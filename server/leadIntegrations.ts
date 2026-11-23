import { createHash } from 'node:crypto';
import { pickTracking } from '../src/utils/attribution.ts';

export interface LeadIntegrationEnv {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_SHEETS_ENABLED?: string;
  GOOGLE_SHEETS_REFRESH_TOKEN?: string;
  GOOGLE_SHEETS_SPREADSHEET_ID?: string;
  GOOGLE_SHEETS_BOOKINGS_TAB?: string;
  GOOGLE_SHEETS_CASE_STUDIES_TAB?: string;
  GOOGLE_SHEETS_AUDITS_TAB?: string;
  SLACK_LEAD_ALERTS_ENABLED?: string;
  SLACK_BOT_TOKEN?: string;
  SLACK_CHANNEL_ID?: string;
}

export type LeadKind = 'audit' | 'booking' | 'case-study';
export interface LeadRecord {
  kind: LeadKind;
  submissionId: string;
  lead: Record<string, string>;
  pagePath?: string | null;
  details?: Record<string, string>;
  tracking?: unknown;
  emailStatus?: 'SENT' | 'FAILED' | 'DISABLED';
  report?: string;
  answers?: string;
}
export type Defer = (task: Promise<void>) => void;
export function sheetsConfigurationStatus(env: LeadIntegrationEnv): 'disabled' | 'incomplete' | 'configured' {
  if (env.GOOGLE_SHEETS_ENABLED !== 'true') return 'disabled';
  if (!env.GOOGLE_CLIENT_ID?.trim() || !env.GOOGLE_CLIENT_SECRET?.trim() || !env.GOOGLE_SHEETS_REFRESH_TOKEN?.trim()
    || !/^[a-zA-Z0-9_-]{10,200}$/.test(env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() || '')) return 'incomplete';
  return 'configured';
}
type Cells = Record<string, string>;
type IntegrationResult = { saved: boolean; alerted: boolean; code?: string };
const statusHeaders = ['Email Status', 'Email Content', 'Slack Status', 'Slack Message ID'];

// Retain the original workbook's column names, including its historical spelling.
export const SHEET_HEADERS: Record<LeadKind, string[]> = {
  booking: ['Session ID', 'Name', 'Bussiness Name', 'Email', 'Phone_Number', 'Appointment_message',
    'Submition_datetime', 'Appointment_dateTime', 'Appointment Time Zone', 'Page Path', 'Source', 'Tracking', ...statusHeaders],
  'case-study': ['Submission ID', 'Submitted At', 'Name', 'Business Name', 'Email', 'Phone', 'Case Study', 'Page Path',
    'Source', 'Session ID', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Click ID', 'Tracking', ...statusHeaders],
  audit: ['Submission ID', 'Submitted At', 'Name', 'Business Name', 'Email', 'Role', 'Phone', 'Page Path',
    'Source', 'Answers', 'Report Status', 'Tracking', ...statusHeaders],
};

export function sheetTabs(env: LeadIntegrationEnv): Record<LeadKind, string> {
  return {
    booking: env.GOOGLE_SHEETS_BOOKINGS_TAB?.trim() || 'form-bookings-data',
    'case-study': env.GOOGLE_SHEETS_CASE_STUDIES_TAB?.trim() || 'Casestudy-Leads-sheet',
    audit: env.GOOGLE_SHEETS_AUDITS_TAB?.trim() || 'audit-reports',
  };
}
export const sheetRange = (tab: string, cells: string) => `'${tab.replaceAll("'", "''")}'!${cells}`;
export function columnName(index: number): string {
  let result = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) result = String.fromCharCode(65 + (n - 1) % 26) + result;
  return result;
}
class IntegrationError extends Error {
  code: string;
  constructor(code: string) { super(code); this.code = code; }
}

