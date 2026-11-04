# Tasks: Optimización SEO Integral (`SPEC-seo-optimization`)

## Task 1: Dominio, Coordenadas y Configuración Legal (`src/config/site.ts` & `src/config/legal.ts`)
**Description:** Actualizar el dominio base a `https://rapidopackvalencia.es`, el correo a `contacto@rapidopackvalencia.es`, añadir coordenadas geográficas (`lat`, `lng`) a `SITE.location`, y crear `src/config/legal.ts` con titularidad, domicilio, correo y marcador editable para el NIF/CIF.
**Acceptance criteria:**
- [x] `SITE.brand.domain` y `SITE.contact.email` apuntan a `rapidopackvalencia.es`.
- [x] `SITE.location.geo` exporta `latitude: 39.4216` y `longitude: -0.3855`.
- [x] `src/config/legal.ts` exporta `LEGAL` con razón social, titular, dirección, correo y `nif: '[NIF/CIF pendiente de asignación]'`.
**Verification:**
- [x] `npm run build` o comprobación de tipos TypeScript.
**Dependencies:** None
**Files likely touched:**
- `src/config/site.ts`
- `src/config/legal.ts`
**Estimated scope:** Small (2 files)

---

## Task 2: Infraestructura de Indexación (`astro.config.mjs`, `@astrojs/sitemap` y `public/robots.txt`)
**Description:** Configurar `site: 'https://rapidopackvalencia.es'` en `astro.config.mjs`, instalar e integrar `@astrojs/sitemap`, y crear `public/robots.txt` permitiendo todo el rastreo y apuntando al sitemap oficial.
**Acceptance criteria:**
- [x] `astro.config.mjs` contiene `site: 'https://rapidopackvalencia.es'` y la integración `@astrojs/sitemap()`.
- [x] `public/robots.txt` contiene `User-agent: *`, `Allow: /` y `Sitemap: https://rapidopackvalencia.es/sitemap-index.xml`.
**Verification:**
- [x] `npm run build` genera `dist/robots.txt` y `dist/sitemap-index.xml`.
**Dependencies:** Task 1
**Files likely touched:**
- `astro.config.mjs`
- `package.json`
- `public/robots.txt`
**Estimated scope:** Small (3 files)

---

## Task 3: Suite TDD de Pruebas Automatizadas (`tests/seo.test.mjs`) [Fase RED]
**Description:** Crear una suite de pruebas automatizada con el Node.js test runner que verifique los 9 hallazgos de auditoría (robots.txt, sitemap, canónicas, OpenGraph/Twitter, longitud de titles, longitud de descripciones, Schema.org JSON-LD, páginas legales y RGPD en footer y formulario).
**Acceptance criteria:**
- [x] `tests/seo.test.mjs` define pruebas unitarias e integrales para los 9 criterios de la especificación.
- [x] `npm test` ejecuta la suite (entra en fase RED para los requerimientos aún no implementados).
**Verification:**
- [x] `npm test` reporta fallos esperados correspondientes a las fases pendientes.
**Dependencies:** Task 1, Task 2
**Files likely touched:**
- `tests/seo.test.mjs`
**Estimated scope:** Small (1 file)

---

## Checkpoint: Tras Tasks 1-3
- [x] Configuración y dominio centralizados en `site.ts` y `legal.ts`.
- [x] `robots.txt` e integración de sitemap creados.
- [x] Suite TDD definida en estado RED con aserciones rigurosas.

---

