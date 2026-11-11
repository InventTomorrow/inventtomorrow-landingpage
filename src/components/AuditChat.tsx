import { CalendarDays, SendHorizontal } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { calendlyLink, BOOKING_PATH } from '../utils/navigation';
import { CtaButton } from './CtaButton';
import { TextLink } from './TextLink';
import styles from './AuditChat.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Booking {
  name: string;
  businessName: string;
  email: string;
  phone?: string;
  description?: string;
}

const GREETING: Message = {
  role: 'assistant',
  content:
    "Hey, I'm Invo! I help cleaning businesses stop losing jobs to missed calls and follow ups. What brings you here today?",
};

// Quick replies. "reply" is answered locally (no model call) so the booking questions start instantly.
const SUGGESTIONS: { label: string; reply?: string; calendar?: boolean }[] = [
  { label: "I'm missing customer calls" },
  { label: 'I need help with follow ups' },
  { label: 'I want more repeat bookings' },
  { label: 'What services do you offer?' },
  { label: 'Book a call directly', reply: "Sure. What's your email address?", calendar: true },
  { label: "I'd like a free audit", reply: "Happy to set that up. What's your name?" },
];

const ERROR_TEXT = "Sorry, I couldn't connect just now. Please try again, or pick a time directly in our calendar.";

// One id per chat, so n8n can tie a transcript to a visit.
function newSessionId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function AuditChat() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  // The visitor asked to book right away: show the calendar without collecting details.
  const [directLink, setDirectLink] = useState(false);
  // Email and phone given on that shortcut path, passed on to the calendar.
  const [contact, setContact] = useState<{ email: string; phone: string } | null>(null);
  const [opening, setOpening] = useState(false);
  const sessionId = useRef(newSessionId());
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  // Coming back from the calendar with the browser's back button: make the button usable again.
  useEffect(() => {
    const reset = () => setOpening(false);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  const send = async (text: string, localReply?: string) => {
    const content = text.trim();
    if (!content || sending) return;
    const next: Message[] = [...messages, { role: 'user', content }];
    setInput('');
    if (localReply) {
      setMessages([...next, { role: 'assistant', content: localReply }]);
      inputRef.current?.focus({ preventScroll: true });
      return;
    }
    setMessages(next);
    setSending(true);
    setFailed(false);
    try {
      // The greeting is local copy, not part of the model conversation.
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(1), sessionId: sessionId.current, state: { lead: booking, askedDirect: directLink } }),
      });
      const data = (await response.json().catch(() => ({}))) as { reply?: string; booking?: Booking; directLink?: boolean; contact?: { email: string; phone: string }; error?: string };
      if (!response.ok || !data.reply) throw new Error(data.error || 'Request failed');
      setMessages([...next, { role: 'assistant', content: data.reply }]);
      if (data.booking) setBooking(data.booking);
      else if (data.directLink) {
        setDirectLink(true);
        if (data.contact) setContact(data.contact);
      }
    } catch {
      setFailed(true);
      setMessages([...next, { role: 'assistant', content: ERROR_TEXT }]);
    } finally {
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

  const openCalendar = () => {
    setOpening(true);
    window.location.assign(
      booking
        ? calendlyLink(booking.name, booking.email, booking)
        : contact
          ? calendlyLink(undefined, contact.email, { phone: contact.phone })
          : calendlyLink(),
    );
  };

  const showSuggestions = messages.length === 1 && !sending;

  return (
    <div data-welcome={showSuggestions} className={`${styles.panel} shadow-float ring-1 ring-white/10`}>
      <div className="mb-4 flex shrink-0 items-center gap-3 border-b border-white/10 pb-4">
        <img
          src="/images/invo-avatar.png"
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-full bg-white object-contain p-1.5"
        />
        <div className="min-w-0">
          <p className="text-base font-semibold leading-tight text-white">Invo</p>
          <p className="text-sm leading-tight text-white/60">Your Invent Tomorrow guide</p>
        </div>
      </div>

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation with Invo, the Invent Tomorrow guide"
        className={`${styles.messages} space-y-3 pr-1`}
      >
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <p
              className={`min-w-0 max-w-[95%] whitespace-pre-wrap [overflow-wrap:anywhere] rounded-2xl px-3.5 py-3 text-base leading-relaxed select-text sm:max-w-[85%] sm:px-4 ${
                m.role === 'user'
                  ? 'rounded-br-sm bg-accent text-white'
                  : 'rounded-bl-sm border border-white/10 bg-white/10 text-white/90'
              }`}
            >
              {m.content}
            </p>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start" aria-label="Invo is typing">
            <div className="flex gap-1.5 rounded-2xl rounded-bl-sm border border-white/10 bg-white/10 px-4 py-4" aria-hidden="true">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="h-2 w-2 rounded-full bg-white/60 motion-safe:animate-pulse"
                  style={{ animationDelay: `${dot * 180}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {(booking || directLink) && (
          <div className="rounded-2xl border border-accent/40 bg-accent/10 p-5">
            <p className="text-sm font-semibold text-white">{booking ? 'Your details are ready' : 'Pick your audit time'}</p>
            <p className="mt-1 text-sm text-white/70">
              Choose a time in our calendar. Your audit is booked when you complete the calendar confirmation.
            </p>
            <CtaButton variant="accent" size="lg" icon={CalendarDays} className="mt-4 w-full" disabled={opening} onClick={openCalendar}>
              {opening ? 'Opening the calendar…' : 'Choose My Audit Time'}
            </CtaButton>
          </div>
        )}

        {showSuggestions && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => void send(s.label, s.reply)}
                className={`min-h-11 min-w-0 cursor-pointer rounded-xs border px-3.5 py-2.5 text-left text-sm leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-h-0 sm:py-2 ${
                  s.calendar
                    ? 'flex items-center gap-2 border-accent/70 bg-accent/10 font-semibold text-white hover:bg-accent/25 sm:col-span-2'
                    : s.reply
                      ? 'border-accent bg-accent font-semibold text-white hover:bg-accent-hover sm:col-span-2'
                      : 'border-white/15 bg-white/5 text-white/90 hover:border-accent hover:bg-accent/15'
                }`}
              >
                {s.calendar && <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />}
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-4 flex min-w-0 shrink-0 items-end gap-2">
        <label htmlFor="audit-chat-input" className="sr-only">
          Your message
        </label>
        <textarea
          id="audit-chat-input"
          ref={inputRef}
          rows={1}
          maxLength={1000}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type your message…"
          className="max-h-32 min-h-12 min-w-0 flex-1 resize-none rounded-xs border border-transparent bg-white px-3.5 py-[11px] text-base leading-6 font-normal text-ink placeholder-primary/40 select-text [field-sizing:content] focus:outline-2 focus:outline-offset-2 focus:outline-accent"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="Send message"
          className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xs bg-accent text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-default disabled:opacity-40 disabled:hover:bg-accent"
        >
          <SendHorizontal className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>

      {failed && (
        <p className="mt-3 shrink-0 text-sm text-white/70">
          Prefer to skip the chat?{' '}
          <TextLink to={BOOKING_PATH}>Pick a time directly</TextLink>
          .
        </p>
      )}
    </div>
  );
}
