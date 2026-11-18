# Integración Catálogo Tienda (Django) + Landing/Paquetería (Astro) vía Subdominio

## Problem Statement
¿Cómo lanzar el catálogo online en tiempo real de Rápido Pack Valencia aprovechando el backend y las plantillas Tailwind que ya existen en Django, manteniendo la velocidad de Astro en Cloudflare para la web corporativa/paquetería y derivando a los clientes de unidades únicas hacia WhatsApp o marketplaces antes de activar pagos online con Stripe?

## Recommended Direction
Arquitectura desacoplada por subdominio con **identidad visual compartida (Tailwind)** y **cero fricción de compra asistida**:
- **`rapidopackvalencia.es` (Astro + Cloudflare Workers):** Landing de marca, punto oficial de paquetería (InPost, GLS, SEUR, Kanguro), protocolo de prueba con enchufe en tienda física y contacto.
- **`tienda.rapidopackvalencia.es` (Django + Tailwind en VPS/PaaS):** Catálogo vivo de unidades únicas y lotes semanales bajo el rótulo **`Tienda`** en la navegación principal (a la derecha de `Outlet`). Sin carrito ni pasarela de pago en esta v1: cada ficha muestra estado real, fotos, precio y dos salidas claras: **consultar/reservar por WhatsApp** (con referencia pre-rellenada) o **comprar en enlace de marketplace**.
- **Puente visual 1:1:** Como Django ya usa Tailwind, se transfieren los tokens `@theme` de `src/styles/global.css` (`#059652`, `#111820`, `Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`) y la estructura exacta de `Header.astro` y `Footer.astro` al `base.html` de Django.

## Key Assumptions to Validate
- [ ] **Disciplina de baja en caja desde el móvil:** Al vender una unidad única en el local, el personal marca el artículo como vendido desde el `/admin` de Django en el móvil para evitar consultas por WhatsApp sobre artículos ya vendidos. *Validación:* Probar durante 1 semana cuántas veces entra un WhatsApp por un producto ya vendido en tienda y medir si conviene añadir un QR en la etiqueta física directo al admin.
- [ ] **Conversión de catálogo → WhatsApp / Marketplace:** Los clientes que ven un artículo en `tienda.rapidopackvalencia.es` cierran la compra por WhatsApp (envío por vuestros operadores o recogida con prueba en mesa) o vía marketplace sin checkout directo en web. *Validación:* Incluir la referencia del producto en el texto pre-rellenado de WhatsApp para medir consultas semanales originadas en el subdominio.
- [ ] **Coherencia visual entre dominios:** El salto entre `rapidopackvalencia.es` y `tienda.rapidopackvalencia.es` no rompe la confianza del usuario en móvil (`390×844`). *Validación:* Comprobar cabecera, logo, menú y tipografía lado a lado antes de publicar en producción.

## MVP Scope (Qué entra en la v1)
1. **Infraestructura DNS & Seguridad Django:** Subdominio `tienda.rapidopackvalencia.es` apuntando al VPS/PaaS en Cloudflare, con `ALLOWED_HOSTS` y `CSRF_TRUSTED_ORIGINS` configurados.
2. **Design System espejo en Django (Tailwind):** Trasladar paleta, tipografías (`Outfit` / `Plus Jakarta Sans` / `JetBrains Mono`), `Header` (sin indicador de horario en vivo y con `Tienda` a la derecha de `Outlet`) y `Footer` al `base.html` de Django.
3. **Ficha de Producto orientada a cierre rápido:**
   - Estado del artículo (Caja abierta / 2ª mano revisada), precio, referencia única (`REF`) y fotos reales.
   - Botón principal a **WhatsApp (`wa.me/34640397434`)** con texto pre-rellenado (`Producto + REF + precio`).
   - Botón secundario al **Marketplace** (cuando el producto esté publicado allí) y recordatorio de recogida/prueba en mesa con enchufe en `C/ Comte Ronrée 8`.
4. **Admin Django optimizado para móvil:** Vista filtrable por referencia/estado y acción rápida para marcar `Vendido` en 1-2 toques desde el teléfono en tienda.
5. **Conexión desde Astro (`src/config/site.ts`, `Header.astro`, `Footer.astro`, `index.astro`, `outlet.astro`, `aviso-legal.astro`):**
   - Añadir `storeUrl: 'https://tienda.rapidopackvalencia.es'` en `SITE.brand`.
   - Enlazar `Tienda` en el header a la derecha de `Outlet` (eliminando el indicador en vivo de abierto/cerrado para ganar espacio), en el footer y en los CTAs de inicio y `/outlet`.

## Not Doing (and Why — Reservado para Fase 2)
- **No activar Stripe, carrito ni checkout todavía:** Evita gestionar reservas concurrentes sobre unidades únicas, webhooks de pago, envíos automatizados y condiciones de desistimiento electrónico en el MVP hasta validar la tracción del catálogo.
- **No usar `<iframe>`:** Destruye el SEO de cada producto en Google, rompe la navegación móvil y empeora la UX.
- **No rehacer la tienda en Astro (Headless):** Django ya tiene modelos, admin y plantillas Tailwind; duplicarlo en Astro no aporta valor al cliente.
- **No tocar `src/worker.ts` para hacer Reverse Proxy:** El subdominio mantiene la web corporativa 100% aislada de cualquier caída o reinicio del servidor Django.
- **No montar TPV complejo:** La baja manual desde el `/admin` móvil de Django es suficiente para el volumen de arranque; si crece el flujo, se añade código QR/TPV en Fase 2.

## Open Questions (Para Fase 2 con Stripe)
1. **Reserva temporal en checkout:** Cómo bloquear durante 10-15 minutos una unidad única mientras un usuario completa el pago en Stripe para evitar doble venta en mostrador.
2. **Condiciones de contratación y desistimiento:** Actualizar `aviso-legal.astro` y `privacidad.astro` con los datos de Stripe y políticas de devolución cuando se habilite el pago con tarjeta.
