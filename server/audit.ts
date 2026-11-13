import { randomUUID } from 'node:crypto';
import { validSessionId } from '../src/utils/sessionId.ts';
import { DEFAULT_APPOINTMENT_TIME_ZONE, isUsAppointmentTimeZone } from '../src/utils/appointment.ts';
import { normalizeUsPhone } from './contact.ts';
import { sendToWebhook, webhookTarget, webhookUrl, type WebhookEnv, type WebhookResult } from './webhook.ts';
import { calculateAudit, COMPANY_SIZE_OPTIONS, FOUNDING_SPOTS_LEFT, parseAuditAnswers, type AuditEstimates } from '../src/utils/freeAudit.ts';
import { AUDIT_EMAIL_SYSTEM_PROMPT } from './auditPrompts.ts';
import { pickTracking, type Tracking } from '../src/utils/attribution.ts';

// Live n8n ("Structure Fields2") reads p.utm_source etc. at the top level, while the
// maintained export reads p.tracking.*, so send both: the same allowlisted values.
function trackingFields(raw: unknown): Record<string, string | Tracking> {
  const tracking = pickTracking(raw);
  return { ...tracking, tracking };
}

// Owners often type "brighthome.com"; accept it as https://brighthome.com.
function normalizeWebsite(raw: unknown): string {
  if (typeof raw !== 'string' || raw.length > 2048) return '';
  const typed = raw.trim();
  if (!typed) return '';
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(typed) ? typed : `https://${typed}`);
    return ['https:', 'http:'].includes(url.protocol) && url.hostname.includes('.') && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

interface AuditResult {
  status: number;
  body: { success?: boolean; submissionId?: string; results?: AuditEstimates; error?: string; code?: string };
}

const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 10;

function deliveryError(sent: WebhookResult, submissionId: string, event: string, env: WebhookEnv, resultMismatch = false): AuditResult {
  const code = sent.failure === 'http_error' ? (sent.status === 404 ? 'WEBHOOK_NOT_REGISTERED' : 'WEBHOOK_HTTP_ERROR')
    : sent.failure === 'timeout' ? 'WEBHOOK_TIMEOUT'
    : sent.failure === 'network_error' ? 'WEBHOOK_NETWORK_ERROR'
    : sent.failure ? 'WEBHOOK_INVALID_RESPONSE'
    : resultMismatch ? 'WEBHOOK_AUDIT_MISMATCH' : 'WEBHOOK_ACK_MISMATCH';
  const data = sent.data && typeof sent.data === 'object' && !Array.isArray(sent.data)
    ? sent.data as Record<string, unknown> : null;
  // No URLs, response bodies, credentials or contact details in logs/public errors.
  console.warn('[audit] n8n submission failed', {
    code, event, submissionId, target: webhookTarget(env), upstreamStatus: sent.status,
    failure: sent.failure, success: data?.success === true,
    hasSubmissionId: typeof data?.submission_id === 'string', idMatches: data?.submission_id === submissionId,
  });
  return { status: 502, body: {
    error: event === 'quick_audit_completed'
      ? "We couldn't confirm your audit was saved. Your details are still here; please try again."
      : code === 'WEBHOOK_ACK_MISMATCH'
        ? "We couldn't confirm your request was saved. Your details are still here; please try again."
        : "We couldn't send your request. Please try again.",
    code,
  } };
}

function acknowledged(data: unknown, submissionId: string): data is Record<string, unknown> {
  return !!data && typeof data === 'object' && !Array.isArray(data)
    && (data as Record<string, unknown>).success === true
    && (data as Record<string, unknown>).submission_id === submissionId;
}

function returnedEstimates(data: Record<string, unknown>, expected: AuditEstimates): AuditEstimates | null {
  if (data.audit_complete !== true || !data.audit || typeof data.audit !== 'object' || Array.isArray(data.audit)) return null;
  const audit = data.audit as Record<string, unknown>;
  const result = {
    missedCallsMonth: audit.missed_calls_month, missedCallValue: audit.missed_call_value,
    oldQuotesNumber: audit.old_quotes_number, revivalValue: audit.revival_value,
    guaranteeStatus: audit.guarantee_status,
  };
  // Reject stale/differently configured workflows rather than show different
  // figures in the chat and email. Never fall back to revealing local results.
  if (Object.entries(expected).some(([key, value]) => result[key as keyof typeof result] !== value)) return null;
  return result as AuditEstimates;
}

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  if (hits.size > 5000) {
    for (const [key, times] of hits) if (times.every((time) => now - time >= WINDOW_MS)) hits.delete(key);
  }
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
}

function parseAppointment(raw: Record<string, unknown>) {
  const appointmentDateTime = typeof raw['appointment datetime'] === 'string' ? raw['appointment datetime'].trim() : '';
  const appointmentTimeZone = raw.appointmentTimeZone === undefined ? DEFAULT_APPOINTMENT_TIME_ZONE
    : typeof raw.appointmentTimeZone === 'string' ? raw.appointmentTimeZone.trim() : '';
  if (!/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/.test(appointmentDateTime)) return null;
  const appointmentDate = appointmentDateTime.slice(0, 10);
  const date = new Date(`${appointmentDate}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== appointmentDate) return null;
  if (!isUsAppointmentTimeZone(appointmentTimeZone)) return null;
  try {
    // Compare in the selected zone, independent of the server's own clock zone.
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: appointmentTimeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date());
    const get = (type: string) => parts.find((part) => part.type === type)?.value;
    const now = `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
    if (appointmentDateTime <= now) return null;
  } catch {
    return null;
  }
  return { 'appointment datetime': appointmentDateTime, appointmentTimeZone };
}

