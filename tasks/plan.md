# Implementation Plan: Pantalla de Consentimiento de Cookies y Cláusulas Legales de Google Analytics (`SPEC-cookies-screen-analytics`)

## Overview
Implementación completa del sistema de consentimiento de cookies y actualización del marco legal para Google Analytics en Rápido Pack Valencia:
1. **Seguridad y Cumplimiento Normativo (AEPD / RGPD):** Google Consent Mode v2 con denegación preventiva por defecto (`analytics_storage: 'denied'`).
2. **Diseño de Interfaz (`/design-taste-frontend` y `/frontend-ui-engineering`):** Tarjeta flotante compacta en esquina inferior derecha (`diffusion-card`), sin patrones oscuros (Aceptar y Rechazar con la misma facilidad), panel interactivo expandible para configuración granular (técnicas vs. analíticas), y adaptación móvil libre de colisiones con la barra fija (`pb-20 sm:pb-0`).
3. **Página de Política de Cookies (`/cookies`):** Documento legal completo con tabla exhaustiva de cookies técnicas (Turnstile, consentimiento) y analíticas de Google (`_ga`, `_ga_*`), plazos de conservación y métodos de desactivación en navegadores.
4. **Actualización de Privacidad (`/privacidad`):** Inclusión de Google Analytics (Google Ireland Limited), base legal (consentimiento art. 6.1.a RGPD) y transferencias internacionales bajo el Marco de Privacidad de Datos UE-EE.UU.
5. **Acceso Permanente a Configuración:** Enlace y disparador en `Footer.astro` para revocar o alterar el consentimiento en cualquier momento.

---

## Dependency Graph
```text
Task 1: Suite TDD de Pruebas Automatizadas (tests/cookies.test.mjs) [FASE RED]
    │
    ├── Task 2: Configuración Legal y Google Consent Mode v2 (src/config/legal.ts y src/components/GoogleTagManager.astro)
    │
    ├── Task 3: Página Dedicada de Política de Cookies y Actualización de Privacidad (src/pages/cookies.astro y src/pages/privacidad.astro)
    │
    ├── Task 4: Componente de Banner Flotante y Panel de Configuración (src/components/CookieBanner.astro y Layout.astro)
    │
    ├── Task 5: Enlace a Política y Disparador de Configuración en el Footer (src/components/Footer.astro)
    │
    └── Task 6: Verificación TDD Green, Build Estático y Verificación en Navegador Real (npm test, npm run build, node scripts/verify-browser.mjs)
```

---

## Risks and Mitigations
| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| **Colisión visual en dispositivos móviles con el botón flotante "Cómo llegar"** | Alto | El banner aplica clases de separación `bottom-0 pb-20 sm:pb-4 sm:bottom-4 sm:right-4` y z-index controlado (`z-50`) para no tapar los elementos de navegación ni romper el scroll. |
| **Carga de cookies analíticas antes del consentimiento del usuario** | Crítico | Se inicializa Google Consent Mode v2 con todos los permisos en `'denied'` antes de la carga de GTM; únicamente tras clic explícito en "Aceptar todas" o toggle analítico se ejecuta `gtag('consent', 'update', { analytics_storage: 'granted' })`. |
| **Banner reapareciendo en cada recarga de página tras aceptar o rechazar** | Medio | Almacenamiento seguro en `localStorage` con lectura síncrona en el primer render para mantener el banner oculto si ya existe consentimiento válido registrado. |
| **Patrón oscuro en el diseño de los botones** | Alto | Ambos botones ("Aceptar todas" y "Rechazar no esenciales") disponen de tipografía clara, tamaños táctiles mínimos WCAG (>= 44px) y contraste accesible sobre el fondo. |
| **Regresión en pruebas previas del sitio** | Alto | Ejecución de `npm test` con los 51 tests existentes garantizando 0 regresiones. |
