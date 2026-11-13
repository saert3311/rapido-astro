# Implementation Plan: Coexistencia Tienda Física y Tienda Web (`SPEC-tienda-fisica-y-web`)

## Overview
Actualizar el copy, metadatos SEO, componentes compartidos y páginas legales de `rapido-astro` conforme a `SPEC-tienda-fisica-y-web.md` para:
1. Reemplazar todas las referencias de identidad comercial basadas en `"tienda de/en Alfafar"` o `"establecimiento de Alfafar"` por el concepto de **tienda física** (conservando `Alfafar` únicamente en dirección postal física, mapa, JSON-LD y `Estación Alfafar-Benetússer`).
2. Posicionar la **tienda física** y la **tienda web (tienda online)** como canales complementarios que coexisten dentro de Rápido Pack Valencia, eliminando el lenguaje antagónico hacia internet (`"frente a la compra a ciegas en internet"`, `"esperas de envíos a domicilio"`).
3. Respaldar el cambio con una suite TDD (`tests/tienda-fisica-y-web.test.mjs`) y verificar todas las suites existentes (`tests/seo.test.mjs`, `tests/online-store-copy.test.mjs`, `tests/transit-station.test.mjs`, `tests/ui-cleanup.test.mjs`), compilación estática y comprobación visual en navegador.

---

## Architecture Decisions
- **Fuente de verdad centralizada (`src/config/site.ts`):** Actualizar `SITE.brand.tagline` y `SITE.brand.metaDescription` primero, de modo que el shell común (`Layout.astro`), los datos estructurados JSON-LD y la página de inicio hereden la nueva definición sin duplicar constantes.
- **Preservación de contratos de test existentes:**
  - `tests/online-store-copy.test.mjs` exige exactamente `"Tienda online próximamente"` (chip de `index.astro`), `"Hoy en tienda · Online próximamente"` (badge de `outlet.astro`) y `"Tienda Online en Desarrollo"` (sección 3 de `aviso-legal.astro`). El nuevo copy de coexistencia integra esas cadenas sin romperlas.
  - `tests/seo.test.mjs` exige `title` entre **35 y 65 caracteres** y `description` entre **120 y 160 caracteres** en `/`, `/paqueteria`, `/outlet` y `/contacto`. Cada modificación de metadatos se calibrará con conteo exacto.
  - `tests/transit-station.test.mjs` exige `Estación Alfafar-Benetússer` en `site.ts` y `Estación Alfafar · {SITE.location.stationWalkLabel}` en `Layout.astro`. Ambos se mantienen intactos.
- **TDD estricto (Red → Green):** Crear `tests/tienda-fisica-y-web.test.mjs` antes de editar `src/` para comprobar el estado inicial en rojo y validar progresivamente cada bloque de archivos.

---

## Dependency Graph
```text
Task 1: Suite TDD (tests/tienda-fisica-y-web.test.mjs) [RED]
    │
    ├── Task 2: Configuración y Componentes Compartidos
    │       (src/config/site.ts, Footer.astro, StoreLocator.astro, ContactForm.astro)
    │
    ├── Task 3: Páginas Principales (Coexistencia Tienda Física + Tienda Web)
    │       (src/pages/index.astro, src/pages/outlet.astro)
    │
    ├── Task 4: Páginas de Servicios y Contacto
    │       (src/pages/paqueteria.astro, src/pages/contacto.astro)
    │
    ├── Task 5: Páginas Legales y Reglas del Proyecto
    │       (src/pages/aviso-legal.astro, privacidad.astro, cookies.astro, AGENTS.md)
    │
    └── Task 6: Verificación Integral (npm test, npm run build, Chrome Headless) [GREEN]
```

---

## Task List

### Phase 1: Foundation & TDD Guardrail
- [ ] Task 1: Crear suite TDD `tests/tienda-fisica-y-web.test.mjs`
- [ ] Task 2: Actualizar configuración central y componentes compartidos (`site.ts`, `Footer.astro`, `StoreLocator.astro`, `ContactForm.astro`)

