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

  await t.test('5. Authentic Vector Brand Geometry & Official Palette Verification', () => {
    const componentPath = path.resolve('src/components/CarrierLogo.astro');
    const content = readFileSync(componentPath, 'utf-8');

    // InPost: authentic yellow envelope/bird vector & wordmark paths
    assert.ok(
      content.includes('Fill-27') || content.includes('17.332778,36.1712445') || content.includes('#FFCB04'),
      'InPost must contain authentic vector envelope/bird mascot geometry and #FFCB04 palette'
    );
    assert.ok(
      content.includes('78.1958434,33.0033259') || content.includes('Fill-43') || content.includes('Fill-41'),
      'InPost must contain authentic vector letterforms'
    );

    // GLS: authentic G-L-S vector paths and #061ab1 / #ffd100 palette
    assert.ok(
      content.includes('#061ab1') || content.includes('061ab1'),
      'GLS must use official Royal Blue #061ab1'
    );
    assert.ok(
      content.includes('272.997') || content.includes('95.434'),
      'GLS must contain authentic letterform geometry'
    );

    // SEUR: authentic Illustrator vector paths extracted from seur.com
    assert.ok(
      content.includes('135.5,56.2V9.5') || content.includes('184.8,36.2') || content.includes('92.8,47.6'),
      'SEUR must contain authentic official letter paths from seur.com'
    );

    // Kanguro: authentic logo from kanguro.com with circle and bowl gradient
    assert.ok(
      content.includes('kg-bowl') || content.includes('#7FD0FF'),
      'Kanguro must define authentic bowl gradient #7FD0FF from kanguro.com'
    );
    assert.ok(
      content.includes('M 70 124 A 184 184') || content.includes('70 124'),
      'Kanguro must contain authentic smile/pouch path geometry from kanguro.com'
    );
  });
});
