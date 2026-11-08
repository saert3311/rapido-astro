// @ts-check
import fs from 'node:fs';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Bridge public vars from wrangler.json into process.env at build time
// so Astro pre-renders static assets with production keys even if CI lacks explicit build env vars
let wranglerVars = /** @type {Record<string, string>} */ ({});
try {
  const wranglerPath = new URL('./wrangler.json', import.meta.url);
  if (fs.existsSync(wranglerPath)) {
    const wrangler = JSON.parse(fs.readFileSync(wranglerPath, 'utf-8'));
    if (wrangler.vars && typeof wrangler.vars === 'object') {
      wranglerVars = wrangler.vars;
      for (const [key, val] of Object.entries(wrangler.vars)) {
        if (key.startsWith('PUBLIC_') && !process.env[key]) {
          process.env[key] = String(val);
        }
      }
    }
  }
} catch {
  // Non-fatal if wrangler.json is unreadable or malformed
}

/** @type {import('vite').Plugin} */
const devContactApiPlugin = {
  name: 'dev-contact-api',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = req.url ? req.url.split('?')[0] : '';
      if (url === '/api/contact' && req.method === 'POST') {
        try {
          const buffers = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const bodyStr = Buffer.concat(buffers).toString('utf-8');
          // @ts-ignore
          const webReq = new Request(`http://${req.headers.host || 'localhost'}/api/contact`, {
            method: 'POST',
            // @ts-ignore
            headers: req.headers,
            body: bodyStr,
          });
          const { handleContactRequest } = await import('./src/lib/contact-handler.ts');
          const devEnv = { ...wranglerVars, ...process.env };
          const webRes = await handleContactRequest(webReq, devEnv);
          res.statusCode = webRes.status;
          webRes.headers.forEach((val, key) => res.setHeader(key, val));
          const resText = await webRes.text();
          res.end(resText);
          return;
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: { code: 'DEV_SERVER_ERROR', message: String(err) } }));
          return;
        }
      }
      next();
    });
  },
};

// https://astro.build/config
export default defineConfig({
  site: 'https://rapidopackvalencia.es',
  integrations: [sitemap()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  vite: {
    plugins: [tailwindcss(), devContactApiPlugin],
  },
});
