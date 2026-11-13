export type SessionStorage = Pick<Storage, 'getItem' | 'setItem'>;
export const SESSION_ID_KEY = 'invo-session:v1';
const legacyKeys = ['invo-chat:v1:/free-audit', 'invo-chat:v1:/free-audit-ads'];

export function validSessionId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const id = value.trim();
  return id.length > 0 && id.length <= 64 && /^[a-zA-Z0-9_-]+$/.test(id) ? id : null;
}

export function newSessionId() {
  try { return crypto.randomUUID(); }
  catch { return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`; }
}

// Also adopt an existing chat ID when a returning visitor opens a form first.
export function getOrCreateSessionId(storage: SessionStorage, fallbackId?: string): string {
  let id: string | null = null;
  try { id = validSessionId(storage.getItem(SESSION_ID_KEY)); } catch { /* blocked storage */ }
  if (!id) {
    for (const key of legacyKeys) {
      try { id = validSessionId(JSON.parse(storage.getItem(key) || 'null')?.sessionId); } catch { /* corrupt or blocked storage */ }
      if (id) break;
    }
  }
  id ||= validSessionId(fallbackId) || newSessionId();
  try { storage.setItem(SESSION_ID_KEY, id); } catch { /* memory fallback still allows submissions */ }
  return id;
}

let browserSessionId: string | null = null;

// Browser startup, effects and event handlers share this ID; SSR never caches it.
export function getBrowserSessionId(): string {
  if (typeof window === 'undefined') return newSessionId();
  if (browserSessionId) return browserSessionId;
  try { browserSessionId = getOrCreateSessionId(window.localStorage); }
  catch { browserSessionId = newSessionId(); }
  return browserSessionId;
}
