import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const headerContent = readFileSync(path.resolve('src/components/Header.astro'), 'utf-8');
const footerContent = readFileSync(path.resolve('src/components/Footer.astro'), 'utf-8');

test('Header logo has enlarged dimensions for higher prominence (TDD Target)', () => {
  // Target: Logo is 120px on desktop and enlarged on mobile (>=90px).
  const hasEnlargedMobile = /h-\[(?:9[0-9]|1[0-1][0-9])px\]|h-24|h-\[(7[4-9]|8[0-9])px\]/.test(headerContent);
  const hasEnlargedDesktop = /h-\[120px\]|(?:sm:|md:|lg:)h-\[120px\]/.test(headerContent);

  assert.ok(hasEnlargedMobile, 'Header logo must have enlarged height on mobile');
  assert.ok(hasEnlargedDesktop, 'Header logo must have 120px height on desktop');
});

test('Footer logo has enlarged dimensions', () => {
  // Target: Footer logo should be enlarged from h-12 (48px) to at least h-14 (56px) or h-16.
  const hasEnlargedFooter = /h-14|h-16|h-\[(5[6-9]|6[0-9])px\]/.test(footerContent);
  assert.ok(hasEnlargedFooter, 'Footer logo should be at least h-14 or h-16 (currently h-12)');
});

test('Mobile navigation menu has responsive width protection against narrow viewports', () => {
  // Target: Mobile menu dropdown width should not be hardcoded to fixed w-72 without viewport safety clamp
  const hasResponsiveWidth = /w-\[calc\(100vw-2rem\)\]|max-w-\[calc\(100vw-2rem\)\]|max-w-xs/.test(headerContent);
  assert.ok(hasResponsiveWidth, 'Mobile menu should use viewport-safe responsive width (e.g. w-[calc(100vw-2rem)] sm:w-72)');
});

test('Mobile navigation menu includes live store open/closed status badge', () => {
  // Target: Mobile drawer should surface store open/closed status for mobile users
  const hasMobileLiveStatus = /header-mobile-live-status|data-mobile-status/.test(headerContent);
  assert.ok(hasMobileLiveStatus, 'Mobile navigation drawer should include live store status');
});

test('Mobile touch targets adhere to WCAG 44px minimum sizing', () => {
  // Touch targets in mobile drawer must have at least 44px min-height (py-3 or min-h-[44px])
  const hasMinHeight = /min-h-\[44px\]|py-3/.test(headerContent);
  assert.ok(hasMinHeight, 'Mobile navigation links should have minimum touch target height of 44px (py-3 or min-h-[44px])');
});
