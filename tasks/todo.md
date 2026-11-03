# Tasks: Transición a Estación Alfafar-Benetússer

- [x] Task 1: Create TDD Test Suite (`tests/transit-station.test.mjs`)
  - Acceptance: Test suite con aserciones que verifiquen: ausencia de "Aparcamiento en puerta" en `src/`, presencia de `stationName` y `stationNote` en `site.ts`, badge `Estación Alfafar · 5 min a pie` en `Layout.astro`, icono `train` en `StoreLocator.astro`, y los nuevos textos de cercanías.
  - Verify: `node --test tests/transit-station.test.mjs` falla (Fase RED).
  - Files: `tests/transit-station.test.mjs`

- [x] Task 2: Update Configuration Single Source of Truth (`src/config/site.ts`)
  - Acceptance: `SITE.location` exporta `stationName`, `stationWalkMinutes`, `stationNote` y `stationLine`, retirando `parkingNote`.
  - Verify: `npm run build` o inspección de tipos TypeScript.
  - Files: `src/config/site.ts`

- [x] Task 3: Update Shared Components (`StoreLocator.astro` & `Layout.astro`)
  - Acceptance: `StoreLocator.astro` muestra el chip de estación con icono `train` y subtítulo actualizado; `Layout.astro` muestra el badge móvil `Estación Alfafar · 5 min a pie`.
  - Verify: El test correspondiente de `tests/transit-station.test.mjs` pasa.
  - Files: `src/components/StoreLocator.astro`, `src/layouts/Layout.astro`

- [x] Task 4: Update All Pages (`index.astro`, `paqueteria.astro`, `outlet.astro`, `contacto.astro`)
  - Acceptance:
    - `index.astro`: pilar 04 es "Estación a 5 Minutos a Pie" (5 MIN A PIE), FAQs y resumen actualizados sin parking.
    - `paqueteria.astro`: paso 03 es "A 5 Min de la Estación" (ACCESO A PIE), hero y cards actualizados.
    - `outlet.astro`: tarjeta de visita y banner sin parking.
    - `contacto.astro`: descripción de local y FAQ de llegada sin parking.
  - Verify: Cero coincidencias de `parking` o `aparcamiento en puerta` en `src/`.
  - Files: `src/pages/index.astro`, `src/pages/paqueteria.astro`, `src/pages/outlet.astro`, `src/pages/contacto.astro`

- [x] Task 5: TDD Green Verification, Build & Real Browser Audit
  - Acceptance: `node --test tests/transit-station.test.mjs` pasa al 100% (Fase GREEN); `npm run build` compila con 0 errores; `node scripts/verify-browser.mjs` valida en Google Chrome real.
  - Verify: Todo verde sin advertencias.
  - Files: `tasks/todo.md`
