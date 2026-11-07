export interface ContactMessageData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface MailjetSendConfig {
  apiKey: string;
  secretKey: string;
  fromEmail?: string;
  fromName?: string;
  toEmail?: string;
  toName?: string;
  fetchFn?: typeof fetch;
}

export interface MailjetListConfig {
  apiKey: string;
  secretKey: string;
  listId: string | number;
  fetchFn?: typeof fetch;
}

export interface MailjetResponse {
  ok: boolean;
  status?: number;
  data?: unknown;
  error?: string;
}

function encodeBasicAuth(apiKey: string, secretKey: string): string {
  if (typeof btoa === 'function') {
    return btoa(`${apiKey}:${secretKey}`);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(`${apiKey}:${secretKey}`).toString('base64');
  }
  return '';
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const SUBJECT_LABELS: Record<string, string> = {
  lotes: 'Productos de segunda mano, outlet y lotes semanales',
  paqueteria: 'Paquetería y recogidas (INPOST, GLS, SEUR, KANGURO)',
  horarios: 'Horarios y ubicación del local',
  otro: 'Otra consulta',
};

/**
 * Builds a clean, responsive HTML email template branded for Rápido Pack Valencia.
 */
function buildHtmlTemplate(data: ContactMessageData): string {
  const subjectDisplay = SUBJECT_LABELS[data.subject] || data.subject;
  const safeName = escapeHtml(data.name);
  const safeEmail = escapeHtml(data.email);
  const safePhone = escapeHtml(data.phone);
  const safeSubject = escapeHtml(subjectDisplay);
  const safeMessage = escapeHtml(data.message).replace(/\n/g, '<br/>');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva consulta web · Rápido Pack Valencia</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 28px 32px; border-bottom: 3px solid #059652;">
              <span style="font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #6ee7b7; font-weight: 600; display: block; margin-bottom: 6px;">
                01 // Formulario Web
              </span>
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                Nueva consulta de cliente · Rápido Pack Valencia
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Has recibido un nuevo mensaje enviado a través del formulario web de contacto en <a href="https://rapidopackvalencia.es/contacto" style="color: #059652; text-decoration: none; font-weight: 600;">rapidopackvalencia.es</a>:
              </p>

              <!-- Data table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; width: 35%; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; font-family: monospace;">Nombre</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; color: #0f172a;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; width: 35%; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; font-family: monospace;">Teléfono</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; color: #0f172a; font-family: monospace;"><a href="tel:${safePhone}" style="color: #059652; text-decoration: none;">${safePhone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; width: 35%; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; font-family: monospace;">Email</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a;"><a href="mailto:${safeEmail}" style="color: #059652; text-decoration: none;">${safeEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; width: 35%; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; font-family: monospace;">Motivo</td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #059652;">${safeSubject}</td>
                </tr>
              </table>

              <!-- Message box -->
              <div style="margin-bottom: 28px;">
                <span style="font-family: monospace; font-size: 12px; text-transform: uppercase; font-weight: 600; color: #64748b; display: block; margin-bottom: 8px;">Mensaje del cliente:</span>
                <div style="background-color: #ffffff; border-left: 3px solid #059652; padding: 16px 20px; font-size: 14px; line-height: 1.6; color: #1e293b; border-radius: 0 8px 8px 0; border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
                  ${safeMessage}
                </div>
              </div>

              <!-- Action button -->
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #059652;">
                    <a href="mailto:${safeEmail}?subject=Re:%20Consulta%20en%20R%C3%A1pido%20Pack%20Valencia" style="display: inline-block; padding: 14px 24px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px;">
                      Responder directamente a ${safeName} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
              Rápido Pack Valencia · Carrer del Comte Ronrée 8, 46910 Alfafar (Valencia)<br/>
              Notificación automática remitida por el sistema web.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Builds the plain text alternative for transactional emails.
 */
function buildPlainTextTemplate(data: ContactMessageData): string {
  const subjectDisplay = SUBJECT_LABELS[data.subject] || data.subject;
  return `NUEVA CONSULTA DE CONTACTO · RÁPIDO PACK VALENCIA
==================================================

Nombre: ${data.name}
Teléfono: ${data.phone}
Email: ${data.email}
Motivo: ${subjectDisplay}

Mensaje:
${data.message}

--------------------------------------------------
Puedes responder directamente a este correo para escribir a ${data.name} (${data.email}).
`;
}

/**
 * Sends a transactional email using Mailjet Send API v3.1.
 */
export async function sendTransactionalEmail(
  data: ContactMessageData,
  config: MailjetSendConfig
): Promise<MailjetResponse> {
  const {
    apiKey,
    secretKey,
    fromEmail = 'contacto@rapidopackvalencia.es',
    fromName = 'Rápido Pack Valencia - Web',
    toEmail = 'contacto@rapidopackvalencia.es',
    toName = 'Rápido Pack Valencia',
    fetchFn = globalThis.fetch,
  } = config;

  if (!apiKey || !secretKey) {
    return { ok: false, error: 'MISSING_MAILJET_CREDENTIALS' };
  }

  const subjectDisplay = SUBJECT_LABELS[data.subject] || data.subject;
  const payload = {
    Messages: [
      {
        From: {
          Email: fromEmail,
          Name: fromName,
        },
        To: [
          {
            Email: toEmail,
            Name: toName,
          },
        ],
        ReplyTo: {
          Email: data.email,
          Name: data.name,
        },
        Subject: `[Consulta Web - ${subjectDisplay}] ${data.name}`,
        TextPart: buildPlainTextTemplate(data),
        HTMLPart: buildHtmlTemplate(data),
      },
    ],
  };

  try {
    const authHeader = `Basic ${encodeBasicAuth(apiKey, secretKey)}`;
    const response = await fetchFn('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        ok: false,
        status: response.status,
        error: `MAILJET_SEND_HTTP_${response.status}: ${errorText}`,
      };
    }

    const resJson = await response.json();
    return {
      ok: true,
      status: response.status,
      data: resJson,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'MAILJET_SEND_NETWORK_ERROR',
    };
  }
}

/**
 * Subscribes or updates a contact in a Mailjet contact list using API v3.
 * Uses Action: "addnoforce" to respect existing unsubscribed states.
 */
export async function subscribeContactToList(
  contact: { name: string; email: string; phone?: string },
  config: MailjetListConfig
): Promise<MailjetResponse> {
  const { apiKey, secretKey, listId, fetchFn = globalThis.fetch } = config;

  if (!apiKey || !secretKey) {
    return { ok: false, error: 'MISSING_MAILJET_CREDENTIALS' };
  }

  if (!listId) {
    return { ok: false, error: 'MISSING_MAILJET_LIST_ID' };
  }

  const payload: {
    Action: string;
    Email: string;
    Name: string;
    Properties?: Record<string, string>;
  } = {
    Action: 'addnoforce',
    Email: contact.email,
    Name: contact.name,
  };

  if (contact.phone) {
    payload.Properties = {
      phone: contact.phone,
    };
  }

  try {
    const authHeader = `Basic ${encodeBasicAuth(apiKey, secretKey)}`;
    const url = `https://api.mailjet.com/v3/REST/contactslist/${encodeURIComponent(String(listId))}/managecontact`;

    const response = await fetchFn(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        ok: false,
        status: response.status,
        error: `MAILJET_LIST_HTTP_${response.status}: ${errorText}`,
      };
    }

    const resJson = await response.json();
    return {
      ok: true,
      status: response.status,
      data: resJson,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'MAILJET_LIST_NETWORK_ERROR',
    };
  }
}
