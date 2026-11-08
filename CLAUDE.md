# Project: Rápido Pack Valencia (`rapido-astro`)

Marketing, outlet showcase, and store-locator site for **Rápido Pack Valencia**, a physical 2nd-hand & brand outlet (restocked weekly) and official multi-operator parcel point in Alfafar, Valencia (`Carrer del Comte Ronrée, 8`).

## Tech Stack

- **Framework:** Astro 7 (`^7.4.4`), static output (`./dist/`), strict TypeScript (`astro/tsconfigs/strict`), Node.js `>=22.23.4`.
- **Styling:** Tailwind CSS v4 (`^4.3.3`) via `@tailwindcss/vite` in `astro.config.mjs`. All design tokens live in `src/styles/global.css` under `@theme`.
- **Interactivity:** Zero client-side UI framework (no React/Vue/Svelte). Uses native HTML primitives (`<details name="...">` exclusive accordions, CSS `:user-invalid` validation) and scoped `<script is:inline>` IIFEs.
- **Backend & Deployment:** Cloudflare Workers Static Assets (`wrangler.json`).
  - Worker entrypoint `src/worker.ts` handles `/api/contact` POST requests (Cloudflare Turnstile token verification + Mailjet transactional email & list subscription) and delegates static assets to Cloudflare Assets.
  - Local dev plugin (`devContactApiPlugin` in `astro.config.mjs`) intercepts `/api/contact` in `npx astro dev` using `wrangler.json` variables.
- **Testing:** Node.js native test runner (`node --test tests/*.test.mjs`).

## Development & Commands

When starting the dev server, use background mode:

```sh
npx astro dev --background
```

Manage the background server with `npx astro dev stop`, `npx astro dev status`, and `npx astro dev logs`.

- **Install:** `npm install`
- **Dev server (background):** `npx astro dev --background` (serves at `http://localhost:4321`)
- **Run tests (TDD):** `npm test` (runs all 16 suites / 65+ unit & integration tests)
- **Production build & type-check:** `npm run build` (runs `astro build` → `./dist/` + sitemap)
- **Preview production build:** `npm run preview`
- **Browser verification:** Run `node scripts/verify-carrier-browser.mjs` or inspect `/`, `/paqueteria`, `/outlet`, and `/contacto` (`1440×900` & `390×844`) via headless Chrome / DevTools before committing UI changes. Console must have zero warnings or errors.

## Project Structure

```text
├── astro.config.mjs               # Vite + @tailwindcss/vite + devContactApiPlugin config
├── wrangler.json                  # Cloudflare worker entry, assets binding, vars & previews config
├── package.json                   # Scripts (dev, build, preview, test) and dependencies
├── tsconfig.json                  # Strict TypeScript configuration
├── public/
│   ├── logo-rapido-pack-valencia.png # Official brand emblem (transparent background)
│   ├── robots.txt                 # Canonical sitemap declaration
│   ├── _headers                   # HTTP security and cache headers
│   └── *.webp                     # Optimized store & showcase photographs
├── src/
│   ├── worker.ts                  # Cloudflare Worker entrypoint (/api/contact + static assets)
│   ├── styles/global.css          # @import "tailwindcss", @theme tokens, utilities, animations
│   ├── config/
│   │   ├── site.ts                # Central source of truth (brand, location, hours, carriers, phone)
│   │   └── legal.ts               # Legal notice, privacy policy, and cookie regulation registry
│   ├── lib/
│   │   ├── contact-handler.ts     # Request validation, Turnstile verification, Mailjet dispatch
│   │   ├── mailjet.ts             # Mailjet API v3.1 transactional & v3 list subscription clients
│   │   └── turnstile.ts           # Cloudflare Turnstile verification helper
│   ├── layouts/
│   │   └── Layout.astro           # HTML shell, SEO meta, LocalBusiness JSON-LD, GTM, CookieBanner
│   ├── pages/
│   │   ├── index.astro            # Home: 7/5 split hero, dual gateway cards, hairline ledger
│   │   ├── paqueteria.astro       # Parcel hub: 4 official carriers, 3-step guide, logistics FAQ
│   │   ├── outlet.astro           # Outlet & 2nd-hand: inspection ledger + 7/5 Bento showcase
│   │   ├── contacto.astro         # Contact: Turnstile contact form, channels ledger, map hub
│   │   ├── aviso-legal.astro      # Legal notice & RGPD disclosures
│   │   ├── privacidad.astro       # Privacy policy with Mailjet & Google Analytics disclosures
│   │   └── cookies.astro          # Dedicated cookies policy & consent configuration
│   └── components/
│       ├── Header.astro           # Sticky navbar, official logo, live status (Europe/Madrid)
│       ├── Footer.astro           # Dark footer with mobile sticky-CTA bottom clearance (pb-20)
│       ├── CarrierLogo.astro      # Pure vector SVGs for InPost, GLS, SEUR, Kanguro (grayscale/hover)
│       ├── StoreLocator.astro     # Schedule table + map hub with Liquid Glass overlays
│       ├── FaqAccordion.astro     # Native <details name="..."> exclusive accordion
│       ├── ContactForm.astro      # Accessible form with :user-invalid + Cloudflare Turnstile
│       ├── CookieBanner.astro     # Accessible cookie consent banner (Consent Mode v2)
│       └── GoogleTagManager.astro # GTM snippet with Consent Mode v2 defaults
├── tests/                         # Node.js native test runner suites (*.test.mjs)
└── scripts/                       # Headless Chrome automated verification scripts (*.mjs)
```