export async function sheetsAccessToken(env: LeadIntegrationEnv, signal: AbortSignal): Promise<string> {
  if (!env.GOOGLE_CLIENT_ID?.trim() || !env.GOOGLE_CLIENT_SECRET?.trim() || !env.GOOGLE_SHEETS_REFRESH_TOKEN?.trim()) {
    throw new IntegrationError('SHEETS_NOT_CONFIGURED');
  }
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal,
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID.trim(), client_secret: env.GOOGLE_CLIENT_SECRET.trim(),
      refresh_token: env.GOOGLE_SHEETS_REFRESH_TOKEN.trim(), grant_type: 'refresh_token' }),
  });
  if (!response.ok) throw new IntegrationError('SHEETS_AUTH_FAILED');
  const token = await response.json() as { access_token?: unknown; token_type?: unknown };
  if (typeof token.access_token !== 'string' || !token.access_token || token.token_type !== 'Bearer') throw new IntegrationError('SHEETS_AUTH_FAILED');
  return token.access_token;
}

export async function sheetsRequest(env: LeadIntegrationEnv, token: string, suffix: string, signal: AbortSignal,
  method = 'GET', body?: unknown): Promise<any> {
  const id = env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() || '';
  if (!/^[a-zA-Z0-9_-]{10,200}$/.test(id)) throw new IntegrationError('SHEETS_NOT_CONFIGURED');
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}${suffix}`, {
    method, signal, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    // Classify known errors without exposing Google response messages or sheet data.
    let reason = '';
    try {
      const error = await response.json() as { error?: { details?: { reason?: string }[]; errors?: { reason?: string }[] } };
      reason = error.error?.details?.find(detail => detail.reason)?.reason || error.error?.errors?.[0]?.reason || '';
    } catch { /* Some upstream failures return no JSON. */ }
    const code = reason === 'SERVICE_DISABLED' || reason === 'accessNotConfigured' ? 'SHEETS_API_DISABLED'
      : reason === 'ACCESS_TOKEN_SCOPE_INSUFFICIENT' ? 'SHEETS_SCOPE_MISSING'
        : response.status === 403 ? 'SHEETS_PERMISSION_DENIED'
          : response.status === 404 ? 'SHEETS_NOT_FOUND' : response.status === 401 ? 'SHEETS_AUTH_FAILED' : 'SHEETS_REQUEST_FAILED';
    throw new IntegrationError(code);
  }
  return response.json();
}

function cellsFor(input: LeadRecord): Cells {
  const { lead, details = {} } = input;
  const tracking = pickTracking(input.tracking);
  const now = new Date().toISOString();
  const common: Cells = {
    'Name': lead.name || '', 'Business Name': lead.businessName || '', 'Email': lead.email || '',
    'Page Path': input.pagePath || '', 'Source': details.source || input.kind, Tracking: JSON.stringify(tracking),
    'Email Status': input.emailStatus || 'DISABLED', 'Email Content': input.report || '',
  };
  if (input.kind === 'booking') return { ...common, 'Session ID': input.submissionId,
    'Bussiness Name': lead.businessName || '', Phone_Number: lead.phone || '',
    Appointment_message: [lead.description, details.conversation].filter(Boolean).join('\n\n'),
    Submition_datetime: now, Appointment_dateTime: details['appointment datetime'] || '',
    'Appointment Time Zone': details.appointmentTimeZone || '', Tracking: JSON.stringify(tracking),
  };
  if (input.kind === 'case-study') return { ...common, 'Submission ID': input.submissionId, 'Submitted At': now,
    Phone: lead.phone || '', 'Case Study': details.caseStudy || '', 'Session ID': input.submissionId,
    'UTM Source': tracking.utm_source || '', 'UTM Medium': tracking.utm_medium || '',
    'UTM Campaign': tracking.utm_campaign || '', 'Click ID': tracking.gclid || tracking.fbclid || tracking.msclkid || '',
  };
  return { ...common, 'Submission ID': input.submissionId, 'Submitted At': now, Role: lead.role || '',
    Phone: lead.phone || '', Answers: input.answers || '', 'Report Status': input.report ? 'GENERATED' : 'FAILED',
    Tracking: JSON.stringify(tracking) };
}

// Serialize writes inside this process. Sheets has no cross-instance unique constraint;
// sequential retries update the existing row, but this is not a distributed exactly-once queue.
const queues = new Map<string, Promise<unknown>>();
function serialized<T>(key: string, run: () => Promise<T>): Promise<T> {
  const task = (queues.get(key) || Promise.resolve()).catch(() => {}).then(run);
  queues.set(key, task);
  void task.finally(() => { if (queues.get(key) === task) queues.delete(key); }).catch(() => {});
  return task;
}

async function saveAndAlert(input: LeadRecord, env: LeadIntegrationEnv): Promise<IntegrationResult> {
  let saved = false;
  try {
    const signal = AbortSignal.timeout(18_000);
    const token = await sheetsAccessToken(env, signal);
    const tab = sheetTabs(env)[input.kind];
    const request = (suffix: string, method = 'GET', body?: unknown) => sheetsRequest(env, token, suffix, signal, method, body);
    const valuePath = (range: string) => `/values/${encodeURIComponent(sheetRange(tab, range))}`;
    const headerData = await request(valuePath('1:1'));
    const headers: string[] = (headerData.values?.[0] || []).map((value: unknown) => String(value).trim());
    const nonempty = headers.filter(Boolean);
    if (new Set(nonempty).size !== nonempty.length || SHEET_HEADERS[input.kind].some(header => !headers.includes(header))) {
      throw new IntegrationError('SHEETS_SCHEMA_MISMATCH');
    }
    const keyHeader = input.kind === 'booking' ? 'Session ID' : 'Submission ID';
    const keyColumn = columnName(headers.indexOf(keyHeader));
    const keys = await request(valuePath(`${keyColumn}2:${keyColumn}`));
    const match = (keys.values || []).findIndex((row: unknown[]) => row[0] === input.submissionId);
    let rowNumber = match < 0 ? 0 : match + 2;
    let existing: string[] = [];
    if (rowNumber) existing = (await request(valuePath(`${rowNumber}:${rowNumber}`))).values?.[0] || [];
    const cells = cellsFor(input);
    cells['Slack Status'] = existing[headers.indexOf('Slack Message ID')] ? 'SENT'
      : env.SLACK_LEAD_ALERTS_ENABLED === 'true' ? 'PENDING' : 'DISABLED';
    // Preserve the original submission time and Slack acknowledgement on retries.
    const values = headers.map((header, i) => {
      if (['Submitted At', 'Submition_datetime'].includes(header) && existing[i]) return existing[i];
      return cells[header] === undefined ? existing[i] || '' : cells[header].slice(0, 45_000);
    });
    if (rowNumber) {
      // Update only owned cells; leave operator columns and their formulas untouched.
      await request('/values:batchUpdate', 'POST', { valueInputOption: 'RAW', data: headers.flatMap((header, index) =>
        cells[header] === undefined ? [] : [{ range: sheetRange(tab, `${columnName(index)}${rowNumber}`), values: [[values[index]]] }]) });
    } else {
      const result = await request(`${valuePath(`A:${columnName(headers.length - 1)}`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, 'POST', { values: [values] });
      rowNumber = Number(/![A-Z]+(\d+):[A-Z]+\d+$/.exec(result.updates?.updatedRange || '')?.[1]);
      if (!rowNumber) throw new IntegrationError('SHEETS_INVALID_RESPONSE');
    }
    saved = true;
    if (env.SLACK_LEAD_ALERTS_ENABLED !== 'true') return { saved, alerted: false };
    if (existing[headers.indexOf('Slack Message ID')]) return { saved, alerted: true };
    const slackToken = env.SLACK_BOT_TOKEN?.trim();
    const channel = env.SLACK_CHANNEL_ID?.trim();
    if (!slackToken || !channel || !/^[CG][A-Z0-9]{8,}$/.test(channel)) throw new IntegrationError('SLACK_NOT_CONFIGURED');
    const lines = [
      `Invent Tomorrow: ${input.kind === 'audit' ? 'Audit report' : input.kind === 'case-study' ? 'Case study lead' : 'Audit booking request'}`,
      `Name: ${input.lead.name || 'Not supplied'}`, `Business: ${input.lead.businessName || 'Not supplied'}`,
      `Email: ${input.lead.email || 'Not supplied'}`, `Phone: ${input.lead.phone || 'Not supplied'}`,
      ...(input.details?.caseStudy ? [`Case study: ${input.details.caseStudy}`] : []),
      ...(input.details?.['appointment datetime'] ? [`Requested appointment: ${input.details['appointment datetime']} (${input.details.appointmentTimeZone})`] : []),
      `Email status: ${input.emailStatus || 'DISABLED'}`, `Page: ${input.pagePath || ''}`, `Submission ID: ${input.submissionId}`,
      ...(input.kind === 'audit' ? [`Report status: ${input.report ? 'GENERATED' : 'FAILED'}`] : []),
      `Sheet: https://docs.google.com/spreadsheets/d/${env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim()}/edit`,
    ];
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST', headers: { Authorization: `Bearer ${slackToken}`, 'Content-Type': 'application/json' },
      // Plain text blocks prevent user-provided Slack markup from mentioning people/channels.
      body: JSON.stringify({ channel, text: 'New Invent Tomorrow lead. Details are in the message.',
        blocks: [{ type: 'section', text: { type: 'plain_text', text: lines.join('\n').slice(0, 2900), emoji: false } }],
        unfurl_links: false, unfurl_media: false }), signal,
    });
    if (!response.ok) throw new IntegrationError('SLACK_SEND_FAILED');
    const slack = await response.json() as { ok?: boolean; ts?: string };
    if (slack.ok !== true || typeof slack.ts !== 'string' || !slack.ts) throw new IntegrationError('SLACK_SEND_FAILED');
    await request('/values:batchUpdate', 'POST', { valueInputOption: 'RAW', data: [
      { range: sheetRange(tab, `${columnName(headers.indexOf('Slack Status'))}${rowNumber}`), values: [['SENT']] },
      { range: sheetRange(tab, `${columnName(headers.indexOf('Slack Message ID'))}${rowNumber}`), values: [[slack.ts]] },
    ] });
    return { saved, alerted: true };
  } catch (error) {
    return { saved, alerted: false, code: error instanceof IntegrationError ? error.code : 'LEAD_INTEGRATION_UNAVAILABLE' };
  }
}

