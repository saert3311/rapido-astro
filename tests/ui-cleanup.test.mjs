import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function getSourceFiles(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) results = results.concat(getSourceFiles(fullPath));
    else if (/\.(astro|ts|js|mjs)$/.test(file)) results.push(fullPath);
  }
  return results;
}

describe('UI Cleanup, Overlays Removal & Interactive Map Facade (TDD)', () => {
  test('Zero remote googleusercontent.com placeholder image URLs remain across src/', () => {
    const files = getSourceFiles(path.resolve('src'));
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      assert.equal(
        content.includes('googleusercontent.com'),
        false,
        `${path.relative(process.cwd(), file)} must not reference external googleusercontent.com assets`
      );
    }
  });

  test('Hero and showcase photographs have zero floating .liquid-glass overlays obstructing images', () => {
    const pages = ['src/pages/index.astro', 'src/pages/paqueteria.astro', 'src/pages/outlet.astro'];
    for (const page of pages) {
      const content = fs.readFileSync(path.resolve(page), 'utf-8');
      assert.equal(
        content.includes('liquid-glass'),
        false,
        `${page} must not place floating .liquid-glass overlays on top of photographs`
      );
    }
  });

  test('Consistent station walk timing: zero "Renfe Alfafar a 10 min" contradictions', () => {
    const files = getSourceFiles(path.resolve('src'));
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      assert.equal(
        /10 min/i.test(content),
        false,
        `${path.relative(process.cwd(), file)} must not contain conflicting "10 min" station timing`
      );
    }
  });

  test('StoreLocator.astro implements native lazy-loaded Google Maps iframe without overlays or client libraries', () => {
    const locator = fs.readFileSync(path.resolve('src/components/StoreLocator.astro'), 'utf-8');
    const site = fs.readFileSync(path.resolve('src/config/site.ts'), 'utf-8');

    assert.ok(site.includes('mapsEmbedUrl'), 'site.ts must define mapsEmbedUrl');
    assert.ok(locator.includes('SITE.location.mapsEmbedUrl'), 'StoreLocator must embed SITE.location.mapsEmbedUrl');
    assert.ok(locator.includes('loading="lazy"'), 'StoreLocator iframe must load lazily upon scroll');
    assert.equal(locator.includes('liquid-glass'), false, 'StoreLocator must not smother map with liquid-glass overlays');
  });

  test('contacto.astro allows full email display without truncate and removes simulated permanent live status', () => {
    const contacto = fs.readFileSync(path.resolve('src/pages/contacto.astro'), 'utf-8');
    assert.equal(
      contacto.includes('Atención en Sala Activa'),
      false,
      'contacto.astro must not render hardcoded simulated live status bar'
    );
    // Email channel link must not use truncate class
    const ledgerLinkSection = contacto.match(/<a[\s\S]*?\{ch\.value\}[\s\S]*?<\/a>/)?.[0] || '';
    assert.equal(
      ledgerLinkSection.includes('truncate'),
      false,
      'contacto.astro contact channel value link must not use truncate (causes email cutoff)'
    );
  });

  test('Redundant "#visita" quick-visit card and stacked bottom dark conversion banner are removed', () => {
    const pages = ['src/pages/index.astro', 'src/pages/paqueteria.astro', 'src/pages/outlet.astro'];
    for (const page of pages) {
      const content = fs.readFileSync(path.resolve(page), 'utf-8');
      assert.equal(content.includes('id="visita"'), false, `${page} should not duplicate id="visita" address module`);
      assert.equal(
        /bg-surface-dark text-on-primary py-16/.test(content),
        false,
        `${page} should not stack a second bg-surface-dark conversion banner directly above dark Footer`
      );
    }
  });

  test('Footer.astro avoids duplicating legal links inside Navigation list column', () => {
    const footer = fs.readFileSync(path.resolve('src/components/Footer.astro'), 'utf-8');
    const navUl = footer.match(/<ul class="space-y-2[\s\S]*?<\/ul>/)?.[0] || '';
    assert.equal(navUl.includes('/aviso-legal'), false, 'Footer Navegación list should not duplicate legal links');
    assert.equal(navUl.includes('/privacidad'), false, 'Footer Navegación list should not duplicate privacy links');
    assert.equal(navUl.includes('/cookies'), false, 'Footer Navegación list should not duplicate cookies links');
  });
});
