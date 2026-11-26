import test, { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createAppServer } from '../server.mjs';

function requestRaw(port, method, rawPath) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        method,
        path: rawPath,
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf-8'),
          });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

describe('Docker Production Server & CI/CD - TDD Suite', () => {
  describe('1. Node HTTP Server Runtime (server.mjs)', () => {
    let server;
    let baseUrl;
    let port;

    before(async () => {
      const mockEnv = {
        TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
        MAILJET_API_KEY: 'mock-mj-key',
        MAILJET_SECRET_KEY: 'mock-mj-secret',
        MAILJET_FROM_EMAIL: 'contacto@rapidopackvalencia.es',
        MAILJET_TO_EMAIL: 'contacto@rapidopackvalencia.es',
        MAILJET_CONTACT_LIST_ID: '10568949',
        __mockFetch: async (url) => {
          if (String(url).includes('v3.1/send')) {
            return { ok: true, status: 200, json: async () => ({ Messages: [{ Status: 'success' }] }) };
          }
          if (String(url).includes('managecontact')) {
            return { ok: true, status: 200, json: async () => ({ Count: 1 }) };
          }
          return { ok: true, status: 200, json: async () => ({ success: true }) };
        },
      };

      server = createAppServer({ distDir: path.resolve('dist'), env: mockEnv, rateLimitMax: 20 });
      await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
      const address = server.address();
      port = address.port;
      baseUrl = `http://127.0.0.1:${port}`;
    });

    after(async () => {
      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }
    });

    it('GET /healthz returns 200 JSON with no-store cache control', async () => {
      const res = await fetch(`${baseUrl}/healthz`);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('cache-control'), 'no-store');
      assert.match(res.headers.get('content-type') || '', /application\/json/);
      const body = await res.json();
      assert.deepEqual(body, { ok: true, status: 'healthy' });
    });

    it('GET / returns 200 HTML with security headers and must-revalidate cache policy', async () => {
      const res = await fetch(`${baseUrl}/`);
      assert.equal(res.status, 200);
      assert.match(res.headers.get('content-type') || '', /text\/html/);
      assert.equal(res.headers.get('cache-control'), 'public, max-age=0, must-revalidate');
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
      assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
      assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
      const html = await res.text();
      assert.ok(html.includes('Rápido Pack Valencia'));
    });

    it('GET /paqueteria and GET /paqueteria/ both return 200 HTML', async () => {
      const resNoSlash = await fetch(`${baseUrl}/paqueteria`);
      assert.equal(resNoSlash.status, 200);
      assert.match(resNoSlash.headers.get('content-type') || '', /text\/html/);

      const resWithSlash = await fetch(`${baseUrl}/paqueteria/`);
      assert.equal(resWithSlash.status, 200);
      assert.match(resWithSlash.headers.get('content-type') || '', /text\/html/);
    });

    it('HEAD / returns 200 with an empty body', async () => {
      const res = await fetch(`${baseUrl}/`, { method: 'HEAD' });
      assert.equal(res.status, 200);
      const text = await res.text();
      assert.equal(text, '');
    });

    it('GET /fachada-rapido-pack-valencia.webp returns 200 with immutable cache policy', async () => {
      const res = await fetch(`${baseUrl}/fachada-rapido-pack-valencia.webp`);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('content-type'), 'image/webp');
      assert.equal(res.headers.get('cache-control'), 'public, max-age=31536000, immutable');
      const bytes = await res.arrayBuffer();
      assert.ok(bytes.byteLength > 0);
    });

    it('blocks path traversal attempts like /%2e%2e/package.json', async () => {
      const res = await requestRaw(port, 'GET', '/%2e%2e/package.json');
      assert.ok(res.status === 400 || res.status === 404, `Expected 400 or 404, got ${res.status}`);
      assert.equal(res.body.includes('"rapido-astro"'), false);
    });

    it('GET /api/contact returns 405 METHOD_NOT_ALLOWED', async () => {
      const res = await fetch(`${baseUrl}/api/contact`);
      assert.equal(res.status, 405);
      const json = await res.json();
      assert.equal(json.ok, false);
      assert.equal(json.error?.code, 'METHOD_NOT_ALLOWED');
    });

    it('POST /api/contact with invalid JSON returns 400 INVALID_JSON', async () => {
      const res = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json{',
      });
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.ok, false);
      assert.equal(json.error?.code, 'INVALID_JSON');
    });

    it('POST /api/contact with valid payload returns 200 ok:true', async () => {
      const res = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Laura Martínez',
          phone: '640397434',
          email: 'laura@ejemplo.es',
          subject: 'paqueteria',
          message: 'Consulta de prueba sobre recogida de paquete.',
          privacy: true,
          turnstileToken: 'dummy-token',
        }),
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.ok, true);
    });

    it('POST /api/contact with oversized payload (> 64 KB) returns 413 PAYLOAD_TOO_LARGE', async () => {
      const oversized = JSON.stringify({ message: 'x'.repeat(70 * 1024) });
      const res = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: oversized,
      });
      assert.equal(res.status, 413);
      const json = await res.json();
      assert.equal(json.ok, false);
      assert.equal(json.error?.code, 'PAYLOAD_TOO_LARGE');
    });

    it('GET /readyz returns 503 when secrets are missing/placeholders and 200 when configured', async () => {
      const unreadyServer = createAppServer({
        distDir: path.resolve('dist'),
        env: {
          TURNSTILE_SECRET_KEY: 'replace-with-turnstile-secret-key',
          MAILJET_API_KEY: 'replace-with-mailjet-api-key',
          MAILJET_SECRET_KEY: '',
        },
      });
      await new Promise((resolve) => unreadyServer.listen(0, '127.0.0.1', resolve));
      try {
        const unreadyPort = unreadyServer.address().port;
        const res = await fetch(`http://127.0.0.1:${unreadyPort}/readyz`);
        assert.equal(res.status, 503);
        const body = await res.json();
        assert.equal(body.ok, false);
        assert.equal(body.status, 'not_ready');
        assert.equal(body.checks?.assets, true);
        assert.equal(body.checks?.turnstile, false);
        assert.equal(body.checks?.mailjet, false);
        assert.ok(Array.isArray(body.missing) && body.missing.includes('MAILJET_SECRET_KEY'));
      } finally {
        await new Promise((resolve) => unreadyServer.close(resolve));
      }

      const readyServer = createAppServer({
        distDir: path.resolve('dist'),
        env: {
          TURNSTILE_SECRET_KEY: '0x4AAAAAA_prod_secret_key',
          MAILJET_API_KEY: 'prod_mailjet_key',
          MAILJET_SECRET_KEY: 'prod_mailjet_secret',
          MAILJET_CONTACT_LIST_ID: '10568949',
        },
      });
      await new Promise((resolve) => readyServer.listen(0, '127.0.0.1', resolve));
      try {
        const readyPort = readyServer.address().port;
        const res = await fetch(`http://127.0.0.1:${readyPort}/readyz`);
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.ok, true);
        assert.equal(body.status, 'ready');
        assert.deepEqual(body.checks, {
          assets: true,
          turnstile: true,
          mailjet: true,
          mailjetList: true,
        });
      } finally {
        await new Promise((resolve) => readyServer.close(resolve));
      }
    });

    it('POST /api/contact enforces per-IP rate limiting using Nginx proxy headers', async () => {
      const rateLimitedServer = createAppServer({
        distDir: path.resolve('dist'),
        rateLimitMax: 2,
        rateLimitWindowMs: 60_000,
        env: {
          TRUST_PROXY: 'true',
          TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
          MAILJET_API_KEY: 'mock-mj-key',
          MAILJET_SECRET_KEY: 'mock-mj-secret',
          __silentLogs: true,
          __mockFetch: async () => ({
            ok: true,
            status: 200,
            json: async () => ({ Messages: [{ Status: 'success' }] }),
          }),
        },
      });
      await new Promise((resolve) => rateLimitedServer.listen(0, '127.0.0.1', resolve));

      try {
        const rlPort = rateLimitedServer.address().port;
        const rlUrl = `http://127.0.0.1:${rlPort}/api/contact`;
        const validPayload = JSON.stringify({
          name: 'Laura Martínez',
          phone: '640397434',
          email: 'laura@ejemplo.es',
          subject: 'paqueteria',
          message: 'Consulta de prueba sobre recogida de paquete.',
          privacy: true,
          turnstileToken: 'dummy-token',
        });

        for (let i = 0; i < 2; i++) {
          const okRes = await fetch(rlUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Real-IP': '198.51.100.10',
            },
            body: validPayload,
          });
          assert.equal(okRes.status, 200);
        }

        const blockedRes = await fetch(rlUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Real-IP': '198.51.100.10',
          },
          body: validPayload,
        });
        assert.equal(blockedRes.status, 429);
        assert.ok(Number(blockedRes.headers.get('retry-after')) >= 1);
        const blockedJson = await blockedRes.json();
        assert.equal(blockedJson.ok, false);
        assert.equal(blockedJson.error?.code, 'RATE_LIMITED');

        // Different visitor IP (via rightmost X-Forwarded-For hop) still succeeds
        const otherIpRes = await fetch(rlUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': '198.51.100.10, 198.51.100.99',
          },
          body: validPayload,
        });
        assert.equal(otherIpRes.status, 200);
      } finally {
        await new Promise((resolve) => rateLimitedServer.close(resolve));
      }
    });

    it('POST /api/contact in NODE_ENV=production without secrets matches CI smoke test contract (400 invalid JSON, 503 valid payload)', async () => {
      const unconfiguredProdServer = createAppServer({
        distDir: path.resolve('dist'),
        env: {
          NODE_ENV: 'production',
          TURNSTILE_SECRET_KEY: '',
          MAILJET_API_KEY: '',
          MAILJET_SECRET_KEY: '',
          __silentLogs: true,
        },
      });
      await new Promise((resolve) => unconfiguredProdServer.listen(0, '127.0.0.1', resolve));

      try {
        const prodPort = unconfiguredProdServer.address().port;
        const prodUrl = `http://127.0.0.1:${prodPort}/api/contact`;

        const invalidJsonRes = await fetch(prodUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'invalid-json{',
        });
        assert.equal(invalidJsonRes.status, 400);
        const invalidJsonBody = await invalidJsonRes.json();
        assert.equal(invalidJsonBody.error?.code, 'INVALID_JSON');

        const validPayloadRes = await fetch(prodUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Laura Martínez',
            phone: '640397434',
            email: 'laura@ejemplo.es',
            subject: 'paqueteria',
            message: 'Consulta de prueba sobre recogida de paquete.',
            privacy: true,
            turnstileToken: 'dummy-token',
          }),
        });
        assert.equal(validPayloadRes.status, 503);
        const validPayloadBody = await validPayloadRes.json();
        assert.equal(validPayloadBody.error?.code, 'SERVICE_UNAVAILABLE');
      } finally {
        await new Promise((resolve) => unconfiguredProdServer.close(resolve));
      }
    });
  });

  describe('2. Docker & CI/CD Configuration Contracts', () => {
    it('package.json defines start and verify:contact scripts without changing test/build scripts', () => {
      const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf-8'));
      assert.equal(pkg.scripts.start, 'node server.mjs');
      assert.equal(pkg.scripts['verify:contact'], 'node scripts/verify-contact-env.mjs');
      assert.equal(pkg.scripts.build, 'astro build');
      assert.equal(pkg.scripts.test, 'node --test tests/*.test.mjs');
    });

    it('Dockerfile uses native $BUILDPLATFORM multi-stage build, builds without test files, drops root, and defines HEALTHCHECK', () => {
      const dockerfile = fs.readFileSync(path.resolve('Dockerfile'), 'utf-8');
      assert.match(dockerfile, /FROM --platform=\$BUILDPLATFORM node:22-alpine AS deps/);
      assert.match(dockerfile, /FROM deps AS builder/);
      assert.match(dockerfile, /FROM node:22-alpine AS runner/);
      assert.match(dockerfile, /RUN npm run build\r?\n/);
      assert.equal(dockerfile.includes('npm test'), false);
      assert.match(dockerfile, /USER node/);
      assert.match(dockerfile, /HEALTHCHECK/);
      assert.match(dockerfile, /\/healthz/);
      assert.match(dockerfile, /CMD \["node", "server\.mjs"\]/);
      assert.equal(dockerfile.includes('PUBLIC_TURNSTILE_SITE_KEY=""'), false);
    });

    it('.dockerignore excludes secrets, build outputs, tests, and local artifacts', () => {
      const dockerignore = fs.readFileSync(path.resolve('.dockerignore'), 'utf-8');
      for (const entry of ['.git', 'node_modules', 'dist', 'tests', '.env', '.env.*']) {
        assert.ok(dockerignore.includes(entry), `.dockerignore must exclude ${entry}`);
      }
    });

    it('docker-compose.yml hardens container runtime, sets TRUST_PROXY, and uses /healthz', () => {
      const compose = fs.readFileSync(path.resolve('docker-compose.yml'), 'utf-8');
      assert.match(compose, /read_only:\s*true/);
      assert.match(compose, /no-new-privileges:true/);
      assert.match(compose, /TRUST_PROXY:/);
      assert.match(compose, /\/healthz/);
      assert.match(compose, /:3000/);
    });

    it('preflight verification script and hardening one-pager exist', () => {
      assert.ok(fs.existsSync(path.resolve('scripts/verify-contact-env.mjs')));
      assert.ok(fs.existsSync(path.resolve('docs/ideas/docker-contact-email-hardening.md')));
    });

    it('.env.example documents required variables with placeholder values only', () => {
      const envExample = fs.readFileSync(path.resolve('.env.example'), 'utf-8');
      for (const key of [
        'PORT',
        'HOST',
        'TURNSTILE_SECRET_KEY',
        'MAILJET_API_KEY',
        'MAILJET_SECRET_KEY',
        'MAILJET_FROM_EMAIL',
        'MAILJET_TO_EMAIL',
        'MAILJET_CONTACT_LIST_ID',
      ]) {
        assert.ok(envExample.includes(`${key}=`), `.env.example must document ${key}`);
      }
      assert.equal(envExample.includes('c8138b7acadb518ecb3272ba95616da1'), false);
    });

    it('GitHub Actions CI, rollback, and Dependabot workflows enforce quality gates', () => {
      const ci = fs.readFileSync(path.resolve('.github/workflows/ci.yml'), 'utf-8');
      assert.match(ci, /npm ci/);
      assert.match(ci, /npm run build/);
      assert.match(ci, /npm test/);
      assert.match(ci, /npm audit --audit-level=high/);
      assert.match(ci, /--read-only/);
      assert.match(ci, /\/healthz/);
      assert.match(ci, /\/readyz/);
      assert.match(ci, /SERVICE_UNAVAILABLE/);
      assert.match(ci, /github\.event_name == 'push'/);
      assert.match(ci, /ghcr\.io/);

      const rollback = fs.readFileSync(path.resolve('.github/workflows/rollback.yml'), 'utf-8');
      assert.match(rollback, /workflow_dispatch/);
      assert.match(rollback, /image_tag/);
      assert.match(rollback, /GITHUB_REPOSITORY:/);
      assert.match(rollback, /imagetools create/);

      const dependabot = fs.readFileSync(path.resolve('.github/dependabot.yml'), 'utf-8');
      assert.match(dependabot, /package-ecosystem:\s*npm/);
      assert.match(dependabot, /package-ecosystem:\s*docker/);
      assert.match(dependabot, /package-ecosystem:\s*github-actions/);
    });

    it('wrangler.json Cloudflare Worker contract remains intact', () => {
      const wrangler = JSON.parse(fs.readFileSync(path.resolve('wrangler.json'), 'utf-8'));
      assert.equal(wrangler.main, 'src/worker.ts');
      assert.equal(wrangler.assets?.directory, './dist');
      assert.ok(wrangler.previews);
    });
  });
});
