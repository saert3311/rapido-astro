# Spec: Integración Parametrizada de Google Tag Manager (`SPEC-google-tag-manager`)

## Objective
Integrar de forma robusta, mantenible y optimizada el snippet de **Google Tag Manager (GTM)** en el sitio web de Rápido Pack Valencia (`rapido-astro`). 
El identificador de contenedor (`GTM-PGBXBVXJ`) debe estar **completamente parametrizado** como fuente única de verdad en la configuración del sitio (con soporte para sobrescritura mediante variable de entorno `PUBLIC_GTM_ID`), siguiendo las mejores prácticas oficiales del framework **Astro**.

---

## Tech Stack & Marco Recomendado por Astro
- **Framework:** Astro 7 (`^7.4.4`), static output (`./dist/`), TypeScript estricto.
- **Directivas de Astro para scripts de terceros (`is:inline`):**
  - Conforme a la documentación oficial de Astro sobre [carga de scripts externos y analítica](https://docs.astro.build/en/guides/client-side-scripts/#load-external-scripts), los scripts de CDN externos y snippets de inicialización global deben usar la directiva `is:inline`.
  - **¿Por qué `is:inline`?** Astro compila los scripts normales como módulos (`type="module"`), aislándolos en un ámbito local y retrasando su ejecución. `is:inline` asegura que el script de GTM no sea empaquetado por Vite, conserve el atributo `async`, y defina `window.dataLayer` y la función `gtag()` directamente en el ámbito global `window` desde el primer milisegundo de ejecución en el `<head>`.
- **Optimización de red y Web Vitals:**
  - Inclusión de directivas de precarga de conexión (`dns-prefetch` y `preconnect` a `https://www.googletagmanager.com`) en `<head>` para acelerar el handshake TLS sin impactar negativamente en el Largest Contentful Paint (LCP) ni en el Interaction to Next Paint (INP).

---

## Commands
- **Ejecutar tests TDD:** `node --test tests/gtm.test.mjs`
- **Suite completa de tests:** `npm test`
- **Compilación de producción y verificación de tipos:** `npm run build`
- **Previsualización de producción:** `npx astro preview --host 127.0.0.1 --port 4321`
- **Auditoría de consola en navegador real:** `node scripts/verify-browser.mjs`

---

## Project Structure
```text
rapido-astro/
├── src/
│   ├── config/
│   │   └── site.ts                    # Añadir `SITE.analytics.gtmId: 'GTM-PGBXBVXJ'`
│   ├── components/
│   │   └── GoogleTagManager.astro     # Componente encapsulado y reutilizable para GTM
│   └── layouts/
│       └── Layout.astro               # Invocación de <GoogleTagManager /> dentro del <head>
└── tests/
    └── gtm.test.mjs                   # Suite TDD para verificar parametrización y renderizado
```

---

## Code Style & Implementation Details

### 1. Configuración Centralizada (`src/config/site.ts`)
```typescript
export const SITE = {
  // ...
  analytics: {
    gtmId: 'GTM-PGBXBVXJ',
  },
} as const;
```

### 2. Componente Dedicado (`src/components/GoogleTagManager.astro`)
```astro
---
import { SITE } from '../config/site';

interface Props {
  id?: string;
  forceEnable?: boolean;
}

const { id = import.meta.env.PUBLIC_GTM_ID || SITE.analytics.gtmId, forceEnable = false } = Astro.props;

// Renderizar únicamente en producción (`import.meta.env.PROD`) a menos que se fuerce explícitamente
const shouldRender = Boolean(id) && (import.meta.env.PROD || forceEnable || import.meta.env.PUBLIC_GTM_FORCE === 'true');
---

{shouldRender && (
  <>
    <!-- Google Tag Manager Resource Hints -->
    <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
    <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin />

    <!-- Google Tag Manager Snippet -->
    <script is:inline async src={`https://www.googletagmanager.com/gtm.js?id=${id}`}></script>
    <script is:inline>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    </script>
  </>
)}
```

### 3. Inclusión en Shell Global (`src/layouts/Layout.astro`)
Se inyecta en el `<head>` justo después de los metadatos esenciales y canónicas:
```astro
---
import GoogleTagManager from '../components/GoogleTagManager.astro';
// ...
---
<!DOCTYPE html>
<html class="scroll-smooth" lang="es">
<head>
  <!-- Metadatos esenciales, canónica y OpenGraph... -->
  <GoogleTagManager />
  <!-- ... -->
