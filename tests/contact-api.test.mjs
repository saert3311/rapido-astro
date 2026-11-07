import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SITE } from '../src/config/site.ts';

describe('Contact Form & Mailjet Integration - TDD Suite', () => {
  describe('1. Configuration & Wrangler Parameterization', () => {
    it('site.ts exports parameterized notificationEmail defaulting to contacto@rapidopackvalencia.es', () => {
      assert.ok(SITE.contact.notificationEmail, 'notificationEmail must exist in SITE.contact');
      assert.equal(SITE.contact.notificationEmail, 'contacto@rapidopackvalencia.es');
    });

    it('site.ts exports turnstileSiteKey with fallback to testing key', () => {
      assert.ok(SITE.security?.turnstileSiteKey, 'turnstileSiteKey must exist in SITE.security');
      assert.equal(typeof SITE.security.turnstileSiteKey, 'string');
      assert.ok(SITE.security.turnstileSiteKey.length > 5);
    });

    it('wrangler.json configures main worker entrypoint while preserving assets and previews', () => {
      const wranglerRaw = fs.readFileSync(path.resolve('wrangler.json'), 'utf-8');
      const wrangler = JSON.parse(wranglerRaw);
      assert.equal(wrangler.main, 'src/worker.ts', 'wrangler.json must specify main as src/worker.ts');
      assert.equal(wrangler.assets?.directory, './dist', 'wrangler.json must preserve assets.directory');
      assert.ok(wrangler.previews, 'wrangler.json must preserve previews block');
    });
  });

  describe('2. Turnstile Verification Client', async () => {
    const { verifyTurnstileToken } = await import('../src/lib/turnstile.ts').catch(() => ({}));

    it('verifyTurnstileToken is defined as a function', () => {
      assert.equal(typeof verifyTurnstileToken, 'function', 'verifyTurnstileToken must be exported from src/lib/turnstile.ts');
    });

    it('verifyTurnstileToken passes automatically with dummy testing secret and token', async () => {
      if (typeof verifyTurnstileToken !== 'function') return;
      const result = await verifyTurnstileToken({
        token: 'dummy-token',
        secretKey: '1x0000000000000000000000000000000AA', // Cloudflare dummy test secret (always passes)
      });
      assert.equal(result.success, true);
    });

    it('verifyTurnstileToken rejects empty token', async () => {
      if (typeof verifyTurnstileToken !== 'function') return;
      const result = await verifyTurnstileToken({
        token: '',
        secretKey: '1x0000000000000000000000000000000AA',
      });
      assert.equal(result.success, false);
      assert.ok(result.error);
    });
  });

  describe('3. Mailjet Clients (Send API v3.1 & List API v3)', async () => {
    const { sendTransactionalEmail, subscribeContactToList } = await import('../src/lib/mailjet.ts').catch(() => ({}));

    it('sendTransactionalEmail and subscribeContactToList are exported', () => {
      assert.equal(typeof sendTransactionalEmail, 'function');
      assert.equal(typeof subscribeContactToList, 'function');
    });

    it('sendTransactionalEmail formats payload correctly with Basic Auth and Reply-To', async () => {
      if (typeof sendTransactionalEmail !== 'function') return;
      let interceptedUrl = '';
      let interceptedOptions = null;

      const mockFetch = async (url, options) => {
        interceptedUrl = url;
        interceptedOptions = options;
        return {
          ok: true,
          status: 200,
          json: async () => ({ Messages: [{ Status: 'success', To: [{ Email: 'contacto@rapidopackvalencia.es' }] }] }),
        };
      };

      const result = await sendTransactionalEmail(
        {
          name: 'Valeria Serrano',
          phone: '685119511',
          email: 'valeria@ejemplo.es',
          subject: 'lotes',
          message: 'Hola, me gustaría saber más sobre la reposición semanal.',
        },
        {
          apiKey: 'test-api-key',
          secretKey: 'test-secret-key',
          fromEmail: 'contacto@rapidopackvalencia.es',
          toEmail: 'custom-inbox@rapidopackvalencia.es',
          fetchFn: mockFetch,
        }
      );

      assert.equal(result.ok, true);
      assert.equal(interceptedUrl, 'https://api.mailjet.com/v3.1/send');
      assert.ok(interceptedOptions.headers.Authorization.startsWith('Basic '));

      const payload = JSON.parse(interceptedOptions.body);
      assert.equal(payload.Messages.length, 1);
      const msg = payload.Messages[0];
      assert.equal(msg.To[0].Email, 'custom-inbox@rapidopackvalencia.es');
      assert.equal(msg.ReplyTo.Email, 'valeria@ejemplo.es');
      assert.equal(msg.ReplyTo.Name, 'Valeria Serrano');
      assert.ok(msg.Subject.includes('lotes'));
      assert.ok(msg.HTMLPart.includes('Valeria Serrano'));
      assert.ok(msg.HTMLPart.includes('685119511'));
      assert.ok(msg.TextPart.includes('685119511'));
    });

    it('subscribeContactToList formats managecontact payload with name, email and phone', async () => {
      if (typeof subscribeContactToList !== 'function') return;
      let interceptedUrl = '';
      let interceptedOptions = null;

      const mockFetch = async (url, options) => {
        interceptedUrl = url;
        interceptedOptions = options;
        return {
          ok: true,
          status: 200,
          json: async () => ({ Count: 1, Data: [{ Email: 'valeria@ejemplo.es' }] }),
        };
      };

      const result = await subscribeContactToList(
        {
          name: 'Valeria Serrano',
          email: 'valeria@ejemplo.es',
          phone: '685119511',
        },
        {
          apiKey: 'test-api-key',
          secretKey: 'test-secret-key',
          listId: '12345',
          fetchFn: mockFetch,
        }
      );

      assert.equal(result.ok, true);
      assert.equal(interceptedUrl, 'https://api.mailjet.com/v3/REST/contactslist/12345/managecontact');
      assert.ok(interceptedOptions.headers.Authorization.startsWith('Basic '));

      const payload = JSON.parse(interceptedOptions.body);
      assert.equal(payload.Action, 'addnoforce');
      assert.equal(payload.Email, 'valeria@ejemplo.es');
      assert.equal(payload.Name, 'Valeria Serrano');
      assert.deepEqual(payload.Properties, { phone: '685119511' });
    });
  });

  describe('4. API Handler Integration (handleContactRequest)', async () => {
    const { handleContactRequest } = await import('../src/lib/contact-handler.ts').catch(() => ({}));

    it('handleContactRequest is exported as a function', () => {
      assert.equal(typeof handleContactRequest, 'function');
    });

    it('returns 400 on invalid or empty JSON body', async () => {
      if (typeof handleContactRequest !== 'function') return;
      const req = new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json{',
      });
      const res = await handleContactRequest(req, {});
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.ok, false);
      assert.equal(json.error.code, 'INVALID_JSON');
    });

    it('returns 422 on validation failure (missing phone, short message, invalid email)', async () => {
      if (typeof handleContactRequest !== 'function') return;
      const req = new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'V', // too short
          email: 'invalid-email',
          phone: '123', // too short
          subject: 'lotes',
          message: 'Short', // too short (< 10)
          privacy: true,
          turnstileToken: 'test-token',
        }),
      });
      const res = await handleContactRequest(req, {});
      assert.equal(res.status, 422);
      const json = await res.json();
      assert.equal(json.ok, false);
      assert.equal(json.error.code, 'VALIDATION_ERROR');
      assert.ok(json.error.details);
    });

    it('returns 200 on successful submission with mocked Turnstile and Mailjet', async () => {
      if (typeof handleContactRequest !== 'function') return;
      const mockEnv = {
        TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
        MAILJET_API_KEY: 'mock-mj-key',
        MAILJET_SECRET_KEY: 'mock-mj-secret',
        MAILJET_FROM_EMAIL: 'contacto@rapidopackvalencia.es',
        MAILJET_TO_EMAIL: 'destinatario@rapidopackvalencia.es',
        MAILJET_CONTACT_LIST_ID: '98765',
        __mockFetch: async (url) => {
          if (url.includes('turnstile')) {
            return { ok: true, status: 200, json: async () => ({ success: true }) };
          }
          if (url.includes('v3.1/send')) {
            return { ok: true, status: 200, json: async () => ({ Messages: [{ Status: 'success' }] }) };
          }
          if (url.includes('managecontact')) {
            return { ok: true, status: 200, json: async () => ({ Count: 1 }) };
          }
          return { ok: true, status: 200, json: async () => ({}) };
        },
      };

      const req = new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Carlos Ruiz',
          email: 'carlos@ejemplo.es',
          phone: '640397434',
          subject: 'paqueteria',
          message: 'Buenas tardes, quisiera consultar los horarios de entrega.',
          privacy: true,
          turnstileToken: 'valid-turnstile-token',
        }),
      });

      const res = await handleContactRequest(req, mockEnv);
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.ok, true);
      assert.equal(typeof json.message, 'string');
    });
  });

  describe('5. ContactForm.astro Frontend Integration', () => {
    it('ContactForm.astro includes Turnstile widget container, script loading, and accessible status regions', () => {
      const formAstro = fs.readFileSync(path.resolve('src/components/ContactForm.astro'), 'utf-8');
      assert.ok(formAstro.includes('cf-turnstile') || formAstro.includes('turnstile'), 'Form must contain Turnstile container or script reference');
      assert.ok(formAstro.includes('fetch') || formAstro.includes('/api/contact'), 'Form script must fetch /api/contact');
      assert.ok(formAstro.includes('role="status"'), 'Form must contain role="status" feedback region');
      assert.ok(formAstro.includes('aria-live="polite"'), 'Form must contain aria-live="polite" region');
    });
  });
});
