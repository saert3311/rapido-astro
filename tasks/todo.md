# Todo List: `feature/segunda-mano-and-rebrand`

## Task 1: Adapt Official Logo & Update Shell (`Layout.astro`, `Header.astro`, `Footer.astro`)

**Description:** Crop and convert the user-uploaded `RÁPIDO PACK VALENCIA` logo into `public/logo-rapido-pack-valencia.png` with transparent background, enlarge the top navbar to `h-24` (`96px`, `<main class="pt-24">`), display the larger logo in `Header.astro` and `Footer.astro`, update `currentPage` to `'home' | 'outlet' | 'contacto'`, and restrict navigation menus strictly to `Inicio` (`/`), `Outlet` (`/outlet`), and `Contacto` (`/contacto`).

**Acceptance criteria:**
- [x] `public/logo-rapido-pack-valencia.png` exists, is tightly cropped, and renders at `h-16 sm:h-[72px] w-auto` inside an `h-24` (`96px`) header.
- [x] `Header.astro` (desktop + mobile drawer) and `Footer.astro` contain only the 3 page links: `Inicio` (`/`), `Outlet` (`/outlet`), and `Contacto` (`/contacto`).
- [x] All occurrences of `Rápido Pack` / `RápidoPack` in `Layout.astro`, `Header.astro`, and `Footer.astro` read `Rápido Pack Valencia`, and Monday restock references are replaced with weekly stock copy.

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: Verify `Header.astro` has no duplicate text next to the logo image and live status script has no Monday restock strings.

**Dependencies:** None

**Files likely touched:**
- `public/logo-rapido-pack-valencia.png`
- `src/layouts/Layout.astro`
- `src/components/Header.astro`
- `src/components/Footer.astro`

**Estimated scope:** Medium (4 files)

---

## Task 2: Update Shared Components (`StoreLocator.astro`, `ContactForm.astro`)

**Description:** Update `StoreLocator.astro` and `ContactForm.astro` so all brand references read `Rápido Pack Valencia` and all Monday 09:30 merch drop references are replaced with weekly stock rotation phrasing while preserving the `Lunes a Viernes 09:30 – 20:00` commercial schedule.

**Acceptance criteria:**
- [x] `StoreLocator.astro` groups `Lunes a Viernes` (`09:30 – 20:00`) cleanly without `Lunes (Reposición Total)` and uses `Rápido Pack Valencia` on the map marker and alt text.
- [x] `ContactForm.astro` replaces `lotes de los lunes` with `lotes semanales y productos de segunda mano / outlet` and uses `Rápido Pack Valencia`.

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Grep check: `Select-String -Path "src\components\*.astro" -Pattern "lunes"` matches only weekday schedule labels (`Lunes a Viernes` / `Abre Lunes`).

**Dependencies:** Task 1

**Files likely touched:**
- `src/components/StoreLocator.astro`
- `src/components/ContactForm.astro`

**Estimated scope:** Small (2 files)

---

## Checkpoint: After Tasks 1–2 (Foundation)
- [x] `npm run build` compiles cleanly
- [x] Shell and shared components have zero standalone `Rápido Pack` or Monday-drop strings

---

## Task 3: Create Dedicated 2nd-Hand & Outlet Page (`src/pages/outlet.astro`)

**Description:** Create `src/pages/outlet.astro` (`currentPage="outlet"`) highlighting verified second-hand, reconditioned, and outlet products at **Rápido Pack Valencia** using the project's asymmetric 7/5 split hero, 4-column hairline inspection ledger (`/01`–`/04`), asymmetric 7/5 Bento product showcase (Segunda Mano Verificada, Pequeño Electrodoméstico y Hogar, Electrónica y Herramientas), `StoreLocator`, and `FaqAccordion`.

**Acceptance criteria:**
- [x] `src/pages/outlet.astro` renders at `/outlet` with `currentPage="outlet"` active in the navbar.
- [x] Uses asymmetric 7/5 split hero, de-boxed hairline ledger, and 7/5 Bento grid (`/design-taste-frontend`), with single `<h1>`, semantic headings, and keyboard-focusable CTAs (`/frontend-ui-engineering`).
- [x] Emphasizes verified second-hand & outlet stock renewed every week (`todas las semanas`) and tested in person at the electrical benches (`mesas de prueba con enchufes`).

**Verification:**
- [x] Build succeeds: `npm run build` generates `dist/outlet/index.html`
- [x] Manual check: Inspect `/outlet` in headless Chrome (`1440×900` and `390×844`).

**Dependencies:** Task 1, Task 2

**Files likely touched:**
- `src/pages/outlet.astro`

**Estimated scope:** Small (1 file)

---

## Task 4: Update Home & Contact Pages (`src/pages/index.astro`, `src/pages/contacto.astro`)

**Description:** Update `src/pages/index.astro` and `src/pages/contacto.astro` to replace all standalone `Rápido Pack` instances with `Rápido Pack Valencia`, replace Monday 09:30 drop claims (and delete `#monday-countdown-pill` script) with weekly restock copy, and feature 2nd-hand & outlet products on `index.astro` with direct CTAs linking to `/outlet`.

**Acceptance criteria:**
- [x] `src/pages/index.astro` and `src/pages/contacto.astro` use `Rápido Pack Valencia` everywhere and contain zero claims of Monday 09:30 merch drops.
- [x] `src/pages/index.astro` references 2nd-hand and outlet products (`Segunda Mano y Outlet`) in the hero/Bento sections with direct links (`href="/outlet"`) to the new dedicated page.
- [x] The `#monday-countdown-pill` inline `<script>` in `src/pages/index.astro` is removed (`/ponytail`).

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Grep check: Zero occurrences of `Rápido Pack` not followed by `Valencia` across `src/`.

**Dependencies:** Task 1, Task 2, Task 3

**Files likely touched:**
- `src/pages/index.astro`
- `src/pages/contacto.astro`

**Estimated scope:** Small (2 files)

---

## Task 5: End-to-End Verification & Rules Sync (`AGENTS.md`)

**Description:** Run production build, grep audits, and headless Chrome DevTools verification across `/`, `/outlet`, and `/contacto` (desktop `1440×900` and mobile `390×844`), update `AGENTS.md` to reflect the 3-page structure and weekly restock convention, and commit atomically on `feature/segunda-mano-and-rebrand`.

**Acceptance criteria:**
- [x] `npm run build` outputs `/index.html`, `/outlet/index.html`, and `/contacto/index.html` with 0 errors.
- [x] Headless Chrome DevTools inspection shows 0 console warnings/errors, 0 horizontal overflow, and `complete: true` on all images including `/logo-rapido-pack-valencia.png`.
- [x] Changes are committed in clean atomic commits on `feature/segunda-mano-and-rebrand`.

**Verification:**
- [x] `npm run build`
- [x] DevTools script verification on `http://localhost:4321/`, `/outlet`, and `/contacto`
- [x] `git status` and `git log --oneline`

**Dependencies:** Task 3, Task 4

**Files likely touched:**
- `AGENTS.md`
- `tasks/todo.md`

**Estimated scope:** Small (2 files)
