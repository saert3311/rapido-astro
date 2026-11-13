import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

function getSourceFiles(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getSourceFiles(fullPath));
    } else if (/\.(astro|ts|js|mjs)$/.test(file)) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Tienda Física & Tienda Web Coexistence (TDD)', () => {
  test('1. Scrubber: Zero "tienda de/en Alfafar", "establecimiento de Alfafar", or anti-web copy in src/', () => {
    const files = getSourceFiles(path.join(projectRoot, 'src'));
    const forbiddenPatterns = [
      { regex: /tienda\s+(?:de\s+|en\s+)?Alfafar/i, label: 'tienda [de/en] Alfafar' },
      { regex: /establecimiento(?:\s+comercial)?\s+de\s+Alfafar/i, label: 'establecimiento [comercial] de Alfafar' },
      { regex: /equipo\s+de\s+Alfafar/i, label: 'equipo de Alfafar' },
      { regex: /Chollos del Día\s*·\s*Alfafar/i, label: 'Chollos del Día · Alfafar' },
      { regex: /compra a ciegas en internet/i, label: 'compra a ciegas en internet' },
      { regex: /Paquetería en Alfafar/i, label: 'Paquetería en Alfafar' },
      { regex: /Outlet y Segunda Mano en Alfafar/i, label: 'Outlet y Segunda Mano en Alfafar' },
      { regex: /Ubicación en Alfafar/i, label: 'Ubicación en Alfafar' },
      { regex: /(?:visitarnos|integrados|encontrarnos|agencias|paquetes|Valencia|paquetería)\s+en\s+Alfafar/i, label: 'service copy "en Alfafar"' },
      { regex: /Visita\s+.*?\s+en\s+Alfafar/i, label: 'Visita ... en Alfafar' },
      { regex: /00\s*\/\/\s*Alfafar/i, label: '00 // Alfafar' },
    ];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const rel = path.relative(projectRoot, file);
      for (const { regex, label } of forbiddenPatterns) {
        assert.doesNotMatch(
          content,
          regex,
          `${rel} must not contain "${label}"`
        );
      }
    }
  });

  test('2. Coexistence copy: index.astro, outlet.astro, aviso-legal.astro, Footer.astro, and site.ts frame tienda física + tienda web/online', () => {
    const targets = [
      { file: 'src/pages/index.astro', requireWeb: true },
      { file: 'src/pages/outlet.astro', requireWeb: true },
      { file: 'src/pages/aviso-legal.astro', requireWeb: true },
      { file: 'src/components/Footer.astro', requireWeb: true },
      { file: 'src/config/site.ts', requireWeb: true },
    ];

    for (const { file, requireWeb } of targets) {
      const content = fs.readFileSync(path.join(projectRoot, file), 'utf-8');
      assert.match(content, /tienda física/i, `${file} must explicitly reference "tienda física"`);
      if (requireWeb) {
        assert.match(
          content,
          /tienda web|tienda online/i,
          `${file} must reference coexistence with "tienda web" or "tienda online"`
        );
      }
    }
  });

  test('3. Location preservation: Physical address in Alfafar and Estación Alfafar-Benetússer remain intact', () => {
    const siteTs = fs.readFileSync(path.join(projectRoot, 'src/config/site.ts'), 'utf-8');
    const legalTs = fs.readFileSync(path.join(projectRoot, 'src/config/legal.ts'), 'utf-8');

    assert.match(siteTs, /Carrer del Comte Ronrée 8/);
    assert.match(siteTs, /city\s*=\s*['"]Alfafar['"]/);
    assert.match(siteTs, /Estación Alfafar-Benetússer/);
    assert.match(legalTs, /Carrer del Comte Ronrée, 8, 46910 Alfafar, Valencia/);
  });
});
