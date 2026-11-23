// Shared server-side core, kept outside api/ so Vercel only creates the intended chat endpoint.
// Used by the Vercel function (api/chat.ts) and by the
// Vite dev server (vite.config.ts), so the API key never reaches the browser.
import { normalizeUsPhone } from './contact.ts';
import { INVO_SYSTEM_PROMPT } from './auditPrompts.ts';
import { AUDIT_PRICING_REPLY, AUDIT_QUESTIONS, predefinedAuditReply } from '../src/utils/freeAudit.ts';
import { cannedReply, cannedText, stripGreeting } from '../src/utils/cannedAnswers.ts';
import { randomUUID } from 'node:crypto';
import { validSessionId } from '../src/utils/sessionId.ts';
import { deliverForm } from './formDelivery.ts';
import type { GmailEnv } from './gmail.ts';
import type { Defer, LeadIntegrationEnv } from './leadIntegrations.ts';
export { normalizeUsPhone } from './contact.ts';

export interface ChatEnv extends GmailEnv, LeadIntegrationEnv {
  KOBOILLM_API_KEY?: string;
  KOBOILLM_BASE_URL?: string;
  KOBOILLM_MODEL?: string;
}

export interface BookingDetails {
  name: string;
  businessName: string;
  email: string;
  phone?: string;
  description?: string;
}

export interface ChatResult {
  status: number;
  // Model and total request time; no transcript delivery runs in the background.
  timings?: Record<string, number>;
  body: { reply?: string; booking?: BookingDetails; directLink?: boolean; contact?: { email: string; phone: string }; requestSent?: boolean; error?: string; loggingDisabled?: boolean };
}

const MAX_MESSAGES = 200;
const MAX_MESSAGE_CHARS = 1500;
const MAX_ASSISTANT_MESSAGE_CHARS = 12_000;
const RATE_LIMIT = 30; // requests per IP per window
const RATE_WINDOW_MS = 10 * 60 * 1000;

// Luna supports this existing Chat Completions/tool flow with reasoning disabled.
// Keep provider overrides compatible with older non-reasoning models.
function modelParameters(env: ChatEnv, outputTokens: number, temperature: number) {
  const model = env.KOBOILLM_MODEL || 'gpt-6-luna';
  return {
    model,
    ...(/(?:^|\/)gpt-6-luna(?:$|-)/.test(model)
      ? { reasoning_effort: 'none', max_completion_tokens: outputTokens }
      : { temperature, max_tokens: outputTokens }),
  };
}

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'submit_audit_contact',
      description:
        'Call only when the visitor explicitly wants to book right now, is in a hurry, or asks for the booking link, AND has typed their email and a valid US phone number. Submits an audit request for the team to follow up.',
      parameters: {
        type: 'object',
        properties: {
          email: { type: 'string', description: 'Email address exactly as the visitor typed it' },
          phone: { type: 'string', description: 'US phone number exactly as the visitor typed it' },
        },
        required: ['email', 'phone'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'submit_booking_details',
      description:
        'Call once the visitor has typed their name, business name, email and a valid US phone number. Submits an audit request for the team to follow up and arrange a time.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: "Visitor's full name" },
          businessName: { type: 'string', description: 'Business name' },
          email: { type: 'string', description: 'Email address' },
          phone: { type: 'string', description: 'US phone number exactly as the visitor typed it' },
          description: { type: 'string', description: 'One-line summary of what the visitor shared: type of cleaning, team size, tools, biggest pain. Empty if nothing shared.' },
        },
        required: ['name', 'businessName', 'email', 'phone'],
      },
    },
  },
];

