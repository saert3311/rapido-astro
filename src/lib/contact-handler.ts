import { SITE } from '../config/site.ts';
import { verifyTurnstileToken } from './turnstile.ts';
import { sendTransactionalEmail, subscribeContactToList } from './mailjet.ts';

export interface ContactRequestBody {
  name: string;
  phone: string;
  email: string;
  subject: 'lotes' | 'paqueteria' | 'horarios' | 'otro';
  message: string;
  privacy: boolean;
  turnstileToken: string;
}

export interface ContactConfigStatus {
  ready: boolean;
  turnstileConfigured: boolean;
  mailjetConfigured: boolean;
  mailjetListConfigured: boolean;
  missing: string[];
}

const VALID_SUBJECTS = ['lotes', 'paqueteria', 'horarios', 'otro'] as const;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DUMMY_TURNSTILE_SECRET = '1x0000000000000000000000000000000AA';

function isPlaceholderOrEmpty(value: unknown): boolean {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) return true;
  const lower = trimmed.toLowerCase();
  return lower.startsWith('replace-with-') || lower.startsWith('your-') || lower === 'changeme';
}

function readEnvValue(env: Record<string, any>, key: string): string {
  if (env && Object.prototype.hasOwnProperty.call(env, key) && typeof env[key] === 'string') {
    return env[key].trim();
  }
  if (typeof process !== 'undefined' && typeof process.env?.[key] === 'string') {
    return process.env[key]!.trim();
  }
  return '';
}

function logEvent(
  env: Record<string, any>,
  level: 'warn' | 'error',
  event: string,
  details: Record<string, unknown> = {}
): void {
  if (env.__silentLogs === true) return;
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...details,
  });
  if (level === 'error') {
    console.error(line);
  } else {
    console.warn(line);
  }
}

export function getContactConfigStatus(env: Record<string, any> = {}): ContactConfigStatus {
  const turnstileSecret = readEnvValue(env, 'TURNSTILE_SECRET_KEY');
  const mailjetApiKey = readEnvValue(env, 'MAILJET_API_KEY');
  const mailjetSecretKey = readEnvValue(env, 'MAILJET_SECRET_KEY');
  const mailjetContactListId = readEnvValue(env, 'MAILJET_CONTACT_LIST_ID');

  const turnstileConfigured =
    !isPlaceholderOrEmpty(turnstileSecret) && turnstileSecret !== DUMMY_TURNSTILE_SECRET;
  const mailjetApiKeyConfigured = !isPlaceholderOrEmpty(mailjetApiKey);
  const mailjetSecretKeyConfigured = !isPlaceholderOrEmpty(mailjetSecretKey);
  const mailjetConfigured = mailjetApiKeyConfigured && mailjetSecretKeyConfigured;
  const mailjetListConfigured = !isPlaceholderOrEmpty(mailjetContactListId);

  const missing: string[] = [];
  if (!turnstileConfigured) missing.push('TURNSTILE_SECRET_KEY');
  if (!mailjetApiKeyConfigured) missing.push('MAILJET_API_KEY');
  if (!mailjetSecretKeyConfigured) missing.push('MAILJET_SECRET_KEY');

  return {
    ready: turnstileConfigured && mailjetConfigured,
    turnstileConfigured,
    mailjetConfigured,
    mailjetListConfigured,
    missing,
  };
}

