# Spec: Integración de Mailjet y Turnstile en el Formulario de Contacto (`SPEC-mailjet-contact-form`)

## Assumptions
1. **Ambiente de ejecución y hosting:** El sitio se compila como sitio estático en `./dist` y se despliega en **Cloudflare Workers con Static Assets** (`wrangler.json`). El endpoint `/api/contact` se ejecuta en el runtime del Worker de Cloudflare (`src/worker.ts` o módulo de servidor) capturando las peticiones POST a `/api/contact` sin alterar la compilación estática de Astro.
2. **Seguridad contra spam:** Se utilizará **Cloudflare Turnstile** en modo gestionado (*managed* o *non-interactive/invisible* según configuración de clave), validando el token `cf-turnstile-response` en el backend contra `https://challenges.cloudflare.com/turnstile/v0/siteverify` antes de invocar los servicios de Mailjet.
3. **Servicio transaccional de Mailjet:** Se utilizará la API v3.1 de envío transaccional (`POST https://api.mailjet.com/v3.1/send`) autenticada con Basic Auth (`MJ_APIKEY_PUBLIC:MJ_APIKEY_PRIVATE`). El correo se enviará a una dirección parametrizable (`MAILJET_TO_EMAIL`, con valor por defecto `SITE.contact.email`), con `Reply-To` establecido al email del usuario que contacta.
4. **Captura en lista de contactos de Mailjet:** Se utilizará la API v3 de Mailjet (`POST https://api.mailjet.com/v3/REST/contactslist/{list_id}/managecontact`) con la acción `addnoforce` para dar de alta/actualizar el contacto en la lista comercial configurada (`MAILJET_CONTACT_LIST_ID`) guardando nombre, teléfono y motivo de consulta.
5. **Resiliencia en fallos parciales:** El envío transaccional es prioritario. Si la suscripción a la lista falla pero el correo transaccional se envía con éxito, el formulario retornará éxito al usuario para no bloquear su consulta, registrando internamente la incidencia de sincronización con la lista.
6. **Diseño y accesibilidad:** Se mantendrá estricto cumplimiento del sistema de diseño de Rápido Pack Valencia (paleta de neutros pizarra + acento esmeralda, tipografías `Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`, tarjeta difusa `.diffusion-card`) y accesibilidad WCAG 2.1 AA (estados táctiles, mensajes `aria-live`, etiquetas semánticas y gestión de foco en errores).

---

## 1. Objective
Implementar el ciclo completo de envío y captura de prospectos en el formulario de contacto de Rápido Pack Valencia (`src/components/ContactForm.astro` en `/contacto`):
1. **Protección Anti-Spam (Cloudflare Turnstile):** Validar la legitimidad del remitente en el cliente y verificar el token criptográfico en el servidor antes de cualquier procesamiento.
2. **Envío de Correo Transaccional (Mailjet Send API v3.1):** Notificar al equipo de la tienda física con todos los detalles de la consulta (nombre, teléfono, email, motivo y mensaje), con destinatario parametrizable vía variables de entorno / configuración.
3. **Captura de Contacto en Lista Mailjet (Mailjet List API v3):** Registrar o actualizar automáticamente el contacto en una lista de Mailjet para seguimiento comercial y fidelización.
4. **Experiencia de Usuario de Alto Nivel (`/frontend-ui-engineering`):** Ciclo de interacción táctil con validación nativa (`:user-invalid`), estado de carga esquelético / deshabilitado, manejo resiliente de errores y anuncio accesible de confirmación.
5. **Contrato de API Estable y Tipado (`/api-and-interface-design`):** Definir esquemas rigurosos de entrada y salida para `POST /api/contact`, validando exhaustivamente en los límites del sistema con semántica consistente de códigos HTTP y errores estructurados.

---

## 2. Tech Stack
- **Frontend:** Astro 7 (`^7.4.4`), Tailwind CSS v4 (`^4.3.3`), Vanilla JavaScript IIFE modular (`<script is:inline>`), Cloudflare Turnstile Web Component / Script API.
- **Backend / Edge:** Cloudflare Workers runtime (`workerd`), Web Standards API (`Request`, `Response`, `fetch`, `crypto`).
- **APIs Externas:**
  - Cloudflare Turnstile Siteverify (`https://challenges.cloudflare.com/turnstile/v0/siteverify`)
  - Mailjet Send API v3.1 (`https://api.mailjet.com/v3.1/send`)
  - Mailjet Contacts List API v3 (`https://api.mailjet.com/v3/REST/contactslist/{list_id}/managecontact`)
- **Testing:** Node.js 22 built-in test runner (`node:test`, `node:assert`).

---

## 3. Commands
- **Ejecutar tests unitarios y de contrato:** `node --test tests/contact-api.test.mjs`
- **Ejecutar suite completa de tests del proyecto:** `npm test`
- **Compilación estática de producción:** `npm run build`
- **Previsualización de assets con Wrangler:** `npx wrangler preview` o `npx wrangler dev`
- **Verificación de navegador real (DevTools):** `node scripts/verify-browser.mjs`

