# Tasks: Pantalla de Consentimiento de Cookies y Cláusulas Legales de Google Analytics (`SPEC-cookies-screen-analytics`)

## Task 1: Suite TDD de Pruebas Automatizadas (`tests/cookies.test.mjs`) [Fase RED]
- **Description:** Crear una suite de pruebas con el test runner nativo de Node.js (`node:test`) que verifique:
  1. `src/components/CookieBanner.astro` existe, tiene accesibilidad (`role="region"` o `role="dialog"`, `aria-labelledby`, `aria-describedby`), botones de "Aceptar todas", "Rechazar" y sección de configuración.
  2. `src/components/GoogleTagManager.astro` inicializa Google Consent Mode v2 con denegación por defecto (`analytics_storage: 'denied'`).
  3. `src/pages/cookies.astro` existe, compila y contiene la información reglamentaria de cookies técnicas y de Google Analytics.
  4. `src/pages/privacidad.astro` incluye la cláusula específica de Google Analytics (Google Ireland Limited, finalidad y legitimación).
  5. `src/components/Footer.astro` incluye enlace a `/cookies` y botón/disparador para reabrir la configuración.
  6. `src/layouts/Layout.astro` monta el componente `<CookieBanner />`.
- **Acceptance criteria:**
  - [x] Archivo `tests/cookies.test.mjs` creado.
  - [x] Ejecución inicial `node --test tests/cookies.test.mjs` falla (Fase RED), evidenciando los archivos y componentes que faltan.
- **Verify:** `node --test tests/cookies.test.mjs`
- **Files:** `tests/cookies.test.mjs`
- **Dependencies:** None
- **Estimated scope:** Medium (1 file)

---

## Task 2: Configuración Legal y Google Consent Mode v2 (`src/config/legal.ts` y `src/components/GoogleTagManager.astro`)
- **Description:**
  1. En `src/config/legal.ts`, añadir datos del proveedor de analítica web (`analyticsProvider: 'Google Ireland Limited'`, `analyticsTool: 'Google Analytics (Google Tag Manager)'`).
  2. En `src/components/GoogleTagManager.astro`, incorporar la inicialización de Google Consent Mode v2 antes del snippet de GTM, leyendo el consentimiento guardado previamente o estableciendo `analytics_storage: 'denied'` por defecto.
- **Acceptance criteria:**
  - [x] `src/config/legal.ts` exporta metadatos de analítica.
  - [x] `src/components/GoogleTagManager.astro` ejecuta `gtag('consent', 'default', ...)` antes del evento `gtm.start`.
- **Verify:** `node --test tests/cookies.test.mjs`
- **Files:** `src/config/legal.ts`, `src/components/GoogleTagManager.astro`
- **Dependencies:** Task 1
- **Estimated scope:** Small (2 files)

---

## Task 3: Página Dedicada de Política de Cookies y Actualización de Privacidad (`src/pages/cookies.astro` y `src/pages/privacidad.astro`)
- **Description:**
  1. Crear `src/pages/cookies.astro` con maquetación en el sistema de diseño oficial: qué son las cookies, tipología (técnicas vs analíticas de Google), tabla de cookies (`_ga`, `_ga_*`, Turnstile, consentimiento local), plazos y guía de revocación en navegadores.
  2. Actualizar `src/pages/privacidad.astro` incorporando una nueva sección/artículo "Tratamiento de Datos mediante Cookies y Analítica Web (Google Analytics)" detallando corresponsabilidad, finalidades estadísticas anónimas, base jurídica de consentimiento y transferencias internacionales.
- **Acceptance criteria:**
  - [x] `src/pages/cookies.astro` creada y accesible.
  - [x] `src/pages/privacidad.astro` incluye la sección legal de Google Analytics.
- **Verify:** `node --test tests/cookies.test.mjs`
- **Files:** `src/pages/cookies.astro`, `src/pages/privacidad.astro`
- **Dependencies:** Task 2
- **Estimated scope:** Medium (2 files)

---

## Task 4: Componente de Banner Flotante y Panel de Configuración (`src/components/CookieBanner.astro` y `src/layouts/Layout.astro`)
- **Description:**
  1. Crear `src/components/CookieBanner.astro` diseñado según `/design-taste-frontend` y `/frontend-ui-engineering`:
     - Tarjeta compacta flotante (`diffusion-card`, bordes sutiles, esquinas `rounded-2xl`).
     - Botón "Aceptar todas" (primario esmeralda).
     - Botón "Rechazar no esenciales" (neutro con alto contraste y sin patrones oscuros).
     - Desplegable interactivo para configuración granular con switches accesibles.
     - Script inline para leer/guardar consentimiento en `localStorage`, actualizar `gtag('consent', 'update', ...)` y escuchar el evento `rpv:open-cookie-settings`.
  2. Importar y montar `<CookieBanner />` en `src/layouts/Layout.astro`.
- **Acceptance criteria:**
  - [x] Banner interactivo implementado y montado en el layout base.
  - [x] Respeta el consentimiento guardado sin parpadeos.
- **Verify:** `node --test tests/cookies.test.mjs`
- **Files:** `src/components/CookieBanner.astro`, `src/layouts/Layout.astro`
- **Dependencies:** Task 3
- **Estimated scope:** Medium (2 files)

---

## Task 5: Enlace a Política y Disparador de Configuración en el Footer (`src/components/Footer.astro`)
- **Description:**
  1. En `src/components/Footer.astro`, añadir el enlace a `/cookies` ("Política de Cookies") en la columna de Navegación y en los enlaces legales del pie inferior.
  2. Añadir botón/enlace interactivo "Configurar cookies" que emita el evento `rpv:open-cookie-settings` para reabrir el banner en cualquier momento.
- **Acceptance criteria:**
  - [x] El pie de página enlaza a `/cookies`.
  - [x] Disparador de configuración de cookies funcional y accesible.
- **Verify:** `node --test tests/cookies.test.mjs`
- **Files:** `src/components/Footer.astro`
- **Dependencies:** Task 4
- **Estimated scope:** Small (1 file)

---

## Task 6: Verificación TDD Green, Compilación Estática y Verificación en Navegador Real
- **Description:**
  1. Ejecutar la suite completa de tests automatizados (`npm test`).
  2. Ejecutar `npm run build` para asegurar compilación estática de `./dist/cookies/index.html` sin errores.
  3. Ejecutar `scripts/verify-browser.mjs` en preview de producción para validar la ausencia de errores en consola y el comportamiento responsivo en desktop (1440x900) y mobile (390x844).
- **Acceptance criteria:**
  - [x] Todos los tests unitarios y de integración pasan (58 tests en verde).
  - [x] Compilación de producción con código de salida 0 (7 páginas generadas).
  - [x] 0 errores y 0 advertencias en la consola del navegador en todas las rutas auditadas (incluida `/cookies`).
- **Verify:** `npm test`, `npm run build`, `node scripts/verify-browser.mjs`
- **Files:** `tasks/todo.md`
- **Dependencies:** Task 5
- **Estimated scope:** Small
