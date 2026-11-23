import { createHmac, timingSafeEqual } from 'node:crypto';
import { SHEET_HEADERS, sheetRange, sheetTabs, sheetsAccessToken, sheetsConfigurationStatus, sheetsRequest,
  type LeadIntegrationEnv, type LeadKind } from './leadIntegrations.ts';

interface CheckInput { timestamp: string; nonce: string; expectedConfig: string; signature: string }
const purpose = 'inventtomorrow:POST:/api/audit:sheets_connection_check:v1';

export function sheetsConfigDigest(env: LeadIntegrationEnv): string {
  return createHmac('sha256', env.GOOGLE_CLIENT_SECRET?.trim() || '').update(JSON.stringify([
    env.GOOGLE_CLIENT_ID?.trim(), env.GOOGLE_SHEETS_REFRESH_TOKEN?.trim(), env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim(), sheetTabs(env),
  ])).digest('hex');
}
export function signSheetsCheck(input: Omit<CheckInput, 'signature'>, secret: string): string {
  return createHmac('sha256', secret.trim()).update([purpose, input.timestamp, input.nonce, input.expectedConfig].join('\n')).digest('hex');
}

// Owner-only, read-only diagnostic. No general mail/sheet write endpoint is added.
// The signature proves possession of the existing private Google client secret;
// it is context-bound, expires after a minute, and never transmits that secret.
export async function checkProductionSheets(raw: unknown, env: LeadIntegrationEnv, now = Date.now()) {
  const input = raw as Partial<CheckInput> | null;
  const secret = env.GOOGLE_CLIENT_SECRET?.trim();
  if (!secret || !input || typeof input.timestamp !== 'string' || !/^\d{13}$/.test(input.timestamp)
    || Math.abs(now - Number(input.timestamp)) > 60_000 || typeof input.nonce !== 'string' || !/^[a-f0-9]{32}$/.test(input.nonce)
    || typeof input.expectedConfig !== 'string' || !/^[a-f0-9]{64}$/.test(input.expectedConfig)
    || typeof input.signature !== 'string' || !/^[a-f0-9]{64}$/.test(input.signature)
    || !timingSafeEqual(Buffer.from(input.signature, 'hex'), Buffer.from(signSheetsCheck(input as CheckInput, secret), 'hex'))) {
    return { status: 401, body: { error: 'Not authorized.' } };
  }
  const configuration = sheetsConfigurationStatus(env);
  const matchesExpected = timingSafeEqual(Buffer.from(input.expectedConfig, 'hex'), Buffer.from(sheetsConfigDigest(env), 'hex'));
  if (configuration !== 'configured') return { status: 200, body: { configuration, matchesExpected } };
  try {
    const signal = AbortSignal.timeout(18_000);
    const token = await sheetsAccessToken(env, signal);
    await sheetsRequest(env, token, '?fields=sheets.properties', signal);
    const tabs = [];
    for (const [kind, tab] of Object.entries(sheetTabs(env)) as [LeadKind, string][]) {
      const data = await sheetsRequest(env, token, `/values/${encodeURIComponent(sheetRange(tab, '1:1'))}`, signal);
      const headers = (data.values?.[0] || []).map((value: unknown) => String(value).trim());
      const nonempty = headers.filter(Boolean);
      tabs.push({ kind, ready: new Set(nonempty).size === nonempty.length && SHEET_HEADERS[kind].every(header => headers.includes(header)) });
    }
    return { status: 200, body: { configuration, matchesExpected, googleAccess: true, tabs } };
  } catch (error) {
    const code = typeof (error as { code?: unknown })?.code === 'string' ? (error as { code: string }).code : 'SHEETS_UNAVAILABLE';
    const safeCodes = ['SHEETS_AUTH_FAILED', 'SHEETS_SCOPE_MISSING', 'SHEETS_API_DISABLED', 'SHEETS_PERMISSION_DENIED', 'SHEETS_NOT_FOUND', 'SHEETS_REQUEST_FAILED'];
    return { status: 200, body: { configuration, matchesExpected, googleAccess: false, code: safeCodes.includes(code) ? code : 'SHEETS_UNAVAILABLE' } };
  }
}
