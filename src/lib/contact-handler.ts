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

const VALID_SUBJECTS = ['lotes', 'paqueteria', 'horarios', 'otro'] as const;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const fetchFn = env.__mockFetch || globalThis.fetch;

  // Turnstile verification
  const turnstileSecret =
    env.TURNSTILE_SECRET_KEY ||
    (typeof process !== 'undefined' ? process.env?.TURNSTILE_SECRET_KEY : undefined) ||
    '1x0000000000000000000000000000000AA';

  const turnstileResult = await verifyTurnstileToken({
    token: turnstileToken,
    secretKey: turnstileSecret,
    fetchFn,
  });

  if (!turnstileResult.success) {
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
  const mailjetApiKey =
    env.MAILJET_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.MAILJET_API_KEY : undefined) ||
    '';
  const mailjetSecretKey =
    env.MAILJET_SECRET_KEY ||
    (typeof process !== 'undefined' ? process.env?.MAILJET_SECRET_KEY : undefined) ||
    '';
  const mailjetFrom =
    env.MAILJET_FROM_EMAIL ||
    (typeof process !== 'undefined' ? process.env?.MAILJET_FROM_EMAIL : undefined) ||
    'contacto@rapidopackvalencia.es';
  const mailjetTo =
    env.MAILJET_TO_EMAIL ||
    (typeof process !== 'undefined' ? process.env?.MAILJET_TO_EMAIL : undefined) ||
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
  const contactListId =
    env.MAILJET_CONTACT_LIST_ID ||
    (typeof process !== 'undefined' ? process.env?.MAILJET_CONTACT_LIST_ID : undefined) ||
    '';

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