export async function syncLead(input: LeadRecord, env: LeadIntegrationEnv): Promise<IntegrationResult> {
  if (env.GOOGLE_SHEETS_ENABLED !== 'true') return { saved: false, alerted: false, code: 'SHEETS_DISABLED' };
  const key = createHash('sha256').update(JSON.stringify([env.GOOGLE_SHEETS_SPREADSHEET_ID, sheetTabs(env)[input.kind],
    env.GOOGLE_SHEETS_REFRESH_TOKEN])).digest('hex');
  return serialized(key, () => saveAndAlert(input, env));
}

// Optional integrations never turn an accepted email/report into a failed form submission.
// Vercel retains this task with waitUntil; tests/dev may await it directly.
export async function recordLead(input: LeadRecord, env: LeadIntegrationEnv, defer?: Defer): Promise<void> {
  if (env.GOOGLE_SHEETS_ENABLED !== 'true') return;
  const task = syncLead(input, env).then(result => {
    if (result.code) console.warn('[lead-integrations] Delivery unconfirmed', { code: result.code, kind: input.kind });
  }).catch(() => { console.warn('[lead-integrations] Delivery unconfirmed', { code: 'LEAD_INTEGRATION_UNAVAILABLE' }); });
  if (defer) defer(task); else await task;
}