export async function handleContactRequest(
  request: Request,
  env: Record<string, any> = {}
): Promise<Response> {
  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({
        ok: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Método no permitido. Solo se acepta POST.',
        },
      }),
      { status: 405, headers: jsonHeaders }
    );
  }

  let body: Partial<ContactRequestBody>;
  try {
    body = (await request.json()) as Partial<ContactRequestBody>;
  } catch {
    return new Response(
      JSON.stringify({
        ok: false,
        error: {
          code: 'INVALID_JSON',
          message: 'El cuerpo de la solicitud no es un JSON válido.',
        },
      }),
      { status: 400, headers: jsonHeaders }
    );
  }

  // Boundary input validation
  const errors: Record<string, string> = {};

  const name = (body.name || '').trim();
  if (name.length < 2 || name.length > 100) {
    errors.name = 'El nombre completo debe tener entre 2 y 100 caracteres.';
  }

  const phone = (body.phone || '').trim();
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 9 || phone.length > 25) {
    errors.phone = 'Introduce un teléfono de contacto válido (mínimo 9 dígitos).';
  }

  const email = (body.email || '').trim().toLowerCase();
  if (!email || !EMAIL_REGEX.test(email) || email.length > 150) {
    errors.email = 'Introduce una dirección de correo electrónico válida.';
  }

  const subject = body.subject as (typeof VALID_SUBJECTS)[number];
  if (!VALID_SUBJECTS.includes(subject)) {
    errors.subject = 'Selecciona un motivo válido para la consulta.';
  }

  const message = (body.message || '').trim();
  if (message.length < 10 || message.length > 2000) {
    errors.message = 'El mensaje debe contener entre 10 y 2000 caracteres.';
  }

  if (body.privacy !== true) {
    errors.privacy = 'Debes aceptar la política de privacidad para enviar la consulta.';
  }

  const turnstileToken = (body.turnstileToken || '').trim();
  if (!turnstileToken) {
    errors.turnstileToken = 'Falta el token de verificación anti-spam.';
  }

  if (Object.keys(errors).length > 0) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Existen errores de validación en el formulario.',
          details: errors,
        },
      }),
      { status: 422, headers: jsonHeaders }
    );
  }

  const nodeEnv = readEnvValue(env, 'NODE_ENV');
  if (nodeEnv === 'production') {
    const configStatus = getContactConfigStatus(env);
    if (!configStatus.ready) {
      logEvent(env, 'error', 'contact.config_missing', { missing: configStatus.missing });
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message:
              'El servicio de contacto no está disponible temporalmente. Por favor, llámanos al 640 39 74 34 o escríbenos por WhatsApp.',
          },
        }),
        { status: 503, headers: jsonHeaders }
      );
    }
  }

  const fetchFn = env.__mockFetch || globalThis.fetch;

  const remoteIp =
    (typeof env.__clientIp === 'string' && env.__clientIp.trim()) ||
    request.headers.get('cf-connecting-ip')?.trim() ||
    undefined;

  // Turnstile verification
  const turnstileSecret =
    readEnvValue(env, 'TURNSTILE_SECRET_KEY') || DUMMY_TURNSTILE_SECRET;

  const turnstileResult = await verifyTurnstileToken({
    token: turnstileToken,
    secretKey: turnstileSecret,
    remoteIp,
    fetchFn,
  });

  if (!turnstileResult.success) {
    logEvent(env, 'warn', 'contact.turnstile_failed', {
      error: turnstileResult.error,
      errorCodes: turnstileResult.errorCodes,
    });
    return new Response(
      JSON.stringify({
        ok: false,
        error: {
          code: 'TURNSTILE_FAILED',
          message: 'La comprobación anti-spam no se pudo validar. Por favor, inténtalo de nuevo.',
        },
      }),
      { status: 422, headers: jsonHeaders }
    );
  }

  // Mailjet Send API v3.1 (Transactional Email)
  const mailjetApiKey = readEnvValue(env, 'MAILJET_API_KEY');
  const mailjetSecretKey = readEnvValue(env, 'MAILJET_SECRET_KEY');
  const mailjetFrom = readEnvValue(env, 'MAILJET_FROM_EMAIL') || 'contacto@rapidopackvalencia.es';
  const mailjetTo =
    readEnvValue(env, 'MAILJET_TO_EMAIL') ||
    SITE.contact.notificationEmail ||
    'contacto@rapidopackvalencia.es';

  // If credentials are provided, send via Mailjet
  let sendSuccess = true;
  if (mailjetApiKey && mailjetSecretKey) {
    const sendResult = await sendTransactionalEmail(
      { name, email, phone, subject, message },
      {
        apiKey: mailjetApiKey,
        secretKey: mailjetSecretKey,
        fromEmail: mailjetFrom,
        toEmail: mailjetTo,
        fetchFn,
      }
    );
    if (!sendResult.ok) {
      logEvent(env, 'error', 'contact.mailjet_send_failed', {
        status: sendResult.status,
        errorCode: sendResult.error ? sendResult.error.split(':')[0] : undefined,
      });
      sendSuccess = false;
    }
  }

  if (!sendSuccess) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: {
          code: 'MAILJET_SEND_ERROR',
          message:
            'No se pudo enviar el mensaje en este momento. Por favor, contacta directamente con nosotros en el 640 39 74 34 o por WhatsApp.',
        },
      }),
      { status: 502, headers: jsonHeaders }
    );
  }

  // Mailjet List API v3 (Subscribe contact to list)
  let contactListSynced = false;
  const contactListId = readEnvValue(env, 'MAILJET_CONTACT_LIST_ID');

  if (mailjetApiKey && mailjetSecretKey && contactListId) {
    const listResult = await subscribeContactToList(
      { name, email, phone },
      {
        apiKey: mailjetApiKey,
        secretKey: mailjetSecretKey,
        listId: contactListId,
        fetchFn,
      }
    );
    if (!listResult.ok) {
      logEvent(env, 'warn', 'contact.mailjet_list_sync_failed', {
        status: listResult.status,
        errorCode: listResult.error ? listResult.error.split(':')[0] : undefined,
      });
    }
    contactListSynced = listResult.ok;
  }

  return new Response(
    JSON.stringify({
      ok: true,
      message: 'Consulta registrada correctamente.',
      data: {
        contactListSynced,
      },
    }),
    { status: 200, headers: jsonHeaders }
  );
}