```

---

## Testing Strategy (TDD)
Seguir el ciclo Red-Green-Refactor creando `tests/gtm.test.mjs`:
1. **Fase RED:**
   - Comprobar que `src/config/site.ts` exporta `SITE.analytics.gtmId === 'GTM-PGBXBVXJ'`.
   - Comprobar que existe `src/components/GoogleTagManager.astro`.
   - Comprobar que `GoogleTagManager.astro` implementa `is:inline` en ambos scripts y utiliza la interpolación del ID.
   - Comprobar que `Layout.astro` incluye el componente `<GoogleTagManager />`.
   - Comprobar que tras `npm run build`, los archivos compilados en `dist/**/*.html` contienen el script con `id=GTM-PGBXBVXJ` y la definición de `dataLayer`.
2. **Fase GREEN:**
   - Añadir la propiedad en `site.ts`.
   - Crear `GoogleTagManager.astro`.
   - Integrarlo en `Layout.astro`.
3. **Fase REFACTOR & VERIFY:**
   - Ejecutar `npm test` y verificar que las 33 pruebas previas más las nuevas de GTM pasan al 100%.
   - Ejecutar `npm run build` y auditar en navegador con `scripts/verify-browser.mjs`.

---

## Boundaries
- **Always:**
  - Mantener `GTM-PGBXBVXJ` parametrizado en `SITE.analytics.gtmId` con fallback a `import.meta.env.PUBLIC_GTM_ID`.
  - Usar la directiva `is:inline` recomendada por Astro para evitar que Vite transforme el script a módulo estricto.
  - Asegurar 0 errores de compilación TypeScript y 100% de tests verdes.
  - Trabajar en la rama aislada `feature/google-tag-manager-integration`.
- **Ask first:**
  - Incluir el iframe `<noscript>` en el `<body>` si el usuario requiere soporte para visitantes con JavaScript desactivado (normalmente opcional o desaconsejado en SSG puro).
  - Añadir eventos personalizados adicionales o configuraciones avanzadas de Consent Mode en este paso.
- **Never:**
  - Hardcodear el ID `GTM-PGBXBVXJ` directamente dentro de plantillas HTML sin variable o constante.
  - Omitir `is:inline`, lo que rompería la inicialización global de `dataLayer` y `gtag`.

---

## Success Criteria
1. El identificador de GTM se configura en `src/config/site.ts` y puede modificarse en un solo lugar o vía variable de entorno.
2. El script de GTM se carga de forma asíncrona en el `<head>` de todas las páginas de `dist/`.
3. `window.dataLayer` y la función `gtag` se inicializan correctamente en el cliente.
4. Las pruebas automáticas pasan al 100% (`npm test`).
5. La compilación estática `npm run build` genera todos los HTMLs con el snippet sin errores.

---

## Resolved Clarifications
1. **Fallback `<noscript>` en `<body>`:**  
   **Resuelto:** Se omite el bloque `<noscript>`. Mantenemos estrictamente lo indicado por el usuario: únicamente los `<script>` en el `<head>`, preservando la ligereza del DOM y evitando iframes innecesarios.
2. **Entornos de Ejecución (Gating):**  
   **Resuelto:** Solo se renderiza en producción (`import.meta.env.PROD === true`), a menos que se configure explícitamente la propiedad `forceEnable={true}` o la variable de entorno `PUBLIC_GTM_FORCE='true'`. De esta manera, el entorno de desarrollo local (`localhost`) no contamina las métricas de analítica.
