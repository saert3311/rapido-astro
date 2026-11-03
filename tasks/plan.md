# Implementation Plan: Transición de Parking a Acceso Peatonal desde Estación Alfafar-Benetússer

## Overview
Actualización integral y eliminación de toda mención a aparcamiento fácil/en puerta, sustituyéndola por la ventaja de estar a solo 5 minutos a pie de la Estación Alfafar-Benetússer (Cercanías C-1/C-2 y MetroBus).

## Dependency Graph
```text
Task 1: TDD Test Suite (tests/transit-station.test.mjs) [RED]
    │
    ├── Task 2: Config Centralizada (src/config/site.ts)
    │
    ├── Task 3: Componentes Compartidos (StoreLocator.astro & Layout.astro)
    │
    ├── Task 4: Páginas Principales (index.astro, paqueteria.astro, outlet.astro, contacto.astro)
    │
    └── Task 5: Verificación TDD [GREEN], build estático y auditoría en navegador real
```

## Risks and Mitigations
| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| Dejar alguna mención residual de "parking" o "aparcamiento" huérfana en el código | Bajo | `tests/transit-station.test.mjs` realiza un escaneo regex sobre todo `src/` asegurando 0 coincidencias de claims de parking en puerta. |
| Referencias rotas a `SITE.location.parkingNote` tras su reemplazo | Medio | `npm run build` con TypeScript strict detectará inmediatamente cualquier uso de la propiedad obsoleta en tiempo de compilación. |
