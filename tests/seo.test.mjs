import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

describe('SEO Audit & Specification Automated Test Suite (TDD)', () => {
  test('1. Configuration & Domain - site.ts and astro.config declare rapidopackvalencia.es', async () => {
    const astroConfig = fs.readFileSync(path.join(projectRoot, 'astro.config.mjs'), 'utf-8');
    assert.match(
      astroConfig,
      /site:\s*['"]https:\/\/rapidopackvalencia\.es['"]/,
      'astro.config.mjs must declare site: https://rapidopackvalencia.es'
    );

    const siteConfig = fs.readFileSync(path.join(projectRoot, 'src/config/site.ts'), 'utf-8');
    assert.match(
      siteConfig,
      /rapidopackvalencia\.es/,
      'src/config/site.ts must declare rapidopackvalencia.es'
    );
    assert.doesNotMatch(
      siteConfig,
      /contacto@rapidopack\.es/,
      'src/config/site.ts must not contain old contact email'
    );
    assert.match(
      siteConfig,
      /latitude:\s*39\./,
      'src/config/site.ts must contain latitude coordinates'
    );
  });

  test('2. Robots.txt - Exists and points to canonical sitemap-index.xml', () => {
    const robotsPath = path.join(projectRoot, 'public/robots.txt');
    assert.ok(fs.existsSync(robotsPath), 'public/robots.txt must exist');
    const content = fs.readFileSync(robotsPath, 'utf-8');
    assert.match(content, /User-agent:\s*\*/i);
    assert.match(content, /Allow:\s*\//i);
    assert.match(content, /Sitemap:\s*https:\/\/rapidopackvalencia\.es\/sitemap-index\.xml/i);
  });

  test('3. Canonical URLs - Layout.astro defines dynamic rel="canonical"', () => {
    const layoutContent = fs.readFileSync(path.join(projectRoot, 'src/layouts/Layout.astro'), 'utf-8');
    assert.match(
      layoutContent,
      /<link\s+rel=["']canonical["']\s+href=/,
      'Layout.astro must declare dynamic <link rel="canonical" ... />'
    );
  });

  test('4. Social Metadata - Layout.astro defines OpenGraph and Twitter Card tags', () => {
    const layoutContent = fs.readFileSync(path.join(projectRoot, 'src/layouts/Layout.astro'), 'utf-8');
    assert.match(layoutContent, /property=["']og:title["']/);
    assert.match(layoutContent, /property=["']og:description["']/);
    assert.match(layoutContent, /property=["']og:image["']/);
    assert.match(layoutContent, /property=["']og:url["']/);
    assert.match(layoutContent, /property=["']og:type["']/);
    assert.match(layoutContent, /property=["']og:locale["']/);
    assert.match(layoutContent, /name=["']twitter:card["']/);
  });

  test('5. Schema.org JSON-LD - Layout.astro injects LocalBusiness / Store structured data', () => {
    const layoutContent = fs.readFileSync(path.join(projectRoot, 'src/layouts/Layout.astro'), 'utf-8');
    assert.match(layoutContent, /type=["']application\/ld\+json["']/);
    assert.match(layoutContent, /schema\.org/);
    assert.match(layoutContent, /LocalBusiness|Store/);
    assert.match(layoutContent, /openingHoursSpecification/);
  });

  test('6. SERP Snippets - Titles are calibrated between 35 and 65 characters', () => {
    const pages = [
      'src/pages/index.astro',
      'src/pages/paqueteria.astro',
      'src/pages/outlet.astro',
      'src/pages/contacto.astro',
    ];

    for (const pageRel of pages) {
      const content = fs.readFileSync(path.join(projectRoot, pageRel), 'utf-8');
      const layoutBlockMatch = content.match(/<Layout[\s\S]*?>/);
      assert.ok(layoutBlockMatch, `<Layout ...> must be present in ${pageRel}`);
      const layoutTag = layoutBlockMatch[0];
      const titleMatch = layoutTag.match(/title=\{`([\s\S]*?)`\}/) || layoutTag.match(/title="([^"]+)"/);
      assert.ok(titleMatch, `Title must be declared on <Layout> in ${pageRel}`);
      
      let title = titleMatch[1];
      title = title.replace(/\$\{SITE\.brand\.name\}/g, 'Rápido Pack Valencia')
                   .replace(/\$\{SITE\.location\.city\}/g, 'Alfafar');

      assert.ok(
        title.length >= 35 && title.length <= 65,
        `Title in ${pageRel} evaluates to "${title}" (${title.length} chars). Must be between 35 and 65 chars to prevent SERP truncation.`
      );
    }
  });

  test('7. SERP Snippets - Meta descriptions are calibrated between 120 and 160 characters', () => {
    const pages = [
      { file: 'src/pages/index.astro', defaultDesc: true },
      { file: 'src/pages/paqueteria.astro', defaultDesc: false },
      { file: 'src/pages/outlet.astro', defaultDesc: false },
      { file: 'src/pages/contacto.astro', defaultDesc: false },
    ];

    for (const { file, defaultDesc } of pages) {
      const content = fs.readFileSync(path.join(projectRoot, file), 'utf-8');
      const layoutBlockMatch = content.match(/<Layout[\s\S]*?>/);
      assert.ok(layoutBlockMatch, `<Layout ...> must be present in ${file}`);
      const layoutTag = layoutBlockMatch[0];

      let desc = '';
      if (defaultDesc && !layoutTag.includes('description=')) {
        const siteConfig = fs.readFileSync(path.join(projectRoot, 'src/config/site.ts'), 'utf-8');
        const descMatch = siteConfig.match(/metaDescription:\s*['"`]([\s\S]*?)['"`],/);
        assert.ok(descMatch, 'metaDescription must exist in site.ts');
        desc = descMatch[1].replace(/\s+/g, ' ').trim();
      } else {
        const descMatch = layoutTag.match(/description=\{`([\s\S]*?)`\}/) || layoutTag.match(/description="([^"]+)"/);
        assert.ok(descMatch, `Description must be declared on <Layout> in ${file}`);
        desc = descMatch[1]
          .replace(/\$\{SITE\.brand\.name\}/g, 'Rápido Pack Valencia')
          .replace(/\$\{SITE\.location\.city\}/g, 'Alfafar')
          .replace(/\$\{SITE\.contact\.phoneDisplay\}/g, '640 39 74 34')
          .replace(/\$\{SITE\.location\.fullAddress\}/g, 'Carrer del Comte Ronrée 8, 46910 Alfafar, Valencia')
          .replace(/\s+/g, ' ')
          .trim();
      }

      assert.ok(
        desc.length >= 120 && desc.length <= 160,
        `Description in ${file} evaluates to "${desc}" (${desc.length} chars). Must be between 120 and 160 chars to avoid SERP cutoff.`
      );
    }
  });

  test('8. Legal & RGPD Compliance - Legal pages exist and are linked from Footer and Form', () => {
    const avisoLegalPath = path.join(projectRoot, 'src/pages/aviso-legal.astro');
    const privacidadPath = path.join(projectRoot, 'src/pages/privacidad.astro');
    assert.ok(fs.existsSync(avisoLegalPath), 'src/pages/aviso-legal.astro must exist');
    assert.ok(fs.existsSync(privacidadPath), 'src/pages/privacidad.astro must exist');

    const footerContent = fs.readFileSync(path.join(projectRoot, 'src/components/Footer.astro'), 'utf-8');
    assert.match(footerContent, /href=["']\/aviso-legal["']/, 'Footer must link to /aviso-legal');
    assert.match(footerContent, /href=["']\/privacidad["']/, 'Footer must link to /privacidad');

    const formContent = fs.readFileSync(path.join(projectRoot, 'src/components/ContactForm.astro'), 'utf-8');
    assert.match(formContent, /href=["']\/privacidad["']/, 'ContactForm must link to /privacidad');
  });

  test('9. Deprecated Domain Scrubber - No remaining references to rapidopack.es in src/', () => {
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
            /[^a-zA-Z0-9]rapidopack\.es/i,
            `File ${fullPath} contains obsolete reference to rapidopack.es`
          );
        }
      }
    }
    scanDir(path.join(projectRoot, 'src'));
  });
});
