# Implementation Plan: Optimización SEO Integral y Resolución de Hallazgos (`SPEC-seo-optimization`)

## Overview
Implementación guiada por especificación (TDD y vertical slicing) para resolver los 9 hallazgos identificados en el informe de auditoría SEO de Rápido Pack Valencia. El plan cubre la infraestructura de rastreo e indexación, marcado estructurado Schema.org JSON-LD, calibración on-page para SERP, metadatos sociales OpenGraph, y cumplimiento normativo RGPD/LSSI-CE con páginas legales dedicadas.

---

## Dependency Graph
```text
Task 1: Dominio, Coordenadas y Configuración Legal (site.ts & legal.ts)
    │
    ├── Task 2: Infraestructura de Indexación (astro.config.mjs, @astrojs/sitemap & robots.txt)
    │       │
    │       └── Task 3: Suite TDD Automatizada (tests/seo.test.mjs) [FASE RED]
    │               │
    │               ├── Task 4: Metadatos Globales, Canónicas y Schema.org JSON-LD (Layout.astro)
    │               │
    │               ├── Task 5: Páginas Legales y Cumplimiento RGPD (aviso-legal.astro, privacidad.astro, Footer & Form)
    │               │
    │               └── Task 6: Calibración On-Page SERP en las 4 Rutas Principales (index, paqueteria, outlet, contacto)
    │                       │
    │                       └── Task 7: Verificación TDD Green, Build Estático y Re-Auditoría SEO
```

---

## Risks and Mitigations

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| **Incompatibilidad de `@astrojs/sitemap` con Astro 7** | Alto | Probar la instalación oficial; si surgiera algún conflicto en Astro 7 estático, implementar la integración nativa o endpoint de sitemap estático conforme a la API de Astro. |
| **URLs canónicas relativas o incompletas** | Medio | Utilizar `Astro.site` y `Astro.url.pathname` para componer URLs absolutas sin parámetros duplicados ni slash inconsistente. |
| **Truncamiento de títulos por cambios en fuentes de Google** | Bajo | Mantener el rango estricto de 45–60 caracteres (menos de 580px de ancho visual en SERP). |
| **Regresión en Core Web Vitals (LCP/CLS)** | Alto | El marcado JSON-LD y las metaetiquetas residen exclusivamente en `<head>` sin inyectar CSS pesado ni JavaScript de renderizado; el tiempo de respuesta y LCP se mantendrán < 600 ms. |

---

## Verification Checkpoints

- **Checkpoint 1 (Tras Tasks 1-3):** Configuración base lista, suite TDD `tests/seo.test.mjs` creada definiendo los 9 criterios (fase RED controlada).
- **Checkpoint 2 (Tras Tasks 4-6):** Schema.org, metadatos, páginas legales y SERP implementados; `npm test` pasa al 100% (fase GREEN).
- **Checkpoint 3 (Tras Task 7):** `npm run build` genera todos los artefactos estáticos (`dist/robots.txt`, `dist/sitemap-index.xml`, etc.), verificación de navegador sin errores y reevaluación del SEO Health Index (>95/100).
