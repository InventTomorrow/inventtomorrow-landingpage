export const FOUNDING_SPOTS_LEFT = 2;
const SPOTS_IN_WORDS = ['None', 'One', 'Two', 'Three', 'Four', 'Five'][FOUNDING_SPOTS_LEFT] ?? String(FOUNDING_SPOTS_LEFT);
export const AUDIT_PRICING_REPLY = `Founding clients pay $1,272 to set up and $345 a month, locked for life. ${SPOTS_IN_WORDS} of five founding spots are left, and it's guaranteed to pay for itself in 90 days. The audit is free either way. Want me to book it?`;
export const MISSED_CALL_OPTIONS = ['0–5', '6–15', '16–30', 'More than 30', 'Not sure'] as const;
export const OLD_QUOTE_OPTIONS = ['Under 50', '50–200', '200–500', 'More than 500', 'Not sure'] as const;
export const CLEAN_PRICE_OPTIONS = ['Under $120', '$120–$180', '$180–$250', 'Over $250'] as const;
export const COMPANY_SIZE_OPTIONS = ['Just me', '2–4 cleaners', '5–10 cleaners', 'More than 10'] as const;

export interface AuditAnswers {
  businessName: string;
  missedCalls: typeof MISSED_CALL_OPTIONS[number];
  oldQuotes: typeof OLD_QUOTE_OPTIONS[number];
  typicalClean: typeof CLEAN_PRICE_OPTIONS[number];
}

export interface AuditEstimates {
  missedCallsMonth: number;
  missedCallValue: number;
  oldQuotesNumber: number | null;
  revivalValue: number | null;
  guaranteeStatus: 'qualifies' | 'close' | 'none';
}

export interface GuidedAudit {
  started: boolean;
  answers: Partial<AuditAnswers>;
  results?: AuditEstimates;
  contact?: { email: string; phone: string };
  tracking?: Record<string, string>;
}

// Short questions for owners reading on a phone between jobs.
export const AUDIT_QUESTIONS = [
  "What's your cleaning business called?",
  'In a normal week, how many calls or messages do you miss?',
  'How many quotes from the past year never got booked?',
  'What does a typical clean cost?',
] as const;

export const AUDIT_INTRO = "Great. Four quick questions, then you'll see your estimates.";

export const auditNudge = (step: number) =>
  `Tap one of the options below, or type a rough ${step === 3 ? 'price' : 'number'}.`;

// Shown instead of the plain nudge when the visitor typed keyboard mash ("asdasd") or a
// number that cannot be real ("-5", "99999999"), so they know why it was not accepted.
export const auditInvalid = (step: number) => step === 0
  ? `That doesn't look like a business name. ${AUDIT_QUESTIONS[0]}`
  : `That doesn't look like a real ${step === 3 ? 'price' : 'number'}. Tap one of the options below, or type something like ${step === 1 ? '10' : step === 2 ? '100' : '$150'}.`;

export const AUDIT_QUICK_REPLIES = {
  'Book my free audit': `${AUDIT_INTRO}\n\n${AUDIT_QUESTIONS[0]}`,
  "I'm missing calls": "Missed Call Rescue texts back anyone you miss within seconds, so they don't call another cleaner. You approve every message first.\n\nBook my free audit to see what your missed calls are worth.",
  'My quotes go quiet': "Quote Chaser follows up new quotes until you get a yes or a no. Quote Revival contacts old quotes that never booked. You approve every message first.\n\nBook my free audit to see what your old quotes could be worth.",
  'I want more repeat clients': "Recurring Booker follows up with past clients and invites them to book regular cleans. You approve every message first. On the free call we count your past clients.\n\nBook my free audit to get started.",
} as const;

export function predefinedAuditReply(message: string): string | undefined {
  const normalized = message.trim().toLowerCase().replace(/’/g, "'").replace(/[.!?]+$/, '').replace(/\s+/g, ' ');
  const entry = Object.entries(AUDIT_QUICK_REPLIES).find(([label]) => label.toLowerCase() === normalized);
  return entry?.[1];
}