---

## 4. Project Structure
```text
rapido-astro/
├── src/
│   ├── config/
│   │   └── site.ts                    # Añadir SITE.contact.notificationEmail y SITE.security.turnstileSiteKey
│   ├── components/
│   │   └── ContactForm.astro          # Formulario actualizado con widget Turnstile, estados y accesibilidad
│   ├── pages/
│   │   └── contacto.astro             # Inclusión de scripts/metadatos requeridos por Turnstile
│   ├── worker.ts                      # Entrypoint de Cloudflare Worker para interceptar POST /api/contact
│   └── lib/
│       ├── turnstile.ts               # Validador de token Turnstile contra la API de Cloudflare
│       └── mailjet.ts                 # Clientes Mailjet: Send API v3.1 + Contacts List managecontact
├── tests/
│   └── contact-api.test.mjs           # Tests TDD para validación de contrato, Turnstile y Mailjet
├── wrangler.json                      # Configuración de Cloudflare Workers con assets y script principal
└── SPEC-mailjet-contact-form.md       # Esta especificación
```

---

## 5. API & Interface Contract (`/api-and-interface-design`)

### 5.1 Endpoint Specification
- **Ruta:** `POST /api/contact`
- **Content-Type:** `application/json`

#### Request Schema
```typescript
export interface ContactSubmissionPayload {
  name: string;          // 2 a 100 caracteres
  phone: string;         // 9 a 15 caracteres (formato telefónico español o internacional)
  email: string;         // Formato válido de email según RFC 5322
  subject: 'lotes' | 'paqueteria' | 'horarios' | 'otro';
  message: string;       // 10 a 2000 caracteres
  privacy: boolean;      // Debe ser estrictamente true
  turnstileToken: string;// Token emitido por el widget de Turnstile
}
```

#### Success Response (HTTP 200 OK)
```typescript
export interface ContactSuccessResponse {
  ok: true;
  message: string;
  data: {
    messageId?: string;
    contactListSynced: boolean;
  };
}
```

#### Error Response (HTTP 400 / 422 / 500 / 502)
```typescript
export interface ContactErrorResponse {
  ok: false;
  error: {
    code: 
      | 'INVALID_JSON'
      | 'VALIDATION_ERROR'
      | 'TURNSTILE_FAILED'
      | 'MAILJET_SEND_ERROR'
      | 'INTERNAL_ERROR';
    message: string;
    details?: Record<string, string>;
  };
}
```

### 5.2 Parametrización y Variables de Entorno
| Variable | Ámbito | Descripción | Valor por defecto |
|---|---|---|---|
| `PUBLIC_TURNSTILE_SITE_KEY` | Cliente / Build | Clave pública del widget Turnstile | Configurable en `SITE.security.turnstileSiteKey` o `0x4AAAAAAAx...` (testing) |
| `TURNSTILE_SECRET_KEY` | Servidor / Secreto | Clave secreta para siteverify | `1x0000000000000000000000000000000AA` (testing) |
| `MAILJET_API_KEY` | Servidor / Secreto | Clave de API pública de Mailjet | Obligatoria en producción |
| `MAILJET_SECRET_KEY` | Servidor / Secreto | Clave secreta de Mailjet | Obligatoria en producción |
| `MAILJET_FROM_EMAIL` | Servidor / Config | Remitente verificado en Mailjet | `contacto@rapidopackvalencia.es` |
| `MAILJET_TO_EMAIL` | Servidor / Config | Destinatario parametrizable de las notificaciones | `contacto@rapidopackvalencia.es` (`SITE.contact.email`) |
| `MAILJET_CONTACT_LIST_ID` | Servidor / Config | ID numérico de la lista en Mailjet | Opcional/Parametrizable (si se omite, omite la adición a lista) |

---

## 6. Frontend UI Engineering (`/frontend-ui-engineering`)

### 6.1 Ciclo de Estados del Formulario
1. **Reposo (Idle):** Todos los campos interactivos listos, botón de envío activo con icono `send`, widget de Turnstile montado de forma no obstructiva.
2. **Validación Interactiva en Cliente:**
   - Regla `:user-invalid` con fallback WeakMap para compatibilidad universal.
   - Mensajes de error específicos vinculados mediante `aria-describedby` y `aria-errormessage`.
3. **Envío en Progreso (Submitting):**
   - Botón de envío deshabilitado (`disabled="true"`), icono sustituido por spinner/indicador de progreso o texto "Enviando mensaje...".
   - Formulario marcado con `aria-busy="true"`.
   - Skeleton loading visible si el retardo supera 150ms.
