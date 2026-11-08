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
});
