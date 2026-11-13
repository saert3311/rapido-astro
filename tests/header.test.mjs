import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const headerPath = path.join(rootDir, 'src', 'components', 'Header.astro');
const layoutPath = path.join(rootDir, 'src', 'layouts', 'Layout.astro');

describe('Header component - Logo & Typography specifications (TDD)', () => {
  test('Header logo has 120px height on desktop and enlarged height on mobile', () => {
    const headerSource = fs.readFileSync(headerPath, 'utf-8');

    // Logo image tag must specify 120px height on desktop
    assert.match(
      headerSource,
      /class="[^"]*h-\[120px\][^"]*"/,
      'Logo image must have h-[120px] class for 120px height'
    );

    // Mobile logo must be enlarged beyond previous 76px (e.g. h-[92px] or h-[96px])
    const hasEnlargedMobile =
      /h-\[9[0-9]px\]|h-\[10[0-9]px\]/.test(headerSource);
    assert.ok(
      hasEnlargedMobile,
      'Mobile logo must have enlarged height class (e.g. h-[92px] to h-[104px])'
    );
  });

  test('Header navigation links use bold fonts and larger font size', () => {
    const headerSource = fs.readFileSync(headerPath, 'utf-8');

    // Desktop nav links must be font-bold
    assert.match(
      headerSource,
      /font-bold/,
      'Desktop navigation links must use font-bold'
    );

    // Desktop nav links must NOT use text-sm for nav links, must use text-base or larger
    // Check nav links definition in desktop nav
    const desktopNavMatch = headerSource.match(/<nav aria-label="Navegación principal"[\s\S]*?<\/nav>/);
    assert.ok(desktopNavMatch, 'Desktop navigation element must exist');
    const desktopNav = desktopNavMatch[0];

    assert.ok(
      desktopNav.includes('font-bold'),
      'Desktop nav items must include font-bold'
    );
    assert.ok(
      desktopNav.includes('text-base') || desktopNav.includes('text-[17px]') || desktopNav.includes('text-lg'),
      'Desktop nav items must use text-base or larger font size'
    );
    assert.ok(
      !desktopNav.includes('text-sm'),
      'Desktop nav items should not use text-sm anymore'
    );
  });

  test('Mobile navigation links use bold fonts and larger font size', () => {
    const headerSource = fs.readFileSync(headerPath, 'utf-8');

    const mobileNavMatch = headerSource.match(/<nav\s+aria-label="Navegación móvil"[\s\S]*?<\/nav>/);
    assert.ok(mobileNavMatch, 'Mobile navigation element must exist');
    const mobileNav = mobileNavMatch[0];

    assert.ok(
      mobileNav.includes('font-bold'),
      'Mobile nav links must use font-bold'
    );
    assert.ok(
      mobileNav.includes('text-base') || mobileNav.includes('text-lg'),
      'Mobile nav links must use text-base or larger'
    );
  });

  test('Header container height and Layout main padding accommodate 120px logo', () => {
    const headerSource = fs.readFileSync(headerPath, 'utf-8');
    const layoutSource = fs.readFileSync(layoutPath, 'utf-8');

    // Header container must be taller than 120px to hold the 120px logo without clipping
    // e.g. lg:h-36 (144px) or h-36 or h-[140px]
    const headerAccommodates120px =
      /h-36|lg:h-36|h-\[140px\]|lg:h-\[140px\]|h-32 lg:h-36/.test(headerSource);
    assert.ok(
      headerAccommodates120px,
      'Header container height must accommodate the 120px logo (e.g. h-36 / lg:h-36)'
    );

    // Layout main top padding must match the enlarged header height
    const mainMatchesHeader =
      /pt-36|lg:pt-36|pt-\[140px\]|lg:pt-\[140px\]/.test(layoutSource);
    assert.ok(
      mainMatchesHeader,
      'Layout main pt must match the enlarged header height on desktop (e.g. lg:pt-36)'
    );
  });

  test('Rendered index.html in dist has updated 120px logo and bold navigation', () => {
    const distIndexPath = path.join(rootDir, 'dist', 'index.html');
    if (!fs.existsSync(distIndexPath)) {
      // Skip if build hasn't run yet
      return;
    }
    const html = fs.readFileSync(distIndexPath, 'utf-8');

    // Logo presence and classes in built HTML
    assert.match(
      html,
      /logo-rapido-pack-valencia\.png/,
      'Rendered HTML must contain official logo image'
    );
    assert.match(
      html,
      /h-\[120px\]/,
      'Rendered HTML must contain h-[120px] class for desktop logo'
    );
    assert.match(
      html,
      /font-bold/,
      'Rendered HTML must contain font-bold navigation links'
    );
  });

  test('Header has clean white surface with emerald top border, diffusion shadow, uppercase nav, and WCAG AA active contrast', () => {
    const headerSource = fs.readFileSync(headerPath, 'utf-8');

    // Header element must use clean white surface with top brand accent and bottom hairline separation
    assert.match(
      headerSource,
      /<header[^>]*bg-white\/95/,
      'Header element must use clean white bg-white/95 surface for optimal logo contrast'
    );
    assert.match(
      headerSource,
      /<header[^>]*border-t-\[3px\]\s+border-t-primary/,
      'Header element must have a 3px top emerald accent bar (border-t-[3px] border-t-primary)'
    );
    assert.match(
      headerSource,
      /<header[^>]*border-b\s+border-border-subtle/,
      'Header element must have bottom subtle hairline border (border-b border-border-subtle)'
    );

    // Active nav links must use WCAG AA compliant primary-hover (#047842) on mint-wash
    assert.match(
      headerSource,
      /bg-mint-wash\s+text-primary-hover/,
      'Active nav links must use text-primary-hover on bg-mint-wash (>= 4.5:1 WCAG AA contrast)'
    );

    // Nav links must be uppercase
    assert.match(
      headerSource,
      /uppercase/,
      'Header navigation links must have uppercase style'
    );

    // Header action area should not have desktop "Cómo llegar" button
    const actionAreaMatch = headerSource.match(/<div class="flex items-center gap-2\.5[\s\S]*?<\/div>\s*<\/div>\s*<\/header>/);
    assert.ok(actionAreaMatch, 'Header right action area must exist');
    // Header desktop action area outside <details> should not have "Cómo llegar" button
    const desktopActionArea = actionAreaMatch[0].split('<details')[0];
    assert.ok(
      !desktopActionArea.includes('Cómo llegar'),
      'Header desktop topbar must not have desktop "Cómo llegar" button'
    );
  });
});
