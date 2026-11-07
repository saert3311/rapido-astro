export interface VerifyTurnstileOptions {
  token: string;
  secretKey: string;
  remoteIp?: string;
  fetchFn?: typeof fetch;
}

export interface TurnstileVerificationResult {
  success: boolean;
  error?: string;
  errorCodes?: string[];
}

/**
 * Verifies a Cloudflare Turnstile token against the siteverify API.
 * Supports official Cloudflare dummy test keys for local development and testing.
 */
export async function verifyTurnstileToken({
  token,
  secretKey,
  remoteIp,
  fetchFn = globalThis.fetch,
}: VerifyTurnstileOptions): Promise<TurnstileVerificationResult> {
  const cleanToken = (token || '').trim();
  const cleanSecret = (secretKey || '').trim();

  if (!cleanToken) {
    return { success: false, error: 'MISSING_TURNSTILE_TOKEN' };
  }

  if (!cleanSecret) {
    return { success: false, error: 'MISSING_TURNSTILE_SECRET_KEY' };
  }

  // Cloudflare official dummy testing keys short-circuit for offline testing
  if (cleanSecret === '1x0000000000000000000000000000000AA') {
    if (cleanToken === 'dummy-fail-token') {
      return { success: false, error: 'TURNSTILE_DUMMY_FAILED' };
    }
    return { success: true };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', cleanSecret);
    formData.append('response', cleanToken);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetchFn('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `TURNSTILE_HTTP_${response.status}`,
      };
    }

    const data = (await response.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (data && data.success === true) {
      return { success: true };
    }

    return {
      success: false,
      error: 'TURNSTILE_VERIFICATION_FAILED',
      errorCodes: data?.['error-codes'] || [],
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'TURNSTILE_NETWORK_ERROR',
    };
  }
}