4. **Éxito (Success):**
   - Notificación destacada con `role="status"` y `aria-live="polite"`.
   - Encabezado: "Consulta registrada en Rápido Pack Valencia".
   - Detalle aclaratorio indicando respuesta en menos de 24 horas y enlace telefónico a tienda.
   - Limpieza del formulario (`form.reset()`) y reseteo del token de Turnstile (`turnstile.reset()`).
5. **Error del Servidor (Server Error):**
   - Banner de alerta con `role="alert"` y foco desplazado para lectura inmediata por tecnologías de asistencia.
   - Mensaje claro explicando el motivo (ej. "No se pudo verificar el captcha" o "Error de conexión temporal") ofreciendo botón de "Reintentar" o contacto telefónico directo.
   - Reactivación inmediata del botón de envío y reseteo de Turnstile.

---

## 7. Testing Strategy
1. **Pruebas de Contrato y Validación (Unitarias):**
   - Validación de payloads válidos e inválidos (faltan campos obligatorios, emails malformados, teléfonos menores a 9 dígitos, token Turnstile ausente).
   - Verificación de la estructura estricta del JSON de respuesta tanto en casos de éxito como de fallo.
2. **Pruebas de Integración con Mocks (Turnstile + Mailjet):**
   - Verificación de que el validador rechaza tokens inválidos devueltos por Turnstile.
   - Verificación del formato del payload enviado a `POST https://api.mailjet.com/v3.1/send` (From, To parametrizable, Reply-To, Subject, HTML/Text).
   - Verificación del llamado a `POST /v3/REST/contactslist/{list_id}/managecontact` con `Action: addnoforce`.
   - Comprobación de que si Mailjet List responde con error pero el email se envió, el endpoint retorna éxito con advertencia registrada.
3. **Pruebas de Regresión y Build:**
   - `npm test`: asegurando que los 37 tests existentes sigan en verde.
   - `npm run build`: comprobando que el build estático y la generación de tipos no sufran regresiones.

---

## 8. Boundaries
- **Always:**
  - Mantener las variables sensibles (`MAILJET_SECRET_KEY`, `TURNSTILE_SECRET_KEY`) exclusivamente en el backend del Worker.
  - Usar tokens de diseño de `src/styles/global.css` y las fuentes tipográficas del triad oficial.
  - Parametrizar la dirección de destino (`MAILJET_TO_EMAIL`) con fallback automático a `SITE.contact.email`.
  - Asegurar accesibilidad WCAG 2.1 AA en todos los estados del formulario.
  - Realizar commits atómicos en la rama `feature/mailjet-turnstile-contact-form`.
- **Ask first:**
  - Añadir librerías npm pesadas externas en lugar de clientes ligeros con `fetch`.
  - Modificar campos obligatorios del formulario que afecten la política de privacidad o RGPD.
- **Never:**
  - Exponer credenciales o claves secretas de Mailjet o Turnstile en código cliente o bundles de Vite.
  - Romper el bloque `"previews": {}` o `"assets": { "directory": "./dist" }` de `wrangler.json`.
  - Bloquear el envío de la consulta si la lista secundaria de Mailjet no está configurada.

---

## 9. Success Criteria
- [ ] La rama `feature/mailjet-turnstile-contact-form` contiene la especificación, implementación y tests.
- [ ] El endpoint `POST /api/contact` valida campos y token de Turnstile antes de procesar el correo.
- [ ] La dirección de correo destinataria es parametrizable mediante `MAILJET_TO_EMAIL` y `SITE.contact.notificationEmail`.
- [ ] El correo transaccional se envía a través de Mailjet Send API v3.1 con los datos del formulario y `ReplyTo` del cliente.
- [ ] El contacto se registra/actualiza en la lista de Mailjet mediante la API v3 `managecontact`.
- [ ] El formulario en `ContactForm.astro` incluye el widget Turnstile y gestiona estados de reposo, envío, éxito y error con retroalimentación accesible.
- [ ] Todos los tests del proyecto (`npm test`) pasan satisfactoriamente.
- [ ] `npm run build` compila con 0 errores y 0 advertencias.

---

## 10. Open Questions & User Approvals
1. **Clave de prueba vs producción de Turnstile:** **[APROBADO]** Se configuran las claves de prueba oficiales de Cloudflare Turnstile (`0x4AAAAAAAx...` para cliente y `1x0000000000000000000000000000000AA` para backend) como valores por defecto en desarrollo local y testing automatizado cuando no se provean variables de entorno.
2. **Propiedades de la lista en Mailjet:** **[APROBADO]** Al capturar el contacto mediante `managecontact` (`Action: addnoforce`), se enviarán `Name`, `Email` y la propiedad `phone` (creada en el panel de Mailjet como tipo `String`).
3. **Formato del correo transaccional:** **[APROBADO]** Se implementa una plantilla HTML responsive con branding de Rápido Pack Valencia (colores oficiales, encabezado con logo/nombre, tabla limpia con datos de contacto del usuario y botón de acción directa "Responder al cliente"), acompañada de una versión alternativa en texto plano.

