import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

function getSourceFiles(dir) {
  let results = [];
  const list = readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getSourceFiles(fullPath));
    } else if (/\.(astro|ts|js|mjs)$/.test(file)) {
      results.push(fullPath);
    }
  }
  return results;
}

const siteTs = readFileSync(path.resolve('src/config/site.ts'), 'utf-8');
const storeLocatorAstro = readFileSync(path.resolve('src/components/StoreLocator.astro'), 'utf-8');
const layoutAstro = readFileSync(path.resolve('src/layouts/Layout.astro'), 'utf-8');
const indexAstro = readFileSync(path.resolve('src/pages/index.astro'), 'utf-8');
const paqueteriaAstro = readFileSync(path.resolve('src/pages/paqueteria.astro'), 'utf-8');
const allSrcFiles = getSourceFiles(path.resolve('src'));

test('site.ts exports stationName and stationNote instead of parkingNote', () => {
  assert.ok(/stationName:\s*['"]Estación Alfafar-Benetússer['"]/.test(siteTs), 'site.ts must export stationName');
  assert.ok(/stationNote:\s*['"][^'"]*Estación Alfafar-Benetússer[^'"]*['"]/.test(siteTs), 'site.ts must export stationNote');
  assert.ok(!/parkingNote:\s*['"]Aparcamiento en puerta['"]/.test(siteTs), 'site.ts must not export parkingNote claim');
});

test('StoreLocator.astro renders train/transit icon and station note', () => {
  assert.ok(/material-symbols-outlined[^>]*>train<\/span>/.test(storeLocatorAstro), 'StoreLocator must display train icon');
  assert.ok(/SITE\.location\.stationNote/.test(storeLocatorAstro), 'StoreLocator must display SITE.location.stationNote');
  assert.ok(!/local_parking/.test(storeLocatorAstro), 'StoreLocator must not display local_parking icon');
});

test('Layout.astro mobile sticky CTA displays Estación Alfafar · 5 min a pie', () => {
  assert.ok(/Estación Alfafar · 5 min a pie/.test(layoutAstro), 'Layout mobile CTA must display Estación Alfafar · 5 min a pie');
  assert.ok(!/V-31 · 8 min/.test(layoutAstro), 'Layout mobile CTA must not show old car badge');
});

test('index.astro includes station walking pillar and zero parking claims', () => {
  assert.ok(/Estación a 5 Minutos a Pie/.test(indexAstro), 'index.astro must include Estación a 5 Minutos a Pie');
  assert.ok(/5 MIN A PIE/.test(indexAstro), 'index.astro must include 5 MIN A PIE metric');
  assert.ok(!/Aparcamiento en la Puerta/.test(indexAstro), 'index.astro must not include Aparcamiento en la Puerta');
  assert.ok(!/parking en la misma puerta/.test(indexAstro), 'index.astro must not include parking en la misma puerta');
});

test('paqueteria.astro includes station walking step and zero parking claims', () => {
  assert.ok(/A 5 Min de la Estación/.test(paqueteriaAstro), 'paqueteria.astro must include A 5 Min de la Estación');
  assert.ok(/ACCESO A PIE/.test(paqueteriaAstro), 'paqueteria.astro must include ACCESO A PIE metric');
  assert.ok(!/Aparcamiento en la Puerta/.test(paqueteriaAstro), 'paqueteria.astro must not include Aparcamiento en la Puerta');
  assert.ok(!/Aparcamiento para carga/.test(paqueteriaAstro), 'paqueteria.astro must not include Aparcamiento para carga');
});

test('Zero claims of "Aparcamiento en puerta" across all files in src/', () => {
  const forbiddenPatterns = [
    /Aparcamiento en la Puerta/i,
    /Aparcamiento en puerta/i,
    /parking en la misma puerta/i,
    /aparcamiento libre sin zona azul/i,
  ];

  const violations = [];
  for (const file of allSrcFiles) {
    const content = readFileSync(file, 'utf-8');
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(content)) {
        violations.push(`${path.relative(process.cwd(), file)} matched ${pattern}`);
      }
    }
  }

  assert.equal(violations.length, 0, `Found parking claims in src:\n${violations.join('\n')}`);
});
