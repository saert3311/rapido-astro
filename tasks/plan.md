# Implementation Plan: Transición a "Tienda Online Próximamente" (`SPEC-online-store-coming-soon`)

## Overview
Actualización sistemática de copys en Rápido Pack Valencia para eliminar las afirmaciones que negaban la existencia de venta online y reemplazarlas por el mensaje de que la tienda online oficial está en desarrollo y llegará próximamente, preservando la exclusividad presencial actual en la tienda de Alfafar sin añadir vitrinas, catálogos ni carritos e-commerce.

---

## Dependency Graph
```text
Task 1: Suite TDD de Pruebas Automatizadas (tests/online-store-copy.test.mjs) [FASE RED]
    │
    ├── Task 2: Actualización de Reglas de Negocio (AGENTS.md)
    │
    ├── Task 3: Actualización de Portada (src/pages/index.astro: Hero chip y FAQ)
    │
    ├── Task 4: Actualización de Outlet (src/pages/outlet.astro: FAQ y Badge)
    │
    ├── Task 5: Actualización Legal (src/pages/aviso-legal.astro: Sección 3)
    │
    └── Task 6: Verificación TDD Green, Build Estático y Verificación en Navegador
```

---

## Risks and Mitigations
| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| **Generar expectativas erróneas de compra online inmediata** | Medio | Redacción explícita: "ahora mismo la venta se realiza en tienda física; la tienda online está en desarrollo y llegará pronto". |
| **Romper tests SEO existentes por longitud de descripciones** | Alto | El cambio solo afecta al cuerpo de FAQs, el badge y el chip del Hero; no se alteran los `<title>` ni las `description` calibrados para SERP. |
| **Olvidar alguna mención de "no vendemos online" o "100% presencial"** | Bajo | La suite TDD escanea exhaustivamente `src/` asegurando 0 coincidencias residuales de esas frases. |