## Code Conventions & Patterns

- **Typography Triad (`src/styles/global.css`):**
  - `font-display` (`Outfit`): Headings (`h1`–`h4`), paired with `text-wrap: balance`.
  - `font-sans` (`Plus Jakarta Sans`): Body copy and buttons (`font-label-button`), paired with `text-wrap: pretty`.
  - `font-mono` (`JetBrains Mono`): Time slots (`09:30 – 20:00`), phone numbers (`640 39 74 34`), indices (`01 //`, `/01`), and telemetry badges.
- **Color & Surface Discipline:**
  - Neutral slate surfaces (`bg-surface`, `bg-surface-alt`, `bg-surface-dark`) with a single emerald accent (`text-primary` `#059652`, `bg-mint-wash` `#ECFDF5`, `text-primary-fixed` `#6EE7B7`).
  - Avoid uniform floating card grids. Use **de-boxed hairline ledgers** (`border-t border-b divide-y md:divide-x divide-border-subtle`) or **asymmetric 7/5 grids** (`lg:grid-cols-12` with `lg:col-span-7` and `lg:col-span-5`).
  - Use `.diffusion-card` for elevated Bento containers and `.liquid-glass` / `.liquid-glass-light` for floating image badges.
- **Centralized Site Configuration:**
  - Never hardcode company phone, street address, opening hours, carrier lists, or transit details in template files. Always import `SITE` from `src/config/site.ts` or `LEGAL` from `src/config/legal.ts`.
- **Carrier Logos (`CarrierLogo.astro`):**
  - Always render parcel carriers via `<CarrierLogo carrier={name} size="sm|md|lg" />`.
  - Logos are pure inline SVGs calibrated to tight bounding boxes, resting in monochrome (`filter grayscale opacity-75`), revealing full brand colors on `:hover`.
  - Do not link carrier cards to external corporate websites (Opción A: keeps user focus on store services).
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

## Things a Newcomer Would Get Wrong (Gotchas & Hard Boundaries)

1. **Tailwind v4 Configuration:** Do **not** create `tailwind.config.js`, install `@astrojs/tailwind`, or inject `<script src="https://cdn.tailwindcss.com">`. Extend tokens exclusively inside `@theme { ... }` in `src/styles/global.css`.
2. **Material Symbols vs. Tailwind `hidden` Specificity:** Google Fonts `.material-symbols-outlined` declares `display: inline-block`, which overrides standard `.hidden` / `group-open:hidden` classes. Always use `!hidden`, `group-open:!hidden`, and `group-open:!inline-block` when toggling icon visibility (see `src/components/Header.astro`).
3. **Timezone-Bound Store Status (`Europe/Madrid`):** Live open/closed indicators (`Header.astro`) must evaluate time in `timeZone: 'Europe/Madrid'` via `Intl.DateTimeFormat`, never the local machine's timezone.
4. **Transit Proximity vs. Zero Parking Claims:** Highlight proximity to **Estación Alfafar-Benetússer** (Cercanías C-1/C-2, 5 min a pie / 100m). **Never make parking claims** ("Aparcamiento en puerta" is strictly forbidden and actively asserted against in tests).
5. **Authorized Parcel Carriers (Exactly 4):** Authorized operators are strictly `INPOST`, `GLS`, `SEUR`, and `KANGURO`. Never add deprecated carriers (Amazon, CTT Express).
6. **No Outbound Carrier External Links:** Do not link carrier cards to external corporate websites; avoid leaking link equity or diverting local parcel customers.
7. **Business Domain & E-Commerce Boundaries:**
   - Physical sales in Alfafar: The online store is **in active development** ("próximamente" / coming soon).
   - Do **not** write "no disponemos de tienda online" or prohibitive phrases (tested by `online-store-copy.test.mjs`).
   - Do **not** implement carts, checkout flows, catalog reservations, or promise exact launch dates.
   - Restocks arrive weekly (avoid promising exact Monday 09:30 delivery times).
8. **Native Accordion Animations:** `FaqAccordion.astro` relies on `:root { interpolate-size: allow-keywords; }` and `details::details-content` in `src/styles/global.css`. Keep the shared `name={groupName}` attribute on `<details>` for exclusive accordion behavior without JS height calculations.
9. **Mobile Sticky CTA Clearance:** `src/pages/index.astro` renders a `md:hidden fixed bottom-3` bar. Keep `pb-20 md:pb-0` on `Footer.astro` so mobile viewports (`< 768px`) never clip footer content.
10. **Cloudflare `wrangler.json` Contract:** Cloudflare CI runs `npx wrangler preview`; never remove `"previews": {}`, `"assets": { "directory": "./dist" }`, or `"main": "src/worker.ts"` from `wrangler.json`.
11. **Testing Standard:** Tests use Node's built-in test runner (`node --test tests/*.test.mjs` via `npm test`). Do not add external test framework dependencies (Vitest/Jest).

## Documentation

Full Astro documentation: https://docs.astro.build
Consult before working on routing, components, or styling changes.
