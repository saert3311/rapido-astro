import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

test('Carrier Logos & Schema SEO - TDD Suite', async (t) => {
  await t.test('1. Component existence and operator SVG definitions', () => {
    const componentPath = path.resolve('src/components/CarrierLogo.astro');
    assert.ok(existsSync(componentPath), 'CarrierLogo.astro must exist in src/components/');

    const content = readFileSync(componentPath, 'utf-8');
    assert.ok(content.includes('INPOST'), 'CarrierLogo must define INPOST');
    assert.ok(content.includes('GLS'), 'CarrierLogo must define GLS');
    assert.ok(content.includes('SEUR'), 'CarrierLogo must define SEUR');
    assert.ok(content.includes('KANGURO'), 'CarrierLogo must define KANGURO');
    assert.ok(content.includes('aria-hidden="true"'), 'CarrierLogo SVGs must be marked aria-hidden="true"');
    assert.ok(content.includes('grayscale'), 'CarrierLogo must use grayscale styling in resting state');
    assert.ok(content.includes('group-hover:grayscale-0'), 'CarrierLogo must reveal full color on group-hover');
  });

  await t.test('2. Integration in src/pages/paqueteria.astro', () => {
    const paqueteriaPath = path.resolve('src/pages/paqueteria.astro');
    const content = readFileSync(paqueteriaPath, 'utf-8');

    assert.ok(
      content.includes('import CarrierLogo from'),
      'paqueteria.astro must import CarrierLogo component'
    );
    assert.ok(
      content.includes('<CarrierLogo'),
      'paqueteria.astro must render CarrierLogo component'
    );

    // Option A enforcement: No external links diverting traffic to carrier general websites
    assert.ok(
      !content.includes('href="https://inpost.es"'),
      'paqueteria.astro must not contain external link to inpost.es home'
    );
    assert.ok(
      !content.includes('href="https://www.gls-spain.es"'),
      'paqueteria.astro must not contain external link to gls home'
    );
    assert.ok(
      !content.includes('href="https://www.seur.com"'),
      'paqueteria.astro must not contain external link to seur home'
    );
  });

  await t.test('3. Integration in src/pages/index.astro', () => {
    const indexPath = path.resolve('src/pages/index.astro');
    const content = readFileSync(indexPath, 'utf-8');

    assert.ok(
      content.includes('import CarrierLogo from'),
      'index.astro must import CarrierLogo component'
    );
    assert.ok(
      content.includes('<CarrierLogo'),
      'index.astro must render CarrierLogo in carrier badges'
    );
  });

  await t.test('4. LocalBusiness JSON-LD in src/layouts/Layout.astro', () => {
    const layoutPath = path.resolve('src/layouts/Layout.astro');
    const content = readFileSync(layoutPath, 'utf-8');

    assert.ok(
      content.includes('knowsAbout'),
      'Layout.astro schemaStore must include knowsAbout property'
    );
    assert.ok(content.includes('InPost'), 'knowsAbout must include InPost');
    assert.ok(content.includes('GLS'), 'knowsAbout must include GLS');
    assert.ok(content.includes('SEUR'), 'knowsAbout must include SEUR');
    assert.ok(content.includes('Kanguro'), 'knowsAbout must include Kanguro');
  });

  await t.test('5. Authentic Vector Brand Geometry, Official Palette & Tight Centered ViewBoxes', () => {
    const componentPath = path.resolve('src/components/CarrierLogo.astro');
    const content = readFileSync(componentPath, 'utf-8');

    // InPost (adapted from inpost-logo-lm.avif): complete yellow crescent + 5 rays & wordmark with tight viewBox
    assert.ok(
      content.includes('viewBox="0 0.27 119.78 71.72"'),
      'InPost must have tight centered viewBox="0 0.27 119.78 71.72"'
    );
    assert.ok(
      content.includes('47.7007144,13.9766729') && content.includes('Fill-29') && content.includes('Fill-36'),
      'InPost must contain complete yellow crescent arc and all 5 rays from inpost-logo-lm.avif'
    );
    assert.ok(
      content.includes('78.1958434,33.0033259') && content.includes('Fill-41'),
      'InPost must contain authentic vector letterforms'
    );

    // GLS: authentic G-L-S vector paths, #061ab1 / #ffd100 palette, and tight centered viewBox
    assert.ok(
      content.includes('viewBox="94.79 5.6 830.67 282.12"'),
      'GLS must have tight centered viewBox="94.79 5.6 830.67 282.12"'
    );
    assert.ok(
      content.includes('#061ab1') && content.includes('#ffd100'),
      'GLS must use official Royal Blue #061ab1 and Yellow #ffd100'
    );

    // SEUR (adapted from seur.com/images/logo.png): 3 progressive blue bars + bold orange-red SEUR wordmark & tight viewBox
    assert.ok(
      content.includes('viewBox="1 28 798 115"'),
      'SEUR must have tight centered viewBox="1 28 798 115"'
    );
    assert.ok(
      content.includes('#C5DDEF') && content.includes('#71B9E2') && content.includes('#0074C0'),
      'SEUR must contain the 3 official progressive blue bars (#C5DDEF, #71B9E2, #0074C0)'
    );
    assert.ok(
      content.includes('#FF5D29') && content.includes('M514,32 H594'),
      'SEUR must contain the bold orange-red (#FF5D29) SEUR vector wordmark'
    );

    // Kanguro: authentic logo from kanguro.com with circle, bowl gradient, and tight centered viewBox
    assert.ok(
      content.includes('viewBox="15.46 10.46 163.17 39.48"'),
      'Kanguro must have tight centered viewBox="15.46 10.46 163.17 39.48"'
    );
    assert.ok(
      content.includes('kg-bowl') && content.includes('#7FD0FF'),
      'Kanguro must define authentic bowl gradient #7FD0FF from kanguro.com'
    );
    assert.ok(
      content.includes('M 70 124 A 184 184'),
      'Kanguro must contain authentic smile/pouch path geometry from kanguro.com'
    );
  });
});
