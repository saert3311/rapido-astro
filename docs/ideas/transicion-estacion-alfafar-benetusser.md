# Sustitución de Parking por Acceso Peatonal desde Estación Alfafar-Benetússer

## Problem Statement
¿Cómo posicionar a Rápido Pack Valencia como un espacio físico ultra-accesible a pie desde la Estación Alfafar-Benetússer (Cercanías C-1/C-2 y MetroBus), eliminando todas las promesas de aparcamiento fácil en la puerta para no generar expectativas irreales?

## Recommended Direction
1. Sustituir en `src/config/site.ts` el parámetro de parking por la conexión con la estación:
   - `stationName: 'Estación Alfafar-Benetússer'`
   - `stationWalkMinutes: 5`
   - `stationNote: 'A 5 min a pie de la Estación Alfafar-Benetússer (Cercanías / MetroBus)'`
   - `stationLine: 'Cercanías C-1 / C-2 (a 5 min de Valencia Nord)'`
2. Reemplazar el pilar de comunicación de "Aparcamiento en puerta" en Inicio (`index.astro`), Paquetería (`paqueteria.astro`), Outlet (`outlet.astro`) y Contacto (`contacto.astro`):
   - El pilar 04 pasa a ser "A 5 Minutos a Pie de la Estación / Conexión Inmediata" (Cercanías C-1/C-2 y MetroBus).
   - En Paquetería, el paso 03 se convierte en "A 5 Min de la Estación" (ideal para recoger tu paquete en tu trayecto diario en tren o autobús).
3. Actualizar la barra móvil flotante inferior (`Layout.astro`):
   - El badge inferior pasa de `V-31 · 8 min` a `Estación Alfafar · 5 min a pie`.
4. Actualizar `StoreLocator.astro`:
   - Sustituir el icono de parking (`local_parking`) por el icono de tren/estación (`train` / `directions_walk`).
   - Chip principal: `A 5 min a pie de la Estación Alfafar-Benetússer`.

## Key Assumptions to Validate
- [ ] La cercanía a pie desde la estación (400-500 m) es más atractiva y predecible para el visitante que la promesa de aparcar en una calle urbana de un solo carril.
- [ ] Eliminar las menciones de "fácil aparcamiento" no desincentiva a clientes en coche, ya que la dirección en Google Maps y el acceso por la V-31 continúan estando disponibles en `/contacto`.

## MVP Scope
- Actualización de `src/config/site.ts` como única fuente de verdad.
- Reemplazo de textos, badges e iconos en `src/components/StoreLocator.astro` y `src/layouts/Layout.astro`.
- Reemplazo de los ledgers, pasos operativos y FAQs en `src/pages/index.astro`, `src/pages/paqueteria.astro`, `src/pages/outlet.astro` y `src/pages/contacto.astro`.

## Not Doing (and Why)
- NO prometer aparcamiento reservado o fácil en la puerta (se retira completamente esa afirmación).
- NO incrustar tablas de horarios de Renfe/MetroBus que puedan quedar obsoletas (se mantiene el cálculo en Google Maps).
- NO suprimir la opción de llegar en coche por la V-31 (se mantiene como dato secundario en la ficha de ubicación).

## Open Questions
- Ninguna pregunta abierta pendiente.
