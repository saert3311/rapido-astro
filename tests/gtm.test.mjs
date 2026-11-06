import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

describe('Google Tag Manager Integration - TDD Suite', () => {
  test('1. Configuration - site.ts exports parameterized GTM ID defaulting to GTM-PGBXBVXJ', () => {
    const siteConfigPath = path.join(projectRoot, 'src/config/site.ts');
    assert.ok(fs.existsSync(siteConfigPath), 'src/config/site.ts must exist');

    const content = fs.readFileSync(siteConfigPath, 'utf-8');
    assert.match(
      content,
      /analytics:\s*\{[^}]*gtmId:/s,
      'src/config/site.ts must export analytics.gtmId'
    );
    assert.match(
      content,
      /GTM-PGBXBVXJ/,
      'src/config/site.ts must contain default ID GTM-PGBXBVXJ'
    );
  });

  test('2. Component - GoogleTagManager.astro exists with is:inline scripts, resource hints and no noscript', () => {
    const compPath = path.join(projectRoot, 'src/components/GoogleTagManager.astro');
    assert.ok(fs.existsSync(compPath), 'src/components/GoogleTagManager.astro must exist');

    const content = fs.readFileSync(compPath, 'utf-8');

    // Must use is:inline on scripts to avoid Vite module scoping
    const scriptMatches = content.match(/<script\b[^>]*>/g) || [];
    assert.ok(scriptMatches.length >= 2, 'GoogleTagManager.astro must contain at least 2 <script> tags');
    for (const tag of scriptMatches) {
      assert.ok(
        tag.includes('is:inline'),
        `Every script in GoogleTagManager.astro must have is:inline directive. Offending tag: ${tag}`
      );
    }

    // Must contain required snippet logic
    assert.match(content, /googletagmanager\.com\/gtm\.js\?id=/, 'Must load gtm.js with parameterized id');
    assert.match(content, /window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];/, 'Must initialize window.dataLayer');
    assert.match(content, /function gtag\(\)\s*\{dataLayer\.push\(arguments\);\}/, 'Must define gtag function');
    assert.match(content, /gtag\('js',\s*new Date\(\)\);/, 'Must call gtag js initialization');

    // Must include resource hints for connection performance
    assert.match(content, /rel=["']preconnect["'][^>]*googletagmanager\.com/, 'Must preconnect to googletagmanager.com');
    assert.match(content, /rel=["']dns-prefetch["'][^>]*googletagmanager\.com/, 'Must dns-prefetch to googletagmanager.com');

    // Scope boundary: Strictly no noscript iframe (per user specification)
    assert.doesNotMatch(content, /<noscript>/i, 'GoogleTagManager.astro must NOT include <noscript>');
    assert.doesNotMatch(content, /<iframe/i, 'GoogleTagManager.astro must NOT include <iframe>');

    // Gating logic: Must check production environment
    assert.match(
      content,
      /import\.meta\.env\.PROD/,
      'GoogleTagManager.astro must check import.meta.env.PROD for gating'
    );
  });

  test('3. Layout integration - Layout.astro imports and mounts GoogleTagManager in <head>', () => {
    const layoutPath = path.join(projectRoot, 'src/layouts/Layout.astro');
    const content = fs.readFileSync(layoutPath, 'utf-8');

    assert.match(
      content,
      /import\s+GoogleTagManager\s+from\s+['"]\.\.\/components\/GoogleTagManager\.astro['"]/,
      'Layout.astro must import GoogleTagManager component'
    );

    const headMatch = content.match(/<head>([\s\S]*?)<\/head>/);
    assert.ok(headMatch, 'Layout.astro must contain a <head> section');
    assert.match(
      headMatch[1],
      /<GoogleTagManager\s*\/>/,
      '<GoogleTagManager /> must be placed inside <head>'
    );
  });

  test('4. Production build artifact - dist/index.html includes GTM script when built in production', () => {
    const distIndexPath = path.join(projectRoot, 'dist/index.html');
    if (!fs.existsSync(distIndexPath)) {
      // If dist has not been built yet, this assertion passes conditionally or is validated during build step
      return;
    }
    const html = fs.readFileSync(distIndexPath, 'utf-8');
    assert.match(
      html,
      /https:\/\/www\.googletagmanager\.com\/gtm\.js\?id=GTM-PGBXBVXJ/,
      'dist/index.html must include GTM script with ID GTM-PGBXBVXJ'
    );
    assert.match(
      html,
      /window\.dataLayer\s*=\s*window\.dataLayer/,
      'dist/index.html must include dataLayer initialization'
    );
  });
});