## Task 4: Layout Global, Metadatos Canónicos, Redes Sociales y Schema.org JSON-LD (`src/layouts/Layout.astro`)
**Description:** Modificar `src/layouts/Layout.astro` para inyectar la URL canónica autorreferenciada, las metaetiquetas OpenGraph y Twitter Cards, y el script semántico JSON-LD `Store` / `LocalBusiness` con los datos exactos de Alfafar.
**Acceptance criteria:**
- [ ] Inyección de `<link rel="canonical" href={canonicalURL} />`.
- [ ] Metaetiquetas `og:site_name`, `og:title`, `og:description`, `og:url`, `og:type`, `og:locale`, `og:image`.
- [ ] Metaetiquetas `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.
- [ ] `<script type="application/ld+json">` con `@type: ["Store", "LocalBusiness"]`, geolocalización, dirección, horarios de apertura y teléfono.
**Verification:**
- [ ] Tests relevantes de Schema, Canónicas y OpenGraph en `npm test` pasan a verde.
**Dependencies:** Task 1, Task 3
**Files likely touched:**
- `src/layouts/Layout.astro`
**Estimated scope:** Small (1 file)

---

## Task 5: Páginas Legales y Cumplimiento Normativo E-E-A-T / RGPD
**Description:** Crear `src/pages/aviso-legal.astro` y `src/pages/privacidad.astro` siguiendo el diseño tipográfico y de componentes del sitio. Añadir enlaces legales en `Footer.astro` y cláusula informativa con enlace en `ContactForm.astro`.
**Acceptance criteria:**
- [ ] `src/pages/aviso-legal.astro` y `src/pages/privacidad.astro` creadas con diseño coherente con Tailwind v4.
- [ ] `Footer.astro` incluye enlaces visibles a `/aviso-legal` y `/privacidad`.
- [ ] `ContactForm.astro` incluye texto informativo sobre el tratamiento de datos y enlace a la política de privacidad.
**Verification:**
- [ ] Tests de páginas legales y RGPD en `npm test` pasan a verde.
**Dependencies:** Task 1, Task 3, Task 4
**Files likely touched:**
- `src/pages/aviso-legal.astro`
- `src/pages/privacidad.astro`
- `src/components/Footer.astro`
- `src/components/ContactForm.astro`
**Estimated scope:** Medium (4 files)

---

## Task 6: Calibración On-Page SERP de Títulos y Descripciones en las 4 Rutas
**Description:** Calibrar los valores de `title` (entre 45 y 60 caracteres) y `description` (entre 135 y 155 caracteres) en `index.astro`, `paqueteria.astro`, `outlet.astro` y `contacto.astro` para eliminar cualquier truncamiento en las SERPs de Google.
**Acceptance criteria:**
- [ ] `<title>` de cada una de las 4 páginas principales está dentro del rango óptimo de 45–60 caracteres.
- [ ] `<meta name="description">` de cada página está dentro del rango óptimo de 135–155 caracteres.
- [ ] Los términos de alta intención de búsqueda local aparecen al inicio del título.
**Verification:**
- [ ] Test de longitud de títulos y descripciones en `npm test` pasa al 100%.
**Dependencies:** Task 3, Task 4
**Files likely touched:**
- `src/pages/index.astro`
- `src/pages/paqueteria.astro`
- `src/pages/outlet.astro`
- `src/pages/contacto.astro`
**Estimated scope:** Medium (4 files)

---

## Task 7: Verificación TDD Green, Build Estático y Re-Auditoría SEO
**Description:** Ejecutar la suite completa de pruebas, realizar la compilación estática de producción `npm run build`, verificar los artefactos generados en `dist/`, comprobar el comportamiento en navegador y actualizar el informe de auditoría confirmando el SEO Health Index >95/100.
**Acceptance criteria:**
- [ ] `npm test` pasa al 100% (todas las pruebas verdes).
- [ ] `npm run build` compila con 0 errores TypeScript y genera `dist/` completo con `robots.txt`, sitemaps y HTMLs con JSON-LD.
- [ ] Verificación de navegador sin advertencias ni errores en consola.
- [ ] Informe de SEO actualizado con la puntuación superando los 95 puntos.
**Verification:**
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `node scripts/verify-browser.mjs`
**Dependencies:** Tasks 1-6
**Files likely touched:**
- `tasks/todo.md`
- `seo-audit-report.md`
**Estimated scope:** Small (2 files)
