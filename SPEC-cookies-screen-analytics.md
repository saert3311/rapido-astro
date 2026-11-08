# Spec: Pantalla de Consentimiento de Cookies y Cláusulas Legales de Google Analytics (`SPEC-cookies-screen-analytics`)

## Assumptions
1. **Marco Normativo (AEPD & RGPD):** El sistema debe cumplir con la Guía sobre el uso de cookies de la AEPD (Agencia Española de Protección de Datos) y el RGPD europeo. Esto implica:
   - No instalar cookies analíticas antes de obtener el consentimiento explícito del usuario.
   - Ofrecer la opción de rechazar las cookies no esenciales con la misma facilidad y prominencia visual que aceptarlas (mismo nivel de accesibilidad y sin patrones oscuros).
   - Permitir al usuario revocar o cambiar sus preferencias en cualquier momento mediante un acceso permanente en el pie de página ("Configurar cookies").
2. **Integración con Google Analytics / Google Tag Manager:** Se implementará **Google Consent Mode v2**. Por defecto, `analytics_storage`, `ad_storage`, `ad_user_data` y `ad_personalization` se inicializan en `'denied'`. Al aceptar, se actualiza `analytics_storage` a `'granted'`, permitiendo el envío de telemetría a GTM/GA sin vulnerar la privacidad previa.
3. **Persistencia del Consentimiento:** La elección del usuario se almacenará localmente en el navegador (`localStorage.getItem('rpv_cookie_consent')`) con marca temporal y versión de política, evitando mostrar el banner intrusivamente en visitas recurrentes una vez tomada la decisión.
4. **Diseño y Accesibilidad (`/frontend-ui-engineering`):** El aviso de cookies se presentará como un banner flotante fijo inferior accesible (`role="dialog"` o `role="region"`, `aria-labelledby`, `aria-describedby`), diseñado bajo la estética oficial de Rápido Pack Valencia (fondos oscuros o neutros slate, acento esmeralda `#059652`, tipografías `Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`). No bloqueará ni colisionará con la barra móvil persistente de navegación (`.fixed.bottom-3`).
5. **Alcance Legal:** Se creará una página dedicada de **Política de Cookies** (`/cookies`) y se actualizarán `src/pages/privacidad.astro`, `src/config/legal.ts` y `src/components/Footer.astro` con mención expresa del tratamiento de datos mediante Google Analytics.

---

## 1. Objective
1. **Pantalla de Consentimiento de Cookies:** Desarrollar un componente interactivo, ligero y sin dependencias npm externas (`src/components/CookieBanner.astro`), que informe con claridad sobre el uso de cookies propias y de terceros, permitiendo al usuario:
   - Aceptar todas las cookies.
   - Rechazar las cookies analíticas no necesarias.
   - Configurar o revisar el detalle por categorías (Técnicas vs Analíticas).
2. **Integración de Consent Mode v2:** Conectar el consentimiento con `src/components/GoogleTagManager.astro` para respetar la decisión en tiempo real.
3. **Acceso Permanente a la Configuración:** Incluir un mecanismo de reapertura del panel de preferencias desde el footer (`Footer.astro`).
4. **Página Dedicada de Política de Cookies (`/cookies`):** Publicar el documento legal detallando la tabla de cookies técnicas (Turnstile, consentimiento) y analíticas (`_ga`, `_ga_*` de Google Analytics).
5. **Actualización de la Política de Privacidad (`/privacidad`):** Incluir la sección sobre métricas web de Google Analytics, identificando a Google Ireland Limited como encargado/tercero, base legal (consentimiento) y transferencias internacionales.

---

## 2. Tech Stack
- **Framework:** Astro 7 (`^7.4.4`), static output (`./dist/`), TypeScript estricto.
- **Estilos:** Tailwind CSS v4 (`^4.3.3`) vía `@tailwindcss/vite`, tokens de diseño en `src/styles/global.css`.
- **Interacción:** Vanilla JS modular nativo (`<script is:inline>`), Google Consent Mode v2 (`window.dataLayer`, `gtag('consent', ...)`).
- **Testing:** Node.js 22 built-in test runner (`node:test`, `node:assert/strict`).

