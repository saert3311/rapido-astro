// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

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
          const webRes = await handleContactRequest(webReq, process.env);
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
