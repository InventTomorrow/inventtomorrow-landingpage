import { CalendarDays, Layers, MessageCircle, Phone, RefreshCw, Send } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { CtaButton } from './CtaButton';
import type { AuditFormValues } from './AuditForm';
import { canKeepChatAlive, chatRequest, createChatSession, readChatSession, writeChatSession, type Booking, type ChatPagePath, type ChatSession, type Message } from '../utils/chatSession';
import styles from './AuditChat.module.css';

const GREETING: Message = {
  role: 'assistant',
  content:
    "Hi! I'm Invo. Where are you losing the most time or potential jobs?",
};

const SUGGESTIONS = [
  { label: 'Missed Calls', message: "I'm missing customer calls", icon: Phone },
  { label: 'Quote Follow-Ups', message: 'I need help following up on quotes', icon: MessageCircle },
  { label: 'Old Leads', message: 'I want to reconnect with old leads', icon: Layers },
  { label: 'Repeat Bookings', message: 'I want more repeat bookings', icon: RefreshCw },
];

const ERROR_TEXT = "Sorry, I couldn't connect just now. Please try again, or use the audit form below.";

export function AuditChat({ onBookAudit, pagePath }: { onBookAudit: (values?: Partial<AuditFormValues>) => void; pagePath: ChatPagePath }) {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  // The quick request path collects email and phone without a calendar handoff.
  const [directLink, setDirectLink] = useState(false);
  // Keep collected details available if the visitor opens the form.
  const [contact, setContact] = useState<{ email: string; phone: string } | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const session = useRef<ChatSession | null>(null);
  const sendingRef = useRef(false);
  const [revision, setRevision] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const persist = (next: ChatSession) => {
    session.current = next;
    try { writeChatSession(window.localStorage, next); } catch { /* blocked storage */ }
    setRevision((value) => value + 1);
  };

  // Load after hydration so both prerendered audit pages retain their greeting.
  useEffect(() => {
    let restored: ChatSession | null = null;
    try { restored = readChatSession(window.localStorage, pagePath); } catch { /* blocked storage */ }
    const next = restored || createChatSession(pagePath);
    session.current = next;
    setMessages([GREETING, ...next.messages]);
    setBooking(next.booking);
    setDirectLink(next.directLink);
    setContact(next.contact);
    setRequestSent(next.requestSent);
    setFailed(next.messages.at(-1)?.localOnly === true);
    setRevision((value) => value + 1);
  }, [pagePath]);

  // Recover pending LOGS only: replaying an AI request could submit an audit twice.
  // The server/queue handles already accepted messages even when this page closes.
  useEffect(() => {
    if (!session.current?.pendingLog || sending) return;
    let stopped = false;
    let recovering = false;
    let retry: ReturnType<typeof setTimeout>;
    const recover = async () => {
      const snapshot = session.current;
      if (stopped || recovering || sendingRef.current || !snapshot?.pendingLog) return;
      recovering = true;
      try {
        const body = JSON.stringify(chatRequest(snapshot, true));
        const response = await fetch('/api/chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
          keepalive: canKeepChatAlive(body), signal: AbortSignal.timeout(20_000),
        });
        const data = await response.json();
        if (!stopped && response.ok && (data.logSaved === true || data.loggingDisabled === true) && session.current === snapshot) {
          persist({ ...snapshot, pendingLog: false });
          return;
        }
      } catch { /* retain the pending snapshot for reconnect/reload */ }
      finally { recovering = false; }
      if (!stopped) retry = setTimeout(recover, 30_000);
    };
    retry = setTimeout(recover, 1_000);
    const onOnline = () => { clearTimeout(retry); void recover(); };
    window.addEventListener('online', onOnline);
    return () => { stopped = true; clearTimeout(retry); window.removeEventListener('online', onOnline); };
  }, [revision, sending, pagePath]);

  // Keep the latest message in view without scrolling the whole page.
  useEffect(() => {
    const list = listRef.current;
    if (list && messages.length > 1) {
      list.scrollTo({
        top: list.scrollHeight,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    }
  }, [messages, sending, booking, directLink]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || sendingRef.current || !session.current) return;
    const current = session.current;
    if (current.messages.filter((m) => !m.localOnly).length >= 199) return;
    sendingRef.current = true;
    const next: Message[] = [...current.messages.filter((m) => !m.localOnly), { role: 'user', content }];
    const pending: ChatSession = { ...current, messages: next, pendingLog: true };
    // Persist synchronously before starting the request, not in an effect that
    // might never run if the visitor immediately reloads or closes the page.
    persist(pending);
    setInput('');
    setMessages([GREETING, ...next]);
    setSending(true);
    setFailed(false);
    try {
      const body = JSON.stringify(chatRequest(pending));
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body, keepalive: canKeepChatAlive(body), signal: AbortSignal.timeout(58_000),
      });
      const data = (await response.json().catch(() => ({}))) as { reply?: string; booking?: Booking; directLink?: boolean; contact?: { email: string; phone: string }; requestSent?: boolean; error?: string; logSaved?: boolean; loggingDisabled?: boolean };
      if (!response.ok || !data.reply) {
        // A failed AI request may still have captured the visitor's message.
        if (data.logSaved || data.loggingDisabled) persist({ ...pending, pendingLog: false });
        throw new Error(data.error || 'Request failed');
      }
      const completed: ChatSession = {
        ...pending, messages: [...next, { role: 'assistant', content: data.reply }],
        booking: data.booking || pending.booking,
        directLink: data.directLink || pending.directLink,
        contact: data.contact || pending.contact,
        requestSent: data.requestSent ?? pending.requestSent,
        pendingLog: data.logSaved !== true && data.loggingDisabled !== true,
      };
      persist(completed);
      setMessages([GREETING, ...completed.messages]);
      if (data.requestSent !== undefined) setRequestSent(data.requestSent);
      if (data.booking) setBooking(data.booking);
      else if (data.directLink) {
        setDirectLink(true);
        if (data.contact) setContact(data.contact);
      }
    } catch {
      setFailed(true);
      const failedSession = { ...(session.current || pending), messages: [...next, { role: 'assistant' as const, content: ERROR_TEXT, localOnly: true }] };
      persist(failedSession);
      setMessages([GREETING, ...failedSession.messages]);
    } finally {
      sendingRef.current = false;
      setSending(false);
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(input);
    }
  };

  const showSuggestions = messages.length === 1 && !sending;
  const chatFull = messages.filter((m) => !m.localOnly).length >= 200;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <img
          src="/images/invo-avatar.png"
          alt=""
          width={48}
          height={48}
          className={styles.avatar}
        />
        <div className="min-w-0">
          <p className={styles.name}>Invo</p>
          <p className={styles.subtitle}>Your Invent Tomorrow guide</p>
        </div>
      </div>

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation with Invo, the Invent Tomorrow guide"
        data-lenis-prevent
        className={styles.messages}
      >
        {messages.map((m, i) => (
          <div key={i} className={`${styles.messageRow} ${m.role === 'user' ? styles.userRow : ''}`}>
            <p
              className={`${styles.message} ${m.role === 'user' ? styles.userMessage : styles.assistantMessage} ${i === 0 ? styles.greeting : ''}`}
            >
              {m.content}
            </p>
          </div>
        ))}

        {(booking || directLink) && (
          <div className="shrink-0 rounded-2xl border border-accent/40 bg-accent/10 p-5">
            <p className="text-sm font-semibold text-white">{requestSent ? 'Audit request received' : 'Send your audit request'}</p>
            <p className="mt-1 text-sm text-white/70">
              {requestSent ? 'Our team will contact you to arrange a time for your free audit.' : 'Open the form to send your details to our team.'}
            </p>
            {!requestSent && (
              <CtaButton variant="accent" size="lg" icon={CalendarDays} className="mt-4 w-full" onClick={() => onBookAudit(booking ?? contact ?? undefined)}>
                Open Audit Form
              </CtaButton>
            )}
          </div>
        )}

        {showSuggestions && (
          <div className={styles.suggestions}>
            {SUGGESTIONS.map(({ label, message, icon: Icon }, index) => (
              <button
                key={label}
                type="button"
                onClick={() => void send(message)}
                className={styles.suggestion}
              >
                <Icon aria-hidden="true" />
                <span>{`${index + 1}. ${label}`}</span>
              </button>
            ))}
          </div>
        )}

        {sending && (
          <div role="status" aria-atomic="true" className={styles.typing}>
            <span>Invo is typing</span>
            <span className={styles.typingDots} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className={styles.composer}>
        <label htmlFor="audit-chat-input" className="sr-only">
          Your message
        </label>
        <textarea
          id="audit-chat-input"
          ref={inputRef}
          rows={1}
          disabled={chatFull}
          maxLength={1000}
          data-lenis-prevent
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={chatFull ? 'Continue through the audit form below' : 'Message Invo...'}
          className={styles.input}
        />
        <button
          type="submit"
          disabled={sending || chatFull || !input.trim()}
          aria-label={sending ? "Waiting for Invo's reply" : 'Send message'}
          data-sending={sending}
          className={styles.sendButton}
        >
          <Send className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </button>
      </form>

      <p className={styles.footer}>
        {failed ? 'Skip the chat? ' : 'Prefer to talk? '}
        <button type="button" onClick={() => onBookAudit(booking ?? contact ?? undefined)} className={styles.bookingLink} aria-haspopup="dialog">
          Book a free audit
        </button>
      </p>
    </div>
  );
}
