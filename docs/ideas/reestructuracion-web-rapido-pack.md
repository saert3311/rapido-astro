# Reestructuración Web: Portal Dual Desacoplado y Página de Paquetería

## Problem Statement
¿Cómo podríamos estructurar la arquitectura web de Rápido Pack Valencia en 4 páginas con propósitos estrictamente diferenciados (Inicio como portal resumen, Paquetería como hub logístico, Outlet como tienda física de oportunidades y Contacto como centro de atención y llegada), eliminando toda duplicidad de textos, mapas y FAQs?

## Recommended Direction
Desacoplar la experiencia en 4 URLs con fronteras estrictas de contenido y cero repetición:
1. `/` (Inicio): Resumen ejecutivo dual que presenta en 5 segundos los dos pilares del negocio en Alfafar (recogida/devolución de paquetería y tienda outlet semanal de 2ª mano) con accesos directos (gateways), datos de confianza y una ficha compacta de visita rápida.
2. `/paqueteria`: Nueva página dedicada que agrupa toda la operativa de envíos: operadores oficiales (Amazon Hub Counter, InPost, GLS, SEUR, CTT), proceso paso a paso (recoger con QR, devolver sin caja ni etiqueta), ventajas (parking en puerta) y FAQ logística exclusiva.
3. `/outlet`: Dedicada 100% al protocolo de compra presencial, banco de pruebas con enchufe, rotación semanal de lotes y showcase de categorías (tecnología, electrodomésticos, herramientas), justificando la venta presencial exclusiva sin e-commerce.
4. `/contacto`: Concentra los canales de atención (teléfono, WhatsApp, formulario) y aloja el mapa interactivo completo de Google Maps (`StoreLocator.astro`) y tabla horaria oficial, evitando incrustar el mapa pesado en las otras 3 páginas.

## Key Assumptions to Validate
- [ ] Los usuarios que buscan puntos de paquetería en Alfafar prefieren una página limpia con operadores y parking antes que ver ofertas de electrodomésticos (validar mediante navegación directa desde la cabecera y clicks en CTA).
- [ ] Aligerar la portada eliminando el bento repetido de categorías y el mapa interactivo mejora la velocidad de carga (LCP) y la tasa de clics hacia `/outlet` y `/paqueteria`.
- [ ] Mantener el mapa interactivo exclusivamente en `/contacto` reduce el peso global del sitio sin perjudicar la orientación de los visitantes.

## MVP Scope
- Nueva página `src/pages/paqueteria.astro` con hero logístico, tarjetas de los 5 operadores oficiales, guía de 3 pasos (recoger, devolver, aparcar) y 4 FAQs logísticas.
- Refactorización de `src/pages/index.astro` a resumen ejecutivo con 2 bloques "Gateway" y 3 FAQs de concepto de tienda.
- Limpieza de `src/pages/outlet.astro` para mantener solo el banco de pruebas, rotación semanal y categorías, con FAQs de producto.
- Actualización de `src/components/Header.astro` con 4 enlaces de navegación (`Inicio`, `Paquetería`, `Outlet`, `Contacto`) y estado en vivo.
- Reserva de `StoreLocator.astro` completo para `src/pages/contacto.astro`, sustituyéndolo en Inicio por un enlace/tarjeta compacto "Cómo llegar".

## Not Doing (and Why)
- NO incrustar el mapa interactivo de Google Maps (`StoreLocator`) en Inicio, Outlet ni Paquetería — Añade peso innecesario al DOM (iframe pesado) y diluye la función de `/contacto`.
- NO repetir las tarjetas de categorías (tecnología, herramientas, electrodoméstico) en la portada — Pertenecen exclusivamente a `/outlet`.
- NO compartir preguntas frecuentes (FAQs) entre páginas — Cada una responde a su vertical para no aburrir al usuario ni canibalizar SEO.
- NO crear un buscador interactivo de códigos de envío ni carritos online — Rápido Pack es un punto físico y no un transportista ni tienda e-commerce.

## Open Questions
- Ninguna pregunta bloqueante tras la validación de la fase de ideación.
