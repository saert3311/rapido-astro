# Spec: Coexistencia Tienda Física y Tienda Web (`SPEC-tienda-fisica-y-web`)

## Objective
Reemplazar todas las referencias que encuadran el negocio únicamente como **"tienda de Alfafar" / "tienda en Alfafar"** por el concepto de **tienda física**, y alinear el tono y el copy del sitio web para que la **tienda física** y la **tienda web (tienda online)** coexistan de forma natural y coherente como dos canales complementarios de **Rápido Pack Valencia**.

- **Usuario objetivo:** Clientes que buscan recoger/enviar paquetes o comprar artículos de outlet y segunda mano, tanto acudiendo en persona a la tienda física como a través de la tienda web en desarrollo.
- **Resultado esperado:** El sitio deja de presentar la tienda de Alfafar como canal único o enfrentado a internet, y comunica claramente la convivencia entre la **tienda física** (experiencia presencial, recogida de paquetería y banco de pruebas con enchufe) y la **tienda web / online** (en desarrollo / próximamente), manteniendo la dirección exacta de Alfafar únicamente como dato de ubicación física, acceso en transporte y requisito legal.

## Tech Stack
- **Framework:** Astro 7 (`^7.4.4`), salida estática (`./dist/`), TypeScript estricto (`astro/tsconfigs/strict`).
- **Estilos:** Tailwind CSS v4 (`^4.3.3`) vía `@tailwindcss/vite` con tokens en `src/styles/global.css`.
- **Datos centralizados:** `src/config/site.ts` (`SITE`) y `src/config/legal.ts` (`LEGAL`).
- **Tests:** Node.js native test runner (`node --test tests/*.test.mjs`).

## Commands
- **Dev server:** `npx astro dev --background`
- **Tests:** `npm test`
- **Build & type-check:** `npm run build`
- **Preview:** `npm run preview`

## Project Structure — Alcance de Archivos
Archivos inspeccionados donde existen referencias a "tienda ... Alfafar", posicionamiento presencial vs. internet o convivencia tienda física / tienda web:

```text
src/config/site.ts                 # metaDescription, cityTag y tagline (ajustar si se desacopla de "en Alfafar")
src/components/Footer.astro        # Descripción de marca y línea inferior del pie de página
src/components/StoreLocator.astro  # Título por defecto y subtítulo del localizador de la tienda física
src/components/ContactForm.astro   # Mensaje de confirmación ("Nuestro equipo...")
src/pages/index.astro              # Hero chip, H1/subtítulo, sección "Confianza Física" (evitar antagonismo con internet), FAQs y alt text
src/pages/outlet.astro             # Meta title/description, CTA "Visitar Tienda...", badge "Chollos del Día", textos y FAQ
src/pages/paqueteria.astro         # Meta title/description, badge hero y título FAQ (según criterio sobre "en Alfafar")
src/pages/contacto.astro           # Meta title/description, eyebrow, alt text y título de StoreLocator
src/pages/aviso-legal.astro        # Sección 2 (Objeto) y Sección 3 (Coexistencia tienda física y tienda online en desarrollo)
src/pages/privacidad.astro         # Meta description y listado de finalidad
src/pages/cookies.astro            # Meta description
AGENTS.md                          # Regla 7 (Business Domain & E-Commerce Boundaries) si aplica reflejar coexistencia física + web
tests/tienda-fisica-y-web.test.mjs # Nueva suite TDD para verificar sustitución y coexistencia
```

> **Fuera de alcance (conservado sin cambios):**
> - Dirección postal física (`Carrer del Comte Ronrée 8, 46910 Alfafar, Valencia`) en `SITE.location`, `LEGAL.address`, `Footer.astro`, `StoreLocator.astro`, JSON-LD (`Layout.astro`) y plantillas de correo (`src/lib/mailjet.ts`).
> - Estación de Cercanías (`Estación Alfafar-Benetússer` y `Estación Alfafar · 1 min a pie` en `Layout.astro` y `site.ts`), protegidos por `tests/transit-station.test.mjs`.
> - No se implementan catálogo, carrito, checkout ni reservas online (se mantiene la frontera de `tests/online-store-copy.test.mjs` salvo que se indique lo contrario).

## Code Style
Seguir las convenciones actuales en `.astro`:
- Datos de marca y ubicación siempre desde `SITE.*` (`src/config/site.ts`) y `LEGAL.*` (`src/config/legal.ts`).
- Mantener longitudes SEO en `<Layout title="..." description="...">` dentro de los umbrales validados por `tests/seo.test.mjs`:
  - `title`: **35–65 caracteres**
  - `description`: **120–160 caracteres**
- Ejemplo de tono esperado (coexistencia sin enfrentar tienda física vs. tienda web):

```astro
<h2 class="font-display text-3xl sm:text-4xl font-bold tracking-tight text-surface-dark">
  Lo mejor de nuestra tienda física, conviviendo con nuestra futura tienda web.
</h2>
```

## Testing Strategy
- **Framework:** `node:test` + `node:assert/strict` (sin dependencias externas).
- **Suites existentes que deben seguir en verde:**
  - `tests/seo.test.mjs` (títulos 35–65 chars, descripciones 120–160 chars).
  - `tests/online-store-copy.test.mjs` (prohibición de frases de rechazo e-commerce, presencia de `Tienda online próximamente`, `Hoy en tienda · Online próximamente`, `Tienda Online en Desarrollo`).
  - `tests/transit-station.test.mjs` (`Estación Alfafar-Benetússer`).
  - `tests/ui-cleanup.test.mjs`.
