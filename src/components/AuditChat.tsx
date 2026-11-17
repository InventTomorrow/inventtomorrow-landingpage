import { CalendarDays, MessageCircle, Phone, RefreshCw, RotateCcw, Send, DollarSign } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { CtaButton } from './CtaButton';
import { AuditResultsModal } from './AuditResultsModal';
import { AUDIT_INTRO, AUDIT_QUESTIONS, MISSED_CALL_OPTIONS, OLD_QUOTE_OPTIONS, CLEAN_PRICE_OPTIONS, auditInvalid, auditNudge, auditStep, auditResultMessage, interpretAuditReply, parseAuditAnswers, predefinedAuditReply, type GuidedAudit, type AuditAnswers } from '../utils/freeAudit';
import type { AuditFormValues } from './AuditForm';
import { companySizeFromChat } from '../utils/companySize';
import { getBrowserSessionId, newSessionId, resetBrowserSessionId } from '../utils/sessionId';
import { browserAttribution } from '../utils/attribution';
import { InvoThinking } from './InvoThinking';
import { DEFAULT_EXPECTED_MS, nextExpectedMs, revealPlan } from '../utils/thinking';
import { canKeepChatAlive, chatRequest, clearChatStorage, createChatSession, readChatSession, writeChatSession, type Booking, type ChatPagePath, type ChatSession, type Message } from '../utils/chatSession';
import styles from './AuditChat.module.css';

const GREETING: Message = {
  role: 'assistant',
  content:
    "Hi, I'm Invo. I help cleaning business owners find the jobs they're missing. What would you like to sort out first?",
};

const SUGGESTIONS = [
  { label: "I'm missing calls", message: "I'm missing calls", icon: Phone },
  { label: 'My quotes go quiet', message: 'My quotes go quiet', icon: MessageCircle },
  { label: 'I want more repeat clients', message: 'I want more repeat clients', icon: RefreshCw },
  { label: 'What does it cost?', message: 'What does it cost?', icon: DollarSign },
];

const ERROR_TEXT = "I couldn't connect just now. Please try again, or choose Talk to a person.";

