# Implementation Plan: Ergonomic Contact Form & Spatial Balance (`SPEC-contact-form-layout`)

## Overview
Optimización ergonómica y redistribución visual del formulario de contacto y su columna lateral en `/contacto` (`rapido-astro`), según lo especificado en `SPEC-contact-form-layout.md`:
1. **Reorganización en Cuadrícula 2×2 (`src/components/ContactForm.astro`):**
   - Fila 1: `Nombre completo` (col 1) + `Motivo de la consulta` (col 2).
   - Fila 2: `Teléfono de contacto` (col 1) + `Correo electrónico` (col 2).
   - Fila 3: `Mensaje` (ancho completo).
   - Conservación íntegra de selectores DOM (`#contact-name`, `#contact-subject`, `#contact-phone`, `#contact-email`, `#contact-message`), validación CSS `:user-invalid` y textos accesibles.
2. **Contenedor Armonizado para Cloudflare Turnstile (`src/components/ContactForm.astro`):**
   - Envolver `#turnstile-widget` en un contenedor horizontal con fondo sutil (`bg-surface-alt/40 border border-border-subtle/70`) e insignia de confianza a la derecha (`Protección Cloudflare Turnstile · Envío seguro`).
   - Conservar intacto el elemento de error `#turnstile-error`.
3. **Columna Lateral Adhesiva y Activos Locales (`src/pages/contacto.astro`):**
   - Anclaje adhesivo (`lg:sticky lg:top-28`) para evitar el vacío al hacer scroll en desktop.
   - Sustituir la imagen externa de Google por la oficial local `/fachada-rapido-pack-valencia.webp`.
   - Incluir badge de transporte con la Estación Alfafar-Benetússer (`1 min a pie`).
   - Agregar barra de estado / telemetría (`Atención en Sala Activa`) alineada con el horario oficial.
4. **Validación Exhaustiva:**
   - Suite de tests unitarios/integración `npm test` (65+ tests).
   - Build estático `npm run build` sin errores de compilación ni tipos.
   - Verificación en navegador Chrome Headless (1440px, 1024px, 390px) con 0 errores/advertencias en consola.

---

## Dependency Graph
```text
Task 1: Suite TDD / Tests de Regresión para Formulario (tests/contact-api.test.mjs)
    │
    ├── Task 2: ContactForm.astro (Cuadrícula 2×2 + Contenedor de Seguridad Turnstile)
    │
    ├── Task 3: contacto.astro (Aside Sticky, Activo WebP Local y Badge de Proximidad)
    │
    ├── Task 4: Verificación Automatizada (npm test + npm run build)
    │
    └── Task 5: Verificación en Navegador Headless (1440px, 1024px, 390px)
```

---

## Risks and Mitigations
| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| **Ruptura de selectores en script de envío** | Crítico | Mantener idénticos los IDs de todos los inputs (`#contact-name`, `#contact-phone`, etc.) y contenedores de feedback. |
| **Colapso en pantallas móviles (<640px)** | Alto | Usar `grid-cols-1 sm:grid-cols-2` para que en móviles los campos se apilen limpiamente de forma vertical con touch targets >= 44px. |
| **Widget Turnstile deformado o cortado** | Alto | Mantener `min-h-[65px]` y contenedor flexible con `flex flex-col sm:flex-row sm:items-center justify-between gap-3`. |
| **Violación de regla de cero aparcamiento** | Bloqueante | Resaltar única y exclusivamente la cercanía a la Estación Alfafar-Benetússer (1 min a pie / 100m). Cero referencias a estacionamiento. |
