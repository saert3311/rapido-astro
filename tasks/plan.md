# Implementation Plan: Carrier Logos & SEO Schema (`SPEC-carrier-logos`)

## Overview
Implementación de los logotipos vectoriales de las cuatro agencias de paquetería homologadas (INPOST, GLS, SEUR, KANGURO) y enriquecimiento del marcado estructurado SEO local en Rápido Pack Valencia (`rapido-astro`), siguiendo `SPEC-carrier-logos.md`:
1. **Componente Modular `CarrierLogo.astro`:** SVGs oficiales inline optimizados, con escalado homogéneo, `aria-hidden="true"`, acabado pizarra/monocromo en reposo (`grayscale opacity-75`) y transición fluida a color corporativo en `:hover` (`group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105`).
2. **Página de Paquetería (`src/pages/paqueteria.astro`):** Sustitución de iconos genéricos de Google Symbols por `CarrierLogo` en la cuadrícula de agencias autorizadas, respetando la **Opción A** (sin enlaces externos salientes a las homes de las empresas para retener al usuario en la conversión local física).
3. **Página de Inicio (`src/pages/index.astro`):** Integración de micro-logos en la tarjeta Gateway de Paquetería.
4. **SEO Local (`src/layouts/Layout.astro`):** Enriquecimiento de `schemaStore` en JSON-LD con `knowsAbout` y las marcas oficiales gestionadas.
5. **Tests Automatizados:** Nueva suite TDD en `tests/carrier-logos.test.mjs` para blindar la presencia de los logos, accesibilidad y schema.

---

## Dependency Graph
```text
Task 1: Suite TDD de Pruebas Automatizadas (tests/carrier-logos.test.mjs) [FASE RED]
    │
    ├── Task 2: Componente SVG Vectorial (src/components/CarrierLogo.astro)
    │
    ├── Task 3: Integración en src/pages/paqueteria.astro (Cuadrícula de Operadores)
    │
    ├── Task 4: Integración en src/pages/index.astro (Gateway Card de Paquetería)
    │
    ├── Task 5: Enriquecimiento JSON-LD en src/layouts/Layout.astro
    │
    └── Task 6: Verificación TDD Green, Build Estático y Git Commits Atómicos
```

---

## Risks and Mitigations
| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| **Desbalance visual entre logos con diferentes proporciones** | Medio | Normalizar viewBox y usar clases `h-6 sm:h-7 w-auto object-contain` con centrado flex para mantener alineación óptica perfecta. |
| **Layout Shift (CLS > 0) al renderizar SVGs** | Alto | SVGs inline con dimensiones fijas en CSS y viewBox explícito; cero peticiones de red asíncronas. |
| **Confusión en lectores de pantalla (doble anuncio del nombre de la agencia)** | Medio | `aria-hidden="true"` en los SVGs porque el elemento `<h3>` adyacente ya contiene el nombre textual accesible de cada agencia. |
| **Colisión o pérdida de la identidad esmeralda del sitio** | Alto | Filtro monocromo `grayscale opacity-75` en reposo; el color oficial solo se activa al interactuar (`group-hover`). |
| **Fuga de tráfico y pérdida de conversión física local** | Alto | Cumplir estrictamente la Opción A: cero enlaces salientes hacia las páginas de inicio generales de las agencias. |