### Checkpoint: Foundation
- [ ] Las aserciones de `site.ts` y componentes compartidos pasan; `tests/seo.test.mjs` y `tests/transit-station.test.mjs` siguen en verde

### Phase 2: Core Pages (Home, Outlet, Paquetería, Contacto)
- [ ] Task 3: Actualizar portada (`index.astro`) y catálogo presencial (`outlet.astro`) con tono de coexistencia física + web
- [ ] Task 4: Actualizar servicios de paquetería (`paqueteria.astro`) y página de contacto (`contacto.astro`)

### Checkpoint: Core Pages
- [ ] `npm test` valida SEO (longitudes exactas), copia de tienda online, estación y nuevas reglas en páginas principales
- [ ] `npm run build` compila `./dist/` sin errores ni advertencias

### Phase 3: Legal Pages, Docs & End-to-End Verification
- [ ] Task 5: Actualizar páginas legales (`aviso-legal.astro`, `privacidad.astro`, `cookies.astro`) y `AGENTS.md` (gotcha 7)
- [ ] Task 6: Verificación completa (`npm test`, `npm run build` y revisión visual/consola en Chrome Headless)

### Checkpoint: Complete
- [ ] Todos los criterios de aceptación de `SPEC-tienda-fisica-y-web.md` cumplidos al 100%
- [ ] Cero errores de consola y cero desbordamientos en desktop (`1440×900`) y móvil (`390×844`)

---

## Risks and Mitigations
| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Desajuste de longitud en títulos o meta-descripciones SEO** | Alto (rompe `tests/seo.test.mjs`) | Calcular la longitud exacta interpolada (35–65 chars en `title`, 120–160 chars en `description`) antes de cerrar Tasks 2, 3 y 4 y ejecutar `node --test tests/seo.test.mjs`. |
| **Ruptura de cadenas protegidas de tienda online o estación** | Alto (rompe `online-store-copy.test.mjs` o `transit-station.test.mjs`) | Conservar literales protegidos (`Tienda online próximamente`, `Hoy en tienda · Online próximamente`, `Tienda Online en Desarrollo`, `Estación Alfafar-Benetússer`) y ejecutar `npm test` tras cada checkpoint. |
| **Eliminación accidental de dirección postal real en Alfafar** | Medio (pérdida de datos de contacto y Schema.org LocalBusiness) | Prohibir en el alcance cualquier cambio sobre `SITE.location.street/postalCode/city/province/fullAddress`, `LEGAL.address` y `Layout.astro` JSON-LD; verificarlo con test específico. |
| **Copy que siga enfrentando tienda física vs. tienda online** | Medio (incumple objetivo de coexistencia) | Añadir en `tests/tienda-fisica-y-web.test.mjs` comprobación negativa sobre `"compra a ciegas en internet"` y expresiones antagónicas equivalentes. |

## Open Questions
- Las 3 preguntas abiertas de `SPEC-tienda-fisica-y-web.md` quedan resueltas implícitamente con la aprobación de la especificación bajo la interpretación integral:
  1. Sustituir también las menciones de identidad/servicio `"en Alfafar"` en títulos, badges y pies por `"Tienda Física"` / `"Tienda Física y Web"`, preservando Alfafar en dirección física, mapa, JSON-LD y estación `Estación Alfafar-Benetússer`.
  2. Mantener la tienda web en estado *"en desarrollo / próximamente"* sin añadir carrito ni catálogo.
  3. Alinear textos legales (`aviso-legal.astro`, `privacidad.astro`, `cookies.astro`) y confirmación de formulario (`ContactForm.astro`) con la terminología **tienda física y web**.
- Si el usuario prefiere conservar `"en Alfafar"` en algún título SEO concreto (por ejemplo en `/paqueteria`), puede indicarlo antes de iniciar la implementación.
