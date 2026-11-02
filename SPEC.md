# Spec: Rebrand to Rápido Pack Valencia, Weekly Merch Copy, Larger Top Bar & Logo, 3-Page Navigation & Dedicated Outlet (2nd-Hand) Page

## Objective
Update the **Rápido Pack Valencia** Astro site (`feature/segunda-mano-and-rebrand`) to:
1. **Brand Naming (`Rápido Pack Valencia`):** Replace all user-facing and metadata occurrences of standalone `Rápido Pack` / `RápidoPack` with **`Rápido Pack Valencia`** across layouts, pages, and components.
2. **Larger Top Bar & Uploaded Brand Logo (`Header.astro`, `Footer.astro`, `Layout.astro`):**
   - Adapt the provided official **Rápido Pack Valencia** logo (`public/logo-rapido-pack-valencia.png`, cropped with transparent background for clean rendering) and use it in `Header.astro` (and `Footer.astro` / `favicon`).
   - Increase the fixed header height to `h-24` (`96px`, with matching `pt-24` on `<main>`) and render the logo prominently (`h-16 sm:h-[72px] w-auto`) without redundant duplicate text next to the logo image.
3. **Weekly Restock Phrasing (No Specific Monday 09:30 Claim):** Replace specific "every Monday at 09:30" restock promises (`cada lunes a las 09:30`, `Lunes de Reposición Total`, `#monday-countdown-pill` script, etc.) with broader **weekly restock** messaging (`mercancía nueva todas las semanas`, `renovación semanal de stock`, `nuevos lotes cada semana`). Keep regular store opening hours (`Lunes a Viernes 09:30–20:00 · Sábados 10:00–15:00`) intact where they refer strictly to business opening hours.
4. **Simplified 3-Item Navigation Menu (`Header.astro` & `Footer.astro`):** Reduce the navigation menu strictly to the 3 top-level page links:
   - **Inicio** (`/`)
   - **Outlet** (`/outlet`) — dedicated page for 2nd-hand & outlet products
   - **Contacto** (`/contacto`)
5. **Dedicated 2nd-Hand & Outlet Products Page (`/outlet`) + Home Reference:**
   - Create `src/pages/outlet.astro` showcasing verified second-hand, reconditioned, and outlet products inspected in-store (technology, small appliances, tools, home goods) with in-store electrical testing benches (`mesas con enchufe`).
   - Reference and link to `/outlet` directly from `src/pages/index.astro`.

## Tech Stack
- **Framework:** Astro `^7.4.4` (static output `./dist/`, strict TypeScript)
- **Styling:** Tailwind CSS `^4.3.3` via `@tailwindcss/vite` (`src/styles/global.css`)
- **Interactivity:** Native HTML (`<details name="...">`, `:user-invalid`) + minimal inline scripts (`<script is:inline>`) — zero extra npm packages (`/ponytail`)
- **Deployment:** Cloudflare Workers Static Assets (`wrangler.json`)

## Commands
- **Dev server (background):** `npx astro dev --background`
- **Dev server status / stop:** `npx astro dev status` / `npx astro dev stop`
- **Production build:** `npm run build`
- **Preview build:** `npm run preview`

## Project Structure
```text
public/
└── logo-rapido-pack-valencia.png # Adapted official Rápido Pack Valencia logo
src/
├── styles/global.css             # Tailwind v4 @theme tokens (Outfit, Plus Jakarta Sans, JetBrains Mono)
├── layouts/Layout.astro          # Shared HTML shell (currentPage: 'home' | 'outlet' | 'contacto', pt-24)
├── pages/
│   ├── index.astro               # Home page + weekly stock Bento + reference/CTA to /outlet
│   ├── outlet.astro              # NEW: Dedicated 2nd-hand & outlet products page
│   └── contacto.astro            # Contact page updated with "Rápido Pack Valencia" & weekly stock copy
└── components/
    ├── Header.astro              # Taller h-24 navbar, larger official logo, 3-link nav (Inicio, Outlet, Contacto)
    ├── Footer.astro              # Updated brand logo/name, weekly copy, and 3-page navigation links
    ├── StoreLocator.astro        # Store schedule (Lunes a Viernes 09:30–20:00 without Monday-drop claim)
    ├── FaqAccordion.astro        # Reusable native exclusive accordion
    └── ContactForm.astro         # Contact form with weekly stock wording and "Rápido Pack Valencia"
```

