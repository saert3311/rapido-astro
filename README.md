# Rápido Pack Valencia (`rapido-astro`)

> Web oficial, escaparate de outlet y localizador del hub físico de paquetería multicarrier de **Rápido Pack Valencia** en Alfafar, Valencia.

[![Framework: Astro 7](https://img.shields.io/badge/Astro-7.4.4-BC52EE?logo=astro&logoColor=white)](https://astro.build/)
[![Styling: Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3.3-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Runtime: Node.js 22+](https://img.shields.io/badge/Node.js-%3E%3D22.23.4-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Deployment: Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-Static_Assets-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Tests: Node Test Runner](https://img.shields.io/badge/Tests-65%2B%20Passing-success)](https://nodejs.org/api/test.html)

---

## 📌 Visión del Proyecto

**Rápido Pack Valencia** opera bajo un modelo híbrido físico en **Alfafar (Valencia)** (`Carrer del Comte Ronrée, 8`):

1. **Hub Oficial de Paquetería Multicarrier:** Punto de entrega y recogida oficial para **INPOST** (Punto Pack), **GLS** (ParcelShop), **SEUR** (Pickup) y **KANGURO** (Punto de conveniencia inteligente). Horario continuo L–V `09:30 – 20:00` y sábados `10:00 – 15:00`.
2. **Tienda Outlet y Segunda Mano:** Oportunidades de liquidación de primeras marcas y artículos reacondicionados/segunda mano con hasta un **-70% PVP**, reposición continua semanal y mesas de prueba con toma de corriente en tienda antes de comprar.
3. **Conexión Inmediata con Transporte Público:** Ubicado a 100 m (1 min a pie) de la **Estación Alfafar-Benetússer** (Cercanías C-1 / C-2, a 5 minutos directos desde Valencia Nord y paradas de MetroBus).

> [!NOTE]
> La venta presencial se realiza en la tienda de Alfafar. La tienda online se encuentra **en desarrollo activo** (anunciada como *"próximamente"* en la plataforma).

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Framework Web** | **Astro 7** (`^7.4.4`) | Salida estática pre-renderizada (`./dist/`), TypeScript en modo estricto (`astro/tsconfigs/strict`). |
| **Estilos** | **Tailwind CSS v4** (`^4.3.3`) | Integrado vía `@tailwindcss/vite` en `astro.config.mjs`. Todos los tokens de diseño residen en `@theme` en `src/styles/global.css`. |
| **Interoperabilidad UI** | **HTML5 & CSS Moderno** | **0 frameworks cliente pesados** (sin React, Vue o Svelte en bundle). Acordeones nativos `<details name="...">`, validación `:user-invalid`, y scripts ligeros `is:inline`. |
| **Backend Edge** | **Cloudflare Workers** | Despliegue estático con Cloudflare Assets (`wrangler.json`) y Worker `src/worker.ts` para endpoint `/api/contact`. |
| **Anti-spam & Correo** | **Turnstile + Mailjet** | Verificación de tokens de Cloudflare Turnstile y despacho de correos transaccionales + suscripción a lista de contactos con Mailjet API v3.1 / v3. |
| **Analítica & Privacidad**| **GTM + Consent Mode v2** | Google Tag Manager con Consent Mode v2 predeterminado, banner de cookies accesible y páginas de RGPD. |
| **Testing & QA** | **Node.js Test Runner** | 16 suites y más de 65 tests automatizados nativos (`node --test tests/*.test.mjs`). Sin dependencias externas de testing. |

---

## 📁 Estructura del Repositorio

```text
rapido-astro/
├── astro.config.mjs               # Configuración Vite, @tailwindcss/vite y plugin devContactApiPlugin
├── wrangler.json                  # Cloudflare worker entrypoint, assets binding, vars y previews
├── package.json                   # Dependencias, scripts y versión de Node.js
├── tsconfig.json                  # Configuración TypeScript estricta
├── public/                        # Activos públicos estáticos
│   ├── logo-rapido-pack-valencia.png # Emblema oficial de la marca
│   ├── robots.txt                 # Directivas de rastreo e indexación (sitemap canónico)
│   ├── _headers                   # Cabeceras de seguridad HTTP y caché para Cloudflare
│   └── *.webp                     # Fotografías optimizadas de fachada y expositores
├── src/
│   ├── worker.ts                  # Entrypoint del Cloudflare Worker (/api/contact + static assets)
│   ├── styles/
│   │   └── global.css             # Importación de Tailwind, variables @theme y utilidades
│   ├── config/
│   │   ├── site.ts                # Fuente de verdad: datos de contacto, horario, operadoras y estación
│   │   └── legal.ts               # Registro legal, aviso legal, privacidad y cookies
│   ├── lib/
│   │   ├── contact-handler.ts     # Validador de formulario, verificación Turnstile y Mailjet
│   │   ├── mailjet.ts             # Cliente HTTP para Mailjet API v3.1 transaccional y v3 contactos
│   │   └── turnstile.ts           # Cliente de verificación de Cloudflare Turnstile
│   ├── layouts/
│   │   └── Layout.astro           # Shell HTML, SEO meta, Schema.org LocalBusiness, GTM y CookieBanner
│   ├── pages/
│   │   ├── index.astro            # Inicio: hero 7/5, tarjetas gateway, ledger de ventajas
│   │   ├── paqueteria.astro       # Hub de paquetería: 4 operadores oficiales, guía y FAQs
│   │   ├── outlet.astro           # Outlet y 2ª mano: banco de pruebas, bento grid de categorías
│   │   ├── contacto.astro         # Contacto: formulario protegido por Turnstile, canales y mapa
│   │   ├── aviso-legal.astro      # Aviso legal e información societaria RGPD
│   │   ├── privacidad.astro       # Política de privacidad con tratamiento Mailjet y GA4
│   │   └── cookies.astro          # Política de cookies detallada y panel de preferencias
│   └── components/
│       ├── Header.astro           # Barra de navegación adhesiva con estado en vivo (Europe/Madrid)
│       ├── Footer.astro           # Pie de página con espacio de seguridad para sticky CTA móvil
│       ├── CarrierLogo.astro      # Logotipos vectoriales puros (InPost, GLS, SEUR, Kanguro)
│       ├── StoreLocator.astro     # Horario, mapa interactivo y enlaces de transporte
│       ├── FaqAccordion.astro     # Acordeón exclusivo nativo (<details name="...">)
│       ├── ContactForm.astro      # Formulario accesible con validación nativa y Turnstile
│       ├── CookieBanner.astro     # Banner de consentimiento conforme a Consent Mode v2
│       └── GoogleTagManager.astro # Script GTM con defaults de privacidad
├── tests/                         # Suites de testing automatizado (TDD nativo)
│   ├── carrier-logos.test.mjs
│   ├── carriers.test.mjs
│   ├── contact-api.test.mjs
│   ├── cookies.test.mjs
│   ├── gtm.test.mjs
│   ├── header.test.mjs
│   ├── logo-and-mobile.test.mjs
│   ├── online-store-copy.test.mjs
│   ├── seo.test.mjs
│   └── transit-station.test.mjs
└── scripts/                       # Scripts de verificación en Chrome Headless
    ├── verify-browser.mjs
    └── verify-carrier-browser.mjs
```

---

## 🚀 Comandos de Desarrollo y Producción

### 1. Instalación de dependencias

```sh
npm install
```

### 2. Servidor de Desarrollo

Para ejecutar el servidor en segundo plano:

```sh
# Iniciar servidor en segundo plano (http://localhost:4321)
npx astro dev --background

# Supervisar estado, registros o detenerlo
npx astro dev status
npx astro dev logs
npx astro dev stop
```

O en primer plano de forma estándar:

```sh
npm run dev
```

> [!TIP]
> En entorno local, el plugin `devContactApiPlugin` de `astro.config.mjs` intercepta automáticamente las peticiones `POST /api/contact`, permitiendo probar el envío de formulario y la suscripción de Mailjet sin desplegar a Cloudflare.

### 3. Ejecución de Pruebas (TDD)

El proyecto utiliza el ejecutor de pruebas nativo de Node.js (`node:test` y `node:assert/strict`):

```sh
npm test
```

Ejecuta todas las suites en `tests/*.test.mjs` (más de 65 aserciones cubriendo esquemas SEO, integración de API, cumplimiento RGPD, dimensiones visuales y contratos de marca).

### 4. Compilación de Producción y Type-Check

```sh
npm run build
```

Compila el sitio estático hacia el directorio `./dist/` y genera el índice canónico `sitemap-index.xml`.

### 5. Vista Previa de Producción

```sh
npm run preview
```

### 6. Verificación Visual en Navegador Headless

```sh
node scripts/verify-carrier-browser.mjs
```

Inspecciona la renderización exacta en Chrome (1440×900 y 390×844), calcula el centrado subpíxel de los logotipos vectoriales y certifica que la consola del navegador tenga 0 errores o advertencias.

---

## 🎨 Sistema de Diseño y Convenciones

### Tríada Tipográfica (`src/styles/global.css`)
- **`font-display` (`Outfit`):** Reservada para titulares (`h1`–`h4`), complementada con `text-wrap: balance`.
- **`font-sans` (`Plus Jakarta Sans`):** Tipografía para el cuerpo del texto y botones de acción (`font-label-button`), complementada con `text-wrap: pretty`.
- **`font-mono` (`JetBrains Mono`):** Horarios (`09:30 – 20:00`), teléfonos (`640 39 74 34`), índices de sección (`01 //`, `/01`) e insignias de telemetría.

### Superficies y Paleta
- Fondo de pizarras y superficies neutras (`bg-surface`, `bg-surface-alt`, `bg-surface-dark`).
- Acento esmeralda unificado de marca (`text-primary` `#059652`, `bg-mint-wash` `#ECFDF5`, `text-primary-fixed` `#6EE7B7`).
- Retículas asimétricas 7/5 (`lg:grid-cols-12` con `lg:col-span-7` y `lg:col-span-5`) y ledgers desgranados con bordes finos (`border-t border-b divide-y md:divide-x divide-border-subtle`).
- Tarjetas con efecto de difusión (`.diffusion-card`) y badges de cristal líquido (`.liquid-glass`).

---

## ⚙️ Variables de Entorno y Configuración Cloudflare

Las variables del worker y del frontend se definen en `wrangler.json` y se pueden sobreescribir en `.env` durante el desarrollo:

| Variable | Tipo | Propósito |
| :--- | :--- | :--- |
| `PUBLIC_TURNSTILE_SITE_KEY` | Pública | Site key de Cloudflare Turnstile inyectada en el formulario de contacto. |
| `TURNSTILE_SECRET_KEY` | Secreto | Clave secreta para verificar tokens en `/api/contact`. |
| `MAILJET_API_KEY` | Secreto | Clave pública de la API de Mailjet. |
| `MAILJET_SECRET_KEY` | Secreto | Clave secreta de la API de Mailjet. |
| `MAILJET_CONTACT_LIST_ID` | Variable | ID de la lista de contactos de Mailjet para suscriptores. |
| `NOTIFICATION_EMAIL` | Variable | Email de destino de los mensajes de contacto (`contacto@rapidopackvalencia.es`). |
| `PUBLIC_GTM_ID` | Pública | Identificador del contenedor de Google Tag Manager (`GTM-PGBXBVXJ`). |

---

## 🛡️ Reglas y Límites del Proyecto (Gotchas para Desarrolladores)

1. **Configuración de Tailwind v4:** No crear `tailwind.config.js`, no instalar `@astrojs/tailwind` ni inyectar scripts CDN. Los tokens se extienden exclusivamente en `@theme { ... }` dentro de `src/styles/global.css`.
2. **Especificidad de Material Symbols:** Los iconos `.material-symbols-outlined` declaran `display: inline-block` en su CSS base. Para ocultarlos o alternarlos en menús móviles, usar siempre `!hidden`, `group-open:!hidden` y `group-open:!inline-block`.
3. **Cálculo de Horario en Vivo:** El indicador de tienda abierta/cerrada en [Header.astro](file:///d:/Proyectos/rapido-astro/src/components/Header.astro) debe evaluar siempre la hora en la zona horaria `Europe/Madrid` mediante `Intl.DateTimeFormat`.
4. **Cercanía a Estación vs. Cero Menciones a Parking:** Se destaca la proximidad inmediata a la **Estación Alfafar-Benetússer** (Cercanías C-1/C-2, 100 m / 1 min a pie). **Está terminantemente prohibido afirmar que hay aparcamiento en puerta** (afirmaciones como *"Aparcamiento en puerta"* se comprueban y rechazan activamente en los tests).
5. **Exactamente 4 Operadores Oficiales:** Los únicos operadores autorizados son `INPOST`, `GLS`, `SEUR` y `KANGURO`. No utilizar marcas obsoletas (Amazon, CTT Express).
6. **Sin Enlaces Salientes a Agencias:** En las fichas informativas de [paqueteria.astro](file:///d:/Proyectos/rapido-astro/src/pages/paqueteria.astro), los logotipos y tarjetas de operador no enlazan a las páginas corporativas externas para proteger la retención de usuarios y el SEO local (Opción A).
7. **Límites de E-Commerce:** Venta exclusivamente física en Alfafar; la tienda online está catalogada como *en desarrollo activo* ("próximamente"). Prohibido escribir frases prohibitivas como *"no disponemos de tienda online"*, pero tampoco implementar carritos de compra, reservas o promesas de fechas de lanzamiento.
8. **Contrato de `wrangler.json`:** El pipeline de Cloudflare ejecuta `wrangler preview`; nunca remover `"previews": {}`, `"assets": { "directory": "./dist" }` o `"main": "src/worker.ts"`.
9. **Espaciado en Footer Móvil:** Debido a la barra de acción fija en pantallas móviles (`< 768px`), [Footer.astro](file:///d:/Proyectos/rapido-astro/src/components/Footer.astro) debe conservar siempre la clase `pb-20 md:pb-0` para evitar solapamientos.

---

## 📄 Licencia

© 2026 Rápido Pack Valencia. Todos los derechos reservados.
