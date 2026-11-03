# Tasks: Reestructuración Web Rápido Pack Valencia

- [x] Task 1: Navigation Shell Update (`Layout.astro`, `Header.astro`, `Footer.astro`)
  - Acceptance: `currentPage` incluye `'paqueteria'`; el Header muestra `Inicio`, `Paquetería`, `Outlet`, `Contacto` con estado activo; Footer incluye `/paqueteria`.
  - Verify: `npm run build` compila sin errores de tipos.
  - Files: `src/layouts/Layout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`

- [x] Task 2: Create Dedicated Parcel Page (`src/pages/paqueteria.astro`)
  - Acceptance: Página dedicada con hero logístico, directorio de 5 operadores oficiales (Amazon Hub, InPost, GLS, SEUR, CTT), guía operativa de 3 pasos (recogidas, devoluciones sin etiqueta, parking en puerta) y 4 FAQs logísticas exclusivas.
  - Verify: `npm run build` compila y genera `/paqueteria/index.html`.
  - Files: `src/pages/paqueteria.astro`

- [x] Task 3: Refactor Home Page (`src/pages/index.astro`)
  - Acceptance: Home se transforma en portal ejecutivo dual (Paquetería + Outlet) con 2 tarjetas Gateway principales, strip de confianza en local, tarjeta compacta de visita/horario y 3 FAQs conceptuales. Se elimina el bento de categorías duplicado y el iframe de mapa pesado.
  - Verify: `npm run build` compila y el contenido no repite el bento de `outlet.astro`.
  - Files: `src/pages/index.astro`

- [x] Task 4: Refactor Outlet Page (`src/pages/outlet.astro`)
  - Acceptance: Outlet se enfoca exclusivamente en el banco de pruebas con enchufe, rotación semanal de lotes y showcase de categorías. Se elimina el `StoreLocator` pesado sustituyéndolo por tarjeta compacta de visita y FAQs exclusivas de segunda mano/outlet.
  - Verify: `npm run build` compila sin errores.
  - Files: `src/pages/outlet.astro`

- [x] Task 5: Final Audit & Build Verification
  - Acceptance: Verificar `src/pages/contacto.astro` (preservando `StoreLocator` completo), comprobar ausencia de errores en consola o build, y validar que no haya contenidos ni FAQs duplicados entre las 4 páginas.
  - Verify: `npm run build` exitoso y revisión de diffs.
  - Files: `src/pages/contacto.astro`, `tasks/todo.md`, `AGENTS.md`
