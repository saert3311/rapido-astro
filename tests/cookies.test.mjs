import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { LEGAL } from '../src/config/legal.ts';

describe('Cookies Consent & Google Analytics Legal Compliance - TDD Suite', () => {
  describe('1. Legal Configuration & Privacy Policy', () => {
    it('legal.ts exports analyticsProvider and analyticsTool information', () => {
      assert.ok(LEGAL.analyticsProvider, 'LEGAL.analyticsProvider must be defined');
      assert.ok(LEGAL.analyticsProvider.includes('Google'), 'analyticsProvider must reference Google');
      assert.ok(LEGAL.analyticsTool, 'LEGAL.analyticsTool must be defined');
    });

    it('privacidad.astro includes explicit mention of Google Analytics, purpose, and legal basis', () => {
      const privacidadHtml = fs.readFileSync(path.resolve('src/pages/privacidad.astro'), 'utf-8');
      assert.ok(
        privacidadHtml.includes('Google Analytics') || privacidadHtml.includes('Google Ireland'),
        'privacidad.astro must mention Google Analytics / Google Ireland'
      );
      assert.ok(
        privacidadHtml.toLowerCase().includes('consentimiento'),
        'privacidad.astro must mention consent as the legal basis for analytics'
      );
      assert.ok(
        privacidadHtml.includes('/cookies'),
        'privacidad.astro must reference the dedicated Política de Cookies (/cookies)'
      );
    });
  });

  describe('2. Dedicated Cookies Policy Page (src/pages/cookies.astro)', () => {
    it('cookies.astro exists and includes regulatory cookie table', () => {
      const exists = fs.existsSync(path.resolve('src/pages/cookies.astro'));
      assert.ok(exists, 'src/pages/cookies.astro must exist');

      const content = fs.readFileSync(path.resolve('src/pages/cookies.astro'), 'utf-8');
      assert.ok(content.includes('Política de Cookies'), 'Must have title Política de Cookies');
      assert.ok(content.includes('_ga'), 'Must detail _ga cookie from Google Analytics');
      assert.ok(content.includes('Google'), 'Must mention Google as third-party provider');
      assert.ok(content.includes('técnicas') || content.includes('necesarias'), 'Must explain technical/necessary cookies');
      assert.ok(content.includes('AEPD'), 'Must reference AEPD guidance / legal rights');
    });
  });

  describe('3. Google Tag Manager with Google Consent Mode v2', () => {
    it('GoogleTagManager.astro initializes Consent Mode v2 before gtm.start', () => {
      const gtmContent = fs.readFileSync(path.resolve('src/components/GoogleTagManager.astro'), 'utf-8');
      assert.ok(
        gtmContent.includes("'consent'") || gtmContent.includes('"consent"'),
        'GoogleTagManager.astro must call gtag consent'
      );
      assert.ok(
        gtmContent.includes('analytics_storage'),
        'GoogleTagManager.astro must configure analytics_storage in consent'
      );
      assert.ok(
        gtmContent.includes('denied'),
        'GoogleTagManager.astro must default analytics_storage to denied'
      );
    });
  });

  describe('4. CookieBanner Component & Layout Integration', () => {
    it('CookieBanner.astro exists and provides accessible actions without dark patterns', () => {
      const exists = fs.existsSync(path.resolve('src/components/CookieBanner.astro'));
      assert.ok(exists, 'src/components/CookieBanner.astro must exist');

      const bannerContent = fs.readFileSync(path.resolve('src/components/CookieBanner.astro'), 'utf-8');
      assert.ok(
        bannerContent.includes('role="dialog"') || bannerContent.includes('role="region"'),
        'Banner must have semantic role="dialog" or role="region"'
      );
      assert.ok(
        bannerContent.includes('Aceptar') || bannerContent.includes('aceptar'),
        'Banner must have an Accept action'
      );
      assert.ok(
        bannerContent.includes('Rechazar') || bannerContent.includes('rechazar'),
        'Banner must have an explicit Reject action (AEPD requirement)'
      );
      assert.ok(
        bannerContent.includes('Configurar') || bannerContent.includes('configurar') || bannerContent.includes('Preferencias'),
        'Banner must have a Configure/Preferences action'
      );
      assert.ok(
        bannerContent.includes('rpv_cookie_consent'),
        'Banner script must persist consent in localStorage using rpv_cookie_consent'
      );
      assert.ok(
        bannerContent.includes('analytics_storage'),
        'Banner script must update gtag analytics_storage upon user decision'
      );
    });

    it('Layout.astro imports and renders CookieBanner', () => {
      const layoutContent = fs.readFileSync(path.resolve('src/layouts/Layout.astro'), 'utf-8');
      assert.ok(
        layoutContent.includes('CookieBanner'),
        'Layout.astro must import and render CookieBanner'
      );
    });
  });

  describe('5. Footer Links & Settings Trigger', () => {
    it('Footer.astro includes link to /cookies and a cookie settings trigger', () => {
      const footerContent = fs.readFileSync(path.resolve('src/components/Footer.astro'), 'utf-8');
      assert.ok(
        footerContent.includes('/cookies'),
        'Footer.astro must link to /cookies'
      );
      assert.ok(
        footerContent.includes('Configurar') || footerContent.includes('cookies') || footerContent.includes('rpv:open-cookie-settings'),
        'Footer.astro must include a button or link to manage cookie preferences'
      );
    });
  });

  describe('6. Cross-Subdomain Cookie Persistence (Domain=.rapidopackvalencia.es)', () => {
    function runCookieBannerScript({ hostname, protocol = 'https:', initialCookie = '', initialStorage = null }) {
      const bannerSource = fs.readFileSync(path.resolve('src/components/CookieBanner.astro'), 'utf-8');
      const scriptMatch = bannerSource.match(/<script is:inline>([\s\S]*?)<\/script>/);
      assert.ok(scriptMatch, 'CookieBanner.astro must contain an inline script');

      const cookieWrites = [];
      let currentCookie = initialCookie;
      const storage = new Map();
      if (initialStorage !== null) {
        storage.set('rpv_cookie_consent', JSON.stringify(initialStorage));
      }

      const elements = new Map();
      const makeEl = (id) => {
        const classes = new Set(id === 'cookie-banner-container' || id === 'cookie-settings-panel' ? ['hidden'] : []);
        const listeners = new Map();
        return {
          id,
          checked: false,
          innerHTML: '',
          classList: {
            add: (c) => classes.add(c),
            remove: (c) => classes.delete(c),
            contains: (c) => classes.has(c),
          },
          addEventListener: (ev, fn) => {
            if (!listeners.has(ev)) listeners.set(ev, []);
            listeners.get(ev).push(fn);
          },
          click: () => {
            for (const fn of listeners.get('click') || []) fn();
          },
        };
      };

      for (const id of [
        'cookie-banner-container',
        'cookie-settings-panel',
        'cookie-analytics-toggle',
        'cookie-toggle-settings-btn',
        'cookie-quick-close-btn',
        'cookie-accept-all-btn',
        'cookie-reject-all-btn',
        'cookie-save-settings-btn',
      ]) {
        elements.set(id, makeEl(id));
      }

      const windowListeners = new Map();
      const gtagCalls = [];
      const windowObj = {
        location: { hostname, protocol },
        dataLayer: [],
        gtag: (...args) => gtagCalls.push(args),
        addEventListener: (ev, fn) => {
          if (!windowListeners.has(ev)) windowListeners.set(ev, []);
          windowListeners.get(ev).push(fn);
        },
        dispatchEvent: (ev) => {
          for (const fn of windowListeners.get(ev.type) || []) fn(ev);
        },
      };

      const documentObj = {
        getElementById: (id) => elements.get(id) || null,
        get cookie() {
          return currentCookie;
        },
        set cookie(val) {
          cookieWrites.push(val);
          const [pair, ...attrs] = val.split(';').map((s) => s.trim());
          const [name, ...rest] = pair.split('=');
          const value = rest.join('=');
          if (attrs.some((a) => a.toLowerCase() === 'max-age=0')) {
            currentCookie = currentCookie
              .split(';')
              .map((s) => s.trim())
              .filter((s) => s && !s.startsWith(`${name}=`))
              .join('; ');
          } else {
            const others = currentCookie
              .split(';')
              .map((s) => s.trim())
              .filter((s) => s && !s.startsWith(`${name}=`));
            others.push(`${name}=${value}`);
            currentCookie = others.join('; ');
          }
        },
      };

      const localStorageObj = {
        getItem: (k) => (storage.has(k) ? storage.get(k) : null),
        setItem: (k, v) => storage.set(k, String(v)),
        removeItem: (k) => storage.delete(k),
      };

      const sandbox = {
        window: windowObj,
        document: documentObj,
        localStorage: localStorageObj,
        CustomEvent: class CustomEvent {
          constructor(type) {
            this.type = type;
          }
        },
        JSON,
        Date,
        Boolean,
        encodeURIComponent,
        decodeURIComponent,
      };
      sandbox.globalThis = sandbox;

      vm.runInNewContext(scriptMatch[1], sandbox);
      return { elements, cookieWrites, windowObj, localStorageObj, documentObj, gtagCalls };
    }

    it('sets and clears rpv_cookie_consent with Domain=.rapidopackvalencia.es on production hosts', () => {
      const ctx = runCookieBannerScript({ hostname: 'rapidopackvalencia.es', protocol: 'https:' });

      ctx.elements.get('cookie-accept-all-btn').click();
      assert.equal(ctx.cookieWrites.length, 1);
      const setWrite = ctx.cookieWrites[0];
      assert.match(setWrite, /^rpv_cookie_consent=[^;]+/);
      assert.match(setWrite, /Domain=\.rapidopackvalencia\.es/);
      assert.match(setWrite, /Path=\//);
      assert.match(setWrite, /Max-Age=31536000/);
      assert.match(setWrite, /SameSite=Lax/);
      assert.match(setWrite, /Secure/);

      const rawValue = setWrite.split(';')[0].split('=')[1];
      const parsed = JSON.parse(decodeURIComponent(rawValue));
      assert.equal(parsed.necessary, true);
      assert.equal(parsed.analytics, true);

      // Clear consent and verify Domain=.rapidopackvalencia.es + Max-Age=0
      ctx.windowObj.dispatchEvent({ type: 'rpv:clear-cookie-consent' });
      const clearWrites = ctx.cookieWrites.slice(1);
      assert.ok(
        clearWrites.some((w) => w.includes('Domain=.rapidopackvalencia.es') && w.includes('Max-Age=0')),
        'Clearing consent on production host must expire rpv_cookie_consent with Domain=.rapidopackvalencia.es'
      );
      assert.equal(ctx.localStorageObj.getItem('rpv_cookie_consent'), null);
    });

    it('omits Domain=.rapidopackvalencia.es on localhost when setting and clearing', () => {
      const ctx = runCookieBannerScript({ hostname: 'localhost', protocol: 'http:' });

      ctx.elements.get('cookie-reject-all-btn').click();
      assert.equal(ctx.cookieWrites.length, 1);
      assert.doesNotMatch(ctx.cookieWrites[0], /Domain=/);
      assert.doesNotMatch(ctx.cookieWrites[0], /Secure/);

      ctx.windowObj.dispatchEvent({ type: 'rpv:clear-cookie-consent' });
      assert.equal(ctx.cookieWrites.length, 2);
      assert.match(ctx.cookieWrites[1], /Max-Age=0/);
      assert.doesNotMatch(ctx.cookieWrites[1], /Domain=/);
    });

    it('syncs existing localStorage consent into shared domain cookie on production hosts', () => {
      const ctx = runCookieBannerScript({
        hostname: 'www.rapidopackvalencia.es',
        protocol: 'https:',
        initialStorage: { version: '2026.1', necessary: true, analytics: true },
      });

      assert.equal(ctx.cookieWrites.length, 1);
      assert.match(ctx.cookieWrites[0], /Domain=\.rapidopackvalencia\.es/);
      assert.match(ctx.cookieWrites[0], /rpv_cookie_consent=/);
    });

    it('GoogleTagManager.astro reads rpv_cookie_consent from document.cookie before localStorage', () => {
      const gtmContent = fs.readFileSync(path.resolve('src/components/GoogleTagManager.astro'), 'utf-8');
      const cookieReadIndex = gtmContent.indexOf('document.cookie.match');
      const localStorageReadIndex = gtmContent.indexOf('localStorage.getItem');
      assert.ok(cookieReadIndex !== -1, 'GoogleTagManager.astro must read rpv_cookie_consent from document.cookie');
      assert.ok(localStorageReadIndex !== -1, 'GoogleTagManager.astro must keep localStorage fallback');
      assert.ok(cookieReadIndex < localStorageReadIndex, 'document.cookie must be checked before localStorage');
    });
  });
});
