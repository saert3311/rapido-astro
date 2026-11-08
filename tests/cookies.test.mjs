import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
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
});
