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
}

export type ChatStorage = Pick<Storage, 'getItem' | 'setItem'>;
const storageKey = (pagePath: ChatPagePath) => `invo-chat:v1:${pagePath}`;

export function newSessionId() {
  try { return crypto.randomUUID(); }
  catch { return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`; }
}

export function createChatSession(pagePath: ChatPagePath): ChatSession {
  return { sessionId: newSessionId(), pagePath, messages: [], booking: null, directLink: false, contact: null, requestSent: false, pendingLog: false };
}

export function readChatSession(storage: ChatStorage, pagePath: ChatPagePath): ChatSession | null {
  try {
    const value = JSON.parse(storage.getItem(storageKey(pagePath)) || 'null');
    if (!value || typeof value.sessionId !== 'string' || !value.sessionId || value.sessionId.length > 64 || value.pagePath !== pagePath) return null;
    if (!Array.isArray(value.messages) || value.messages.length > 200 || !value.messages.every((m: Message) =>
      m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.length <= 1500)) return null;
    const booking = value.booking;
    if (booking && !['name', 'businessName', 'email'].every((key) => typeof booking[key] === 'string')) return null;
    const contact = value.contact;
    if (contact && (typeof contact.email !== 'string' || typeof contact.phone !== 'string')) return null;
    return {
      sessionId: value.sessionId, pagePath,
      messages: value.messages.map((m: Message) => ({ role: m.role, content: m.content, ...(m.localOnly === true ? { localOnly: true } : {}) })),
      booking: booking || null, contact: contact || null,
      directLink: value.directLink === true, requestSent: value.requestSent === true, pendingLog: value.pendingLog === true,
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
  return {
    ...(logOnly ? { mode: 'log' } : {}),
    messages: session.messages.filter((m) => !m.localOnly).map(({ role, content }) => ({ role, content })),
    sessionId: session.sessionId, pagePath: session.pagePath,
    state: { lead: session.booking, askedDirect: session.directLink },
  };
}

// Keepalive requests can continue during navigation/close, but have a 64 KiB
// browser limit. Larger histories still use a normal request and local recovery.
export function canKeepChatAlive(body: string): boolean {
  return new TextEncoder().encode(body).byteLength < 60_000;
}
