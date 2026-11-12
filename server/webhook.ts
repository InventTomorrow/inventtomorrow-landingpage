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

export async function sendToWebhook(url: string, payload: unknown): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) console.warn(`[n8n] webhook responded ${response.status}`);
    return response.ok;
  } catch {
    console.warn('[n8n] webhook request failed');
    return false;
  }
}
