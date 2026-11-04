# Spec: Optimización SEO Integral y Resolución de Hallazgos de Auditoría (`SPEC-seo-optimization`)

## Objective
Resolver de forma exhaustiva y verificable los 9 hallazgos diagnosticados en el informe de auditoría (`seo-audit-report.md`), elevando el **SEO Health Index** de la web de Rápido Pack Valencia del **85% a >95%**. 

El objetivo primordial es maximizar la visibilidad orgánica en búsquedas locales y de alta intención comercial en Alfafar y el área metropolitana de Valencia (posicionamiento en Google Local 3-Pack, Google Maps, paneles de conocimiento y snippets enriquecidos en SERP) tanto para el hub de paquetería oficial (`InPost`, `GLS`, `SEUR`, `Kanguro`) como para la tienda física de outlet y segunda mano.

---

## Tech Stack
- **Framework:** Astro 7 (`^7.4.4`), static output (`./dist/`), strict TypeScript (`astro/tsconfigs/strict`).
- **SEO & Indexación:** `@astrojs/sitemap` (`^3.2.1` o compatible con Astro 7), Schema.org JSON-LD estándar (`Store`, `LocalBusiness`).
- **Estilos y Maquetación:** Tailwind CSS v4 (`^4.3.3`) respetando la disciplina de tokens `@theme` en `src/styles/global.css`.
- **Testing:** Node.js built-in test runner (`node --test tests/*.test.mjs`).
- **Despliegue:** Cloudflare Workers Static Assets (`wrangler.json`).

---

## Commands
- **Instalación de dependencias sitemap:** `npm install @astrojs/sitemap`
- **Compilación de producción y verificación de tipos:** `npm run build`
- **Suite de pruebas automáticas (TDD):** `npm test` o `node --test tests/seo.test.mjs`
- **Previsualización local de producción:** `npm run preview`
- **Auditoría de navegador / headless verification:** `node scripts/verify-browser.mjs`

---

## Project Structure
```text
rapido-astro/
├── astro.config.mjs             # Añadir `site: 'https://rapidopackvalencia.es'` e integración `@astrojs/sitemap`
├── public/
│   ├── robots.txt               # Directivas de rastreo User-agent: * y referencia canónica al sitemap
│   └── _headers                 # Cabeceras de caché (ya optimizadas)
├── src/
│   ├── config/
│   │   ├── site.ts              # Enriquecer SITE con geolocalización (lat/long), metadatos SEO y URLs canónicas
│   │   └── legal.ts             # Datos de titularidad mercantil y política de protección de datos (RGPD)
│   ├── layouts/
│   │   └── Layout.astro         # Inyección de <link rel="canonical">, OpenGraph, Twitter Cards y Schema.org JSON-LD
│   ├── components/
│   │   ├── Footer.astro         # Enlaces de navegación legal (Aviso Legal, Política de Privacidad)
│   │   └── ContactForm.astro    # Cláusula informativa y enlace a Política de Privacidad
│   └── pages/
│       ├── index.astro          # Calibración de <title> (50-60 car.) y meta description (140-155 car.)
│       ├── paqueteria.astro     # Calibración de <title> y meta description
│       ├── outlet.astro         # Calibración de <title> y meta description
│       ├── contacto.astro       # Calibración de <title> y meta description
│       ├── aviso-legal.astro    # Página legal estática con titularidad, LSSI-CE y condiciones
│       └── privacidad.astro     # Página de política de privacidad y derechos RGPD/LOPDGDD
└── tests/
    └── seo.test.mjs             # Suite TDD para validar los 9 hallazgos de forma automática
```

---

## Code Style & Implementation Details

### 1. Schema.org JSON-LD (`Layout.astro`)
Marcado semántico generado de forma dinámica y validado contra el esquema oficial `Store` / `LocalBusiness`:
```html
<script type="application/ld+json" is:inline set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": ["Store", "LocalBusiness"],
  "name": "Rápido Pack Valencia",
  "image": "https://rapidopackvalencia.es/logo-rapido-pack-valencia.png",
  "@id": "https://rapidopackvalencia.es/#store",
  "url": "https://rapidopackvalencia.es",
  "telephone": "+34640397434",
  "priceRange": "€",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Carrer del Comte Ronrée, 8",
    "addressLocality": "Alfafar",
    "postalCode": "46910",
    "addressRegion": "Valencia",
    "addressCountry": "ES"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 39.4216,
    "longitude": -0.3855
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:30",
      "closes": "20:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "10:00",
      "closes": "15:00"
    }
  ]
})} />
```

### 2. Canónicas y Metadatos Sociales (`Layout.astro`)
```html
<link rel="canonical" href={canonicalURL} />
<meta property="og:site_name" content="Rápido Pack Valencia" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalURL} />
<meta property="og:type" content="website" />
<meta property="og:locale" content="es_ES" />
<meta property="og:image" content={socialImageURL} />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={socialImageURL} />
```

### 3. Títulos y Meta Descripciones Calibradas para SERP
- **`/` (Inicio):**
  - *Title:* `Rápido Pack Valencia · Outlet y Paquetería en Alfafar` (53 car.)
  - *Desc:* `Punto oficial de paquetería (InPost, GLS, SEUR, Kanguro) y tienda outlet de segunda mano en Alfafar. A 5 min de la estación de tren.` (138 car.)
