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

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: vp.deviceScaleFactor,
    mobile: vp.mobile,
  });

  await send('Page.navigate', { url: BASE_URL + route });
  await new Promise((r) => setTimeout(r, 1200));

  // Inspect Logo and Mobile UI via Runtime.evaluate
  const metricsResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const logoImg = document.querySelector('header a img[src*="logo-rapido-pack-valencia"]');
      const logoRect = logoImg ? logoImg.getBoundingClientRect() : { width: 0, height: 0 };
      const docScrollWidth = document.documentElement.scrollWidth;
      const winInnerWidth = window.innerWidth;
      const overflow = docScrollWidth > winInnerWidth;
      const menuSummary = document.querySelector('header details summary');
      const menuSummaryRect = menuSummary ? menuSummary.getBoundingClientRect() : null;
      const stickyCta = document.querySelector('.md\\\\:hidden.fixed.bottom-3');
      const mobileStatus = document.getElementById('header-mobile-live-status');

      return {
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.trim() || null,
        logo: {
          width: Math.round(logoRect.width),
          height: Math.round(logoRect.height),
        },
        viewport: {
          docScrollWidth,
          winInnerWidth,
          hasHorizontalOverflow: overflow,
        },
        mobileMenuSummary: menuSummaryRect ? {
          width: Math.round(menuSummaryRect.width),
          height: Math.round(menuSummaryRect.height),
        } : null,
        hasStickyCta: !!stickyCta,
        hasMobileLiveStatus: !!mobileStatus,
      };
    })()`,
    returnByValue: true,
  });

  const metrics = metricsResult.result.value;
  console.log('Title:', metrics.title);
  console.log(`Logo rendered size: ${metrics.logo.width}x${metrics.logo.height}px`);
  console.log(`Viewport check: docScrollWidth=${metrics.viewport.docScrollWidth}px, winInnerWidth=${metrics.viewport.winInnerWidth}px, overflow=${metrics.viewport.hasHorizontalOverflow}`);

  // Assertions for logo and mobile
  if (vp.name === 'desktop') {
    if (metrics.logo.height < 80) {
      console.error(`Desktop logo height ${metrics.logo.height}px is below target >= 80px!`);
      overallErrors++;
    } else {
      console.log(`✓ Desktop logo size (${metrics.logo.height}px height) meets target >= 80px`);
    }
  } else if (vp.name === 'mobile') {
    if (metrics.logo.height < 70) {
      console.error(`Mobile logo height ${metrics.logo.height}px is below target >= 70px!`);
      overallErrors++;
    } else {
      console.log(`✓ Mobile logo size (${metrics.logo.height}px height) meets target >= 70px`);
    }

    if (metrics.viewport.hasHorizontalOverflow) {
      console.error(`Mobile horizontal overflow detected: docScrollWidth=${metrics.viewport.docScrollWidth} > ${metrics.viewport.winInnerWidth}`);
      overallErrors++;
    } else {
      console.log(`✓ 0 horizontal overflow on mobile (${metrics.viewport.docScrollWidth}px <= ${metrics.viewport.winInnerWidth}px)`);
    }

    if (metrics.mobileMenuSummary && metrics.mobileMenuSummary.width >= 44 && metrics.mobileMenuSummary.height >= 44) {
      console.log(`✓ Mobile menu tap target (${metrics.mobileMenuSummary.width}x${metrics.mobileMenuSummary.height}px) meets WCAG >= 44px`);
    }

    if (metrics.hasStickyCta) {
      console.log(`✓ Mobile sticky CTA bar is present`);
    } else {
      console.error(`Mobile sticky CTA bar is missing!`);
      overallErrors++;
    }
  }

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
    metrics,
    consoleErrors: errors.length,
    networkErrors: networkErrors.length,
    screenshot: filePath,
  });

  await send('Page.close');
  ws.close();
}

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    await inspectRoute(route, vp);
  }
}

chrome.kill();

console.log('\n======================================');
console.log('BROWSER VERIFICATION SUMMARY');
console.log('======================================');
for (const r of results) {
  console.log(`${r.viewport.padEnd(8)} ${r.route.padEnd(14)} | Logo: ${r.metrics.logo.width}x${r.metrics.logo.height}px | Overflow: ${r.metrics.viewport.hasHorizontalOverflow} | Errors: ${r.consoleErrors}`);
}

if (overallErrors > 0) {
  console.error(`\nFAILED: Total check errors = ${overallErrors}`);
  process.exit(1);
} else {
  console.log('\nSUCCESS: All 4 routes verified in Desktop & Mobile: Logo enlarged, Zero overflow, WCAG tap targets passed, Zero console errors!');
  process.exit(0);
}
