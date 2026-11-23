import { randomUUID } from 'node:crypto';
import { DEFAULT_APPOINTMENT_TIME_ZONE, isUsAppointmentTimeZone } from '../src/utils/appointment.ts';
import { normalizeUsPhone } from './contact.ts';
// Same website rule as the audit form: "brighthome.com" becomes https://brighthome.com/.
import { normalizeWebsite } from '../src/utils/contactChecks.ts';
import { deliverForm } from './formDelivery.ts';
import { calculateAudit, COMPANY_SIZE_OPTIONS, parseAuditAnswers, type AuditEstimates } from '../src/utils/freeAudit.ts';
import { calculateReadinessScore, parseReadinessAnswers, READINESS_COMPANY_SIZES, READINESS_QUESTION_COUNT, readinessReport, type ReadinessResults } from '../src/utils/readinessScorecard.ts';
import { BUSINESS_AUDIT_QUESTION_COUNT, businessAuditReportText, parseBusinessAuditAnswers, type BusinessAuditReport } from '../src/utils/businessAudit.ts';
import { AuditReportError, generateBusinessAuditReport, type AuditReportEnv } from './businessAuditReport.ts';
import { gmailAuditEnabled, sendAuditReportEmail, type GmailEnv } from './gmail.ts';
import { renderBusinessAuditEmail } from './auditEmail.ts';

type AuditEnv = AuditReportEnv & GmailEnv;

interface AuditResult {
  status: number;
  body: { success?: boolean; submissionId?: string; results?: AuditEstimates; scorecard?: ReadinessResults; report?: BusinessAuditReport; reportEmailSent?: boolean; error?: string; code?: string };
}

const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 10;

function mailError(code: string): AuditResult {
  console.warn('[audit] Email delivery unconfirmed', { code });
  return { status: code === 'GMAIL_DISABLED' || code === 'GMAIL_NOT_CONFIGURED' ? 503 : 502,
    body: { code, error: "We couldn't send your request. Your details are still here; please try again." } };
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

async function submitQuickAudit(raw: Record<string, unknown>, env: GmailEnv): Promise<AuditResult> {
  const answers = parseAuditAnswers(raw.answers);
  const email = typeof raw.email === 'string' ? raw.email.trim() : '';
  const phone = typeof raw.phone === 'string' && raw.phone.length <= 40 ? normalizeUsPhone(raw.phone) : null;
  const companySize = COMPANY_SIZE_OPTIONS.find((size) => size === raw.companySize);
  const pagePath = raw.pagePath === '/free-audit' || raw.pagePath === '/free-audit-ads' ? raw.pagePath : null;
  const website = raw.noWebsite === true ? 'none' : normalizeWebsite(raw.website);
  if (!website && raw.noWebsite !== true && answers && companySize && pagePath) {
    return { status: 400, body: { error: 'Please enter a valid website, like brighthome.com, or tick "No website yet".' } };
  }
  if (!answers || !companySize || !pagePath || !website || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 400, body: { error: 'Please complete your audit, email, website and company size.' } };
  }
  if (!phone) return { status: 400, body: { error: 'Please enter a valid US phone number, including the area code.' } };
  const submissionId = typeof raw.submissionId === 'string' && /^[a-zA-Z0-9-]{16,64}$/.test(raw.submissionId) ? raw.submissionId : randomUUID();
  const results = calculateAudit(answers);
  const text = [
    'Your quick audit - ' + answers.businessName, '', 'These figures are rough estimates from your answers.',
    'Estimated missed calls per month: ' + results.missedCallsMonth,
    'Estimated monthly missed-call value: $' + results.missedCallValue,
    ...(results.revivalValue === null ? [] : ['Estimated one-off old-quote opportunity: $' + results.revivalValue]),
    '', 'Book your free call: https://www.inventtomorrow.pro/free-audit?book=1',
  ].join('\n');
  const delivery = await sendAuditReportEmail({ to: email, submissionId, text, subject: 'Your quick audit - Invent Tomorrow' }, env);
  if (!delivery.sent && 'code' in delivery) return mailError(delivery.code);
  return { status: 200, body: { success: true, submissionId, results, reportEmailSent: true } };
}

// Short case-study unlock form; notify the configured team mailbox before unlocking.
async function submitCaseStudyUnlock(raw: Record<string, unknown>, env: GmailEnv): Promise<AuditResult> {
  const limits = { name: 120, businessName: 160, email: 254, phone: 40 };
  const lead = { name: '', businessName: '', email: '', phone: '' };
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
  const caseStudySlug = typeof raw.caseStudySlug === 'string' && /^[a-z0-9-]{1,100}$/.test(raw.caseStudySlug) ? raw.caseStudySlug : null;
  if (!caseStudySlug) return { status: 400, body: { error: 'Please check your details and try again.' } };
  const submissionId = typeof raw.submissionId === 'string' && /^[a-zA-Z0-9-]{16,64}$/.test(raw.submissionId) ? raw.submissionId : randomUUID();
  const delivery = await deliverForm({ subject: 'Case study unlocked - Invent Tomorrow', submissionId,
    lead: { ...lead, phone }, pagePath: '/our-work/' + caseStudySlug, details: { caseStudy: caseStudySlug }, tracking: raw.tracking }, env);
  if (!delivery.sent && 'code' in delivery) return mailError(delivery.code);
  return { status: 200, body: { success: true, submissionId } };
}

