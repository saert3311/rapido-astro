# Spec: Copy "Tienda Online Próximamente" (`SPEC-online-store-coming-soon`)

> Reemplaza la versión anterior (que incluía la vitrina/estantería digital). **Alcance reducido: solo textos.** No se desarrolla vitrina, catálogo, carrito, ni componentes nuevos.

## Objective
Eliminar del sitio las afirmaciones de que **no existe tienda online** (o que la venta es "100% presencial" por naturaleza) y sustituirlas por el mensaje de que **la tienda online está en desarrollo y llegará pronto**, manteniendo que hoy la compra de outlet/segunda mano se hace en la tienda física de Alfafar.

Usuario objetivo: cliente local que pregunta si puede comprar por la web. Éxito: ninguna página dice "no hay tienda online" y al menos las FAQs de Inicio y Outlet anuncian "próximamente".

## Tech Stack
Astro 7 (static, TS strict), Tailwind v4. Sin dependencias nuevas. Solo se editan cadenas de texto en `.astro`, y se actualizan las reglas de negocio en `AGENTS.md`.

## Commands
- Test: `npm test` (incluye el nuevo `tests/online-store-copy.test.mjs`)
- Build: `npm run build`
- Verificación en navegador: `npx astro preview --host 127.0.0.1 --port 4321` + `node scripts/verify-browser.mjs`

## Project Structure — archivos a tocar
```text
src/pages/index.astro        # Chip en el Hero ("🛒 Tienda online próximamente") + FAQ L45-46: "¿Se puede comprar online…?"
src/pages/outlet.astro       # FAQ L55-56 ("¿Publicáis un listado online…?"); badge L256 "Hoy en tienda · Online próximamente"
src/pages/aviso-legal.astro  # Sección 3 (L82-95): "exclusivamente física… No se realizan operaciones de venta electrónica…"
AGENTS.md                    # Gotcha nº 7 (Business Domain Boundaries): "100% in-person (no online catalog… no e-commerce shipping)"
tests/online-store-copy.test.mjs   # nuevo, TDD
```
Sin cambios (revisados, no afirman "no hay tienda online"): `contacto.astro` (FAQ de reservas por orden de llegada y "Atención Presencial"), `paqueteria.astro` (menciones a compras online de terceros), `Footer.astro`.

## Copy propuesto
**`index.astro` Hero chip & FAQ**
- Hero chip: En el bloque de presentación de la portada, chip informativo visible:
  `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-wash text-primary font-mono text-xs font-semibold uppercase tracking-wider border border-primary/20"><span class="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true"></span>Tienda online próximamente · Hoy en Alfafar</span>`
- Pregunta FAQ: `¿Se puede comprar online o reservar artículos por la web?`
- Respuesta FAQ: `Todavía no: ahora mismo la venta de outlet y segunda mano se hace en nuestra tienda física de ${SITE.location.shortStreet}, por orden de llegada, porque el stock rota cada semana. <strong>Estamos desarrollando nuestra tienda online y llegará pronto.</strong> Mientras tanto, pásate por la tienda o escríbenos por WhatsApp.`

**`outlet.astro` FAQ & Badge**
- Pregunta FAQ: `¿Publicáis un listado online de cada unidad de segunda mano?`
- Respuesta FAQ: `Aún no. Hoy las unidades se venden en tienda (${SITE.location.street}, ${SITE.location.city}) por orden de llegada. <strong>Nuestra tienda online está en camino</strong> y llegará pronto; hasta entonces, el stock real lo ves en la tienda.`
- Badge (L256): `Venta 100% presencial` → `Hoy en tienda · Online próximamente`

**`aviso-legal.astro` §3**
- Título: `3. Actividad Comercial y Tienda Online en Desarrollo`
- Texto: actualmente los artículos se comercializan de forma física en el local de Alfafar; la tienda online se encuentra en desarrollo y, cuando se active, sus condiciones de contratación se publicarán en este sitio. Se elimina "No se realizan operaciones de venta electrónica…".
- Se mantiene el párrafo de que disponibilidad/precio/estado se verifican en tienda.

**`AGENTS.md` gotcha 7**: pasar a "hoy vende en tienda física en Alfafar; la tienda online está **en desarrollo** (puede anunciarse como 'próximamente'); no añadir carrito/checkout ni catálogo online todavía; no prometer fecha de lanzamiento ni reservas telefónicas; no inventar claims".

## Code Style
Mismas convenciones: cadenas dentro de arrays de FAQs ya existentes, `<strong>` para el claim clave, datos desde `SITE.*`. Sin lenguaje de fecha concreta ("pronto", "próximamente").

## Testing Strategy (TDD)
`tests/online-store-copy.test.mjs` (node:test, lee archivos de `src/`):
1. Ningún archivo de `src/` contiene `no disponemos de tienda online`, `100% presencial` ni `No se realizan operaciones de venta electrónica`.
2. `index.astro` y `outlet.astro` contienen `tienda online` junto con `pronto` (o `próximamente`/`en camino`).
3. `index.astro` incluye el chip visual de tienda online en desarrollo / próximamente en el Hero.
4. `aviso-legal.astro` menciona `tienda online` en desarrollo.
5. No existen archivos nuevos de vitrina/catálogo (`OnlineShelf.astro`, `products.ts`) — guarda de alcance.
Ciclo: RED (test falla con el copy actual) → GREEN (editar textos) → `npm test` + `npm run build` + verificación en navegador.

## Boundaries
- **Always:** mantener datos vía `SITE.*`; conservar el resto de claims verificados (horario, estación, operadores, stock semanal sin hora exacta); ejecutar test y build antes de commit; rama `feature/online-store-coming-soon-shelf` (ya creada).
- **Ask first:** poner fecha de lanzamiento, añadir CTA de "avísame cuando abra", cambiar FAQ de reservas en `contacto.astro`.
- **Never:** desarrollar vitrina/catálogo/carrito/checkout; prometer envíos a domicilio o plazos; prometer reservas telefónicas.

## Success Criteria
1. `grep` de `no disponemos de tienda online|100% presencial|venta electrónica` en `src/` = 0 resultados.
2. FAQs de Inicio y Outlet, badge de Outlet y Aviso Legal comunican "tienda online próximamente".
3. Chip informativo de "Tienda online próximamente" visible en el hero de Inicio (`index.astro`).
4. `AGENTS.md` actualizado con la nueva regla de negocio.
5. `npm test` y `npm run build` en verde; sin errores de consola en `/`, `/outlet`, `/aviso-legal`.

## Open Questions (Resueltas)
1. **Badge de Outlet:** Confirmado `Hoy en tienda · Online próximamente`.
2. **Chip en el Hero de Inicio:** Confirmado, se incorpora el chip visible de aviso de tienda online próximamente.
