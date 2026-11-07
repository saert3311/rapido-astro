# Implementation Plan: Integración de Mailjet y Turnstile en el Formulario de Contacto (`SPEC-mailjet-contact-form`)

## Overview
Implementación completa de la infraestructura de backend y frontend para el formulario de contacto de Rápido Pack Valencia (`/contacto`):
1. **Seguridad Anti-Spam:** Cloudflare Turnstile con validación de tokens en frontend y backend.
2. **Envío Transaccional:** Mailjet Send API v3.1 con destinatario parametrizable (`MAILJET_TO_EMAIL` / `SITE.contact.email`) y plantilla HTML responsive con branding oficial.
3. **Suscripción a Lista:** Mailjet Contacts List API v3 (`managecontact`) registrando `Name`, `Email` y propiedad `phone` (`String`).
4. **Arquitectura Serverless:** Worker de Cloudflare (`src/worker.ts`) e integración en dev con middleware Vite en `astro.config.mjs` sin romper la compilación estática de Astro.
5. **Experiencia de Usuario y Accesibilidad:** Estados reactivos de carga, éxito y error con WCAG 2.1 AA en `src/components/ContactForm.astro`.

---

## Dependency Graph
```text
Task 1: Suite TDD de Pruebas Automatizadas (tests/contact-api.test.mjs) [FASE RED]
    │
    ├── Task 2: Configuración y Parametrización (src/config/site.ts y wrangler.json)
    │       │
    │       ├── Task 3: Clientes de Servicios (src/lib/turnstile.ts y src/lib/mailjet.ts)
    │       │       │
    │       │       └── Task 4: Handler del Endpoint y Worker (src/lib/contact-handler.ts, src/worker.ts, astro.config.mjs)
    │       │
    │       └── Task 5: Componente UI Frontend y Turnstile (src/components/ContactForm.astro)
    │
    └── Task 6: Verificación TDD Green, Build Estático y Pruebas de Regresión
```

---

## Risks and Mitigations
| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| **Fallo en API de listas de Mailjet bloqueando al usuario** | Alto | El envío transaccional es la operación primaria. Si falla la lista de Mailjet pero el correo se envía, el handler responde 200 OK y registra la advertencia internamente. |
| **Ejecución local en `astro dev` sin runtime de Worker** | Medio | Inclusión de un middleware ligero en `astro.config.mjs` durante desarrollo que ejecuta el mismo `handleContactRequest` para pruebas locales sin requerir despliegues continuos. |
| **Token de Turnstile caducado o reusado** | Medio | Reseteo explícito del widget de Turnstile tras cada intento de envío (éxito o fallo) y validación única contra `challenges.cloudflare.com`. |
| **Filtración de claves de API en el cliente** | Crítico | Las credenciales secretas de Mailjet y Turnstile se leen exclusivamente en el entorno del Worker (`env` / `process.env`), nunca en bundle cliente de Vite ni en `SITE.security`. |
| **Regresión en compilación o tests existentes** | Alto | Preservar `wrangler.json` con `assets.directory: "./dist"` y `previews: {}`, ejecutando `npm test` y `npm run build` en cada hito. |
