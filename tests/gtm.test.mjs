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

  test('2. Component - GoogleTagManager.astro has correct order, gtm.start, non-CORS preconnect, and is:inline', () => {
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

    // Must contain required snippet logic with core GTM start event
    assert.match(content, /googletagmanager\.com\/gtm\.js\?id=/, 'Must load gtm.js with parameterized id');
    assert.match(content, /window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];/, 'Must initialize window.dataLayer');
    assert.match(content, /['"]gtm\.start['"]\s*:\s*new Date\(\)\.getTime\(\)/, 'Must push gtm.start timestamp');
    assert.match(content, /event\s*:\s*['"]gtm\.js['"]/, 'Must push gtm.js event for Page View triggers');
    assert.match(content, /function gtag\(\)\s*\{dataLayer\.push\(arguments\);\}/, 'Must define gtag helper function');
    assert.match(content, /gtag\('js',\s*new Date\(\)\);/, 'Must call gtag js initialization');

    // Execution Order: dataLayer setup inline script MUST precede async gtm.js script
    const inlineScriptIndex = content.indexOf('window.dataLayer');
    const asyncScriptIndex = content.indexOf('src={`https://www.googletagmanager.com/gtm.js');
    assert.ok(
      inlineScriptIndex !== -1 && asyncScriptIndex !== -1 && inlineScriptIndex < asyncScriptIndex,
      'Inline dataLayer script MUST appear before the external async gtm.js script to prevent race conditions'
    );

    // Preconnect MUST NOT have crossorigin because gtm.js is loaded without crossorigin (classic script fetch)
    const preconnectMatch = content.match(/<link\s+rel=["']preconnect["'][^>]*>/);
    assert.ok(preconnectMatch, 'Must declare preconnect to googletagmanager.com');
    assert.ok(
      !preconnectMatch[0].includes('crossorigin'),
      'Preconnect for classic script must not declare crossorigin (avoids socket pool mismatch in Chromium)'
    );
    assert.match(content, /rel=["']dns-prefetch["'][^>]*googletagmanager\.com/, 'Must dns-prefetch to googletagmanager.com');

    // Scope boundary: Strictly no noscript iframe (per user specification)
    assert.doesNotMatch(content, /<noscript>/i, 'GoogleTagManager.astro must NOT include <noscript>');
    assert.doesNotMatch(content, /<iframe/i, 'GoogleTagManager.astro must NOT include <iframe>');

    // Sanitization and validation: ID format validation
    assert.match(
      content,
      /\/\^\[A-Z0-9-\]\+\$\/i/,
      'GoogleTagManager.astro must validate container ID format'
    );

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

  test('4. Production build artifact - dist/index.html includes GTM script and gtm.js event when built', () => {
    const distIndexPath = path.join(projectRoot, 'dist/index.html');
    if (!fs.existsSync(distIndexPath)) {
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
    assert.match(
      html,
      /['"]gtm\.start['"]/,
      'dist/index.html must include gtm.start timestamp'
    );
    assert.match(
      html,
      /event\s*:\s*['"]gtm\.js['"]/,
      'dist/index.html must include event: "gtm.js"'
    );
  });
});