- **`/paqueteria`:**
  - *Title:* `Punto de Paquetería en Alfafar · InPost, GLS, SEUR` (50 car.)
  - *Desc:* `Recogida y envío de paquetes en Alfafar con InPost, GLS, SEUR y Kanguro. Horario continuo L-V 09:30-20:00 y sábados. A 5 min de la estación.` (143 car.)
- **`/outlet`:**
  - *Title:* `Outlet y Segunda Mano en Alfafar · Rápido Pack` (46 car.)
  - *Desc:* `Tienda física de outlet y segunda mano en Alfafar con hasta -70% de descuento. Banco de pruebas con enchufe y stock renovado semanalmente.` (142 car.)
- **`/contacto`:**
  - *Title:* `Contacto y Ubicación en Alfafar · Rápido Pack` (44 car.)
  - *Desc:* `Visítanos en Carrer del Comte Ronrée 8, Alfafar (Valencia). A 5 min de la estación de tren. WhatsApp, teléfono y mapa de cómo llegar.` (138 car.)

---

## Testing Strategy (TDD)
Seguir el ciclo Red-Green-Refactor creando `tests/seo.test.mjs` para verificar de forma estricta los 9 requerimientos:
1. **`astro.config.mjs`:** Verifica que declare la propiedad `site: 'https://rapidopackvalencia.es'`.
2. **`robots.txt`:** Verifica existencia en `public/robots.txt` y en `dist/robots.txt`, comprobando directivas `User-agent: *`, `Allow: /` y la referencia al sitemap XML (`https://rapidopackvalencia.es/sitemap-index.xml`).
3. **`sitemap.xml`:** Verifica la generación de `sitemap-index.xml` (o `sitemap-0.xml`) conteniendo las 4 rutas canónicas principales (`/`, `/paqueteria`, `/outlet`, `/contacto`) y las 2 rutas legales (`/aviso-legal`, `/privacidad`).
4. **Etiquetas Canónicas:** Comprueba que en todas las páginas de `dist/**/*.html` exista exactamente una etiqueta `<link rel="canonical" href="https://rapidopackvalencia.es/..." />` válida.
5. **Metadatos Sociales:** Comprueba la presencia de las etiquetas `og:title`, `og:description`, `og:image`, `og:url`, `og:locale` y `twitter:card`.
6. **Longitud de `<title>`:** Aserción estricta de que el `<title>` de cada una de las páginas tenga entre 30 y 65 caracteres (0 truncamientos en SERP).
7. **Longitud de `meta description`:** Aserción estricta de que la descripción tenga entre 120 y 160 caracteres.
8. **Schema.org JSON-LD:** Valida sintaxis JSON-LD válida con campos obligatorios de Google Local (`@type: Store`, `name`, `address`, `geo`, `openingHoursSpecification`).
9. **Páginas Legales y RGPD:** Valida existencia de `/aviso-legal` y `/privacidad`, presencia de enlaces en `Footer.astro` y cláusula informativa en `ContactForm.astro`.

---

## Boundaries
- **Always:**
  - Mantener `src/config/site.ts` como la única fuente de verdad para datos de contacto, horarios y dirección física.
  - Asegurar que `npm run build` compile con 0 errores y que `npm test` pase con 100% de éxito.
  - Mantener las páginas legales con el mismo diseño estético y tipográfico (`font-display: Outfit`, `font-sans: Plus Jakarta Sans`, Tailwind v4 tokens) que el resto de la web.
- **Ask first:**
  - Datos mercantiles específicos (NIF/CIF final o razón social formal del titular) si difieren del nombre comercial "Rápido Pack Valencia".
- **Never:**
  - Instalar frameworks reactivos cliente (React, Vue) para el sitemap o metadatos.
  - Generar sitemaps con URLs `http://` no seguras o rutas de desarrollo locales (`localhost`).
  - Truncar títulos clave con puntos suspensivos en el código fuente.

---

## Success Criteria
1. El informe de auditoría SEO pasa de **85/100** a **>95/100** (estado Excelente).
2. Los 9 hallazgos diagnosticados quedan completamente solventados y verificados.
3. El comando `npm test` ejecuta y aprueba todos los tests existentes más la nueva suite `tests/seo.test.mjs`.
4. El comando `npm run build` genera la web estática en `./dist/` con `robots.txt`, `sitemap-index.xml`, páginas legales y HTMLs enriquecidos con JSON-LD y OpenGraph.
5. Se mantiene un rendimiento impecable de Core Web Vitals (LCP < 0.8s, CLS = 0).

---

## Open Questions & Clarifications (Resueltas)
1. **Dominio canónico de producción:** Confirmado `https://rapidopackvalencia.es`. Se actualizan todas las referencias en el proyecto (correos a `contacto@rapidopackvalencia.es`, directiva `site`, canónicas y sitemaps).
2. **Datos de Titularidad Legal:** Se utiliza la estructura legal oficial de `Rápido Pack Valencia` con marcador editable `[NIF/CIF pendiente de asignación]` en `src/config/legal.ts` para facilitar su sustitución futura.
