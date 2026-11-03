# Implementation Plan: Reestructuración Web (Portal Dual, Nueva Página `/paqueteria` y Cero Repeticiones)

## Overview
Reestructuración de la arquitectura de contenidos de **Rápido Pack Valencia** para eliminar duplicidades entre páginas y dotar a cada ruta de un propósito único:
- **Inicio (`/`):** Portal de bienvenida y resumen ejecutivo dual (Paquetería + Outlet) sin bentos de producto repetidos ni mapa iframe pesado.
- **Paquetería (`/paqueteria`):** Nueva página dedicada con los 5 operadores oficiales, proceso de recogida/devolución y FAQ logística.
- **Outlet (`/outlet`):** Foco exclusivo en banco de pruebas con enchufe, rotación semanal de lotes y catálogo presencial de categorías.
- **Contacto (`/contacto`):** Canales directos, formulario y componente `StoreLocator.astro` completo (mapa y horario oficial).

## Architecture Decisions
- **Zero New Dependencies & Minimal Diff (`/ponytail`):** Reutilizar los componentes existentes (`Layout`, `FaqAccordion`, `StoreLocator`), aplicando los tokens Tailwind v4 ya definidos en `src/styles/global.css`.
- **Deduplication of `StoreLocator`:** Reservar el mapa interactivo completo de Google Maps exclusivamente para `/contacto`. En Inicio, Paquetería y Outlet se proporcionan tarjetas compactas con horarios y botones directos a Google Maps y a `/contacto`.
- **4-Link Navigation:** Actualizar `currentPage?: 'home' | 'paqueteria' | 'outlet' | 'contacto'` en `Layout.astro` y `Header.astro`.

## Dependency Graph
```text
Task 1: Navigation Shell (Layout, Header & Footer 4-link nav)
    │
    ├── Task 2: Nueva Página /paqueteria (Hub de paquetería, operadores y FAQ logística)
    │
    ├── Task 3: Refactorización de Inicio / (Resumen ejecutivo dual y gateways)
    │
    ├── Task 4: Refactorización de Outlet /outlet (Eliminación de redundancias)
    │
    └── Task 5: Verificación integral de Contacto /contacto, build y typecheck
```

## Risks and Mitigations
| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| Enlaces rotos tras redistribuir secciones y anclas `#` | Medio | Auditar todos los `href` en las 4 páginas y verificar que apunten a sus rutas (`/paqueteria`, `/outlet`, `/contacto`). |
| Pérdida de contexto sobre los operadores de paquetería en la portada | Bajo | Diseñar una tarjeta Gateway destacada en la Home con los badges de los 5 operadores y CTA a `/paqueteria`. |
| Sobrecarga del DOM en móviles | Bajo | Eliminar el iframe del mapa de Home y Outlet aligera drásticamente el First Contentful Paint y LCP en móvil. |