---

## 3. Commands
- **Ejecutar tests unitarios y de cumplimiento:** `node --test tests/cookies.test.mjs`
- **Suite completa de tests del proyecto:** `npm test`
- **Compilación estática de producción:** `npm run build`
- **Previsualización de producción en local:** `npx astro preview --host 127.0.0.1 --port 4321`
- **Auditoría visual y de consola en navegador real:** `node scripts/verify-browser.mjs`

---

## 4. Project Structure
```text
rapido-astro/
├── src/
│   ├── components/
│   │   ├── CookieBanner.astro         # Componente flotante de consentimiento y preferencias
│   │   ├── GoogleTagManager.astro     # Actualizado con inicialización de Google Consent Mode v2
│   │   └── Footer.astro               # Añadido enlace a /cookies y botón "Configurar cookies"
│   ├── config/
│   │   └── legal.ts                   # Añadida configuración y metadatos de Google Analytics
│   ├── layouts/
│   │   └── Layout.astro               # Montaje global de <CookieBanner />
│   └── pages/
│       ├── cookies.astro              # NUEVA: Página informativa de Política de Cookies
│       └── privacidad.astro           # Actualizada con cláusula explícita de Google Analytics
├── tests/
│   └── cookies.test.mjs               # Suite TDD para verificar banner, consentimiento y textos legales
└── SPEC-cookies-screen-analytics.md   # Esta especificación
```

---

## 5. Code Style & Technical Contracts

### 5.1 Google Consent Mode v2 Contract (`GoogleTagManager.astro`)
```html
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}

  // 1. Obtener consentimiento almacenado previamente (si existe)
  var savedConsent = null;
  try {
    savedConsent = JSON.parse(localStorage.getItem('rpv_cookie_consent') || 'null');
  } catch(e) {}

  var analyticsGranted = savedConsent && savedConsent.analytics === true;

  // 2. Definir estado inicial por defecto (denegado si no hay consentimiento previo)
  gtag('consent', 'default', {
    'analytics_storage': analyticsGranted ? 'granted' : 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'wait_for_update': 500
  });

  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
</script>
```

### 5.2 Estructura del Objeto de Consentimiento en `localStorage`
```typescript
export interface CookieConsentState {
  version: '2026.1';
  timestamp: string; // ISO 8601
  necessary: true;   // Siempre true (técnicas obligatorias)
  analytics: boolean; // true si aceptó analíticas, false si rechazó
}
```

### 5.3 Componente `CookieBanner.astro`
- **Posición:** Fijo inferior (`fixed bottom-0 inset-x-0` o `sm:bottom-4 sm:right-4 sm:max-w-lg z-50`), adaptado con margen inferior en móvil (`pb-20 sm:pb-0`) para no solapar la barra fija de navegación (`.md:hidden.fixed.bottom-3`).
- **Controles principales:**
  - Botón primario: `"Aceptar todas"` (habilita analíticas, guarda consentimiento, actualiza Consent Mode a `'granted'`).
  - Botón secundario: `"Rechazar no esenciales"` (mantiene analíticas denegadas, guarda consentimiento, oculta banner).
  - Enlace terciario: `"Configurar"` (abre panel expandible con toggles accesibles).
  - Enlace legal: `"Más información en nuestra Política de Cookies"`.
- **Event Bus en navegador:** Emisión de evento personalizado `window.dispatchEvent(new CustomEvent('rpv:open-cookie-settings'))` para reabrir el banner desde el footer.

---

