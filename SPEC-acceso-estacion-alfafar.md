# Spec: Sustitución de Parking por Acceso Peatonal desde Estación Alfafar-Benetússer (`SPEC-acceso-estacion-alfafar`)

## Objective
Reemplazar sistemáticamente todas las menciones y pilares relacionados con "aparcamiento fácil en puerta" y "parking cómodo" en el sitio web de Rápido Pack Valencia por la ventaja de accesibilidad peatonal inmediata desde la **Estación Alfafar-Benetússer** (Cercanías C-1 / C-2 y líneas de MetroBus, a solo 5 minutos a pie y a 5 minutos directos en tren desde Valencia Nord).

## Tech Stack
- **Framework:** Astro 7 (`^7.4.4`), static output (`./dist/`), TypeScript strict.
- **Styling:** Tailwind CSS v4 (`^4.3.3`) con tokens en `src/styles/global.css`.
- **Icons:** Google Material Symbols Outlined (`train`, `directions_walk`, `near_me`).
- **Data Source:** `src/config/site.ts` (`SITE.location`) como única fuente de verdad.

## Commands
- **Dev preview:** `npx astro preview --host 127.0.0.1 --port 4321`
- **Build & Typecheck:** `npm run build`
- **TDD Tests:** `node --test tests/transit-station.test.mjs`
- **Browser verification:** `node scripts/verify-browser.mjs`

## Project Structure
```text
src/
├── config/
│   └── site.ts                  # Parámetros centralizados (stationName, stationWalkMinutes, stationNote)
├── components/
│   └── StoreLocator.astro       # Chip y subtítulo con icono de tren/estación en vez de parking
├── layouts/
│   └── Layout.astro             # Mobile sticky CTA con badge: "Estación Alfafar · 5 min a pie"
└── pages/
    ├── index.astro              # Pilar 04, FAQs de llegada y tarjeta de visita actualizados
    ├── paqueteria.astro         # Paso 03 ("A 5 Min de la Estación"), hero y badges sin parking
    ├── outlet.astro             # Tarjeta de visita y banner sin parking
    └── contacto.astro           # Descripción de canal físico y FAQ de llegada sin parking
tests/
└── transit-station.test.mjs     # Test TDD automatizado verificando 0 menciones de parking y presencia de la estación
```

## Code Style & Conventions
- **Single Source of Truth:** `SITE.location.stationNote` y `SITE.location.stationName` definen la información de transporte en `src/config/site.ts`.
- **Iconography Consistency:** Sustituir `local_parking` por `train` o `directions_walk`.
- **Accurate Naming:** La estación se denomina `Estación Alfafar-Benetússer (Tren Cercanías / MetroBus a 5 min a pie)`. En badges móviles compactos se resume como `Estación Alfafar · 5 min a pie`.
- **Clean Language:** Eliminar cualquier afirmación como "aparcamiento en puerta", "sin problemas de aparcamiento" o "carga fácil con coche".

## Testing Strategy (TDD)
- **Fase RED:** Escribir `tests/transit-station.test.mjs` comprobando que:
  1. No existe ninguna referencia a `Aparcamiento en puerta` o `parking en la misma puerta` en `src/`.
  2. `src/config/site.ts` exporta `stationName` y `stationNote`.
  3. `Layout.astro` muestra `Estación Alfafar · 5 min a pie` en la barra flotante móvil.
  4. `StoreLocator.astro` renderiza el icono `train` y la nota de la estación.
  5. `npm run build` genera las 4 páginas estáticas sin errores.
- **Fase GREEN:** Realizar las modificaciones mínimas necesarias para que el test pase.
- **Fase REFACTOR:** Verificar en navegador real mediante `scripts/verify-browser.mjs`.

## Boundaries
- **Always:**
  - Mantener la centralización de datos en `src/config/site.ts`.
  - Asegurar que `npm run build` compile con 0 errores TypeScript.
  - Ejecutar verificación en Google Chrome CDP.
- **Ask first:**
  - Eliminar por completo el acceso por carretera (V-31 se mantiene como dato complementario secundario en la ficha de ubicación).
- **Never:**
  - Prometer aparcamiento reservado o plazas garantizadas en la vía pública.

## Success Criteria
1. Cero coincidencias en el código fuente de "Aparcamiento en puerta" o promesas de parking fácil.
2. La Estación Alfafar-Benetússer y la distancia a pie (5 minutos) son el pilar de accesibilidad visible en Inicio, Paquetería, Outlet, Contacto y el módulo StoreLocator.
3. El botón flotante inferior en móviles muestra `Estación Alfafar · 5 min a pie`.
4. El test `node --test tests/transit-station.test.mjs` y `npm run build` pasan al 100%.

## Open Questions
- Ninguna pregunta pendiente tras la consulta interactiva previa.
