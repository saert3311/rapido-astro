# Tasks: Transición a "Tienda Online Próximamente" (`SPEC-online-store-coming-soon`)

## Task 1: Suite TDD de Pruebas Automatizadas (`tests/online-store-copy.test.mjs`) [Fase RED]
**Description:** Crear un archivo de prueba automatizado con Node.js test runner que verifique la ausencia de "no disponemos de tienda online", "100% presencial", y "No se realizan operaciones de venta electrónica" en `src/`, la presencia del anuncio "tienda online próximamente" en `index.astro`, `outlet.astro` y `aviso-legal.astro`, la presencia del chip en el Hero de `index.astro`, y la no existencia de archivos no solicitados de catálogo/vitrina.
**Acceptance criteria:**
- [ ] `tests/online-store-copy.test.mjs` creado con las aserciones de la spec.
- [ ] `node --test tests/online-store-copy.test.mjs` falla inicialmente señalando los textos a cambiar (Fase RED).
**Verification:**
- [ ] `node --test tests/online-store-copy.test.mjs`
**Dependencies:** None
**Files likely touched:**
- `tests/online-store-copy.test.mjs`
**Estimated scope:** Small (1 file)

---

## Task 2: Actualización de Reglas de Negocio en Documentación (`AGENTS.md`)
**Description:** Modificar el Gotcha nº 7 (Business Domain Boundaries) en `AGENTS.md` para reflejar que la tienda online oficial está en desarrollo y puede anunciarse como "próximamente", manteniendo las fronteras de no añadir carrito ni prometer reservas telefónicas.
**Acceptance criteria:**
- [ ] `AGENTS.md` actualizado sin afirmar que el negocio vende exclusivamente "100% in-person forever" sin e-commerce.
**Verification:**
- [ ] Inspección visual de `AGENTS.md`.
**Dependencies:** Task 1
**Files likely touched:**
- `AGENTS.md`
**Estimated scope:** Small (1 file)

---

## Task 3: Actualización de Portada (`src/pages/index.astro`)
**Description:** Añadir el chip informativo en el Hero de `index.astro` ("Tienda online próximamente · Hoy en Alfafar") y actualizar la respuesta de la FAQ sobre compra online indicando que la tienda online está en desarrollo y llegará pronto.
**Acceptance criteria:**
- [ ] Hero de `index.astro` incluye el chip visual estilizado con tokens del proyecto.
- [ ] FAQ de `index.astro` actualizada indicando que la tienda online está en desarrollo.
- [ ] Cero menciones a "no disponemos de tienda online" ni "100% presencial".
**Verification:**
- [ ] `node --test tests/online-store-copy.test.mjs`
**Dependencies:** Task 1
**Files likely touched:**
- `src/pages/index.astro`
**Estimated scope:** Small (1 file)

---

## Task 4: Actualización de Outlet (`src/pages/outlet.astro`)
**Description:** Actualizar la FAQ sobre el listado online en `outlet.astro` ("Aún no. Hoy las unidades se venden en tienda... Nuestra tienda online está en camino y llegará pronto") y cambiar el badge de la imagen de chollos de "Venta 100% presencial" a "Hoy en tienda · Online próximamente".
**Acceptance criteria:**
- [ ] FAQ de `outlet.astro` actualizada.
- [ ] Badge L256 actualizado a "Hoy en tienda · Online próximamente".
- [ ] Cero menciones a "100% presencial".
**Verification:**
- [ ] `node --test tests/online-store-copy.test.mjs`
**Dependencies:** Task 1
**Files likely touched:**
- `src/pages/outlet.astro`
**Estimated scope:** Small (1 file)

---

## Task 5: Actualización de Aviso Legal (`src/pages/aviso-legal.astro`)
**Description:** Modificar la sección 3 de `aviso-legal.astro` (renombrar a "Actividad Comercial y Tienda Online en Desarrollo"), suprimiendo la cláusula "No se realizan operaciones de venta electrónica" e indicando que el comercio electrónico se encuentra en fase de desarrollo.
**Acceptance criteria:**
- [ ] Sección 3 de `aviso-legal.astro` actualizada sin "No se realizan operaciones de venta electrónica".
**Verification:**
- [ ] `node --test tests/online-store-copy.test.mjs`
**Dependencies:** Task 1
**Files likely touched:**
- `src/pages/aviso-legal.astro`
**Estimated scope:** Small (1 file)

---

## Task 6: Verificación TDD Green, Build Estático y Verificación en Navegador
**Description:** Ejecutar la suite completa de pruebas automáticas, compilar el sitio con `npm run build` verificando 0 errores, y comprobar las rutas afectadas en navegador real.
**Acceptance criteria:**
- [ ] `node --test tests/online-store-copy.test.mjs` pasa al 100% (Fase GREEN).
- [ ] `npm test` pasa íntegramente con todas las suites (incluidas SEO y transit).
- [ ] `npm run build` compila con 0 errores TypeScript.
- [ ] `node scripts/verify-browser.mjs` verifica 0 errores en consola.
**Verification:**
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `node scripts/verify-browser.mjs`
**Dependencies:** Tasks 1-5
**Files likely touched:**
- `tasks/todo.md`
**Estimated scope:** Small (1 file)
