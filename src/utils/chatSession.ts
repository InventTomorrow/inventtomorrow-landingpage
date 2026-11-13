import { calculateAudit, CLEAN_PRICE_OPTIONS, COMPANY_SIZE_OPTIONS, MISSED_CALL_OPTIONS, OLD_QUOTE_OPTIONS, parseAuditAnswers, type AuditAnswers, type GuidedAudit } from './freeAudit';
import { newSessionId } from './sessionId';
import { pickTracking } from './attribution';
export { newSessionId } from './sessionId';

export type ChatPagePath = '/free-audit' | '/free-audit-ads';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  // Connection errors are UI feedback, not something Invo said.
  localOnly?: boolean;
}

export interface Booking {
  name: string;
  businessName: string;
  email: string;
  phone?: string;
  description?: string;
}

export interface ChatSession {
  sessionId: string;
  pagePath: ChatPagePath;
  messages: Message[];
  booking: Booking | null;
  directLink: boolean;
  contact: { email: string; phone: string } | null;
  requestSent: boolean;
  pendingLog: boolean;
  audit?: GuidedAudit;
}

export type ChatStorage = Pick<Storage, 'getItem' | 'setItem'>;
const storageKey = (pagePath: ChatPagePath) => `invo-chat:v1:${pagePath}`;

export interface AuditDraftFields {
  email: string;
  phone: string;
  website: string;
  companySize: string;
  noWebsite: boolean;
}

export interface AuditDraft extends AuditDraftFields {
  submissionId: string;
  sessionId: string;
  answers: AuditAnswers;
}

const auditDraftKey = (pagePath: ChatPagePath) => `invo-audit-draft:v1:${pagePath}`;
export const auditAnswerKey = (answers: AuditAnswers) => JSON.stringify([
  answers.businessName, answers.missedCalls, answers.oldQuotes, answers.typicalClean,
]);

export function readAuditDraft(storage: ChatStorage, pagePath: ChatPagePath, sessionId: string, answers: AuditAnswers): AuditDraft | null {
  try {
    const draft = JSON.parse(storage.getItem(auditDraftKey(pagePath)) || 'null');
    const savedAnswers = parseAuditAnswers(draft?.answers);
    if (!draft || draft.sessionId !== sessionId || !savedAnswers || auditAnswerKey(savedAnswers) !== auditAnswerKey(answers)
      || typeof draft.submissionId !== 'string' || !/^[a-zA-Z0-9-]{16,64}$/.test(draft.submissionId)
      || typeof draft.noWebsite !== 'boolean') return null;
    for (const [key, limit] of Object.entries({ email: 254, phone: 40, website: 2048, companySize: 30 })) {
      if (typeof draft[key] !== 'string' || draft[key].length > limit) return null;
    }
    if (draft.companySize && !COMPANY_SIZE_OPTIONS.includes(draft.companySize)) return null;
    return { answers: savedAnswers, sessionId, submissionId: draft.submissionId,
      email: draft.email, phone: draft.phone, website: draft.website,
      companySize: draft.companySize, noWebsite: draft.noWebsite };
  } catch { return null; }
}

export function writeAuditDraft(storage: ChatStorage, pagePath: ChatPagePath, draft: AuditDraft): void {
  try { storage.setItem(auditDraftKey(pagePath), JSON.stringify(draft)); } catch { /* blocked storage must not prevent submissions */ }
}

export function clearAuditDraft(storage: Pick<Storage, 'removeItem'>, pagePath: ChatPagePath): void {
  try { storage.removeItem(auditDraftKey(pagePath)); } catch { /* blocked storage */ }
}

