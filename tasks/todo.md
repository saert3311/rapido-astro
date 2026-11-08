# Task List: Integración de Carrier Logos & Schema SEO

## Phase 1: Test Suite Automatizada (TDD Red)
- [x] **Task 1.1**: Crear suite de tests `tests/carrier-logos.test.mjs`
  - Validar existencia de `src/components/CarrierLogo.astro`
  - Validar soporte de los 4 operadores: `INPOST`, `GLS`, `SEUR`, `KANGURO`
  - Validar presencia de `aria-hidden="true"`
  - Validar clases de hover y grayscale
  - Validar sustitución en `paqueteria.astro` y micro-badges en `index.astro`
  - Validar `knowsAbout` en el JSON-LD de `Layout.astro`
  - *Verify:* `npm test` falla controladamente (FASE RED) [COMPLETADO].

## Phase 2: Componente CarrierLogo.astro
- [x] **Task 2.1**: Implementar `src/components/CarrierLogo.astro`
  - Diseñar paths SVG vectoriales nítidos para INPOST, GLS, SEUR, KANGURO
  - Añadir soporte de tamaños (`sm` para badges, `md` para tarjetas)
  - Configurar clases Tailwind para reposo (`filter grayscale opacity-75`) y hover (`group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300`)
  - *Verify:* `npm test` avanza con tests de componente [COMPLETADO].

## Phase 3: Integración en Páginas
- [x] **Task 3.1**: Actualizar `src/pages/paqueteria.astro`
  - Reemplazar iconos genéricos de Google Symbols por `<CarrierLogo carrier={carrier.name} size="md" />`
  - Comprobar que no hay enlaces salientes a las homes de paquetería (Opción A)
  - *Verify:* `npm test` y `npm run build` [COMPLETADO].
- [x] **Task 3.2**: Actualizar `src/pages/index.astro`
  - Integrar micro-logos en los tags de operadores de la tarjeta Gateway de Paquetería
  - *Verify:* `npm test` y `npm run build` [COMPLETADO].

## Phase 4: Schema SEO JSON-LD
- [x] **Task 4.1**: Actualizar `src/layouts/Layout.astro`
  - Agregar `knowsAbout` en `schemaStore` con los 4 operadores oficiales
  - *Verify:* `npm test` pasa al 100% (FASE GREEN) [COMPLETADO].

## Phase 5: Verificación, Build y Git Commits
- [x] **Task 5.1**: Ejecutar suite completa `npm test` y build `npm run build` [COMPLETADO].
- [x] **Task 5.2**: Realizar commits atómicos en la rama `feature/carrier-logos` según `/git-workflow-and-versioning` [COMPLETADO].