export function AuditChat({ onBookAudit, pagePath }: { onBookAudit: (values?: Partial<AuditFormValues>) => void; pagePath: ChatPagePath }) {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  // True once the reply has arrived and Invo is in its final "Typing" beat.
  const [replyReady, setReplyReady] = useState(false);
  // While the reply is already in, the stage Invo is flashing through (null = follow the clock).
  const [forcedStep, setForcedStep] = useState<number | null>(null);
  // Running average of real reply times, so the stages are paced to what visitors actually wait.
  const expectedMs = useRef(DEFAULT_EXPECTED_MS);
  const [failed, setFailed] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  // The quick request path collects email and phone without a calendar handoff.
  const [directLink, setDirectLink] = useState(false);
  // Keep collected details available if the visitor opens the form.
  const [contact, setContact] = useState<{ email: string; phone: string } | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [audit, setAudit] = useState<GuidedAudit>({ started: false, answers: {} });
  const [resultsFormOpen, setResultsFormOpen] = useState(false);
  const session = useRef<ChatSession | null>(null);
  const sendingRef = useRef(false);
  // How long to wait before double-checking that the last messages were saved (longer while the server saves in the background).
  const recoveryDelay = useRef(1_000);
  const [revision, setRevision] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const unlockRef = useRef<HTMLButtonElement>(null);

  const persist = (next: ChatSession) => {
    session.current = next;
    try { writeChatSession(window.localStorage, next); } catch { /* blocked storage */ }
    setRevision((value) => value + 1);
  };

  // Load after hydration so both prerendered audit pages retain their greeting.
  useEffect(() => {
    let restored: ChatSession | null = null;
    try { restored = readChatSession(window.localStorage, pagePath); } catch { /* blocked storage */ }
    const sessionId = getBrowserSessionId();
    const next = restored ? { ...restored, sessionId } : createChatSession(pagePath, sessionId);
    // Current URL tags, else the site-wide first touch captured in main.tsx.
    const visit = browserAttribution();
    const tracking = Object.keys(visit).length ? visit : next.audit?.tracking ?? {};
    next.audit = { started: false, answers: {}, ...next.audit, tracking };
    session.current = next;
    try { writeChatSession(window.localStorage, next); } catch { /* blocked storage */ }
    setAudit(next.audit);
    setMessages([GREETING, ...next.messages]);
    setBooking(next.booking);
    setDirectLink(next.directLink);
    setContact(next.contact);
    setRequestSent(next.requestSent);
    setFailed(next.messages.at(-1)?.localOnly === true);
    setRevision((value) => value + 1);
  }, [pagePath]);

  const updateAudit = (nextAudit: GuidedAudit, addedMessages: Message[] = []) => {
    if (!session.current) return;
    const next = { ...session.current, audit: nextAudit,
      messages: [...session.current.messages.filter((m) => !m.localOnly), ...addedMessages], pendingLog: true };
    persist(next);
    setAudit(nextAudit);
    setMessages([GREETING, ...next.messages]);
    setInput('');
  };

  // "Reset Invo": one tap, any time. A new session ID and an empty chat, so the visitor can start over.
  // Ad attribution is kept, and anything not yet logged is sent under the OLD ID first.
  // A reply or audit submission still in flight for the old chat is dropped, never shown in the new one.
  const resetGeneration = useRef(0);
  const inFlight = useRef<AbortController | null>(null);

  const resetInvo = () => {
    resetGeneration.current += 1;
    inFlight.current?.abort();
    inFlight.current = null;
    sendingRef.current = false;
    setSending(false);
    setReplyReady(false);
    setForcedStep(null);
    const old = session.current;
    if (old?.pendingLog) {
      try {
        const body = JSON.stringify(chatRequest(old, true));
        void fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: canKeepChatAlive(body) }).catch(() => {});
      } catch { /* the reset must still happen */ }
    }
    let sessionId = newSessionId();
    try { clearChatStorage(window.localStorage); } catch { /* blocked storage */ }
    try { sessionId = resetBrowserSessionId(); } catch { /* blocked storage */ }
    const next = createChatSession(pagePath, sessionId);
    next.audit = { started: false, answers: {}, tracking: browserAttribution() };
    session.current = next;
    try { writeChatSession(window.localStorage, next); } catch { /* blocked storage */ }
    setAudit(next.audit);
    setMessages([GREETING]);
    setBooking(null);
    setDirectLink(false);
    setContact(null);
    setRequestSent(false);
    setFailed(false);
    setInput('');
    setResultsFormOpen(false);
    setRevision((value) => value + 1);
    inputRef.current?.focus({ preventScroll: true });
  };

  const startAudit = (said = 'Book my free audit', lead: string | null = AUDIT_INTRO) => {
    if (sendingRef.current || !session.current) return;
    const current = session.current.audit || { started: false, answers: {} };
    const step = auditStep(current.answers);
    if (step === 4) {
      if (!current.results) setResultsFormOpen(true);
      else onBookAudit({ businessName: current.answers.businessName, ...current.contact });
      return;
    }
    // Resuming only re-asks the waiting question; it never replays the intro.
    updateAudit({ ...current, started: true }, current.started
      ? [{ role: 'assistant', content: AUDIT_QUESTIONS[step] }]
      : [{ role: 'user', content: said }, ...(lead ? [{ role: 'assistant' as const, content: lead }] : []), { role: 'assistant', content: AUDIT_QUESTIONS[step] }]);
    if (step === 0) inputRef.current?.focus({ preventScroll: true });
  };

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
    retry = setTimeout(recover, recoveryDelay.current);
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
  }, [messages, sending, booking, directLink, audit]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || sendingRef.current || !session.current) return;
    const current = session.current;
    if (current.messages.filter((m) => !m.localOnly).length >= 199) return;
    if (/^(?:talk to a (?:person|human)|book (?:a |my )?15.minute call)$/i.test(content)) {
      onBookAudit({ businessName: audit.answers.businessName, ...audit.contact });
      return;
    }
    const step = auditStep(audit.answers);
    // "Yes" only starts the audit when Invo has just offered it ("Want me to book it?"),
    // not when it answers some other question.
    const lastSaid = current.messages.filter((m) => m.role === 'assistant' && !m.localOnly).at(-1)?.content ?? GREETING.content;
    const startIntent = /^(?:book my free audit|start (?:my |the )?audit|run (?:my |the )?(?:free )?audit|(?:i(?:'d| would) like|i want) (?:a |my )?(?:free )?audit)\.?$/i.test(content)
      || (/^(?:yes|yes please|yeah|yep|sure|ok(?:ay)?|let'?s do it)[.!]?$/i.test(content) && /\b(?:book|audit)\b[^\n]*\?\s*$/i.test(lastSaid));
    if (startIntent && (!audit.started || step === 4)) { startAudit(content); return; }
    // A topic chip ("I'm missing calls") goes straight to the first audit question:
    // no explainer card and no extra "Book my free audit" tap in between.
    if (!audit.started && predefinedAuditReply(content)) { startAudit(content, null); return; }
    // While a question is waiting, the AI is asked only for real questions, and the
    // waiting question is repeated after its reply so the visitor knows what's next.
    let reask: number | null = null;
    if (audit.started && !audit.results) {
      if (step === 4) { setResultsFormOpen(true); return; }
      const turn = interpretAuditReply(step as 0 | 1 | 2 | 3, content);
      if (turn.kind === 'repeat') {
        updateAudit(audit, [{ role: 'user', content }, { role: 'assistant', content: turn.invalid ? auditInvalid(step) : step === 0 ? AUDIT_QUESTIONS[0] : auditNudge(step) }]);
        return;
      }
      if (turn.kind === 'ask') reask = step;
      else {
        const answer = turn.value;
        const key = ['businessName', 'missedCalls', 'oldQuotes', 'typicalClean'][step] as keyof AuditAnswers;
        const nextAudit = { ...audit, answers: { ...audit.answers, [key]: answer } };
        const nextStep = auditStep(nextAudit.answers);
        updateAudit(nextAudit, [
          { role: 'user', content: answer },
          { role: 'assistant', content: nextStep === 4
            ? `Thanks, ${nextAudit.answers.businessName}. Your audit is ready. Just tell us where to send it.`
            : AUDIT_QUESTIONS[nextStep] },
        ]);
        if (nextStep === 4) setResultsFormOpen(true);
        return;
      }
    }
    sendingRef.current = true;
    const next: Message[] = [...current.messages.filter((m) => !m.localOnly), { role: 'user', content }];
    const pending: ChatSession = { ...current, messages: next, pendingLog: true };
    // Persist synchronously before starting the request, not in an effect that
    // might never run if the visitor immediately reloads or closes the page.
    persist(pending);
    setInput('');
    setMessages([GREETING, ...next]);
    setSending(true);
    setReplyReady(false);
    setForcedStep(null);
    setFailed(false);
    const startedAt = Date.now();
    // Reset Invo can happen at any moment; a reply to the OLD conversation must never appear in the new one.
    const generation = resetGeneration.current;
    const stale = () => generation !== resetGeneration.current;
    const controller = new AbortController();
    inFlight.current = controller;
    try {
      const body = JSON.stringify(chatRequest(pending));
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body, keepalive: canKeepChatAlive(body), signal: AbortSignal.any([controller.signal, AbortSignal.timeout(58_000)]),
      });
      const data = (await response.json().catch(() => ({}))) as { reply?: string; booking?: Booking; directLink?: boolean; contact?: { email: string; phone: string }; requestSent?: boolean; error?: string; logSaved?: boolean; logDeferred?: boolean; loggingDisabled?: boolean };
      if (stale()) return;
      if (!response.ok || !data.reply) {
        // A failed AI request may still have captured the visitor's message.
        if (data.logSaved || data.loggingDisabled) persist({ ...pending, pendingLog: false });
        throw new Error(data.error || 'Request failed');
      }
      // Paced to the real wait: a reply that is already here flashes through the stages it
      // skipped; a slow one has been moving all along and only gets the "Typing" beat.
      const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      const waited = Date.now() - startedAt;
      const plan = revealPlan(waited, expectedMs.current);
      expectedMs.current = nextExpectedMs(expectedMs.current, waited);
      await pause(plan.readingWaitMs);
      if (stale()) return;
      for (const step of plan.steps) { setForcedStep(step); await pause(plan.stageMs); if (stale()) return; }
      setReplyReady(true);
      await pause(plan.typingMs);
      if (stale()) return;
      // The server is still saving this message in the background: check on it later, not straight away.
      recoveryDelay.current = data.logDeferred ? 15_000 : 1_000;
      const repeated: Message[] = reask === null ? [] : [{ role: 'assistant', content: AUDIT_QUESTIONS[reask] }];
      const completed: ChatSession = {
        ...pending, messages: [...next, { role: 'assistant', content: data.reply }, ...repeated],
        booking: data.booking || pending.booking,
        directLink: data.directLink || pending.directLink,
        contact: data.contact || pending.contact,
        requestSent: data.requestSent ?? pending.requestSent,
        // The repeated question is only local so far, so log the transcript again.
        pendingLog: data.loggingDisabled !== true && (repeated.length > 0 || data.logSaved !== true),
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
      if (stale()) return;
      recoveryDelay.current = 1_000;
      setFailed(true);
      const failedSession = { ...(session.current || pending), messages: [...next, { role: 'assistant' as const, content: ERROR_TEXT, localOnly: true }] };
      persist(failedSession);
      setMessages([GREETING, ...failedSession.messages]);
    } finally {
      // After a reset the new conversation owns these flags.
      if (!stale()) {
        sendingRef.current = false;
        setSending(false);
        setReplyReady(false);
        setForcedStep(null);
        inputRef.current?.focus({ preventScroll: true });
      }
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
  const locked = audit.started && auditStep(audit.answers) === 4 && !audit.results;
  const completedAnswers = parseAuditAnswers(audit.answers);
  const step = auditStep(audit.answers);
  const inProgress = audit.started && !audit.results && step < 4;
  const answerOptions = inProgress && step > 0
    ? [[], MISSED_CALL_OPTIONS, OLD_QUOTE_OPTIONS, CLEAN_PRICE_OPTIONS][step] : [];
  // Offer "Continue" only when the waiting question has scrolled out of view
  // (after a connection error or an old saved chat), never right under it.
  const lastMessage = messages.at(-1);
  const questionShowing = lastMessage?.role === 'assistant' && !lastMessage.localOnly
    && (lastMessage.content === (AUDIT_QUESTIONS as readonly string[])[step] || lastMessage.content === auditNudge(step) || lastMessage.content === auditInvalid(step));
  const typingName = inProgress && step === 0;
  // A popup submission that finishes after Reset Invo belongs to the old chat and is ignored here.
  const modalGeneration = resetGeneration.current;
  useEffect(() => {
    if (locked && !resultsFormOpen) unlockRef.current?.focus({ preventScroll: true });
  }, [locked, resultsFormOpen]);

  return (
    <div className={styles.shell}>
    <div className={`${styles.panel} ${locked ? styles.locked : ''}`} inert={locked}>
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
          <p className={styles.subtitle}>Invent Tomorrow's AI assistant</p>
        </div>
        <button type="button" className={styles.resetButton} onClick={resetInvo} aria-label="Reset Invo and start the chat over">
          <RotateCcw aria-hidden="true" />
          <span>Reset Invo</span>
        </button>
      </div>

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation with Invo, Invent Tomorrow's AI assistant"
        data-lenis-prevent
        className={styles.messages}
      >
        {messages.map((m, i) => {
          const question = m.role === 'assistant' && i > 0 ? (AUDIT_QUESTIONS as readonly string[]).indexOf(m.content) : -1;
          return (
            <div key={i} className={`${styles.messageRow} ${m.role === 'user' ? styles.userRow : ''}`}>
              <p
                className={`${styles.message} ${m.role === 'user' ? styles.userMessage : styles.assistantMessage} ${i === 0 ? styles.greeting : ''} ${question >= 0 ? styles.questionMessage : ''}`}
              >
                {question >= 0 && (
                  <span className={styles.questionLabel}>
                    <span>Question {question + 1} of 4</span>
                    <span className={styles.pips} aria-hidden="true">
                      {[0, 1, 2, 3].map((pip) => <span key={pip} data-on={pip <= question} />)}
                    </span>
                  </span>
                )}
                {m.content}
              </p>
            </div>
          );
        })}

        {(booking || directLink) && (
          <div className="shrink-0 rounded-2xl border border-border bg-paper p-5">
            <p className="text-sm font-semibold text-primary">{requestSent ? 'Audit request received' : 'Send your audit request'}</p>
            <p className="mt-1 text-sm text-ink">
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
          <div className={`${styles.suggestions} ${styles.starters}`}>
            {SUGGESTIONS.map(({ label, message, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => void send(message)}
                className={styles.suggestion}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        {!showSuggestions && !sending && (!audit.started || (inProgress && !questionShowing)) && (
          <div className={styles.suggestions}>
            <button type="button" onClick={() => startAudit()} className={`${styles.suggestion} ${styles.primaryChip}`}>
              <CalendarDays aria-hidden="true" />{audit.started ? 'Continue my free audit' : 'Book my free audit'}
            </button>
          </div>
        )}
        {answerOptions.length > 0 && !sending && (
          <div className={styles.suggestions} role="group" aria-label="Choose your answer">
            {answerOptions.map((answer) => <button key={answer} type="button" className={styles.suggestion} onClick={() => void send(answer)}>{answer}</button>)}
          </div>
        )}
        {audit.results && !sending && (
          <div className={styles.suggestions}>
            <button type="button" className={`${styles.suggestion} ${styles.primaryChip}`} onClick={() => onBookAudit({ businessName: audit.answers.businessName, ...audit.contact })}>Book my 15 minute call</button>
            <button type="button" className={styles.suggestion} onClick={() => inputRef.current?.focus()}>Ask a question</button>
          </div>
        )}

        {sending && <InvoThinking replyReady={replyReady} forcedStep={forcedStep} expectedMs={expectedMs.current} />}
      </div>

      <form onSubmit={onSubmit} className={styles.composer} data-highlight={typingName && !sending}>
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
          placeholder={chatFull ? 'Continue through the audit form below' : typingName ? 'Type your business name'
            : inProgress ? `Or type a ${step === 3 ? 'price' : 'number'}` : 'Type your question'}
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
        {failed ? 'Skip the chat? ' : 'Need a hand? '}
        <button type="button" onClick={() => onBookAudit({ ...booking, ...contact, businessName: audit.answers.businessName || booking?.businessName, ...audit.contact })} className={styles.bookingLink} aria-haspopup="dialog">
          Talk to a person
        </button>
      </p>
    </div>
    {locked && (
      <div className={styles.lockOverlay}>
        <p>Your audit is ready. To get your audit, click here.</p>
        <button ref={unlockRef} type="button" onClick={() => setResultsFormOpen(true)} className={styles.unlockButton} aria-haspopup="dialog">Get my audit</button>
        <button type="button" onClick={resetInvo} className={styles.startOver}>Start over</button>
      </div>
    )}
    {completedAnswers && session.current && (
      <AuditResultsModal open={resultsFormOpen} onClose={() => setResultsFormOpen(false)}
        answers={completedAnswers} pagePath={pagePath} sessionId={session.current.sessionId} tracking={audit.tracking} knownCompanySize={companySizeFromChat(messages)}
        onComplete={(results, details) => resetGeneration.current === modalGeneration && updateAudit({ ...audit, results, contact: details }, [
          { role: 'assistant', content: auditResultMessage(completedAnswers.businessName, results) },
        ])} />
    )}
    </div>
  );
}
