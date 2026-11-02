# Implementation Plan: Rebrand to Rápido Pack Valencia, Larger Logo Header, Weekly Merch Copy & Dedicated `/outlet` (2nd-Hand) Page

## Overview
We are updating **Rápido Pack Valencia** (`feature/segunda-mano-and-rebrand`) to unify the brand name to **Rápido Pack Valencia**, integrate and adapt the official uploaded logo in an enlarged `h-24` top navigation bar, simplify navigation to three top-level routes (**Inicio** `/`, **Outlet** `/outlet`, **Contacto** `/contacto`), replace all "every Monday at 09:30" merch drop claims with broader weekly restock copy, and launch the dedicated `/outlet` page for 2nd-hand and outlet products with cross-links from the home page.

## Architecture Decisions
- **Logo Adaptation (`public/logo-rapido-pack-valencia.png`):** The uploaded JPEG has a white background and generous outer margin. We will tightly crop the padding and make the white background transparent (plus a white-text variant or clean badge container in the dark footer) so it scales cleanly at `h-16 sm:h-[72px]` inside the taller `h-24` (`96px`) header without needing redundant HTML text beside it.
- **Zero New Dependencies (`/ponytail`):** `src/pages/outlet.astro` will compose existing `Layout.astro`, `StoreLocator.astro`, and `FaqAccordion.astro` using the established asymmetric 7/5 split hero, de-boxed 4-column hairline ledger, and 7/5 Bento grid patterns.
- **Deletion Over Complexity (`/ponytail`):** Remove the Monday countdown script (`#monday-countdown-pill`) from `src/pages/index.astro` and simplify the `Europe/Madrid` open/closed status script in `src/components/Header.astro` so it only reports store hours (`Abierto ahora · Hasta 20:00` / `Abre Lunes 09:30` for opening time, never "Lunes Reposición").

## Dependency Graph
```text
Task 1: Logo Asset + Layout + Header + Footer (Shell & 3-Link Nav)
    │
    ├── Task 2: Shared Components (StoreLocator + ContactForm weekly copy & naming)
    │       │
    │       ├── Task 3: Dedicated 2nd-Hand & Outlet Page (src/pages/outlet.astro)
    │       │
    │       └── Task 4: Home & Contacto Pages (index.astro + contacto.astro updates & /outlet CTA)
    │
    └── Task 5: Build, Grep & DevTools Browser Verification + AGENTS.md update
```

## Task List

### Phase 1: Foundation (Brand Shell, Logo & Shared Components)
- [x] **Task 1:** Adapt uploaded logo to `public/` and update `Layout.astro`, `Header.astro`, and `Footer.astro` (`h-24` top bar, larger logo, 3-item menu: `Inicio`, `Outlet`, `Contacto`, `Rápido Pack Valencia` naming).
- [x] **Task 2:** Update `StoreLocator.astro` and `ContactForm.astro` to replace Monday 09:30 drop claims with weekly restock copy and enforce `Rápido Pack Valencia` naming.

### Checkpoint: Foundation
- [x] `npm run build` passes and header/footer render the adapted logo and 3-item navigation cleanly.

### Phase 2: Core Pages (`/outlet`, `/`, `/contacto`)
- [x] **Task 3:** Create `src/pages/outlet.astro` dedicated to 2nd-hand and outlet products (asymmetric 7/5 split hero, 4-step inspection hairline ledger, 7/5 Bento showcase of 2nd-hand product lines, `StoreLocator`, and `FaqAccordion`).
- [x] **Task 4:** Update `src/pages/index.astro` and `src/pages/contacto.astro` with `Rápido Pack Valencia` naming, weekly merch rotation copy (removing Monday 09:30 drop specifics), and prominent CTAs/references on `index.astro` linking to `/outlet`.

### Checkpoint: Complete
- [x] **Task 5:** Verify `npm run build`, grep assertions (0 standalone `Rápido Pack` or Monday restock claims), and headless Chrome DevTools inspection (`1440×900` & `390×844`) across `/`, `/outlet`, and `/contacto`.

## Parallelization Opportunities
- **Sequential Foundation:** Task 1 (`Layout.astro` `currentPage` union type `'home' | 'outlet' | 'contacto'`) must complete first.
- **Parallelizable Slices:** Once Task 1 and Task 2 are in place, Task 3 (`src/pages/outlet.astro`) and Task 4 (`src/pages/index.astro` + `src/pages/contacto.astro`) touch independent page files.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Uploaded JPEG logo has white background and outer padding that reduces visual size inside `Header.astro` | Med | Crop whitespace and convert white background to alpha transparency in `public/logo-rapido-pack-valencia.png` so the graphic fills `h-16 sm:h-[72px]` cleanly. |
| Increasing header height from `h-20` to `h-24` could clip top of `<main>` content | Med | Update `<main id="main-content">` in `Layout.astro` from `pt-20` to `pt-24` and adjust hero `min-h-[calc(100svh-6rem)]`. |
| Accidentally removing Monday–Friday `09:30–20:00` regular store opening hours while removing Monday 09:30 restock claims | Low | Keep commercial schedule rows (`Lunes a Viernes: 09:30 – 20:00`), removing only the `(Reposición Total)` / Monday-drop labels. |

## Open Questions
- None (all questions resolved with user in Phase 1).
