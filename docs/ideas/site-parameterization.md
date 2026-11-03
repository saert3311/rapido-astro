# Central Store Parameterization (`src/config/site.ts`)

## Problem Statement
How might we centralize all store parameters (phone, WhatsApp, email, address, Google Maps URL, opening hours, brand name, max discount, and parcel carriers) into a single source of truth so a one-line edit updates all templates, links, and live open/closed scripts without drift?

## Recommended Direction
Create a single, zero-dependency, strictly typed module at `src/config/site.ts` exporting `SITE`. You edit human-readable source values once (e.g., `phone: '685 11 95 11'`, `schedule.weekdays: { open: '09:30', close: '20:00' }`), and `SITE` automatically derives normalized URLs (`tel:685119511`, `https://wa.me/34685119511`, encoded Google Maps query URL) and minute offsets (`openMinutes`, `closeMinutes`) for the `Europe/Madrid` status indicator in `Header.astro`.

All 8 Astro pages and components (`Layout.astro`, `Header.astro`, `Footer.astro`, `StoreLocator.astro`, `ContactForm.astro`, `FaqAccordion.astro`, `index.astro`, `outlet.astro`, `contacto.astro`) import `{ SITE } from '../config/site'` and reference it directly in markup, frontmatter arrays, and `data-*` attributes.

## Key Assumptions to Validate
- [ ] **Single-edit propagation:** Changing `phone` in `src/config/site.ts` updates display text, `tel:` links, `wa.me` links, and form placeholders across all 3 built pages (`dist/index.html`, `dist/outlet/index.html`, `dist/contacto/index.html`) — validated via grep on `./dist`.
- [ ] **Live status script sync:** Passing `SITE.schedule` via `data-*` attributes on `[data-store-status]` in `Header.astro` drives the `Europe/Madrid` open/closed calculation with zero console warnings — validated via headless Chrome DevTools.
- [ ] **Zero raw duplicates left behind:** Grep across `src/**/*.astro` for hardcoded `685`, `Ronrée`, or `09:30` returns zero matches outside `src/config/site.ts`.

## MVP Scope
**In Scope (`src/config/site.ts`):**
- **Brand & Promo:** `name` (`'Rápido Pack Valencia'`), `tagline`, `maxDiscountPct` (`70`), `restockFrequency` (`'Semanal'`).
- **Contact:** `phone` (`'685 11 95 11'`), `countryCode` (`'34'`), `email` (`'contacto@rapidopack.es'`), plus computed `phoneRaw` (`'685119511'`), `phoneHref` (`'tel:685119511'`), `whatsappHref` (`'https://wa.me/34685119511'`), and `emailHref` (`'mailto:contacto@rapidopack.es'`).
- **Location:** `address` (`street`, `shortStreet`, `postalCode`, `city`, `province`, `full`, `transitNote`, `driveTimeFromValencia`) + computed `mapsUrl`.
- **Schedule:** `weekdays` (`open: '09:30'`, `close: '20:00'`), `saturday` (`open: '10:00'`, `close: '15:00'`), `sundayClosed: true`, summary labels (`'L–V 09:30–20:00 · Sáb 10:00–15:00'`), and computed minute thresholds for `Header.astro`.
- **Carriers:** `carriers` list (`Amazon Hub Counter`, `InPost`, `GLS`, `SEUR`, `CTT Express`) with role badges (`Oficial`, `Locker & Punto Pack`, `ParcelShop`, `Pickup`, `Punto CTT`).

## Not Doing (and Why)
- **Not adding `astro:content` JSON collections or Zod schemas** — Adds async `await getEntry()` boilerplate to every component without supporting derived getters (`tel:`, `wa.me`, time math).
- **Not moving config into `.env` / `astro:env`** — Public store info (phone, address, hours, carriers) is not a secret and benefits from structured objects and Git history rather than flat environment strings.
- **Not parameterizing page-specific marketing paragraphs** — Only shared store facts and parameters belong in `SITE`; turning all page copy into a giant config object hurts readability.

## Open Questions
- None — ready for implementation.
