# Tasks: Integración de Mailjet y Turnstile en el Formulario de Contacto (`SPEC-mailjet-contact-form`)

## Task 1: Suite TDD de Pruebas Automatizadas (`tests/contact-api.test.mjs`) [Fase RED]
- **Description:** Crear una suite de pruebas con el test runner nativo de Node.js (`node:test`) que verifique:
  1. Validación del payload de contacto (campos requeridos, formato de email, longitud de mensaje, sanitización de teléfono).
  2. Cliente de validación de Turnstile con tokens de prueba y mocks de Cloudflare siteverify.
  3. Cliente de Mailjet: estructura del payload para la Send API v3.1 (Basic Auth, remitente, destinatario parametrizado, reply-to, HTML y TextPart) y la Contacts List API v3 (`managecontact` con `Action: addnoforce`, `Name`, `Email`, `Properties: { phone }`).
  4. Función controladora `handleContactRequest` retornando 200 OK con payload válido, 400 en JSON inválido, 422 en campos incorrectos o Turnstile fallido, y tolerancia a fallos en la lista si el envío de correo tuvo éxito.
- **Acceptance criteria:**
  - [x] Archivo `tests/contact-api.test.mjs` creado.
  - [x] Ejecución inicial `node --test tests/contact-api.test.mjs` falla (Fase RED), evidenciando los módulos pendientes de implementación.
- **Verify:** `node --test tests/contact-api.test.mjs`
- **Files:** `tests/contact-api.test.mjs`
- **Dependencies:** None
- **Estimated scope:** Medium (1 file)

---

## Task 2: Configuración y Parametrización (`src/config/site.ts` y `wrangler.json`)
- **Description:** 
  1. Extender `src/config/site.ts` con `SITE.contact.notificationEmail` (para parametrizar el destinatario con fallback) y `SITE.security.turnstileSiteKey` (con clave de prueba oficial de Cloudflare como fallback).
  2. Actualizar `wrangler.json` para declarar `"main": "src/worker.ts"` conservando `"assets": { "directory": "./dist" }` y `"previews": {}`.
- **Acceptance criteria:**
  - [x] `SITE.contact.notificationEmail` y `SITE.security.turnstileSiteKey` exportados y tipados.
  - [x] `wrangler.json` incluye `"main": "src/worker.ts"` sin eliminar la configuración de assets ni previews.
- **Verify:** `node --test tests/contact-api.test.mjs`
- **Files:** `src/config/site.ts`, `wrangler.json`
- **Dependencies:** Task 1
- **Estimated scope:** Small (2 files)

---

## Task 3: Implementación de Clientes de Servicio (`src/lib/turnstile.ts` y `src/lib/mailjet.ts`)
- **Description:** 
  1. Crear `src/lib/turnstile.ts` para verificar tokens contra `https://challenges.cloudflare.com/turnstile/v0/siteverify` utilizando `fetch` nativo, soportando claves de prueba oficiales.
  2. Crear `src/lib/mailjet.ts` con:
     - `sendTransactionalEmail(data, env)`: invoca Mailjet Send API v3.1 con Basic Auth, cabecera `Reply-To`, destinatario parametrizable y plantilla responsive en HTML + versión texto.
     - `subscribeContactToList(data, env)`: invoca `POST /v3/REST/contactslist/{list_id}/managecontact` con `Action: "addnoforce"` y propiedades `Name`, `Email`, `Properties: { phone }`.
- **Acceptance criteria:**
  - [x] Ambos clientes implementados utilizando Web APIs estándar (`fetch`, `btoa`/`Buffer`).
  - [x] Manejo adecuado de respuestas y tipado estricto.
- **Verify:** `node --test tests/contact-api.test.mjs`
- **Files:** `src/lib/turnstile.ts`, `src/lib/mailjet.ts`
- **Dependencies:** Task 2
- **Estimated scope:** Medium (2 files)

---

## Task 4: Handler de la API, Cloudflare Worker y Middleware Dev (`src/lib/contact-handler.ts`, `src/worker.ts`, `astro.config.mjs`)
- **Description:**
  1. Crear `src/lib/contact-handler.ts` con la función `handleContactRequest(request, env)` que orqueste la validación de entrada, validación de Turnstile, envío transaccional en Mailjet y adición a lista.
  2. Crear `src/worker.ts` como entrypoint del Worker de Cloudflare interceptando `POST /api/contact`.
  3. Añadir middleware de desarrollo en `astro.config.mjs` para permitir probar `POST /api/contact` localmente durante `npx astro dev`.
- **Acceptance criteria:**
  - [x] `handleContactRequest` procesa peticiones y retorna respuestas con el contrato exacto de la especificación.
  - [x] `src/worker.ts` exporta `default { fetch }`.
  - [x] La suite de pruebas de la API pasa al 100% (Fase GREEN).
- **Verify:** `node --test tests/contact-api.test.mjs`
- **Files:** `src/lib/contact-handler.ts`, `src/worker.ts`, `astro.config.mjs`
- **Dependencies:** Task 3
- **Estimated scope:** Medium (3 files)

---

## Task 5: Componente UI Frontend, Turnstile y Accesibilidad (`src/components/ContactForm.astro`)
- **Description:**
  1. Integrar el script de Cloudflare Turnstile con carga asíncrona (`api.js?render=explicit`).
  2. Renderizar el contenedor del widget Turnstile con gestión de token y reseteo.
  3. Conectar el envío del formulario mediante `fetch('/api/contact')` con payload JSON.
  4. Implementar los estados visuales y accesibles: botón de envío deshabilitado durante la carga con spinner/texto explicativo, skeleton loading, banner de confirmación accesible (`role="status"`, `aria-live="polite"`), y banner de error con reintento accesible (`role="alert"`).
  5. Asegurar cumplimiento de WCAG 2.1 AA y tokens de diseño de Rápido Pack Valencia.
- **Acceptance criteria:**
  - [x] Formulario envía datos al endpoint `/api/contact`.
  - [x] Estados de carga, éxito y error funcionan adecuadamente y son accesibles.
  - [x] Widget de Turnstile se renderiza y se resetea al completar o fallar.
- **Verify:** `npm run build`
- **Files:** `src/components/ContactForm.astro`
- **Dependencies:** Task 4
- **Estimated scope:** Medium (1 file)

---

## Task 6: Verificación TDD Green, Compilación Estática y Verificación en Navegador
- **Description:**
  1. Ejecutar la suite completa de tests automatizados (`npm test`).
  2. Ejecutar `npm run build` para comprobar la compilación estática de Astro y la generación de tipos.
  3. Ejecutar `scripts/verify-browser.mjs` en preview para auditar la consola del navegador y el renderizado visual.
- **Acceptance criteria:**
  - [x] Todos los tests de la suite pasan (51 tests totales en verde).
  - [x] `npm run build` compila con 0 errores.
  - [x] Verificación en navegador real sin errores de consola ni advertencias en desktop y mobile.
- **Verify:** `npm test`, `npm run build`, `node scripts/verify-browser.mjs`
- **Files:** `tasks/todo.md`
- **Dependencies:** Task 5
- **Estimated scope:** Small
