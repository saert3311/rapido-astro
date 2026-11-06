# Implementation Plan: Integración Parametrizada de Google Tag Manager (`SPEC-google-tag-manager`)

## Overview
Integración estricta y de alto rendimiento del contenedor de Google Tag Manager (`GTM-PGBXBVXJ`) en Astro 7 para Rápido Pack Valencia. El ID se parametriza en `src/config/site.ts`, permitiendo sobreescritura mediante `PUBLIC_GTM_ID`. Se implementa mediante un componente dedicado `src/components/GoogleTagManager.astro` con directivas `is:inline` (según documentación oficial de Astro), resource hints (`dns-prefetch` y `preconnect`), y gating de entorno para ejecutarse exclusivamente en producción (`import.meta.env.PROD`) salvo bandera explícita.

---

## Dependency Graph
```text
Task 1: Suite TDD de Pruebas Automatizadas (tests/gtm.test.mjs) [FASE RED]
    │
    ├── Task 2: Configuración y Parametrización (src/config/site.ts)
    │
    ├── Task 3: Componente Astro Dedicado (src/components/GoogleTagManager.astro)
    │
    ├── Task 4: Inserción en el Layout Base (src/layouts/Layout.astro)
    │
    └── Task 5: Verificación TDD Green, Build Estático y Verificación en Navegador
```

---

## Risks and Mitigations
| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| **Vite envolviendo scripts en módulos ES (`type="module"`)** | Alto | Uso obligatorio de la directiva `is:inline` en los elementos `<script>` del componente Astro para mantener el alcance global `window.dataLayer` y `gtag`. |
| **Inyección de tráfico de prueba local en analítica de producción** | Medio | Gating estricto mediante `import.meta.env.PROD === true`, renderizando el snippet únicamente en compilaciones estáticas de producción salvo `forceEnable` o `PUBLIC_GTM_FORCE='true'`. |
| **Retraso de red en la carga del script externo de GTM** | Bajo | Preconexión y prefetch de DNS a `https://www.googletagmanager.com` en `<head>`. |
| **Modificación difícil del ID de contenedor en el futuro** | Medio | Centralización en `src/config/site.ts` con fallback opcional a variable de entorno `PUBLIC_GTM_ID`. |
