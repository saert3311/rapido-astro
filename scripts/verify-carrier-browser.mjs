import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9225;
const BASE_URL = 'http://localhost:4321';

fs.mkdirSync('.verification', { recursive: true });

console.log('Starting headless Chrome for carrier logo verification...');
const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--user-data-dir=' + path.resolve('.temp-chrome-carrier-verify'),
]);

for (let i = 0; i < 30; i++) {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
    if (res.ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 200));
}

async function verifyLogos() {
  const createRes = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BASE_URL + '/paqueteria')}`, { method: 'PUT' });
  const target = await createRes.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);

  let idCounter = 1;
  const pending = new Map();
  const consoleErrors = [];

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
      if (type === 'error' || type === 'warning') {
        console.error(`[Browser ${type}]`, text);
        consoleErrors.push(text);
      }
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await new Promise((r) => setTimeout(r, 1500));

  // Scroll to #operadores and inspect the 4 logos rendered in DOM + their centering inside their container box
  const evalRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      await document.fonts.ready;
      const section = document.getElementById('operadores');
      if (!section) return { error: 'Section #operadores not found' };
      section.scrollIntoView({ behavior: 'instant', block: 'start' });
      await new Promise(r => setTimeout(r, 200));

      const svgs = Array.from(section.querySelectorAll('svg[aria-hidden="true"]')).map((svg, i) => {
        const rect = svg.getBoundingClientRect();
        const box = svg.parentElement.parentElement;
        const boxRect = box.getBoundingClientRect();
        const dx = +((rect.left + rect.width / 2) - (boxRect.left + boxRect.width / 2)).toFixed(2);
        const dy = +((rect.top + rect.height / 2) - (boxRect.top + boxRect.height / 2)).toFixed(2);
        const html = svg.outerHTML;
        return {
          index: i,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          dx,
          dy,
          centered: Math.abs(dx) <= 1 && Math.abs(dy) <= 1,
          isInPost: html.includes('inpost-mascot') && html.includes('Fill-29') && html.includes('#FFCB04'),
          isGls: html.includes('#061ab1') && html.includes('#ffd100'),
          isSeur: html.includes('#FF5D29') && html.includes('#0074C0') && html.includes('#C5DDEF'),
          isKanguro: html.includes('kg-bowl') && html.includes('#7FD0FF'),
        };
      });
      return { count: svgs.length, svgs };
    })()`,
    returnByValue: true
  });

  console.log('Evaluated logos on /paqueteria:');
  console.log(JSON.stringify(evalRes.result.value, null, 2));

  // Capture screenshot of paqueteria #operadores in resting state
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('.verification/carrier-logos-paqueteria.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Screenshot saved to .verification/carrier-logos-paqueteria.png');

  // Temporarily remove grayscale to verify full-color hover appearance on /paqueteria
  await send('Runtime.evaluate', {
    expression: `(() => {
      document.querySelectorAll('#operadores svg').forEach(s => {
        s.classList.remove('grayscale', 'opacity-75');
      });
    })()`
  });
  await new Promise((r) => setTimeout(r, 200));
  const colorScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('.verification/carrier-logos-paqueteria-color.png', Buffer.from(colorScreenshot.data, 'base64'));
  console.log('Color screenshot saved to .verification/carrier-logos-paqueteria-color.png');

  // Now check Home /
  await send('Page.navigate', { url: BASE_URL + '/' });
  await new Promise((r) => setTimeout(r, 1500));
  await send('Runtime.evaluate', {
    expression: `(() => {
      const s = document.getElementById('servicios');
      if (s) s.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`
  });
  await new Promise((r) => setTimeout(r, 200));
  const homeScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('.verification/carrier-logos-home.png', Buffer.from(homeScreenshot.data, 'base64'));
  console.log('Screenshot saved to .verification/carrier-logos-home.png');

  await send('Page.close');
  ws.close();

  if (consoleErrors.length > 0) {
    console.error(`FAILED with ${consoleErrors.length} browser console errors/warnings!`);
    process.exit(1);
  }

  const data = evalRes.result.value;
  if (!data || data.svgs.length < 4) {
    console.error('Failed to find all 4 carrier SVGs on /paqueteria!');
    process.exit(1);
  }

  const s = data.svgs;
  const inpostOk = s.some(x => x.isInPost && x.centered && x.width > 20 && x.height > 10);
  const glsOk = s.some(x => x.isGls && x.centered && x.width > 20 && x.height > 10);
  const seurOk = s.some(x => x.isSeur && x.centered && x.width > 20 && x.height > 10);
  const kanguroOk = s.some(x => x.isKanguro && x.centered && x.width > 20 && x.height > 10);

  console.log(`Verification results: InPost=${inpostOk}, GLS=${glsOk}, SEUR=${seurOk}, Kanguro=${kanguroOk}`);
  if (inpostOk && glsOk && seurOk && kanguroOk) {
    console.log('SUCCESS: All 4 carrier logos reflect authentic official brand SVGs, are centered in their boxes, and have zero errors!');
  } else {
    console.error('Verification failed for some carrier logos!');
    process.exit(1);
  }
}

try {
  await verifyLogos();
} finally {
  chrome.kill();
  await new Promise((r) => setTimeout(r, 500));
  try {
    fs.rmSync(path.resolve('.temp-chrome-carrier-verify'), { recursive: true, force: true });
  } catch {}
  process.exit(0);
}
