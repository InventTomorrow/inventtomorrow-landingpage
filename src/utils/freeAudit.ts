export const FOUNDING_SPOTS_LEFT = 3;
const SPOTS_IN_WORDS = ['None', 'One', 'Two', 'Three', 'Four', 'Five'][FOUNDING_SPOTS_LEFT] ?? String(FOUNDING_SPOTS_LEFT);
export const AUDIT_PRICING_REPLY = `Founding clients pay $1,500 to set up and $345 a month, locked for life. ${SPOTS_IN_WORDS} of five founding spots are left, and it's guaranteed to pay for itself in 90 days. The audit is free either way. Want me to book it?`;
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

export const AUDIT_QUESTIONS = [
  "Let's start with the basics. What's the name of your cleaning business?",
  "In a normal week, how many calls or messages do you miss, or answer late, because you're on a job?",
  'Roughly how many quotes have you sent in the past year that never turned into a booking?',
  'What does a typical clean cost your customers?',
] as const;

export const AUDIT_QUICK_REPLIES = {
  'Book my free audit': `I'll ask you four questions about your cleaning business, missed calls, old quotes and typical clean price. Then we'll ask where to send your audit. You'll see your estimates here and receive an email copy after you submit your details. Your free 15-minute call will confirm the real numbers and the first fix.\n\n${AUDIT_QUESTIONS[0]}`,
  "I'm missing calls": "When you're on a clean, answering every call can be difficult. Missed Call Rescue texts back missed callers in seconds, so they hear from your business before trying another cleaner. For website, Facebook, Instagram and Google enquiries, 60 Second Response replies in under a minute.\n\nWe set up and run the follow-up for you, and you approve the messages before they go live. Your free audit estimates what missed calls could be worth using your answers; the 15-minute call checks your actual numbers and which fix makes sense. Choose Book my free audit to start, or ask me anything first.",
  'My quotes go quiet': "Quote Chaser follows up each new quote until you get a yes or a no, so interested customers don't get forgotten. Quote Revival reconnects with people who received a quote but never booked, to see whether they still need a clean. You approve the messages before they go live.\n\nOne Quote Revival campaign booked 18 jobs from old enquiries. That is a past result, not a promise for your business. Your free audit uses your old quote count and typical clean price to estimate the opportunity; the 15-minute call confirms the real numbers and what to tackle first. Choose Book my free audit when you're ready.",
  'I want more repeat clients': "Recurring Booker helps turn one-time cleans into regular bookings by following up with past clients. Busy Season Ready offers past clients first pick of dates before the spring rush. We set up and run the follow-up, and you approve the messages before they go live.\n\nOn your free 15-minute call, we'll look at past clients alongside missed calls and open quotes to identify the first fix that could book the most cleans. The quick online audit estimates missed-call and old-quote opportunities; it doesn't calculate repeat-client revenue. Choose Book my free audit to begin, or tell me what you'd like to know about repeat bookings.",
} as const;

export function predefinedAuditReply(message: string): string | undefined {
  const normalized = message.trim().toLowerCase().replace(/’/g, "'").replace(/[.!?]+$/, '').replace(/\s+/g, ' ');
  const entry = Object.entries(AUDIT_QUICK_REPLIES).find(([label]) => label.toLowerCase() === normalized);
  return entry?.[1];
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
    || !MISSED_CALL_OPTIONS.includes(a.missedCalls) || !OLD_QUOTE_OPTIONS.includes(a.oldQuotes)
    || !CLEAN_PRICE_OPTIONS.includes(a.typicalClean)) return null;
  return { businessName: a.businessName.trim(), missedCalls: a.missedCalls, oldQuotes: a.oldQuotes, typicalClean: a.typicalClean };
}

// These are estimates, not promised bookings. Calculate on the server after lead capture.
// Must stay identical to the live n8n "Structure Fields2" node (docs/n8n-live-workflow.json):
// whole-number monthly calls, then dollar values from that number rounded to $50.
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
    'These are rough estimates. Your free 15-minute call confirms the real numbers. Want to pick a time?',
  ].join('\n');
}