- **Nueva suite (`tests/tienda-fisica-y-web.test.mjs`, ciclo TDD Red → Green):**
  1. Cero ocurrencias de `tienda de Alfafar`, `tienda en Alfafar`, `establecimiento de Alfafar`, `establecimiento comercial de Alfafar` ni `compra a ciegas en internet` en `src/`.
  2. Referencias explícitas a `tienda física` y convivencia con `tienda web` / `tienda online` en `index.astro`, `outlet.astro`, `aviso-legal.astro` y `Footer.astro`.
  3. Conservación íntegra de la dirección física y la referencia a `Estación Alfafar-Benetússer`.

## Boundaries
- **Always:**
  - Usar `SITE.*` y `LEGAL.*` para datos de contacto, dirección y horarios.
  - Verificar `npm test` y `npm run build` tras los cambios.
  - Respetar los rangos de caracteres de `tests/seo.test.mjs` y las reglas de `tests/online-store-copy.test.mjs`.
- **Ask first:**
  - Si debemos eliminar `"Alfafar"` también de los títulos/meta-descripciones SEO locales (`Punto de Paquetería en Alfafar`, `Outlet y Segunda Mano en Alfafar`) o mantenerlo ahí por SEO local.
  - Si la tienda web ya está operativa o sigue comunicándose como "en desarrollo / próximamente".
  - Si se desea cambiar el texto de `Estación Alfafar` (actualmente protegido por `tests/transit-station.test.mjs`).
- **Never:**
  - Eliminar la dirección real de Alfafar en pie de página, localizador, JSON-LD o textos legales.
  - Introducir claims prohibidos (`Aparcamiento en puerta`, `no disponemos de tienda online`, `100% presencial`).
  - Añadir carrito, catálogo o checkout fuera de alcance sin aprobación.

## Success Criteria
1. Cero apariciones de `"tienda de Alfafar"`, `"tienda en Alfafar"`, `"establecimiento de Alfafar"` o equivalentes en `src/`.
2. Cero mensajes que enfrenten o desacrediten la compra web/online (como `"compra a ciegas en internet"` en `src/pages/index.astro`).
3. El copy de `index.astro`, `outlet.astro`, `contacto.astro`, `aviso-legal.astro` y `Footer.astro` refleja de forma consistente el concepto de **tienda física** coexistiendo con la **tienda web / tienda online**.
4. Todas las suites en `npm test` (incluida la nueva suite TDD) y `npm run build` pasan con 0 errores y 0 advertencias.

## Assumptions (To Confirm)
1. **Alcance de reemplazo de "Alfafar":** Se sustituyen todas las expresiones que identifican el negocio como *"tienda de Alfafar" / "tienda en Alfafar" / "establecimiento de Alfafar"* por **"tienda física"** (o **"nuestra tienda física"**), y se mantiene Alfafar únicamente en la dirección postal (`Carrer del Comte Ronrée 8, 46910 Alfafar, Valencia`), el mapa/ubicación y la estación `Estación Alfafar-Benetússer`.
2. **Estado de la tienda web:** La tienda web sigue en fase de desarrollo ("próximamente"), tal como indican `SPEC-online-store-coming-soon.md` y `tests/online-store-copy.test.mjs`, por lo que el objetivo es posicionar ambas desde ya como canales que coexisten (sin construir carrito/catálogo todavía).
3. **Coexistencia en `index.astro` (§2 Confianza Física):** Se reescribe el titular `"La ventaja de una tienda física frente a la compra a ciegas en internet."` y su subtítulo para destacar el valor de la tienda física en armonía con la tienda web, en lugar de criticar la compra por internet.
4. **Terminología:** Se emplea **"tienda física"** para el local presencial y **"tienda web"** / **"tienda online"** de manera coherente (manteniendo las cadenas exactas exigidas por `tests/online-store-copy.test.mjs` donde aplique).

## Open Questions
1. **¿Qué hacemos con las menciones a `"en Alfafar"` que NO dicen `"tienda"`?** Por ejemplo:
   - Títulos/descripciones SEO (`Outlet y Segunda Mano en Alfafar`, `Punto de Paquetería en Alfafar`, `Contacto y Ubicación en Alfafar`, `Rápido Pack Valencia · Alfafar`).
   - Encabezados de sección (`00 // Alfafar · Paquetería y Outlet`, `Todo lo que puedes hacer al visitarnos en Alfafar`, `Chollos del Día · Alfafar`, `Visita Rápido Pack Valencia en Alfafar`, `Dónde encontrarnos en Alfafar`, pie del `Footer.astro`).
   ¿Quieres cambiar **todas** esas también a `"Tienda Física"` / `"Valencia"`, o conservar `"Alfafar"` en SEO/ubicación/paquetería y cambiar solo las referencias a la tienda?
2. **¿La tienda web sigue estando "próximamente / en desarrollo", o ya convive como activa / con enlace propio?**
3. **En `paqueteria.astro`, `privacidad.astro` y `cookies.astro`**, donde aparece `"en Alfafar"` (por ejemplo, `"gestiones de paquetería en Alfafar"` o `"en el sitio de Rápido Pack Valencia en Alfafar"`), ¿también preferirías sustituirlo por `"en nuestra tienda física"` / `"en nuestra tienda física y web"`?
