import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const headerContent = readFileSync(path.resolve('src/components/Header.astro'), 'utf-8');
const footerContent = readFileSync(path.resolve('src/components/Footer.astro'), 'utf-8');

test('Header logo has enlarged dimensions for higher prominence (TDD Target)', () => {
  // Target: Logo must be larger than the old h-16 (64px) on mobile and larger than sm:h-[72px] (72px) on desktop.
  // Target minimums: h-[74px] or higher on mobile, sm:h-[82px] or higher on desktop.
  const hasEnlargedMobile = /h-\[(7[4-9]|8[0-9])px\]|h-20|h-\[76px\]|h-\[78px\]/.test(headerContent);
  const hasEnlargedDesktop = /sm:h-\[(8[2-9]|9[0-9])px\]|sm:h-24|sm:h-\[84px\]/.test(headerContent);

  assert.ok(hasEnlargedMobile, 'Header logo must have height >= 74px on mobile (currently h-16 / 64px)');
  assert.ok(hasEnlargedDesktop, 'Header logo must have height >= 82px on desktop (currently sm:h-[72px])');
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