const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
  }
  return recent.length > RATE_LIMIT;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function parseMessages(input: unknown): ChatMessage[] | null {
  const raw = (input as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) return null;
  const out: ChatMessage[] = [];
  for (const m of raw) {
    const role = (m as ChatMessage)?.role;
    const content = (m as ChatMessage)?.content;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    const text = content.trim().slice(0, role === 'assistant' ? MAX_ASSISTANT_MESSAGE_CHARS : MAX_MESSAGE_CHARS);
    if (text) out.push({ role, content: text });
  }
  return out.some((m) => m.role === 'user') && out[out.length - 1].role === 'user' ? out : null;
}

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function parseBooking(args: string): BookingDetails | null {
  try {
    const a = JSON.parse(args) as Record<string, unknown>;
    const booking: BookingDetails = {
      name: clean(a.name, 120),
      businessName: clean(a.businessName, 160),
      email: clean(a.email, 254),
      phone: clean(a.phone, 40),
      description: clean(a.description, 1000),
    };
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email);
    return booking.name && booking.businessName && emailOk ? booking : null;
  } catch {
    return null;
  }
}

// The model must never invent booking details: each one has to appear in what the visitor typed.
const words = (text: string) => text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
const PHONE_ASK = "What's your phone number?";
const PHONE_INVALID = "That doesn't look like a valid US phone number. Could you enter it with the area code?";