## Code Style & Design Contract (`/design-taste-frontend`, `/frontend-ui-engineering`, `/ponytail`)
- **Smallest Complete Change (`/ponytail`):** Reuse `Layout.astro`, `StoreLocator.astro`, and `FaqAccordion.astro` directly in `src/pages/outlet.astro` instead of creating new single-use components or installing libraries. Delete the Monday countdown inline script in `index.astro`.
- **Anti-Generic Layout (`/design-taste-frontend`):**
  - No centered heroes (`DESIGN_VARIANCE: 8`). Use asymmetric `lg:grid-cols-12` (`lg:col-span-7` + `lg:col-span-5`) split layouts.
  - No 3-equal-column or 4-equal-column floating card rows. Use de-boxed hairline ledgers (`border-t border-b divide-y md:divide-x divide-border-subtle`) and asymmetric 7/5 Bento grids.
  - Maintain the typography triad: `font-display` (`Outfit`), `font-sans` (`Plus Jakarta Sans`), `font-mono` (`JetBrains Mono`).
- **Accessibility (`/frontend-ui-engineering`):** Single `<h1>` per page, logical `<h2>`→`<h3>` hierarchy, `aria-current="page"` on active nav links, keyboard focus rings (`focus-visible:outline-2`), and responsive collapse on `< 768px`.

```astro
<!-- 3-Link Navigation & Adapted Logo Lockup in Header.astro -->
const navLinks = [
  { label: 'Inicio', href: '/', active: currentPage === 'home' },
  { label: 'Outlet', href: '/outlet', active: currentPage === 'outlet' },
  { label: 'Contacto', href: '/contacto', active: currentPage === 'contacto' },
];
```

## Testing Strategy
1. **Static Build & Type Verification:** Run `npm run build` and confirm 3 static routes (`/index.html`, `/outlet/index.html`, `/contacto/index.html`) build with 0 errors.
2. **Content & Grep Verification:**
   - Grep `src/` for any remaining standalone `Rápido Pack` (not followed by `Valencia`) or `RápidoPack`.
   - Grep `src/` for any remaining "lunes" restock claims (confirming only standard opening hours `Lunes a Viernes 09:30 – 20:00` remain).
3. **Browser DevTools Verification (`/browser-testing-with-devtools`):**
   - Inspect `/`, `/outlet`, and `/contacto` at `1440×900` (desktop) and `390×844` (mobile) in headless Chrome.
   - Verify 0 console errors/warnings, 0 horizontal overflow, taller `h-24` header with larger logo (`complete: true, naturalWidth > 0`), and working 3-item navigation.

## Boundaries
- **Always:** Keep `wrangler.json` (`"previews": {}`, `"assets": { "directory": "./dist" }`) intact; preserve `pb-20 md:pb-0` mobile sticky-bar clearance in `Footer.astro`; use `!hidden` / `group-open:!hidden` on Material Symbols icons in `Header.astro`; commit atomically on `feature/segunda-mano-and-rebrand`.
- **Ask first:** Adding any npm dependency, changing business hours (`L–V 09:30–20:00 · Sáb 10:00–15:00`), or adding e-commerce/catalog reservation features.
- **Never:** Mention specific Monday 09:30 restock times, use standalone "Rápido Pack" without "Valencia", or use 3-column equal card grids.

## Success Criteria
- [ ] Every occurrence of `Rápido Pack` / `RápidoPack` in `src/` is updated to `Rápido Pack Valencia`.
- [ ] Official logo image is adapted and served from `public/logo-rapido-pack-valencia.png`, and `Header.astro` is taller (`h-24` / `96px`, `<main class="pt-24">`) with the enlarged logo (`h-16 sm:h-[72px]`).
- [ ] All references to "new merch every Monday at 09:30" are replaced with weekly restock phrasing ("mercancía nueva todas las semanas" / "lotes renovados cada semana").
- [ ] Desktop and mobile navigation menus in `Header.astro` (and section links in `Footer.astro`) contain only the 3 page links: **Inicio** (`/`), **Outlet** (`/outlet`), and **Contacto** (`/contacto`).
- [ ] Dedicated page `src/pages/outlet.astro` exists for 2nd-hand & outlet products, follows the asymmetric 7/5 split hero + hairline ledger + 7/5 Bento design system, and is referenced with a direct CTA on `src/pages/index.astro`.
- [ ] `npm run build` succeeds and headless Chrome DevTools verification reports 0 console warnings/errors across `/`, `/outlet`, and `/contacto`.

## Open Questions
- *Resolved:* Menu label is **Outlet** (`/outlet`) and the provided `RÁPIDO PACK VALENCIA` logo image is used.