async function submitQuickAudit(raw: Record<string, unknown>, env: WebhookEnv): Promise<AuditResult> {
  const answers = parseAuditAnswers(raw.answers);
  const email = typeof raw.email === 'string' ? raw.email.trim() : '';
  const phone = typeof raw.phone === 'string' && raw.phone.length <= 40 ? normalizeUsPhone(raw.phone) : null;
  const companySize = COMPANY_SIZE_OPTIONS.find((size) => size === raw.companySize);
  const pagePath = raw.pagePath === '/free-audit' || raw.pagePath === '/free-audit-ads' ? raw.pagePath : null;
  const website = raw.noWebsite === true ? 'none' : normalizeWebsite(raw.website);
  if (!answers || !companySize || !pagePath || !website || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 400, body: { error: 'Please complete your audit, email, website and company size.' } };
  }
  if (!phone) return { status: 400, body: { error: 'Please enter a valid US phone number, including the area code.' } };
  const url = webhookUrl(env);
  if (!url) return { status: 503, body: { error: 'The form is temporarily unavailable. Please try again later.' } };
  const submissionId = typeof raw.submissionId === 'string' && /^[a-zA-Z0-9-]{16,64}$/.test(raw.submissionId) ? raw.submissionId : randomUUID();
  const results = calculateAudit(answers);
  const sent = await sendToWebhook(url, {
    source: 'form_data', event: 'quick_audit_completed', submissionId,
    sessionId: validSessionId(raw.sessionId) || randomUUID(),
    timestamp: new Date().toISOString(), pagePath, ...trackingFields(raw.tracking),
    lead: { name: '', businessName: answers.businessName, email, phone, website, companySize, description: 'Completed the four-question quick audit' },
    answers, estimates: results, leadCaptured: true,
    smsConsent: { granted: true, text: 'By sharing your number you agree we can text you about your audit. Reply STOP to opt out.' },
    auditEmail: {
      systemPrompt: AUDIT_EMAIL_SYSTEM_PROMPT,
      data: {
        business_name: answers.businessName, company_size: companySize, website,
        missed_calls_answer: answers.missedCalls, missed_calls_month: results.missedCallsMonth,
        missed_call_value: results.missedCallValue, old_quotes_answer: answers.oldQuotes,
        old_quotes_number: results.oldQuotesNumber, revival_value: results.revivalValue,
        typical_clean_answer: answers.typicalClean, guarantee_status: results.guaranteeStatus,
        founding_spots_left: FOUNDING_SPOTS_LEFT,
        subject_opportunity: results.revivalValue !== null && results.revivalValue > results.missedCallValue ? 'old_quotes' : 'missed_calls',
        booking_link: 'https://www.inventtomorrow.pro/free-audit?book=1',
      },
    },
  });
  const confirmed = sent.ok && acknowledged(sent.data, submissionId) ? returnedEstimates(sent.data, results) : null;
  if (!confirmed) return deliveryError(sent, submissionId, 'quick_audit_completed', env, sent.ok && acknowledged(sent.data, submissionId));
  return { status: 200, body: { success: true, submissionId, results: confirmed } };
}

export async function handleAudit(input: unknown, ip: string, env: WebhookEnv): Promise<AuditResult> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { status: 400, body: { error: 'Please check your details and try again.' } };
  }
  if (rateLimited(ip)) return { status: 429, body: { error: 'Too many requests. Please try again shortly.' } };
  const raw = input as Record<string, unknown>;
  if (raw.mode === 'quick_audit') return submitQuickAudit(raw, env);
  const limits = { name: 120, businessName: 160, email: 254, phone: 40, description: 1000 };
  const lead = { name: '', businessName: '', email: '', phone: '', description: '' };
  for (const key of Object.keys(limits) as (keyof typeof limits)[]) {
    const value = raw[key];
    if ((value !== undefined && typeof value !== 'string') || (typeof value === 'string' && value.length > limits[key])) {
      return { status: 400, body: { error: 'Please check your details and try again.' } };
    }
    lead[key] = typeof value === 'string' ? value.trim() : '';
  }
  if (!lead.name || !lead.businessName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return { status: 400, body: { error: 'Please enter your name, business name and a valid email address.' } };
  }
  const phone = normalizeUsPhone(lead.phone);
  if (!phone) return { status: 400, body: { error: 'Please enter a valid US phone number, including the area code.' } };
  lead.phone = phone;
  const appointment = parseAppointment(raw);
  if (!appointment) return { status: 400, body: { error: 'Please choose a valid future appointment date, time and time zone.' } };
  const url = webhookUrl(env);
  if (!url) return { status: 503, body: { error: 'The form is temporarily unavailable. Please try again later.' } };
  // A stable client id lets n8n deduplicate a retry after an interrupted response.
  const submissionId = typeof raw.submissionId === 'string' && /^[a-zA-Z0-9-]{16,64}$/.test(raw.submissionId)
    ? raw.submissionId : randomUUID();
  const pagePath = typeof raw.pagePath === 'string' && ['/free-audit', '/free-audit-ads', '/contact'].includes(raw.pagePath)
    ? raw.pagePath : null;
  const sent = await sendToWebhook(url, {
    source: 'form_data',
    event: 'audit_request',
    submissionId,
    sessionId: validSessionId(raw.sessionId) || randomUUID(),
    timestamp: new Date().toISOString(),
    pagePath,
    ...trackingFields(raw.tracking),
    lead,
    ...appointment,
    leadCaptured: true,
  });
  if (!sent.ok || !acknowledged(sent.data, submissionId)) return deliveryError(sent, submissionId, 'audit_request', env);
  return { status: 200, body: { success: true, submissionId } };
}
