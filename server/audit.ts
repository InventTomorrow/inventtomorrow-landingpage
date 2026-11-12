import { randomUUID } from 'node:crypto';
import { DEFAULT_APPOINTMENT_TIME_ZONE, isUsAppointmentTimeZone } from '../src/utils/appointment.ts';
import { normalizeUsPhone } from './contact.ts';
import { sendToWebhook, webhookUrl, type WebhookEnv } from './webhook.ts';

interface AuditResult {
  status: number;
  body: { success?: boolean; submissionId?: string; error?: string };
}

const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 10;

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

export async function handleAudit(input: unknown, ip: string, env: WebhookEnv): Promise<AuditResult> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { status: 400, body: { error: 'Please check your details and try again.' } };
  }
  if (rateLimited(ip)) return { status: 429, body: { error: 'Too many requests. Please try again shortly.' } };
  const raw = input as Record<string, unknown>;
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
    timestamp: new Date().toISOString(),
    pagePath,
    lead,
    ...appointment,
    leadCaptured: true,
  });
  if (!sent) return { status: 502, body: { error: "We couldn't send your request. Please try again." } };
  return { status: 200, body: { success: true, submissionId } };
}
