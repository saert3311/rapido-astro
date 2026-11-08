# Spec: Integración de Logos de Paquetería y Schema SEO

## Objective
Implementar los logotipos vectoriales de las cuatro agencias de paquetería homologadas (**INPOST**, **GLS**, **SEUR** y **KANGURO**) en la web de Rápido Pack Valencia (`rapido-astro`), sustituyendo los iconos genéricos de Google Material Symbols en la página de paquetería y enriqueciendo la tarjeta de acceso rápido de la página de inicio. 

La solución aplicará la **Opción A (Recomendada)**: sin enlaces salientes a portales generales de las agencias para evitar la fuga de tráfico y proteger el embudo de conversión local física y venta cruzada al Outlet. El diseño seguirá las directrices de `design-taste-frontend` y `frontend-ui-engineering`, mostrando los logos en tono monocromo slate en reposo y revelando sus colores corporativos oficiales fluidamente al interactuar (`:hover`). Asimismo, se enriquecerán los datos estructurados `LocalBusiness` (JSON-LD) en `Layout.astro` para consolidar el posicionamiento en búsquedas locales como *"Punto InPost Alfafar"* o *"SEUR Pickup Alfafar"*.

## Tech Stack
- **Framework:** Astro 7 (`^7.4.4`), static output (`./dist/`).
- **Styling:** Tailwind CSS v4 (`^4.3.3`) vía `@tailwindcss/vite`, tokens en `src/styles/global.css`.
- **Language:** Strict TypeScript (`astro/tsconfigs/strict`).
- **Interactivity:** Zero framework JS (CSS puro con `transition`, `grayscale` y pseudoclases de grupo).

## Commands
- **Build & Typecheck:** `npm run build`
- **Dev Server:** `npx astro dev --background`
- **Check Status / Logs:** `npx astro dev status` / `npx astro dev logs`
- **Preview:** `npm run preview`

## Project Structure
```text
src/
├── components/
│   └── CarrierLogo.astro       # [NUEVO] Componente SVG modular para InPost, GLS, SEUR, Kanguro
├── layouts/
│   └── Layout.astro            # [MODIFICAR] Enriquecer JSON-LD con knowsAbout / marcas de paquetería
└── pages/
    ├── index.astro             # [MODIFICAR] Incorporar micro-logos en tarjeta Gateway de paquetería
    └── paqueteria.astro        # [MODIFICAR] Sustituir iconos genéricos por CarrierLogo en cuadrícula
```

## Code Style
Componente de presentación puro con tipado estricto:
```astro
---
interface Props {
  carrier: 'INPOST' | 'GLS' | 'SEUR' | 'KANGURO';
  class?: string;
  size?: 'sm' | 'md' | 'lg';
}

const { carrier, class: className = '', size = 'md' } = Astro.props;
---
<div class:list={['inline-flex items-center justify-center', className]}>
  {carrier === 'INPOST' && (
    <svg aria-hidden="true" viewBox="0 0 120 40" class="h-6 w-auto transition-all duration-300 filter grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105">
      <!-- Trazo e isotipo InPost -->
    </svg>
  )}
  <!-- GLS, SEUR, KANGURO -->
</div>
```

## Testing & Quality Strategy
1. **Compilación Estática:** `npm run build` debe generar el bundle estático en `./dist` sin advertencias de compilación ni errores de tipos TypeScript.
2. **Estabilidad Visual (CLS):** Los SVGs deben declarar `viewBox` y clases de altura fija (`h-6`, `h-7`, etc.) para asegurar 0 layout shift durante la carga.
3. **Accesibilidad (a11y):** Los SVGs deben portar `aria-hidden="true"` dado que el nombre del operador se comunica explícitamente en el título textual `<h3>INPOST</h3>`, evitando lecturas redundantes en tecnologías de asistencia.
4. **Verificación Responsiva:** Probar visualmente en desktop (`1440×900`) y móvil (`390×844`).

## Boundaries
- **Siempre:** Mantener la estética slate neutral + acento esmeralda; preservar la semántica HTML accesible; verificar con `npm run build` antes de cada commit.
- **Consultar primero:** Si se requiere añadir un nuevo operador a la lista de `SITE.carriers`.
- **Nunca:** Añadir enlaces salientes hacia las homes corporativas de las agencias (Opción A); incluir imágenes rasterizadas pesadas (PNG/JPG); usar paquetes de iconos externos adicionales cuando bastan SVGs limpios en el componente.

## Success Criteria
1. `src/components/CarrierLogo.astro` creado y optimizado para los 4 operadores oficiales.
2. `src/pages/paqueteria.astro` muestra los logotipos vectoriales en sustitución de los iconos genéricos de Google Symbols en la cuadrícula de agencias.
3. Al pasar el cursor sobre las tarjetas de operador, el logo transiciona suavemente de gris monocromo a su paleta cromática oficial.
4. `src/pages/index.astro` integra los logos en los badges de la sección de servicios.
5. `src/layouts/Layout.astro` incluye las entidades de los operadores en el schema JSON-LD (`knowsAbout`).
6. `npm run build` finaliza con código de salida 0.

## Open Questions
- Ninguna pregunta abierta pendiente: se han adoptado las opciones recomendadas aprobadas (logos monocromo con hover a color y Opción A sin enlaces salientes).