// What a typed reply means while an audit question is waiting:
// - answer: record it and move on;
// - repeat: not an answer (a greeting, "yes", an unrecognised word), so ask again locally;
// - ask: a real question or remark for the AI, after which the chat repeats the question.
// A repeat marked `invalid` was keyboard mash or an impossible number, not just an unrecognised reply.
export type AuditTurn = { kind: 'answer'; value: string } | { kind: 'repeat'; invalid?: true } | { kind: 'ask' };

const INVALID: AuditTurn = { kind: 'repeat', invalid: true };
const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const nextToEachOther = (a: string, b: string) => KEYBOARD_ROWS.some((row) => {
  const i = row.indexOf(a), j = row.indexOf(b);
  return i >= 0 && j >= 0 && Math.abs(i - j) === 1;
});

// Keyboard mash, not a word: "asdasd", "qwerty", "aaaaa", "hahahaha", "sdfghj", "xzzqtp".
export function isGibberishWord(raw: string): boolean {
  const w = raw.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length < 3) return false;
  if (w.length === 3) return /^(?:asd|sdf|dfg|fgh|ghj|hjk|jkl|qwe|wer|ert|rty|tyu|yui|uio|iop|zxc|xcv|cvb|vbn|bnm)$/.test(w);
  if (/(.)\1{3,}/.test(w) || /^(.{2,3})\1{2,}$/.test(w)) return true;
  let neighbours = 0;
  for (let i = 0; i < w.length - 1; i++) if (nextToEachOther(w[i], w[i + 1])) neighbours++;
  const share = neighbours / (w.length - 1);
  if (w.length === 4 ? share === 1 : share >= 0.7) return true;
  // Five or more letters with no vowel at all (not an all-caps acronym like "HVAC").
  return w.length >= 5 && !/[aeiouy]/.test(w) && raw !== raw.toUpperCase();
}

export const hasGibberish = (text: string) => text.split(/\s+/).some(isGibberishWord);

export function isPlausibleBusinessName(name: string) {
  const letters = name.match(/\p{L}/gu)?.length ?? 0;
  return letters >= 2 && !hasGibberish(name);
}

const tidy = (text: string) => text.trim().toLowerCase().replace(/[’‘]/g, "'").replace(/[–—−]/g, '-')
  .replace(/\s+/g, ' ').replace(/[.!]+$/, '');
