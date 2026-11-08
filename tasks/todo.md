# Task List: Optimización Ergonómica del Formulario de Contacto y Balance Espacial

## Phase 1: Test Suite & Regression Checks
- [x] **Task 1.1**: Revisar y ampliar tests en `tests/contact-api.test.mjs` para verificar la existencia del contenedor de seguridad de Turnstile y la estructura de inputs.
  - *Verify:* `npm test` ejecutó la fase RED y posteriormente pasó a GREEN al 100% (67 tests passing).

## Phase 2: Refactorización Ergonómica de ContactForm.astro
- [x] **Task 2.1**: Reorganizar los campos en cuadrícula 2×2:
  - Fila 1: `Nombre completo` + `Motivo de la consulta` en `grid grid-cols-1 sm:grid-cols-2 gap-5`.
  - Fila 2: `Teléfono de contacto` + `Correo electrónico` en `grid grid-cols-1 sm:grid-cols-2 gap-5`.
  - Fila 3: `Mensaje` a ancho completo.
  - *Verify:* Selectores, IDs, clases `form-control` y accesibilidad preservados al 100%.
- [x] **Task 2.2**: Envolver `#turnstile-widget` en el contenedor de seguridad estructurado:
  - Contenedor con `flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-alt/40 border border-border-subtle/70`.
  - Insignia derecha con icono `verified_user` y texto `Protección Cloudflare Turnstile · Envío seguro`.
  - Mantener `#turnstile-error` intacto bajo el contenedor.
  - *Verify:* `npm test` verde.

## Phase 3: Columna Lateral y Activos Locales en contacto.astro
- [x] **Task 3.1**: Actualizar la columna `<aside>` en `src/pages/contacto.astro`:
  - Añadir clases `lg:sticky lg:top-28` al elemento `<aside>`.
  - Sustituir la imagen externa de Google por `/fachada-rapido-pack-valencia.webp`.
  - Añadir badge de conexión con Estación Alfafar-Benetússer (`1 min a pie`).
  - Añadir badge de telemetría de atención en sala activa (`L–V 09:30 – 20:00`).
  - *Verify:* Cero menciones de aparcamiento y preservación estricta de tokens de diseño.

## Phase 4: Verificación Funcional y Visual
- [x] **Task 4.1**: Ejecutar `npm test` (todos los 67 tests en verde).
- [x] **Task 4.2**: Ejecutar `npm run build` (compilación estática sin errores en 851ms).
- [x] **Task 4.3**: Verificación en navegador Chrome Headless (1440×900, 1024×800, 390×844) capturando capturas de pantalla y verificando 0 desbordamientos horizontales ni errores.
