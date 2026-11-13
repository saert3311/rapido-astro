# Task List: Coexistencia Tienda Física y Tienda Web (`SPEC-tienda-fisica-y-web`)

## Phase 1: Foundation & TDD Guardrail

- [x] **Task 1**: Crear suite TDD `tests/tienda-fisica-y-web.test.mjs`
  - **Description:** Implementar pruebas unitarias sobre `src/` que aseguren la eliminación de expresiones tipo `"tienda de/en Alfafar"`, `"establecimiento [comercial] de Alfafar"` y `"compra a ciegas en internet"`, la presencia del concepto de coexistencia `tienda física` + `tienda web`/`tienda online`, y la preservación intacta de la dirección física en Alfafar y `Estación Alfafar-Benetússer`.
  - **Acceptance criteria:**
    - [ ] Escanea recursivamente `src/` buscando cero ocurrencias de `tienda (de |en )?Alfafar`, `establecimiento( comercial)? de Alfafar`, `equipo de Alfafar`, `Chollos del Día · Alfafar` y `compra a ciegas en internet`.
    - [ ] Verifica presencia de `tienda física` y convivencia con `tienda web` / `tienda online` en `index.astro`, `outlet.astro`, `aviso-legal.astro` y `Footer.astro`.
    - [ ] Verifica que `SITE.location` (`site.ts`) y `LEGAL.address` (`legal.ts`) conservan `Carrer del Comte Ronrée` y `Alfafar`.
  - **Verification:**
    - [ ] Tests pass (fase RED esperada inicialmente): `node --test tests/tienda-fisica-y-web.test.mjs`
  - **Dependencies:** None
  - **Files likely touched:** `tests/tienda-fisica-y-web.test.mjs`
  - **Estimated scope:** Small (1 file)

- [x] **Task 2**: Actualizar configuración central y componentes compartidos
  - **Description:** Actualizar `SITE.brand.tagline` y `SITE.brand.metaDescription` en `src/config/site.ts` (respetando 120–160 chars), la descripción y pie de `src/components/Footer.astro`, el título por defecto de `src/components/StoreLocator.astro` y el mensaje de confirmación de `src/components/ContactForm.astro`.
  - **Acceptance criteria:**
    - [x] `site.ts` refleja tienda física + futura tienda web en `tagline` y `metaDescription` (120–160 chars), conservando `location.*` y `Estación Alfafar-Benetússer`.
    - [x] `Footer.astro` describe la convivencia entre tienda física y futura tienda web y sustituye la línea inferior `"en Alfafar"`.
    - [x] `StoreLocator.astro` y `ContactForm.astro` sustituyen `"en Alfafar"` / `"de Alfafar"` por referencia a la tienda física.
  - **Verification:**
    - [x] Tests pass: `node --test tests/seo.test.mjs tests/transit-station.test.mjs tests/ui-cleanup.test.mjs`
    - [x] Build succeeds: `npm run build`
  - **Dependencies:** Task 1
  - **Files likely touched:** `src/config/site.ts`, `src/components/Footer.astro`, `src/components/StoreLocator.astro`, `src/components/ContactForm.astro`
  - **Estimated scope:** Medium (4 files)

### Checkpoint: Foundation
- [x] `tests/seo.test.mjs`, `tests/transit-station.test.mjs` y `tests/ui-cleanup.test.mjs` pasan al 100%
- [x] `npm run build` compila sin errores

---

## Phase 2: Core Pages (Home, Outlet, Paquetería, Contacto)

- [x] **Task 3**: Actualizar `src/pages/index.astro` y `src/pages/outlet.astro`
  - **Description:** Sustituir todas las ocurrencias de `"tienda ... Alfafar"` y `"en Alfafar"` en portada y página de outlet por `"tienda física"`, reformular el bloque `02 // Confianza Física` de `index.astro` para eliminar el contraste negativo contra compras por internet, y ajustar SEO title/description de `outlet.astro` manteniendo los rangos válidos y las cadenas protegidas de `online-store-copy.test.mjs`.
  - **Acceptance criteria:**
    - [x] `index.astro` actualiza eyebrow (`00 // Tienda Física · Paquetería y Outlet`), H2 de servicios, alt de fachada, badge de venta física, sección `02` (coexistencia física + web), FAQs y subtítulo de FAQ sin frases antagónicas hacia internet.
    - [x] `outlet.astro` actualiza `title` (35–65 chars), `description` (120–160 chars), CTA (`Visitar Tienda Física`), texto descriptivo, `figcaption` (`Chollos del Día · Tienda Física`) y FAQs.
    - [x] Se conservan `"Tienda online próximamente"` en `index.astro` y `"Hoy en tienda · Online próximamente"` en `outlet.astro`.
  - **Verification:**
    - [x] Tests pass: `node --test tests/seo.test.mjs tests/online-store-copy.test.mjs`
    - [x] Build succeeds: `npm run build`
  - **Dependencies:** Task 2
  - **Files likely touched:** `src/pages/index.astro`, `src/pages/outlet.astro`
  - **Estimated scope:** Small (2 files)

