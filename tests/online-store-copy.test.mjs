import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

describe('Online Store Coming Soon - Copy & Policy Specifications (TDD)', () => {
  test('1. Scope guard: No unrequested catalog, shelf, or cart components exist', () => {
    assert.ok(
      !fs.existsSync(path.join(projectRoot, 'src/components/OnlineShelf.astro')),
      'OnlineShelf.astro must NOT exist (scope restricted to copy updates only)'
    );
    assert.ok(
      !fs.existsSync(path.join(projectRoot, 'src/config/products.ts')),
      'products.ts must NOT exist (scope restricted to copy updates only)'
    );
  });

  test('2. Deprecated copy scrubber: Zero mentions of "no disponemos de tienda online", "100% presencial" or prohibitive e-commerce in src/', () => {
    function scanDir(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (/\.(astro|ts|js|mjs)$/.test(file)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          assert.doesNotMatch(
            content,
            /no disponemos de tienda online/i,
            `File ${fullPath} contains outdated "no disponemos de tienda online"`
          );
          assert.doesNotMatch(
            content,
            /100%\s*presencial/i,
            `File ${fullPath} contains outdated "100% presencial"`
          );
          assert.doesNotMatch(
            content,
            /No se realizan operaciones de venta electrónica/i,
            `File ${fullPath} contains outdated "No se realizan operaciones de venta electrónica"`
          );
        }
      }
    }
    scanDir(path.join(projectRoot, 'src'));
  });

  test('3. site.ts, Header.astro, Footer.astro, and index.astro integrate Tienda subdomain links', () => {
    const siteTs = fs.readFileSync(path.join(projectRoot, 'src/config/site.ts'), 'utf-8');
    const headerAstro = fs.readFileSync(path.join(projectRoot, 'src/components/Header.astro'), 'utf-8');
    const footerAstro = fs.readFileSync(path.join(projectRoot, 'src/components/Footer.astro'), 'utf-8');
    const indexPath = path.join(projectRoot, 'src/pages/index.astro');
    const content = fs.readFileSync(indexPath, 'utf-8');

    assert.match(
      siteTs,
      /storeUrl:\s*['"]https:\/\/tienda\.rapidopackvalencia\.es['"]/,
      'site.ts must define storeUrl pointing to https://tienda.rapidopackvalencia.es'
    );
    assert.match(headerAstro, /SITE\.brand\.storeUrl/, 'Header.astro must link Tienda to SITE.brand.storeUrl');
    assert.match(footerAstro, /SITE\.brand\.storeUrl/, 'Footer.astro must link Tienda to SITE.brand.storeUrl');

    // Hero chip check
    assert.match(
      content,
      /SITE\.brand\.storeUrl/,
      'index.astro must link to SITE.brand.storeUrl'
    );

    // FAQ check
    assert.match(
      content,
      /tienda web|tienda online/i,
      'index.astro FAQ must mention tienda web/online'
    );
  });

  test('4. outlet.astro links to Tienda subdomain in CTA, badge, and FAQ', () => {
    const outletPath = path.join(projectRoot, 'src/pages/outlet.astro');
    const content = fs.readFileSync(outletPath, 'utf-8');

    assert.match(
      content,
      /SITE\.brand\.storeUrl/,
      'outlet.astro must link to SITE.brand.storeUrl'
    );
    assert.match(
      content,
      /Ir a la Tienda/i,
      'outlet.astro must include an "Ir a la Tienda" CTA'
    );
    assert.match(
      content,
      /Hoy en tienda física y Tienda web/i,
      'outlet.astro image caption must reference tienda física y Tienda web'
    );
  });

  test('5. aviso-legal.astro reflects active Tienda web catalog and payment gateway in development', () => {
    const legalPath = path.join(projectRoot, 'src/pages/aviso-legal.astro');
    const content = fs.readFileSync(legalPath, 'utf-8');

    assert.match(
      content,
      /SITE\.brand\.storeUrl/,
      'aviso-legal.astro must reference SITE.brand.storeUrl'
    );
    assert.match(
      content,
      /tienda online/i,
      'aviso-legal.astro must mention tienda online'
    );
  });
});
