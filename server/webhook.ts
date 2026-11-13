export interface WebhookEnv {
  N8N_WEBHOOK_URL?: string;
  N8N_WEBHOOK_TEST_URL?: string;
  N8N_USE_PRODUCTION?: string;
  VERCEL_ENV?: string;
}

// Chat and form requests deliberately use the same configured destination.
export function webhookUrl(env: WebhookEnv) {
  const production = env.VERCEL_ENV === 'production' || env.N8N_USE_PRODUCTION === 'true';
  return (production ? env.N8N_WEBHOOK_URL : env.N8N_WEBHOOK_TEST_URL)?.trim() || '';
}

export function webhookTarget(env: WebhookEnv): 'production' | 'test' | 'off' {
  if (!webhookUrl(env)) return 'off';
  return env.VERCEL_ENV === 'production' || env.N8N_USE_PRODUCTION === 'true' ? 'production' : 'test';
}

export type WebhookFailure = 'http_error' | 'empty_response' | 'invalid_json' | 'timeout' | 'network_error';
export interface WebhookResult {
  ok: boolean;
  data: unknown;
  status: number | null;
  failure: WebhookFailure | null;
}

export async function sendToWebhook(url: string, payload: unknown): Promise<WebhookResult> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return { ok: false, data: null, status: response.status, failure: 'http_error' };
    // A 2xx can be n8n's empty/default response or an application-level failure.
    // Form handlers must validate the acknowledgement before unlocking anything.
    const body = await response.text();
    if (!body.trim()) return { ok: false, data: null, status: response.status, failure: 'empty_response' };
    try {
      return { ok: true, data: JSON.parse(body), status: response.status, failure: null };
    } catch {
      return { ok: false, data: null, status: response.status, failure: 'invalid_json' };
    }
  } catch (error) {
    const timeout = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
    return { ok: false, data: null, status: null, failure: timeout ? 'timeout' : 'network_error' };
  }
}
