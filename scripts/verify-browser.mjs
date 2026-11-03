import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;
const BASE_URL = 'http://127.0.0.1:4321';
const ROUTES = ['/', '/paqueteria', '/outlet', '/contacto'];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 3, mobile: true },
];

const outDir = path.resolve('.verification');
await mkdir(outDir, { recursive: true });

console.log('Starting headless Chrome on port', PORT);
const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--user-data-dir=' + path.resolve('.temp-chrome-profile'),
]);

chrome.stderr.on('data', (d) => {
  // console.error('[chrome stderr]', d.toString());
});

// Wait for Chrome CDP port to become ready
let versionData = null;
for (let i = 0; i < 30; i++) {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
    if (res.ok) {
      versionData = await res.json();
      break;
    }
  } catch {}
  await new Promise((r) => setTimeout(r, 200));
}

if (!versionData) {
  console.error('Failed to connect to Chrome CDP');
  chrome.kill();
  process.exit(1);
}

console.log('Connected to Chrome:', versionData['Browser']);

let overallErrors = 0;
const results = [];

async function inspectRoute(route, vp) {
  console.log(`\n--- Inspecting ${route} [${vp.name}: ${vp.width}x${vp.height}] ---`);

  // Create new target tab
  const createRes = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BASE_URL + route)}`, { method: 'PUT' });
  const target = await createRes.json();
  const wsUrl = target.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);

  const consoleLogs = [];
  const networkErrors = [];

  let idCounter = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise((resolve) => ws.onopen = resolve);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
      return;
    }

    if (msg.method === 'Runtime.consoleAPICalled') {
      const type = msg.params.type;
      const text = msg.params.args.map((a) => a.value || a.description || '').join(' ');
      consoleLogs.push({ type, text });
      if (type === 'error' || type === 'warning') {
        console.warn(`[Browser ${type.toUpperCase()}]`, text);
      }
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const text = msg.params.exceptionDetails.text;
      consoleLogs.push({ type: 'error', text });
      console.error('[Browser Exception]', text);
    } else if (msg.method === 'Network.responseReceived') {
      const status = msg.params.response.status;
      const url = msg.params.response.url;
      if (status >= 400 && !url.includes('googleusercontent')) {
        networkErrors.push({ url, status });
        console.error(`[Network ${status}]`, url);
      }
    }
  };

  // Enable domains
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  // Set device metrics
  await send('Emulation.setDeviceMetricsOverride', {
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: vp.deviceScaleFactor,
    mobile: vp.mobile,
  });

  // Navigate and wait for load
  await send('Page.navigate', { url: BASE_URL + route });

  // Wait for load event and render stabilization
  await new Promise((r) => setTimeout(r, 1200));

  // Get title and check DOM
  const evalResult = await send('Runtime.evaluate', {
    expression: '({ title: document.title, h1: document.querySelector("h1")?.textContent?.trim() || null, navCount: document.querySelectorAll("header nav a").length })',
    returnByValue: true,
  });

  const pageInfo = evalResult.result.value;
  console.log('Title:', pageInfo.title);
  console.log('H1:', pageInfo.h1?.replace(/\s+/g, ' '));
  console.log('Header nav links count:', pageInfo.navCount);

  // Capture screenshot
  const screenshotRes = await send('Page.captureScreenshot', { format: 'png' });
  const filename = `${vp.name}-${route.replace(/\//g, '_') || 'home'}.png`;
  const filePath = path.join(outDir, filename);
  await writeFile(filePath, Buffer.from(screenshotRes.data, 'base64'));
  console.log('Screenshot saved to:', filePath);

  const errors = consoleLogs.filter((l) => l.type === 'error');
  if (errors.length > 0) {
    overallErrors += errors.length;
    console.error(`Found ${errors.length} console error(s) on ${route}`);
  } else {
    console.log(`✓ 0 console errors on ${route}`);
  }

  results.push({
    route,
    viewport: vp.name,
    pageInfo,
    consoleErrors: errors.length,
    networkErrors: networkErrors.length,
    screenshot: filePath,
  });

  // Close tab
  await send('Page.close');
  ws.close();
}

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    await inspectRoute(route, vp);
  }
}

// Close Chrome
chrome.kill();

console.log('\n======================================');
console.log('VERIFICATION SUMMARY');
console.log('======================================');
for (const r of results) {
  console.log(`${r.viewport.padEnd(8)} ${r.route.padEnd(14)} | Title: "${r.pageInfo.title.slice(0, 35)}..." | Errors: ${r.consoleErrors} | Screenshot: ${path.basename(r.screenshot)}`);
}

if (overallErrors > 0) {
  console.error(`\nFAILED: Total console errors = ${overallErrors}`);
  process.exit(1);
} else {
  console.log('\nSUCCESS: All 4 routes verified in Desktop & Mobile with ZERO console errors!');
  process.exit(0);
}