function restoreAudit(value: unknown): GuidedAudit | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  const audit = value as GuidedAudit;
  const answers = audit.answers;
  if (typeof audit.started !== 'boolean' || !answers || typeof answers !== 'object' || Array.isArray(answers)) return;
  if (answers.businessName !== undefined && (typeof answers.businessName !== 'string' || answers.businessName.length > 160)) return;
  if (answers.missedCalls !== undefined && !MISSED_CALL_OPTIONS.includes(answers.missedCalls)) return;
  if (answers.oldQuotes !== undefined && !OLD_QUOTE_OPTIONS.includes(answers.oldQuotes)) return;
  if (answers.typicalClean !== undefined && !CLEAN_PRICE_OPTIONS.includes(answers.typicalClean)) return;
  const restored: GuidedAudit = { started: audit.started, answers: {
    ...(answers.businessName !== undefined ? { businessName: answers.businessName } : {}),
    ...(answers.missedCalls !== undefined ? { missedCalls: answers.missedCalls } : {}),
    ...(answers.oldQuotes !== undefined ? { oldQuotes: answers.oldQuotes } : {}),
    ...(answers.typicalClean !== undefined ? { typicalClean: answers.typicalClean } : {}),
  } };
  const complete = parseAuditAnswers(answers);
  // Corrupt/incomplete saved results must never bypass the lead capture gate.
  if (complete && audit.results && typeof audit.results === 'object' && !Array.isArray(audit.results)) {
    const expected = calculateAudit(complete);
    if (Object.entries(expected).every(([key, entry]) => audit.results![key as keyof typeof expected] === entry)) restored.results = expected;
  }
  if (audit.contact && typeof audit.contact.email === 'string' && audit.contact.email.length <= 254
    && typeof audit.contact.phone === 'string' && audit.contact.phone.length <= 40) restored.contact = { email: audit.contact.email, phone: audit.contact.phone };
  if (audit.tracking && typeof audit.tracking === 'object' && !Array.isArray(audit.tracking)) {
    restored.tracking = pickTracking(audit.tracking);
  }
  return restored;
}

export function createChatSession(pagePath: ChatPagePath, sessionId = newSessionId()): ChatSession {
  return { sessionId, pagePath, messages: [], booking: null, directLink: false, contact: null, requestSent: false, pendingLog: false };
}

export function readChatSession(storage: ChatStorage, pagePath: ChatPagePath): ChatSession | null {
  try {
    const value = JSON.parse(storage.getItem(storageKey(pagePath)) || 'null');
    if (!value || typeof value.sessionId !== 'string' || !value.sessionId || value.sessionId.length > 64 || value.pagePath !== pagePath) return null;
    if (!Array.isArray(value.messages) || value.messages.length > 200 || !value.messages.every((m: Message) =>
      m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.length <= (m.role === 'assistant' ? 12_000 : 1500))) return null;
    const booking = value.booking;
    if (booking && !['name', 'businessName', 'email'].every((key) => typeof booking[key] === 'string')) return null;
    const contact = value.contact;
    if (contact && (typeof contact.email !== 'string' || typeof contact.phone !== 'string')) return null;
    const audit = restoreAudit(value.audit);
    return {
      sessionId: value.sessionId, pagePath,
      messages: value.messages.map((m: Message) => ({ role: m.role, content: m.content, ...(m.localOnly === true ? { localOnly: true } : {}) })),
      booking: booking || null, contact: contact || null,
      directLink: value.directLink === true, requestSent: value.requestSent === true, pendingLog: value.pendingLog === true,
      ...(audit ? { audit } : {}),
    };
  } catch { return null; }
}

export function writeChatSession(storage: ChatStorage, session: ChatSession): boolean {
  try {
    storage.setItem(storageKey(session.pagePath), JSON.stringify(session));
    return true;
  } catch { return false; } // Storage restrictions must not prevent chatting.
}

export function chatRequest(session: ChatSession, logOnly = false) {
  const audit = session.audit;
  // After the popup is accepted, the chat log carries the same lead so the chat
  // history row in n8n shows the business, email, phone and "Lead Captured".
  const auditLead = audit?.results && audit.contact && audit.answers.businessName
    ? { businessName: audit.answers.businessName, email: audit.contact.email, phone: audit.contact.phone } : null;
  return {
    ...(logOnly ? { mode: 'log' } : {}),
    experience: 'guided-audit',
    messages: session.messages.filter((m) => !m.localOnly).map(({ role, content }) => ({ role, content })),
    sessionId: session.sessionId, pagePath: session.pagePath,
    state: { lead: session.booking, askedDirect: session.directLink, ...(auditLead ? { audit: auditLead } : {}) },
  };
}

// Keepalive requests can continue during navigation/close, but have a 64 KiB
// browser limit. Larger histories still use a normal request and local recovery.
export function canKeepChatAlive(body: string): boolean {
  return new TextEncoder().encode(body).byteLength < 60_000;
}