const wordCount = (text: string) => text.split(' ').filter(Boolean).length;
const ASKING = /\?|^(?:what|what's|whats|how|why|who|where|when|which|can|could|do|does|is|are|will|would|should|tell me)\b/;
const NOT_SURE = /^(?:not sure|unsure|no idea|idk|dunno|no clue|hard to say|not certain|unknown|(?:i )?(?:don't|dont|do not) (?:know|track (?:it|that|them)|count (?:it|that|them)))$/;
const START_OR_ACK = /^(?:hi|hello|hey|hiya|howdy|yo|good (?:morning|afternoon|evening)|thanks|thank you|yes|yeah|yep|yup|sure|ok|okay|ready|go|start|continue|next|sounds good|let's (?:go|start|do (?:it|this))|book my free audit|(?:start|run|continue) (?:my |the )?(?:free )?audit|(?:i'd like|i would like|i want) (?:a |my )?(?:free )?audit)(?: there| please| invo)?$/;
const NAME_PREFIX = /^(?:(?:my|our|the) (?:cleaning )?(?:business|company)(?: name)?(?:'s| is)(?: called| named)?|(?:it's|it is|we're|we are)(?: called| named)?|(?:the )?name(?:'s| is)|called)\s+/i;
const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50,
};

// A rough number from a short reply: "about 10", "10-20", "over 30", "1.5k", "$150".
export function roughNumber(text: string): number | null {
  let t = tidy(text).replace(/(\d),(?=\d{3}\b)/g, '$1');
  if (/^(?:none|zero|nothing|no|nil)$/.test(t)) return 0;
  t = t.replace(/\b(?:a )?couple(?: of)?\b/g, '2').replace(/\ba few\b/g, '3')
    .replace(/\b(?:a |one )?hundred\b/g, '100').replace(/\b(?:a |one )?thousand\b/g, '1000')
    .replace(new RegExp(`\\b(${Object.keys(NUMBER_WORDS).join('|')})\\b`, 'g'), (word) => String(NUMBER_WORDS[word]));
  const numbers = [...t.matchAll(/(\d+(?:\.\d+)?)\s*(k\b)?/g)].map((m) => Number(m[1]) * (m[2] ? 1000 : 1));
  if (numbers.length === 2 && /\d\s*k?\s*(?:-|to|or)\s*\$?\s*\d/.test(t)) return (numbers[0] + numbers[1]) / 2;
  if (numbers.length !== 1) return null;
  if (/\b(?:more than|over|above)\b|\+/.test(t)) return numbers[0] + 1;
  if (/\b(?:under|less than|below|fewer than)\b/.test(t)) return Math.max(0, numbers[0] - 1);
  return numbers[0];
}

// undefined: no usable number in the reply. null: a number, but not a possible answer
// (negative, or far outside what a cleaning business could really have).
function rangeAnswer(step: 1 | 2 | 3, text: string): string | null | undefined {
  const t = tidy(text);
  if (wordCount(t) > 8) return;
  let n = roughNumber(t);
  if (n === null) return;
  if (/(?:^|\s)-\s?\d/.test(t) && !/\d\s*-\s*\$?\d/.test(t)) return null; // "-5"
  const per = (unit: string) => new RegExp(`\\b(?:a|per|each|every) ${unit}\\b|\\b${unit}ly\\b|/ ?${unit}\\b`).test(t);
  if (step === 1) {
    if (per('day') || /\bdaily\b/.test(t)) n *= 5;
    else if (per('month')) n /= 4.3;
    else if (per('year')) n /= 52;
    if (n > 1000) return null; // over 1,000 missed calls a week
    return n <= 5 ? '0–5' : n <= 15 ? '6–15' : n <= 30 ? '16–30' : 'More than 30';
  }
  if (step === 2) {
    if (per('month')) n *= 12;
    else if (per('week')) n *= 52;
    if (n > 100_000) return null;
    return n < 50 ? 'Under 50' : n < 200 ? '50–200' : n <= 500 ? '200–500' : 'More than 500';
  }
  if (/\b(?:hour|hr|hourly)\b/.test(t)) return; // an hourly rate is not the price of a clean
  if (n < 20 || n > 5000) return null; // "$0", "$3", "$900,000" are not the price of a clean
  return n < 120 ? 'Under $120' : n <= 180 ? '$120–$180' : n <= 250 ? '$180–$250' : 'Over $250';
}

export function interpretAuditReply(step: 0 | 1 | 2 | 3, text: string): AuditTurn {
  const t = tidy(text);
  if (!text.trim()) return { kind: 'repeat' };
  if (!/[\p{L}\p{N}]/u.test(text)) return INVALID; // "???", "!!!", "..."
  if (step === 0) {
    if (START_OR_ACK.test(t)) return { kind: 'repeat' };
    if (predefinedAuditReply(text) || ASKING.test(t) || /\b(?:pricing|price|cost|guarantee)\b/.test(t)) return { kind: 'ask' };
    if (/@|\d[\d\s().-]{6,}\d/.test(t)) return { kind: 'repeat' }; // contact details come later, in the form
    const name = text.trim().replace(/[’‘]/g, "'").replace(NAME_PREFIX, '').replace(/[.!,]+$/, '')
      .replace(/^["“']+|["”']+$/g, '').trim();
    if (!name) return { kind: 'repeat' };
    if (!isPlausibleBusinessName(name)) return INVALID;
    return wordCount(name) > 8 ? { kind: 'ask' } : { kind: 'answer', value: name.slice(0, 160) };
  }
  const options: readonly string[] = [MISSED_CALL_OPTIONS, OLD_QUOTE_OPTIONS, CLEAN_PRICE_OPTIONS][step - 1];
  const squash = (value: string) => tidy(value).replace(/\s/g, '');
  const exact = options.find((option) => squash(option) === squash(text));
  if (exact) return { kind: 'answer', value: exact };
  if (START_OR_ACK.test(t)) return { kind: 'repeat' };
  if (predefinedAuditReply(text) || ASKING.test(t)) return { kind: 'ask' };
  if (NOT_SURE.test(t)) return options.includes('Not sure') ? { kind: 'answer', value: 'Not sure' } : { kind: 'repeat' };
  if (hasGibberish(text)) return INVALID; // "asdasd", even beside a number
  const range = rangeAnswer(step, t);
  if (range === null) return INVALID;
  if (range) return { kind: 'answer', value: range };
  return wordCount(t) <= 4 ? { kind: 'repeat' } : { kind: 'ask' };
}

export function auditStep(answers: Partial<AuditAnswers>) {
  if (!answers.businessName) return 0;
  if (!answers.missedCalls) return 1;
  if (!answers.oldQuotes) return 2;
  if (!answers.typicalClean) return 3;
  return 4;
}

export function parseAuditAnswers(value: unknown): AuditAnswers | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const a = value as AuditAnswers;
  if (typeof a.businessName !== 'string' || !a.businessName.trim() || a.businessName.length > 160
    || !isPlausibleBusinessName(a.businessName)
    || !MISSED_CALL_OPTIONS.includes(a.missedCalls) || !OLD_QUOTE_OPTIONS.includes(a.oldQuotes)
    || !CLEAN_PRICE_OPTIONS.includes(a.typicalClean)) return null;
  return { businessName: a.businessName.trim(), missedCalls: a.missedCalls, oldQuotes: a.oldQuotes, typicalClean: a.typicalClean };
}

// Shared legacy estimates, not promised bookings. Round monthly calls first,
// then round the resulting dollar estimates to $50.
export function calculateAudit(answers: AuditAnswers): AuditEstimates {
  const weekly = [3, 10, 23, 35, 10][MISSED_CALL_OPTIONS.indexOf(answers.missedCalls)];
  const oldQuotesNumber = [30, 125, 350, 600, null][OLD_QUOTE_OPTIONS.indexOf(answers.oldQuotes)];
  const cleanPrice = [100, 150, 215, 275][CLEAN_PRICE_OPTIONS.indexOf(answers.typicalClean)];
  const missedCallsMonth = Math.round(weekly * 4.3);
  const round50 = (value: number) => Math.round(value / 50) * 50;
  return {
    missedCallsMonth,
    missedCallValue: round50(missedCallsMonth * 0.2 * cleanPrice),
    oldQuotesNumber,
    revivalValue: oldQuotesNumber === null ? null : round50(oldQuotesNumber * 0.09 * cleanPrice),
    guaranteeStatus: answers.oldQuotes === '200–500' || answers.oldQuotes === 'More than 500' ? 'qualifies'
      : answers.oldQuotes === '50–200' ? 'close' : 'none',
  };
}

export const auditDollars = (value: number) => `$${value.toLocaleString('en-US')}`;

export function auditResultMessage(businessName: string, result: AuditEstimates) {
  return [
    `Here's your quick audit, ${businessName}:`,
    '',
    `• About ${result.missedCallsMonth} missed calls a month could be worth around ${auditDollars(result.missedCallValue)} in cleans.`,
    ...(result.oldQuotesNumber !== null && result.revivalValue !== null
      ? [`• Your ${result.oldQuotesNumber} old quotes could bring in about ${auditDollars(result.revivalValue)} if we revive them.`] : []),
    ...(result.guaranteeStatus === 'qualifies' ? ['• You qualify for our Pays For Itself Guarantee.']
      : result.guaranteeStatus === 'close' ? ["• You're close to qualifying for our Pays For Itself Guarantee, which needs 200 past enquiries or quotes."] : []),
    '',
    'These are rough estimates. Your free 15 minute call confirms the real numbers. Want to pick a time?',
  ].join('\n');
}