## 6. Testing Strategy
1. **Suite TDD (`tests/cookies.test.mjs`):**
   - Comprobación de que `src/components/CookieBanner.astro` existe y contiene los botones obligatorios (Aceptar, Rechazar, Configurar o enlace a Política).
   - Comprobación de que `src/pages/cookies.astro` existe, compila y contiene la tabla detallada de cookies (técnicas y Google Analytics).
   - Comprobación de que `src/pages/privacidad.astro` incluye la sección y términos explícitos de Google Analytics (`Google Ireland`, `analítica`, `consentimiento`).
   - Comprobación de que `Footer.astro` incluye el enlace a `/cookies` y el disparador de configuración.
   - Comprobación de que `Layout.astro` incluye `<CookieBanner />`.
   - Comprobación de que `GoogleTagManager.astro` inicializa `gtag('consent', 'default', ...)`.
2. **Suite Completa y Build:**
   - Ejecutar `npm test` garantizando 0 fallos.
   - Ejecutar `npm run build` asegurando que `/cookies/index.html` se genere limpiamente en `./dist/`.
   - Ejecutar `scripts/verify-browser.mjs` bajo preview de producción para validar 0 errores de consola y ausencia de solapamiento visual en 1440px y 390px.

---

## 7. Boundaries
- **Always:**
  - Iniciar Google Consent Mode con `analytics_storage: 'denied'` por defecto a menos que exista consentimiento previo explícito.
  - Diseñar el botón de "Rechazar" con visibilidad y accesibilidad equitativa al botón de "Aceptar" (sin patrones oscuros ni tipografías ocultas).
  - Prever la separación de z-index y espaciado inferior en móvil para convivir armónicamente con la barra fija de "Cómo llegar" de Alfafar.
  - Añadir commits atómicos en la rama `feature/cookie-consent-and-analytics-legal`.
- **Ask first:**
  - Instalar plataformas CMP externas de pago (tipo Cookiebot, OneTrust o Axeptio); el enfoque ligero nativo cumple la normativa sin dependencias ni costes.
- **Never:**
  - Cargar cookies de rastreo antes de que el usuario haga clic en Aceptar.
  - Eliminar los enlaces obligatorios del footer a Aviso Legal y Privacidad.

---

## 8. Success Criteria
- [ ] La rama `feature/cookie-consent-and-analytics-legal` contiene la especificación, implementación y pruebas.
- [ ] El banner de cookies se muestra a los nuevos visitantes y recuerda su elección en visitas futuras.
- [ ] El banner permite tanto aceptar como rechazar cookies analíticas de manera inmediata y accesible.
- [ ] El footer contiene enlace a la Política de Cookies y opción para modificar la configuración en cualquier momento.
- [ ] Existe la página `/cookies` con la descripción completa de cookies técnicas y de Google Analytics.
- [ ] La página `/privacidad` menciona expresamente el tratamiento de datos para analítica mediante Google Analytics y sus garantías legales.
- [ ] `GoogleTagManager.astro` respeta Google Consent Mode v2.
- [ ] La suite de tests pasa al 100% y `npm run build` compila con 0 errores.

---

## 9. Open Questions & User Approvals
1. **Estilo visual y ubicación del banner:** **[APROBADO]** Tarjeta compacta flotante en la esquina inferior derecha en pantallas de escritorio (`sm:bottom-4 sm:right-4 sm:max-w-md`), con elevación `diffusion-card`, bordes sutiles y modo tarjeta fija inferior en móvil respetando el margen de seguridad de la barra persistente (`pb-20 sm:pb-0`).
2. **Modo de configuración de preferencias:** **[APROBADO]** Desplegable interactivo directo en el propio banner (acordeón expandible) con toggles semánticos y accesibles:
   - *Cookies Técnicas y de Seguridad:* Obligatorias y marcadas siempre como activas (gestión de sesión, seguridad Turnstile, almacenamiento de consentimiento).
   - *Cookies Analíticas (Google Analytics / GTM):* Desactivadas por defecto, con switch personalizable por el usuario.
   El usuario puede guardar sus preferencias elegidas o pulsar en "Aceptar todas" / "Rechazar no esenciales" al instante.
