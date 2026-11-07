import { handleContactRequest } from './lib/contact-handler.ts';

export interface Env {
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
  TURNSTILE_SECRET_KEY?: string;
  MAILJET_API_KEY?: string;
  MAILJET_SECRET_KEY?: string;
  MAILJET_FROM_EMAIL?: string;
  MAILJET_TO_EMAIL?: string;
  MAILJET_CONTACT_LIST_ID?: string;
}

export default {
  async fetch(request: Request, env: Env = {}, ctx?: any): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      return handleContactRequest(request, env);
    }

    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
