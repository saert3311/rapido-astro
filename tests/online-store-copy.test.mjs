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

  test('3. index.astro announces online store coming soon in Hero chip and FAQ', () => {
    const indexPath = path.join(projectRoot, 'src/pages/index.astro');
    const content = fs.readFileSync(indexPath, 'utf-8');

    // Hero chip check
    assert.match(
      content,
      /Tienda online próximamente/i,
      'index.astro must display a Hero chip announcing online store coming soon'
    );

    // FAQ check
    assert.match(
      content,
      /tienda online/i,
      'index.astro FAQ must mention tienda online'
    );
    assert.match(
      content,
      /pronto|próximamente|en desarrollo/i,
      'index.astro FAQ must state that online store is coming soon or in development'
    );
  });

  test('4. outlet.astro announces online store in FAQ and updates image badge', () => {
    const outletPath = path.join(projectRoot, 'src/pages/outlet.astro');
    const content = fs.readFileSync(outletPath, 'utf-8');

    // Badge check
    assert.match(
      content,
      /Hoy en tienda · Online próximamente/i,
      'outlet.astro image badge must say "Hoy en tienda · Online próximamente"'
    );

    // FAQ check
    assert.match(
      content,
      /tienda online/i,
      'outlet.astro FAQ must mention tienda online'
    );
    assert.match(
      content,
      /en camino|pronto|próximamente|en desarrollo/i,
      'outlet.astro FAQ must state that online store is coming soon or on the way'
    );
  });

  test('5. aviso-legal.astro reflects online store in active development', () => {
    const legalPath = path.join(projectRoot, 'src/pages/aviso-legal.astro');
    const content = fs.readFileSync(legalPath, 'utf-8');

    assert.match(
      content,
      /Tienda Online en Desarrollo/i,
      'aviso-legal.astro Section 3 title must mention "Tienda Online en Desarrollo"'
    );
    assert.match(
      content,
      /tienda online/i,
      'aviso-legal.astro must mention tienda online'
    );
  });
});
