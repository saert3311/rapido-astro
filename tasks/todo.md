# Tasks: Integración Parametrizada de Google Tag Manager (`SPEC-google-tag-manager`)

## Task 1: Suite TDD de Pruebas Automatizadas (`tests/gtm.test.mjs`) [Fase RED]
**Description:** Crear una suite de pruebas con el test runner nativo de Node.js (`node:test`) que verifique:
1. `SITE.analytics.gtmId` está definido y configurado con `'GTM-PGBXBVXJ'`.
2. `src/components/GoogleTagManager.astro` existe y contiene los elementos `<script is:inline>` requeridos por la especificación.
3. `src/layouts/Layout.astro` importa e incluye `<GoogleTagManager />` dentro de `<head>`.
4. La compilación estática de producción genera el snippet de GTM en los archivos HTML (`dist/index.html`).
**Acceptance criteria:**
- [x] Archivo `tests/gtm.test.mjs` creado.
- [x] Ejecución inicial `node --test tests/gtm.test.mjs` falla (Fase RED), evidenciando la falta del componente y configuración.
**Verification:**
- [x] `node --test tests/gtm.test.mjs`
**Dependencies:** None
**Files likely touched:**
- `tests/gtm.test.mjs`
**Estimated scope:** Small (1 file)

---

## Task 2: Configuración y Parametrización en `src/config/site.ts`
**Description:** Extender el objeto de configuración `SITE` en `src/config/site.ts` con una propiedad `analytics: { gtmId: string }`, permitiendo override mediante `import.meta.env.PUBLIC_GTM_ID || 'GTM-PGBXBVXJ'`.
**Acceptance criteria:**
- [x] `SITE.analytics.gtmId` está disponible y tipado.
- [x] El valor por defecto es `'GTM-PGBXBVXJ'`.
**Verification:**
- [x] Test unitario en `tests/gtm.test.mjs`.
**Dependencies:** Task 1
**Files likely touched:**
- `src/config/site.ts`
**Estimated scope:** Small (1 file)

---

## Task 3: Componente Astro Dedicado (`src/components/GoogleTagManager.astro`)
**Description:** Crear `src/components/GoogleTagManager.astro` que acepte props opcionales (`gtmId?: string`, `forceEnable?: boolean`). Evaluar gating mediante `import.meta.env.PROD || forceEnable || import.meta.env.PUBLIC_GTM_FORCE === 'true'`. Si está activo y `gtmId` está presente, renderizar los resource hints (`dns-prefetch` y `preconnect`) y los dos scripts con la directiva `is:inline`:
1. `<script is:inline async src={`https://www.googletagmanager.com/gtm.js?id=${containerId}`}></script>`
2. `<script is:inline>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date());</script>`
**Acceptance criteria:**
- [x] Componente creado con directivas `is:inline`.
- [x] No incluye iframe `<noscript>`.
- [x] Respeta el gating de producción.
**Verification:**
- [x] Test unitario en `tests/gtm.test.mjs`.
**Dependencies:** Task 2
**Files likely touched:**
- `src/components/GoogleTagManager.astro`
**Estimated scope:** Small (1 file)

---

## Task 4: Inserción en el Layout Base (`src/layouts/Layout.astro`)
**Description:** Importar `<GoogleTagManager />` en `src/layouts/Layout.astro` e insertarlo dentro de `<head>`, asegurando que todas las páginas del sitio reciban el contenedor sin repetición de código.
**Acceptance criteria:**
- [x] `<GoogleTagManager />` importado e invocado en el `<head>` de `src/layouts/Layout.astro`.
- [x] Ningún otro layout secundario duplica la etiqueta.
**Verification:**
- [x] Test unitario en `tests/gtm.test.mjs`.
**Dependencies:** Task 3
**Files likely touched:**
- `src/layouts/Layout.astro`
**Estimated scope:** Small (1 file)

---

## Task 5: Verificación TDD Green, Compilación Estática y Verificación en Navegador
**Description:** Ejecutar el ciclo completo de verificación:
1. `npm test` para asegurar que todas las suites (anteriores + nueva) pasan al 100%.
2. `npm run build` para compilar el sitio en `./dist/` y validar que el snippet se emite en el HTML de producción con el ID correcto.
3. Ejecutar `scripts/verify-browser.mjs` bajo preview local en modo headless para confirmar 0 errores de consola y 0 regresiones visuales.
**Acceptance criteria:**
- [x] Todos los tests unitarios pasan (Fase GREEN).
- [x] `npm run build` finaliza con código 0 y `dist/index.html` contiene el snippet.
- [x] `scripts/verify-browser.mjs` pasa con 0 errores y 0 advertencias de consola.
**Verification:**
- [x] `npm test`
- [x] `npm run build`
- [x] `node scripts/verify-browser.mjs`
**Dependencies:** Task 4
**Files likely touched:**
- `tests/gtm.test.mjs`
- `tasks/todo.md`
**Estimated scope:** Medium