// The latest valid email and US phone the visitor typed, found directly in their messages. A visitor who
// corrects a wrong number gets the new one saved, whatever the model passes along.
export function lastTypedContact(messages: ChatMessage[]): { email?: string; phone?: string } {
  const found: { email?: string; phone?: string } = {};
  for (const m of messages) {
    if (m.role !== 'user') continue;
    for (const email of m.content.match(/[^\s@,;:<>()"']+@[^\s@,;:<>()"']+\.[A-Za-z]{2,}/g) ?? []) found.email = email;
    for (const candidate of m.content.match(/(?:\+?1[\s.\-]*)?\(?\d{3}\)?[\s.\-]*\d{3}[\s.\-]*\d{4}/g) ?? []) {
      const phone = normalizeUsPhone(candidate);
      if (phone) found.phone = phone;
    }
  }
  return found;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const typedBy = (messages: ChatMessage[]) => messages.filter((m) => m.role === 'user').map((m) => m.content).join(' \n ');

// Email and a valid US phone are compulsory, and both must be what the visitor actually typed.
function contactProblem(email: string, phone: string, messages: ChatMessage[]): string | null {
  const typed = typedBy(messages);
  if (!EMAIL_RE.test(email) || !typed.toLowerCase().includes(email.toLowerCase())) return "What's your email address?";
  const normalized = normalizeUsPhone(phone);
  if (!normalized) return phone ? PHONE_INVALID : PHONE_ASK;
  if (!typed.replace(/\D/g, '').includes(normalized.slice(2))) return PHONE_ASK;
  return null;
}

function missingDetail(booking: BookingDetails, messages: ChatMessage[]): string | null {
  const typedWords = new Set(words(typedBy(messages)));
  const allTyped = (value: string) => words(value).length > 0 && words(value).every((w) => typedWords.has(w));
  if (!allTyped(booking.name)) return "What's your name?";
  if (!allTyped(booking.businessName)) return "What's your cleaning business called?";
  return contactProblem(booking.email, booking.phone ?? '', messages);
}

// A question about OUR price. Not a remark about the visitor's own prices
// ("a clean costs $150") or what they could earn ("how much am I losing?").
export function isPricingQuestion(text: string): boolean {
  const t = text.trim().toLowerCase().replace(/[’‘]/g, "'");
  if (/\b(?:guarantee|90 days?|qualif\w*)\b/.test(t)) return false;
  if (/\b(?:my|our) (?:cleans?|customers?|clients?|rates?|prices?|jobs?)\b|\bper (?:clean|hour)\b|\b(?:we|i) charge\b/.test(t)) return false;
  const aboutPrice = /\b(?:pric(?:e|es|ed|ing)|costs?|fees?|charges?)\b/.test(t)
    || /\bhow much (?:is|are|do|does|would|will|for)\b(?!.*\b(?:lose|losing|lost|make|making|earn|earning|worth|save|saving|miss|missing)\b)/.test(t);
  const asking = /\?|^(?:what|how|is|are|do|does|can|could|tell me)\b|^(?:price|prices|pricing|cost|costs|fees?)[.!]*$/.test(t);
  return aboutPrice && asking;
}

type AuditProgress = 1 | 2 | 3 | 4 | 'done';
function auditProgress(value: unknown): AuditProgress | null {
  return value === 'done' || value === 1 || value === 2 || value === 3 || value === 4 ? value : null;
}

// Where the visitor is in the quick audit, so the model neither restarts it nor
// asks its questions in free text (the interface owns those questions).
function auditStateNote(progress: AuditProgress | null): string {
  if (progress === 'done') {
    return '\n\nCURRENT STATE: The visitor has finished the quick audit and can see their estimates. Do not restart it or ask its questions again. If they want to go through their numbers with us, point them to the "Book my 15-minute call" button.';
  }
  if (progress === null) return '';
  return `\n\nCURRENT STATE: The visitor is answering question ${progress} of 4 of the quick audit ("${AUDIT_QUESTIONS[progress - 1]}"). Answer their message briefly, in one or two short sentences. Do not ask that question or any other audit question yourself, and do not tell them to press "Book my free audit": the chat shows the question again right after your reply.`;
}

// Chat bubbles show plain text, so Markdown from the model would appear as stray symbols.
export function plainChatText(text: string): string {
  return text
    .replace(/\*\*([^*\n]+)\*\*/g, '$1').replace(/__([^_\n]+)__/g, '$1')
    .replace(/^#{1,6}[ \t]+/gm, '')
    .replace(/^[ \t]*[-*+][ \t]+/gm, '• ')
    .replace(/\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1 ($2)')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function runChat(input: unknown, ip: string, env: ChatEnv): Promise<ChatResult> {
  const messages = parseMessages(input);
  if (!messages) return { status: 400, body: { error: 'Invalid request.' } };

  const question = messages.at(-1)?.content ?? '';
  const guided = (input as { experience?: string })?.experience === 'guided-audit';
  const progress = guided ? auditProgress((input as { state?: { auditProgress?: unknown } })?.state?.auditProgress) : null;
  // Once the audit has started, canned replies drop their "start the audit" invitation.
  // "hi, I'm missing calls" is understood like "I'm missing calls".
  const predefined = predefinedAuditReply(question) ?? predefinedAuditReply(stripGreeting(question));
  if (predefined) return { status: 200, body: { reply: progress ? predefined.replace(/\n\n[^\n]*Book my free audit[^\n]*$/, '') : predefined } };
  if (isPricingQuestion(question)) {
    return { status: 200, body: { reply: progress ? AUDIT_PRICING_REPLY.replace(/\s*Want me to book it\?$/, '') : AUDIT_PRICING_REPLY } };
  }
  // Greetings and the most common questions have fixed answers: instant, and no AI call.
  const canned = guided ? cannedReply(question) : undefined;
  if (canned) return { status: 200, body: { reply: cannedText(canned, progress !== null) } };
  const apiKey = env.KOBOILLM_API_KEY;
  if (!apiKey) return { status: 503, body: { error: 'Chat is not configured.' } };

  const baseUrl = (env.KOBOILLM_BASE_URL || 'https://api.koboillm.com/v1').replace(/\/+$/, '');
  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        ...modelParameters(env, 1200, 0.3),
        messages: [{ role: 'system', content: INVO_SYSTEM_PROMPT + auditStateNote(progress) }, ...messages.slice(-30)],
        ...(guided ? {} : { tools: TOOLS }),
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!upstream.ok) return { status: 502, body: { error: 'The assistant is unavailable right now.' } };

    const data = (await upstream.json()) as {
      choices?: { message?: { content?: string | null; tool_calls?: { function?: { name?: string; arguments?: string } }[] } }[];
    };
    const message = data.choices?.[0]?.message;
    const linkCall = message?.tool_calls?.find((t) => t.function?.name === 'submit_audit_contact');
    if (linkCall && !message?.tool_calls?.some((t) => t.function?.name === 'submit_booking_details')) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(linkCall.function?.arguments ?? '{}') as Record<string, unknown>;
      } catch {
        /* treated as missing details below */
      }
      const typedContact = lastTypedContact(messages);
      const email = typedContact.email ?? clean(args.email, 254);
      const phone = typedContact.phone ?? clean(args.phone, 40);
      const problem = contactProblem(email, phone, messages);
      if (problem) return { status: 200, body: { reply: problem } };
      return { status: 200, body: { reply: 'Your audit details are ready.', directLink: true, contact: { email, phone: normalizeUsPhone(phone) ?? '' } } };
    }
    const call = message?.tool_calls?.find((t) => t.function?.name === 'submit_booking_details');
    if (call) {
      const booking = parseBooking(call.function?.arguments ?? '');
      if (booking) {
        const typedContact = lastTypedContact(messages);
        booking.email = typedContact.email ?? booking.email;
        booking.phone = typedContact.phone ?? booking.phone;
        const missing = missingDetail(booking, messages);
        if (missing) return { status: 200, body: { reply: missing } };
        booking.phone = normalizeUsPhone(booking.phone ?? '') ?? '';
        return { status: 200, body: { booking, reply: 'Your audit details are ready.' } };
      }
      return { status: 200, body: { reply: 'Something looks off in those details. Could you check your email address and phone number?' } };
    }
    const reply = plainChatText(message?.content ?? '');
    if (!reply) return { status: 502, body: { error: 'The assistant is unavailable right now.' } };
    return { status: 200, body: { reply } };
  } catch {
    return { status: 502, body: { error: 'The assistant is unavailable right now.' } };
  }
}

type Lead = { name?: string; businessName?: string; email?: string; phone?: string; description?: string };

const EXTRACT_PROMPT = `You read a chat between a website visitor and an assistant for a cleaning business service. Extract the details the VISITOR has typed. Reply with JSON only, in this shape:
{"name": string|null, "businessName": string|null, "email": string|null, "phone": string|null, "mainConcern": string|null}
Rules: use only what the visitor actually wrote; use null for anything not given, skipped or unclear. "name" is the visitor's own name, never their company. "businessName" is their cleaning company's name. "phone" exactly as written. "mainConcern" is one short line (under 20 words) saying what they want help with, for example missed calls, cold quotes, follow ups, reviews or repeat bookings, plus any detail they gave such as team size or software; null if they have not said. Asking for an audit, a call or a booking is NOT a concern, so use null for that.`;

// Reads the contact details the visitor has typed so far, so they can be saved as soon as they are given.
// Every value is checked against the visitor's own words, so nothing invented can be saved.
async function extractLead(messages: ChatMessage[], env: ChatEnv): Promise<Lead | null> {
  if (!env.KOBOILLM_API_KEY) return null;
  const baseUrl = (env.KOBOILLM_BASE_URL || 'https://api.koboillm.com/v1').replace(/\/+$/, '');
  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.KOBOILLM_API_KEY}` },
      body: JSON.stringify({
        ...modelParameters(env, 220, 0),
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: EXTRACT_PROMPT },
          { role: 'user', content: messages.map((m) => `${m.role === 'user' ? 'Visitor' : 'Assistant'}: ${m.content}`).join('\n') },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!upstream.ok) return null;
    const data = (await upstream.json()) as { choices?: { message?: { content?: string | null } }[] };
    const raw = JSON.parse(data.choices?.[0]?.message?.content ?? '{}') as Record<string, unknown>;

    const typed = messages.filter((m) => m.role === 'user').map((m) => m.content).join(' \n ');
    const typedWords = new Set(words(typed));
    const typedDigits = typed.replace(/\D/g, '');
    const allTyped = (value: string) => words(value).length > 0 && words(value).every((w) => typedWords.has(w));

    const lead: Lead = {};
    const name = clean(raw.name, 120);
    if (name && allTyped(name)) lead.name = name;
    const businessName = clean(raw.businessName, 160);
    if (businessName && allTyped(businessName)) lead.businessName = businessName;
    const email = clean(raw.email, 254);
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && typed.toLowerCase().includes(email.toLowerCase())) lead.email = email;
    const phone = clean(raw.phone, 40);
    const usPhone = normalizeUsPhone(phone);
    if (usPhone && typedDigits.includes(usPhone.slice(2))) lead.phone = usPhone;
    const concern = clean(raw.mainConcern, 300);
    if (concern) lead.description = concern;
    return lead;
  } catch {
    return null;
  }
}

// The quick audit request still requires the visitor's email and US phone.
const DIRECT_INTENT = /book(?:ing)?\s+(?:a\s+)?(?:call\s+)?directly|book\s+(?:me\s+)?(?:in\s+)?(?:right\s+)?now|in a hurry|\basap\b|(?:booking|calendar)\s+link|(?:give|send)\s+me\s+(?:the\s+)?(?:link|calendar)/i;

// Captures the audit request as soon as the last required detail arrives, without depending on the
// model to notice (it sometimes asks again even though a valid number was just given). Only fires on the
// message that completes the email + phone pair, and only with details the visitor really typed.
async function completedHandoff(messages: ChatMessage[], extract: () => Promise<Lead | null>): Promise<ChatResult | null> {
  const now = lastTypedContact(messages);
  if (!now.email || !now.phone) return null;
  const before = lastTypedContact(messages.slice(0, -1));
  if (before.email && before.phone) return null;

  if (DIRECT_INTENT.test(typedBy(messages))) {
    return { status: 200, body: { reply: 'Your audit details are ready.', directLink: true, contact: { email: now.email, phone: now.phone } } };
  }
  const lead = await extract();
  if (lead?.name && lead.businessName) {
    const booking: BookingDetails = { name: lead.name, businessName: lead.businessName, email: now.email, phone: now.phone, description: lead.description ?? '' };
    return { status: 200, body: { reply: 'Your audit details are ready.', booking } };
  }
  return null;
}

export function handleChat(
  input: unknown,
  ip: string,
  env: ChatEnv,
  defer?: (task: Promise<void>) => void,
): Promise<ChatResult> {
  const task = processChat(input, ip, env, defer);
  // Retain any in-flight model request and completed form notification after disconnect.
  defer?.(task.then(() => {}, () => {}));
  return task;
}

async function processChat(input: unknown, ip: string, env: ChatEnv, defer?: Defer): Promise<ChatResult> {
  // Old browser sessions can clear their retired delivery state without resending messages.
  if ((input as { mode?: unknown } | null)?.mode === 'log') return { status: 200, body: { loggingDisabled: true } };
  const messages = parseMessages(input);
  if (!messages) return { status: 400, body: { error: 'Invalid request.' } };
  if (rateLimited('chat:' + ip)) return { status: 429, body: { error: 'Too many messages. Please try again shortly.' } };
  const startedAt = performance.now();
  const modelStarted = performance.now();
  let result = await runChat(input, ip, env);
  if ((input as { experience?: string })?.experience !== 'guided-audit' && result.status === 200 && !result.body.booking && !result.body.directLink) {
    result = (await completedHandoff(messages, () => extractLead(messages, env))) ?? result;
  }
  const timings = { model: Math.round(performance.now() - modelStarted), total: 0 };
  if (result.status === 200 && (result.body.booking || result.body.directLink)) {
    const body = input as { sessionId?: unknown; pagePath?: unknown; state?: { lead?: unknown } };
    const earlier = body.state?.lead ? parseBooking(JSON.stringify(body.state.lead)) : null;
    const contact = result.body.contact ?? lastTypedContact(messages);
    const lead = result.body.booking ?? { name: earlier?.name || '', businessName: earlier?.businessName || '',
      email: contact.email || '', phone: contact.phone || '', description: '' };
    const delivery = await deliverForm({ subject: 'Chat audit request - Invent Tomorrow',
      submissionId: validSessionId(body.sessionId) || randomUUID(), lead: { ...lead, phone: lead.phone || '', description: lead.description || '' },
      pagePath: body.pagePath === '/free-audit-ads' ? '/free-audit-ads' : '/free-audit',
      details: { conversation: messages.slice(-8).map(message => message.role + ': ' + message.content).join('\n').slice(-12_000) },
    }, env, defer);
    result.body.requestSent = delivery.sent;
    result.body.reply = delivery.sent ? 'Your audit request is received. Our team will contact you to arrange a time.'
      : "We couldn't send your audit request. Please try the form below.";
    if (!delivery.sent && 'code' in delivery) console.warn('[chat] Email notification unconfirmed', { code: delivery.code });
  }
  timings.total = Math.round(performance.now() - startedAt);
  result.timings = timings;
  return result;
}