async function submitBusinessAudit(raw: Record<string, unknown>, env: AuditEnv): Promise<AuditResult> {
  const answers = parseBusinessAuditAnswers(raw.answers);
  if (!answers) return { status: 400, body: { error: `Please answer all ${BUSINESS_AUDIT_QUESTION_COUNT} audit questions and select up to two lead sources.` } };
  const limits = { name: 120, businessName: 160, email: 254, role: 120 };
  const lead = { name: '', businessName: '', email: '', role: '' };
  for (const key of Object.keys(limits) as (keyof typeof limits)[]) {
    const value = raw[key];
    if (typeof value !== 'string' || !value.trim() || value.length > limits[key]) {
      return { status: 400, body: { error: 'Please enter your name, work email, business name and role.' } };
    }
    lead[key] = value.trim();
  }
  const pagePath = raw.pagePath === '/free-audit' || raw.pagePath === '/free-audit-ads' ? raw.pagePath : null;
  if (!pagePath || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return { status: 400, body: { error: 'Please enter a valid work email and try again.' } };
  }
  const submissionId = typeof raw.submissionId === 'string' && /^[a-zA-Z0-9-]{16,64}$/.test(raw.submissionId) ? raw.submissionId : randomUUID();
  let report: BusinessAuditReport;
  try { report = await generateBusinessAuditReport(lead.businessName, answers, env); }
  catch (error) {
    if (error instanceof AuditReportError) return { status: error.status, body: { code: error.code, error: error.message } };
    return { status: 502, body: { code: 'AUDIT_AI_UNAVAILABLE', error: "We couldn't prepare your report. Please try again; your answers are still here." } };
  }
  let reportEmailSent = false;
  if (gmailAuditEnabled(env)) {
    const delivery = await sendAuditReportEmail({ to: lead.email, submissionId, text: businessAuditReportText(report), html: renderBusinessAuditEmail(report) }, env);
    reportEmailSent = delivery.sent;
    if (!delivery.sent && 'code' in delivery) console.warn('[audit] Gmail report delivery unconfirmed', { code: delivery.code });
  }
  return { status: 200, body: { success: true, submissionId, report, reportEmailSent } };
}

async function submitReadinessScorecard(raw: Record<string, unknown>, env: GmailEnv): Promise<AuditResult> {
  const answers = parseReadinessAnswers(raw.answers);
  if (!answers) return { status: 400, body: { error: `Please answer all ${READINESS_QUESTION_COUNT} audit questions.` } };
  const limits = { name: 120, businessName: 160, email: 254, role: 120 };
  const lead = { name: '', businessName: '', email: '', role: '' };
  for (const key of Object.keys(limits) as (keyof typeof limits)[]) {
    const value = raw[key];
    if (typeof value !== 'string' || !value.trim() || value.length > limits[key]) {
      return { status: 400, body: { error: 'Please enter your name, work email, company and role.' } };
    }
    lead[key] = value.trim();
  }
  const companySize = READINESS_COMPANY_SIZES.find((size) => size === raw.companySize);
  const pagePath = raw.pagePath === '/free-audit' || raw.pagePath === '/free-audit-ads' ? raw.pagePath : null;
  if (!companySize || !pagePath || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return { status: 400, body: { error: 'Please enter a valid work email and company size.' } };
  }
  const submissionId = typeof raw.submissionId === 'string' && /^[a-zA-Z0-9-]{16,64}$/.test(raw.submissionId) ? raw.submissionId : randomUUID();
  const scorecard = calculateReadinessScore(answers);
  const delivery = await sendAuditReportEmail({ to: lead.email, submissionId, text: readinessReport(answers, scorecard),
    subject: 'Your AI readiness scorecard - Invent Tomorrow' }, env);
  if (!delivery.sent && 'code' in delivery) return mailError(delivery.code);
  return { status: 200, body: { success: true, submissionId, scorecard, reportEmailSent: true } };
}

export async function handleAudit(input: unknown, ip: string, env: AuditEnv): Promise<AuditResult> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { status: 400, body: { error: 'Please check your details and try again.' } };
  }
  if (rateLimited(ip)) return { status: 429, body: { error: 'Too many requests. Please try again shortly.' } };
  const raw = input as Record<string, unknown>;
  if (raw.mode === 'cleaning_business_audit') return submitBusinessAudit(raw, env);
  if (raw.mode === 'readiness_scorecard') return submitReadinessScorecard(raw, env);
  if (raw.mode === 'quick_audit') return submitQuickAudit(raw, env);
  if (raw.mode === 'case_study_unlock') return submitCaseStudyUnlock(raw, env);
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
  const submissionId = typeof raw.submissionId === 'string' && /^[a-zA-Z0-9-]{16,64}$/.test(raw.submissionId) ? raw.submissionId : randomUUID();
  const pagePath = typeof raw.pagePath === 'string' && ['/free-audit', '/free-audit-ads', '/contact'].includes(raw.pagePath) ? raw.pagePath : null;
  const delivery = await deliverForm({ subject: 'New audit request - Invent Tomorrow', submissionId, lead,
    pagePath, details: appointment, tracking: raw.tracking }, env);
  if (!delivery.sent && 'code' in delivery) return mailError(delivery.code);
  return { status: 200, body: { success: true, submissionId } };
}
