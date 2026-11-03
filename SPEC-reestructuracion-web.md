# Spec: Reestructuración Web y Nueva Página de Paquetería (`SPEC-reestructuracion-web`)

## Objective
Reestructurar la arquitectura de información y la navegación del sitio web de Rápido Pack Valencia para eliminar repeticiones de contenido, desacoplar las páginas en cuatro responsabilidades únicas y publicar la página dedicada `/paqueteria`:
1. **Inicio (`/`):** Resumen ejecutivo conciso del negocio físico dual en Alfafar (portal de bienvenida en 5 segundos con accesos directos a paquetería y outlet, sin bento repetido de productos ni iframe de mapa).
2. **Paquetería (`/paqueteria`):** Nueva página especializada con los 5 operadores oficiales (Amazon Hub Counter, InPost, GLS, SEUR, CTT), proceso paso a paso (recogida/devolución sin etiqueta), ventajas de aparcamiento en puerta y FAQ logística.
3. **Outlet (`/outlet`):** Concentración del catálogo presencial, protocolo del banco de pruebas con enchufe, renovación semanal de lotes y FAQ de compra en tienda física.
4. **Contacto (`/contacto`):** Canales directos (teléfono, WhatsApp, formulario) y el componente `StoreLocator.astro` completo (mapa interactivo y tabla horaria oficial).

## Tech Stack
- **Framework:** Astro 7 (`^7.4.4`), static output (`./dist/`), TypeScript strict.
- **Styling:** Tailwind CSS v4 (`^4.3.3`) con tokens en `src/styles/global.css` (`@theme`).
- **Icons & Fonts:** Material Symbols Outlined (`!hidden`, `!inline-block`), Outfit (`font-display`), Plus Jakarta Sans (`font-sans`), JetBrains Mono (`font-mono`).
- **Data Source:** `src/config/site.ts` (`SITE` object) como única fuente de verdad para teléfonos, horarios, operadores y direcciones.

## Commands
- **Dev server:** `npx astro dev --background`
- **Build & Typecheck:** `npm run build`
- **Preview build:** `npm run preview`
- **Git status:** `git status`

## Project Structure
```text
src/
├── config/
│   └── site.ts                  # Fuente de verdad (SITE config)
├── styles/
│   └── global.css               # Tailwind v4 theme tokens
├── layouts/
│   └── Layout.astro             # Shell común (navbar h-24, footer, metadata)
├── pages/
│   ├── index.astro              # REFACTOR: Resumen ejecutivo dual + 2 Gateways + Trust ledger
│   ├── paqueteria.astro         # NUEVO: Hub oficial de paquetería (operadores, pasos, FAQ envíos)
│   ├── outlet.astro             # REFACTOR: Limpieza de duplicados, foco en test bench y categorías
│   └── contacto.astro           # Contacto directo + StoreLocator completo
└── components/
    ├── Header.astro             # REFACTOR: 4 enlaces (Inicio, Paquetería, Outlet, Contacto) + live status
    ├── Footer.astro             # Enlaces actualizados con /paqueteria
    ├── StoreLocator.astro       # Mapa y horario (reservado para /contacto)
    ├── FaqAccordion.astro       # Acordeón accesible nativo <details name="...">
    └── ContactForm.astro        # Formulario accesible
```

## Code Style & Conventions
- **Zero Client-Side JS Frameworks:** HTML semántico y utilidades Tailwind v4.
- **De-boxed Hairline Ledgers:** `border-t border-b divide-y md:divide-x divide-border-subtle` en lugar de tarjetas flotantes genéricas.
- **Single Source of Truth:** Todo dato de contacto, operador, dirección u horario debe consumirse de `SITE` en `src/config/site.ts`.
- **Material Symbols Specificity:** Usar `!hidden`, `group-open:!hidden` para toggles de iconos.
- **Lazy/Minimalist Diff (Ponytail):** Reutilizar los componentes existentes (`FaqAccordion`, `Layout`, `Header`, `Footer`). No inventar librerías ni scripts complejos.

## Testing & Verification Strategy
- **Static Build:** `npm run build` debe compilar a `./dist/` con 0 errores TypeScript y 0 errores de Astro.
- **Nav Verification:** El menú de cabecera (`Header.astro`) y el pie de página (`Footer.astro`) deben enlazar correctamente a las 4 rutas activas (`/`, `/paqueteria`, `/outlet`, `/contacto`) y reflejar el estado activo en la página actual.
- **No-Repetition Audit:**
  - `StoreLocator` (iframe de Google Maps) únicamente se renderiza en `/contacto`.
  - En `index.astro` no se repite el bento de categorías de producto de `outlet.astro`.
  - Las preguntas frecuentes (FAQs) en `index.astro`, `paqueteria.astro`, `outlet.astro` y `contacto.astro` son 100% independientes y no se solapan.

## Boundaries
- **Always:**
  - Respetar las reglas de `AGENTS.md` (no `tailwind.config.js`, no e-commerce online, hora en `Europe/Madrid`).
  - Usar `npm run build` para validar cambios.
  - Crear commits atómicos por tarea según `/git-workflow-and-versioning`.
- **Ask first:**
  - Agregar nuevas dependencias npm.
  - Modificar variables del negocio en `src/config/site.ts` fuera de paquetería/outlet.
- **Never:**
  - Implementar checkout, pasarela de pago o carritos online.
  - Añadir librerías React/Vue/Svelte (mantener cero JS framework).

## Success Criteria
1. Existe `src/pages/paqueteria.astro` con diseño coherente con la marca, operadores oficiales, guía de 3 pasos y FAQs logísticas.
2. `src/pages/index.astro` es un portal conciso de entrada dual (Paquetería y Outlet) sin el bento de productos duplicado y sin el mapa interactivo pesado.
3. `src/pages/outlet.astro` se enfoca en el banco de pruebas, rotación semanal y categorías de oportunidades.
4. `src/components/Header.astro` muestra los 4 enlaces de navegación (`Inicio`, `Paquetería`, `Outlet`, `Contacto`), marcando el estado activo según `currentPage`.
5. `src/components/Footer.astro` incluye el enlace directo a `/paqueteria`.
6. `npm run build` completa con éxito sin errores.

## Open Questions
- Ninguna pregunta abierta pendiente. Requisitos completamente consensuados.
