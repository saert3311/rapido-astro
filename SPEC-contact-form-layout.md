# Spec: Optimización Ergonómica del Formulario de Contacto y Balance Espacial (`/contacto`)

## 1. Objective

Resolver de forma integral los problemas de balance espacial y espacios muertos a la derecha identificados en la sección de formulario de [contacto.astro](file:///d:/Proyectos/rapido-astro/src/pages/contacto.astro) y [ContactForm.astro](file:///d:/Proyectos/rapido-astro/src/components/ContactForm.astro) bajo los estándares de `@design-taste-frontend` y `@frontend-ui-engineering`:

1. **Eliminar el vacío vertical de 315 px en el lateral:** Reducir la disparidad de altura entre el formulario (`1003 px`) y la columna lateral (`688 px`), integrando anclaje adhesivo (`lg:sticky lg:top-28`) para acompañar al usuario durante el scroll y rellenar el lateral con información contextual verificada de la tienda.
2. **Armonizar la fila de Cloudflare Turnstile:** Envolver el widget de ancho fijo (300 px) en un contenedor estructurado con una insignia de confianza y seguridad a la derecha (`Protección Cloudflare Turnstile · Envío seguro`), eliminando los 266 px de vacío asimétrico.
3. **Optimizar la densidad de campos (Cuadrícula 2×2):** Reorganizar los campos superiores en dos columnas simétricas: Fila 1 (`Nombre completo` + `Motivo de la consulta`), Fila 2 (`Teléfono de contacto` + `Correo electrónico`), y Fila 3 (`Mensaje` a ancho completo). Esto elimina el carril estirado de 622 px en inputs de una línea y reduce la altura del formulario a ~915 px.
4. **Sustituir activos externos no confiables:** Reemplazar la URL remota de Google User Content en la tarjeta de tienda por la fotografía oficial local en formato WebP (`/fachada-rapido-pack-valencia.webp`) e incorporar la insignia de conexión inmediata a la Estación Alfafar-Benetússer (1 min a pie).

---

## 2. Tech Stack

- **Framework:** Astro 7 (`^7.4.4`), componentes estáticos `.astro`.
- **Estilos:** Tailwind CSS v4 (`^4.3.3`) con tokens de diseño en `src/styles/global.css`.
- **Tipografía:** Tríada oficial del proyecto (`font-display: Outfit`, `font-sans: Plus Jakarta Sans`, `font-mono: JetBrains Mono`).
- **Antispam & API:** Cloudflare Turnstile (`cf-turnstile`) y Worker endpoint `/api/contact`.
- **Testing:** Node.js native test runner (`node --test tests/*.test.mjs`).

---

## 3. Commands

- **Tests automatizados:** `npm test`
- **Build de producción:** `npm run build`
- **Servidor local (background):** `npx astro dev --background`
- **Verificación en navegador Headless:** `node scripts/verify-carrier-browser.mjs`

---

## 4. Project Structure & Affected Files

```text
src/
├── components/
│   └── ContactForm.astro      # Cuadrícula 2x2 para inputs, contenedor de seguridad para Turnstile
├── pages/
│   └── contacto.astro         # lg:sticky en aside, tarjeta de tienda con WebP local y badge de estación
tests/
└── contact-api.test.mjs       # Verificación de selectores y persistencia de tests de formulario
```

---

## 5. Code Style & Layout Patterns

### A. Cuadrícula 2×2 en `ContactForm.astro`
```astro
<!-- Fila 1: Nombre y Motivo -->
<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
  <div class="field flex flex-col gap-1.5">
    <label class="font-label-button text-sm text-on-surface" for="contact-name">
      Nombre completo <span class="text-primary" aria-hidden="true">*</span>
    </label>
    <!-- input name -->
  </div>
  <div class="field flex flex-col gap-1.5">
    <label class="font-label-button text-sm text-on-surface" for="contact-subject">
      Motivo de la consulta <span class="text-primary" aria-hidden="true">*</span>
    </label>
    <!-- select subject -->
  </div>
</div>

<!-- Fila 2: Teléfono y Correo -->
<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
  <!-- phone and email fields -->
</div>
```

### B. Barra de Seguridad Integrada para Turnstile
```astro
<div class="field flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-alt/40 border border-border-subtle/70">
  <div id="turnstile-widget" class="cf-turnstile min-h-[65px]" data-sitekey={turnstileSiteKey}></div>
  <div class="flex items-center gap-2 text-text-muted font-mono text-xs pr-2 select-none">
    <span class="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">verified_user</span>
    <span>Protección Cloudflare Turnstile · Envío seguro</span>
  </div>
</div>
```

### C. Columna Lateral Adhesiva con Activo Local en `contacto.astro`
```astro
<aside class="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28">
  <!-- Card 1: Servicios y WhatsApp -->
  <!-- Card 2: Tienda física con WebP local y Estación Cercanías -->
</aside>
```

---

## 6. Testing Strategy

1. **Preservación Funcional de Formulario (`tests/contact-api.test.mjs`):**
   - Asegurar que los IDs de inputs (`#contact-name`, `#contact-phone`, `#contact-email`, `#contact-subject`, `#contact-message`, `#privacy-check`, `#turnstile-widget`) sigan existiendo intactos para que los tests unitarios y de integración de API sigan pasando en verde.
2. **Validación de Accesibilidad y Semántica:**
   - Conservar atributos `aria-describedby`, `aria-errormessage`, y roles `alert` y `status`.
   - Garantizar orden secuencial de foco accesible con Tabulación (Nombre → Motivo → Teléfono → Correo → Mensaje → Checkbox → Turnstile → Enviar).
3. **Verificación Visual con Headless Chrome:**
   - Ejecución a resoluciones `1440×900`, `1024×800` y `390×844`.
   - Verificar 0 desbordamientos horizontales, 0 advertencias o errores en la consola.
   - Confirmar que la diferencia de altura visual no genera huecos muertos.

---

## 7. Boundaries

- **Always:**
  - Ejecutar `npm test` y `npm run build` antes de finalizar.
  - Utilizar clases de Tailwind CSS v4 existentes y tokens `@theme`.
  - Usar imágenes locales optimizadas de `public/` (nunca URLs externas no controladas).
  - Mantener la regla de cero menciones a aparcamiento y resaltar la Estación Alfafar-Benetússer.
- **Ask first:**
  - Cambiar los campos del payload que procesa el endpoint `/api/contact`.
- **Never:**
  - Romper la validación en vivo ni la integración con Cloudflare Turnstile / Mailjet.
  - Añadir frameworks del lado del cliente (React, Vue) o scripts externos no autorizados.

---

## 8. Success Criteria

- [ ] Todos los tests de la suite (`tests/*.test.mjs`) pasan al 100% (65+ tests en verde).
- [ ] `npm run build` compila estáticamente a `./dist/` sin errores de tipado.
- [ ] La cuadrícula de campos superiores en el formulario se adapta a 2 columnas en desktop/tablet (`sm:grid-cols-2`) y 1 columna en móvil (`grid-cols-1`).
- [ ] El widget de Turnstile está balanceado por la insignia de seguridad a su derecha, eliminando el hueco asimétrico.
- [ ] La columna lateral `<aside>` acompaña la lectura con `lg:sticky lg:top-28` y muestra la foto local `/fachada-rapido-pack-valencia.webp`.
- [ ] Consola del navegador con 0 advertencias y 0 errores.

---

## 9. Open Questions & Assumptions

- **Asunción 1:** Agrupar `Nombre` + `Motivo` en la primera fila y `Teléfono` + `Correo` en la segunda es la distribución más natural para el usuario, manteniendo el campo de texto libre `Mensaje` en ancho completo al final.
- **Asunción 2:** Mantener los mismos nombres de campos y atributos para que no haya impacto en el contrato backend del Worker `/api/contact`.
