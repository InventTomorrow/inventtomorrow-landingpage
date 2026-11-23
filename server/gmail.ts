import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { AUDIT_EMAIL_IMAGE_CID } from './auditEmail.ts';

export interface GmailEnv {
  GMAIL_AUDIT_REPORTS_ENABLED?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GMAIL_REFRESH_TOKEN?: string;
  GMAIL_SENDER_EMAIL?: string;
}

type Delivery = { sent: true } | { sent: false; code: string };
const sent = new Map<string, number>();
const active = new Map<string, Promise<Delivery>>();
const CACHE_MS = 10 * 60_000;
// One plain mailbox per header: disallow control characters and address lists.
const mailbox = /^[a-zA-Z0-9.!#$%&'*+\-/=?^_`{|}~]+@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;

export function gmailAuditEnabled(env: GmailEnv) {
  return env.GMAIL_AUDIT_REPORTS_ENABLED === 'true';
}

// Deliberately server-only, with no public arbitrary-message endpoint.
// Cache/coalescing prevents repeat sends within this process, not across deployments.
export async function sendAuditReportEmail(input: { to: string; submissionId: string; text: string; html?: string }, env: GmailEnv): Promise<Delivery> {
  if (!gmailAuditEnabled(env)) return { sent: false, code: 'GMAIL_DISABLED' };
  const from = env.GMAIL_SENDER_EMAIL?.trim() || '';
  const clientId = env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = env.GOOGLE_CLIENT_SECRET?.trim();
  const refreshToken = env.GMAIL_REFRESH_TOKEN?.trim();
  if (!clientId || !clientSecret || !refreshToken || from.length > 254 || !mailbox.test(from)) {
    return { sent: false, code: 'GMAIL_NOT_CONFIGURED' };
  }
  if (input.to.length > 254 || !mailbox.test(input.to) || !input.text.trim() || input.text.length > 30_000
    || (input.html !== undefined && (!input.html.trim() || Buffer.byteLength(input.html, 'utf8') > 100_000))) {
    return { sent: false, code: 'GMAIL_INVALID_MESSAGE' };
  }
  const key = createHash('sha256').update(JSON.stringify([
    clientId, clientSecret, refreshToken, from, input.to.toLowerCase(), input.submissionId, input.text, input.html,
  ])).digest('hex');
  for (const [id, expires] of sent) if (expires <= Date.now()) sent.delete(id);
  if (sent.has(key)) return { sent: true };
  const pending = active.get(key);
  if (pending) return pending;
  if (active.size >= 20) return { sent: false, code: 'GMAIL_BUSY' };

  const task = (async (): Promise<Delivery> => {
    try {
      // A single deadline covers both Google calls and their response bodies.
      const signal = AbortSignal.timeout(20_000);
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }),
        signal,
      });
      if (!tokenResponse.ok) return { sent: false, code: 'GMAIL_AUTH_FAILED' };
      const token = await tokenResponse.json() as { access_token?: unknown; token_type?: unknown };
      if (typeof token?.access_token !== 'string' || !token.access_token.trim() || token.token_type?.toString().toLowerCase() !== 'bearer') {
        return { sent: false, code: 'GMAIL_AUTH_FAILED' };
      }
      const encode = (value: string | Buffer) => (typeof value === 'string' ? Buffer.from(value.replace(/\r?\n/g, '\r\n'), 'utf8') : value)
        .toString('base64').match(/.{1,76}/g)!.join('\r\n');
      const plainPart = ['Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', encode(input.text)].join('\r\n');
      const alternative = `audit-alt-${key.slice(0, 32)}`;
      const related = `audit-related-${key.slice(0, 32)}`;
      const content = input.html ? [
        `Content-Type: multipart/alternative; boundary="${alternative}"`, '',
        `--${alternative}`, plainPart,
        `--${alternative}`, `Content-Type: multipart/related; boundary="${related}"`, '',
        `--${related}`, 'Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', encode(input.html),
        `--${related}`, 'Content-Type: image/jpeg; name="audit-hero.jpg"', 'Content-Transfer-Encoding: base64',
        `Content-ID: <${AUDIT_EMAIL_IMAGE_CID}>`, 'Content-Disposition: inline; filename="audit-hero.jpg"', '',
        // Reuse the unchanged homepage hero; includeFiles packages it on Vercel.
        encode(readFileSync(new URL('../public/images/hero-cleaning-automation.jpg', import.meta.url))),
        `--${related}--`, `--${alternative}--`, '',
      ].join('\r\n') : plainPart;
      const mime = [
        `From: Invent Tomorrow <${from}>`, `To: ${input.to}`,
        'Subject: Your cleaning business audit - Invent Tomorrow', `Date: ${new Date().toUTCString()}`,
        `Message-ID: <audit-${key}@inventtomorrow.pro>`,
        'MIME-Version: 1.0', content,
      ].join('\r\n');
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.access_token}` },
        body: JSON.stringify({ raw: Buffer.from(mime, 'utf8').toString('base64url') }), signal,
      });
      if (!response.ok) return { sent: false, code: 'GMAIL_SEND_FAILED' };
      const message = await response.json() as { id?: unknown };
      if (typeof message?.id !== 'string' || !message.id.trim()) return { sent: false, code: 'GMAIL_INVALID_RESPONSE' };
      if (sent.size >= 256) sent.delete(sent.keys().next().value!);
      sent.set(key, Date.now() + CACHE_MS);
      return { sent: true };
    } catch {
      // Google error bodies, tokens and lead details must never enter logs or API errors.
      return { sent: false, code: 'GMAIL_UNAVAILABLE' };
    }
  })();
  active.set(key, task);
  try { return await task; } finally { active.delete(key); }
}
