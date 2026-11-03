# Project: Rápido Pack Valencia (`rapido-astro`)

Marketing, outlet showcase, and store-locator site for **Rápido Pack Valencia**, a physical-only 2nd-hand & brand outlet (restocked every week) and official parcel point in Alfafar, Valencia (`Carrer del Comte Ronrée, 8`).

## Tech Stack

- **Framework:** Astro 7 (`^7.4.4`), static output (`./dist/`), strict TypeScript (`astro/tsconfigs/strict`), Node.js `>=22.23.4`.
- **Styling:** Tailwind CSS v4 (`^4.3.3`) via `@tailwindcss/vite` in `astro.config.mjs`. All design tokens live in `src/styles/global.css` under `@theme`.
- **Interactivity:** Zero client-side UI framework (no React/Vue/Svelte). Uses native HTML primitives (`<details name="...">` exclusive accordions, CSS `:user-invalid` validation) and scoped `<script is:inline>` IIFEs.
- **Deployment:** Cloudflare Workers Static Assets configured in `wrangler.json` (`assets.directory: "./dist"`).

## Development & Commands

When starting the dev server, use background mode:

```sh
npx astro dev --background
```

Manage the background server with `npx astro dev stop`, `npx astro dev status`, and `npx astro dev logs`.

- **Install:** `npm install`
- **Dev server (background):** `npx astro dev --background` (serves at `http://localhost:4321`)
- **Production build & type-check:** `npm run build` (runs `astro build` → `./dist/`)
- **Preview production build:** `npm run preview`
- **Browser verification:** Inspect `/`, `/paqueteria`, `/outlet`, and `/contacto` (`1440×900` & `390×844`) via headless Chrome / DevTools before committing UI changes; console must have zero warnings or errors.

## Project Structure

```text
├── astro.config.mjs               # Vite + @tailwindcss/vite configuration
├── wrangler.json                  # Cloudflare static assets + previews config
├── public/
│   └── logo-rapido-pack-valencia.png # Official brand emblem with transparent background
└── src/
    ├── styles/global.css          # @import "tailwindcss", @theme tokens, utilities
    ├── layouts/Layout.astro       # HTML shell (pt-24), Google Fonts, fixed grain overlay
    ├── pages/
    │   ├── index.astro            # Home: 7/5 split hero, dual gateway cards, hairline ledger
    │   ├── paqueteria.astro       # Parcel hub: 5 official carriers, 3-step guide, logistics FAQ
    │   ├── outlet.astro           # Outlet & 2nd-hand: inspection ledger + 7/5 Bento showcase
    │   └── contacto.astro         # Contact: hairline channel ledger, form, store info & map
    └── components/
        ├── Header.astro           # Sticky h-24 navbar, official logo, 4-page nav, live status
        ├── Footer.astro           # Dark footer with mobile sticky-CTA bottom clearance
        ├── StoreLocator.astro     # Schedule table + map hub with Liquid Glass overlays
        ├── FaqAccordion.astro     # Native <details name="..."> exclusive accordion
        └── ContactForm.astro      # Accessible form with :user-invalid + WeakMap fallback
```

## Code Conventions & Patterns

- **Typography Triad (`src/styles/global.css`):**
  - `font-display` (`Outfit`): Headings (`h1`–`h4`), paired with `text-wrap: balance`.
  - `font-sans` (`Plus Jakarta Sans`): Body copy and buttons (`font-label-button`), paired with `text-wrap: pretty`.
  - `font-mono` (`JetBrains Mono`): Time slots (`09:30 – 20:00`), phone numbers (`685 11 95 11`), section/item indices (`01 //`, `/01`), and telemetry badges.
- **Color & Surface Discipline:**
  - Neutral slate surfaces (`bg-surface`, `bg-surface-alt`, `bg-surface-dark`) with a single emerald accent (`text-primary` `#059652`, `bg-mint-wash` `#ECFDF5`, `text-primary-fixed` `#6EE7B7`).
  - Avoid uniform 3-column or 4-column floating card rows. Use **de-boxed hairline ledgers** (`border-t border-b divide-y md:divide-x divide-border-subtle`) or **asymmetric 7/5 grids** (`lg:grid-cols-12` with `lg:col-span-7` and `lg:col-span-5`).
  - Use `.diffusion-card` for elevated Bento containers and `.liquid-glass` / `.liquid-glass-light` for floating image badges.
- **Component Pattern (`src/components/*.astro`):**
  ```astro
  ---
  interface Props {
    badge?: string;
    title: string;
  }
  const { badge = '01 // Sección', title } = Astro.props;
  ---
  <section class="w-full bg-surface-alt py-16 lg:py-24 border-b border-border-subtle">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <span class="inline-block font-mono text-xs font-semibold text-primary uppercase tracking-widest mb-2">
        {badge}
      </span>
      <h2 class="font-display text-3xl sm:text-4xl font-bold tracking-tight text-surface-dark">
        {title}
      </h2>
    </div>
  </section>
  ```

## Things a Newcomer Would Get Wrong (Gotchas)

1. **Tailwind v4 Configuration:** Do **not** create `tailwind.config.js`, install `@astrojs/tailwind`, or inject `<script src="https://cdn.tailwindcss.com">`. Extend tokens exclusively inside `@theme { ... }` in `src/styles/global.css`.
2. **Material Symbols vs. Tailwind `hidden` Specificity:** Google Fonts `.material-symbols-outlined` declares `display: inline-block`, which overrides standard `.hidden` / `group-open:hidden` classes. Always use `!hidden`, `group-open:!hidden`, and `group-open:!inline-block` when toggling icon visibility (see `src/components/Header.astro`).
3. **Timezone-Bound Store Status (`Europe/Madrid`):** Live open/closed indicators (`Header.astro`) must evaluate time in `timeZone: 'Europe/Madrid'` via `Intl.DateTimeFormat`, never the browser's local timezone.
4. **Native Accordion Animations:** `FaqAccordion.astro` relies on `:root { interpolate-size: allow-keywords; }` and `details::details-content` in `src/styles/global.css`. Keep the shared `name={groupName}` attribute on `<details>` for exclusive accordion behavior without JS height calculations.
5. **Mobile Sticky CTA Clearance:** `src/pages/index.astro` renders a `md:hidden fixed bottom-3` bar. Keep `pb-20 md:pb-0` on `Footer.astro` so mobile viewports (`< 768px`) never clip footer content.
6. **Cloudflare `wrangler.json` Previews Block:** Cloudflare CI runs `npx wrangler preview`; never remove `"previews": {}` or `"assets": { "directory": "./dist" }` from `wrangler.json`.
7. **Business Domain Boundaries:** Rápido Pack Valencia sells **100% in-person** in Alfafar (no online catalog, no reservations, no e-commerce shipping), receives new 2nd-hand and outlet merchandise every week (avoid promising exact Monday 09:30 restock times), and operates an official parcel point (`Amazon Hub Counter`, `InPost`, `GLS`, `SEUR`, `CTT Express`). Never add e-commerce cart/checkout flows or invent unverified store claims.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