- [x] **Task 4**: Actualizar `src/pages/paqueteria.astro` y `src/pages/contacto.astro`
  - **Description:** Sustituir las referencias de servicio `"en Alfafar"` por `"en Tienda Física"` / `"Tienda Física"` en `paqueteria.astro` (title, description, eyebrow, título de FAQ) y en `contacto.astro` (title, description, alt de fachada, título de `StoreLocator`), verificando que las longitudes SEO se mantienen dentro de los rangos exigidos.
  - **Acceptance criteria:**
    - [x] `paqueteria.astro` tiene `title` de 35–65 chars y `description` de 120–160 chars, y sustituye `"Alfafar"` en eyebrow y título de FAQ por referencia a tienda física.
    - [x] `contacto.astro` tiene `title` de 35–65 chars y `description` de 120–160 chars, y actualiza `alt` y título de `StoreLocator` a tienda física.
    - [x] `StoreLocator` mantiene intacto el mapa, horario y acceso desde `Estación Alfafar-Benetússer`.
  - **Verification:**
    - [x] Tests pass: `node --test tests/seo.test.mjs tests/ui-cleanup.test.mjs`
    - [x] Build succeeds: `npm run build`
  - **Dependencies:** Task 2
  - **Files likely touched:** `src/pages/paqueteria.astro`, `src/pages/contacto.astro`
  - **Estimated scope:** Small (2 files)

### Checkpoint: Core Pages
- [x] `tests/seo.test.mjs`, `tests/online-store-copy.test.mjs` y `tests/ui-cleanup.test.mjs` pasan al 100%
- [x] `npm run build` compila `./dist/` limpiamente

---

## Phase 3: Legal Pages, Docs & End-to-End Verification

- [x] **Task 5**: Actualizar páginas legales (`aviso-legal.astro`, `privacidad.astro`, `cookies.astro`) y `AGENTS.md`
  - **Description:** Alinear el objeto y alcance comercial de `aviso-legal.astro` (§2 y §3) con la coexistencia entre tienda física y tienda web en desarrollo (manteniendo el título `"3. Actividad Comercial y Tienda Online en Desarrollo"`), actualizar las menciones `"en Alfafar"` en `privacidad.astro` y `cookies.astro`, y reflejar en `AGENTS.md` (gotcha 7) la convivencia tienda física + tienda web.
  - **Acceptance criteria:**
    - [x] `aviso-legal.astro` sustituye `"establecimiento [comercial] de Alfafar"` por `"tienda física"` y describe la coexistencia con la futura tienda web/online.
    - [x] `privacidad.astro` y `cookies.astro` actualizan sus descripciones y finalidades a tienda física y web, conservando `LEGAL.address` intacto.
    - [x] `AGENTS.md` (gotcha 7) documenta la regla de coexistencia tienda física y web.
  - **Verification:**
    - [x] Tests pass: `npm test` (todas las suites, incluida `tests/tienda-fisica-y-web.test.mjs` en GREEN)
  - **Dependencies:** Task 1, Task 3, Task 4
  - **Files likely touched:** `src/pages/aviso-legal.astro`, `src/pages/privacidad.astro`, `src/pages/cookies.astro`, `AGENTS.md`
  - **Estimated scope:** Medium (4 files)

- [x] **Task 6**: Verificación integral y comprobación en navegador
  - **Description:** Ejecutar la batería completa de tests, compilar producción, levantar `astro preview` y validar visualmente `/`, `/paqueteria`, `/outlet`, `/contacto` y `/aviso-legal` en desktop (`1440×900`) y móvil (`390×844`) asegurando cero errores o advertencias en consola y cero regresiones de diseño.
  - **Acceptance criteria:**
    - [x] `npm test` pasa el 100% de las suites sin omisiones ni fallos.
    - [x] `npm run build` finaliza con código 0 y genera `./dist/`.
    - [x] Verificación en navegador sin errores de consola, sin desbordamiento horizontal y con los textos actualizados visibles.
  - **Verification:**
    - [x] Tests pass: `npm test`
    - [x] Build succeeds: `npm run build`
    - [x] Manual/browser check: `npx astro preview --host 127.0.0.1 --port 4321` + inspección con Chrome headless (`scripts/verify-browser.mjs` / `scripts/verify-carrier-browser.mjs`)
  - **Dependencies:** Task 5
  - **Files likely touched:** None (verificación)
  - **Estimated scope:** Small (verification only)

### Checkpoint: Complete
- [x] Todos los checks de `SPEC-tienda-fisica-y-web.md` cumplidos
- [x] Listo para revisión final del usuario
