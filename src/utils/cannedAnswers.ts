// Fixed answers to the questions visitors ask most, so those replies are instant and
// need no AI call. A message only gets one when it is short and clearly means exactly
// one thing; anything ambiguous, long or multi-part still goes to the AI.
// Every fact here comes from the Invo prompt (docs/prompts/invo-system-prompt.txt).
export interface CannedAnswer {
  id: string;
  answer: string;
  // A nudge toward the audit, left off once the visitor has started it.
  cta?: string;
}

const BOOK = 'Book my free audit to get started.';

// "What's" -> "whats", punctuation and emoji removed, one space between words.
const clean = (text: string) => text.toLowerCase().replace(/[’‘`]/g, "'").replace(/'/g, '')
  .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const wordCount = (text: string) => text.split(' ').filter(Boolean).length;

const GREETING = '(?:hi|hello|hey|hiya|howdy|yo|greetings|good (?:morning|afternoon|evening|day))';
const GREETING_TAIL = '(?: (?:there|invo|team|everyone|all|again))*';
const GREETING_ONLY = new RegExp(`^${GREETING}${GREETING_TAIL}(?: how are you(?: today| doing)?)?$`);
const GREETING_PREFIX = new RegExp(`^${GREETING}${GREETING_TAIL} `);

export const GREETING_REPLY = "Hello. I'm Invo, Invent Tomorrow's AI assistant. Are you missing calls, chasing quotes, or looking for more repeat clients?";

// Leading "hi" / "hello invo," removed so "hi, is the audit free?" is still understood.
export const stripGreeting = (message: string) =>
  message.replace(/^\s*(?:hi|hello|hey|hiya|howdy)(?:\s+(?:there|invo))?\s*[,!.:-]*\s+(?=\S)/i, '');

interface Intent { id: string; test: RegExp; answer: string; cta?: string; maxWords?: number }

const INTENTS: Intent[] = [
  { id: 'how-are-you', test: /^(?:how are you|how are you doing|hows it going|how is it going|whats up|sup)(?: today)?$/,
    answer: "I'm doing well, thank you. How can I help with your cleaning business?" },
  { id: 'thanks', test: /^(?:thanks|thank you|thx|ty|cheers|many thanks)(?: (?:a lot|so much|very much|invo))*$/,
    answer: "You're welcome. Is there anything else I can help with?" },
  { id: 'goodbye', test: /^(?:bye|goodbye|see you|see ya|cya|talk later|thats all|nothing else|no thanks|no thank you|nope)$/,
    answer: "Thanks for stopping by. If you'd like your free audit later, I'm here." },
  { id: 'ack', test: /^(?:ok|okay|k|great|cool|nice|got it|alright|perfect|awesome|sounds good|i see|understood|makes sense)$/,
    answer: 'Great. Would you like to start your free audit, or ask me something first?' },
  { id: 'audit-free', maxWords: 10,
    test: /^(?:is|are|does|do|will|would) .*\b(?:audit|call|consultation)\b.*\b(?:free|cost|charge|pay|price|fee)\b|^(?:is|are) (?:it|this|that) (?:really |actually )?free$/,
    answer: 'Yes. The audit is free and takes 15 minutes.', cta: BOOK },
  { id: 'audit-length', maxWords: 10, test: /\bhow long\b.*\b(?:audit|call)\b|\bhow many minutes\b/,
    answer: 'The audit is a 15 minute call.', cta: BOOK },
  { id: 'audit-what', maxWords: 10,
    test: /^(?:what is|whats|what are) (?:the |this |your )?(?:free )?(?:audit|call)$|\bhow (?:does|do) (?:the |this |your )?(?:free )?(?:audit|call) work\b|\bwhat happens (?:on|in|during) (?:the|this|your) (?:free )?(?:audit|call)\b|\bwhat(?:s| is| does)? (?:included|covered) (?:in|on) (?:the|this) (?:free )?(?:audit|call)\b/,
    answer: "It's a 15 minute call where we count your missed calls, open quotes and past clients, estimate what they're worth, and pick the first fix likely to book the most jobs.", cta: 'Book my free audit to start.' },
  { id: 'human', maxWords: 10,
    test: /\b(?:are|r) (?:you|u) (?:a |an )?(?:real |actual )?(?:human|person|bot|robot|ai|machine|chatbot)\b|\bam i (?:talking|speaking|chatting) (?:to|with) (?:a |an )?(?:real |actual )?(?:human|person|bot|robot|ai|machine)\b|\bis this (?:a |an )?(?:real |actual )?(?:human|person|bot|robot|ai)\b|\bis (?:there )?(?:a )?(?:real )?(?:human|person) (?:there|here|behind this)\b/,
    answer: "I'm Invo, Invent Tomorrow's AI assistant. Your audit call is with our team." },
  { id: 'about', maxWords: 8,
    test: /^(?:who are you|what are you|who is invent tomorrow|what is invent tomorrow|whats invent tomorrow|what do you do|what does invent tomorrow do|what do you guys do|what can you do|what do you offer|what services do you offer|what services do you have|what do you sell|what is this)$/,
    answer: 'Invent Tomorrow sets up and runs follow up for cleaning businesses: texting back missed calls, chasing quotes, reviving old quotes and turning one time clients into regulars. You approve every message first.',
    cta: "Book my free audit to see what you're missing." },
  { id: 'guarantee', maxWords: 7,
    test: /\b(?:guarantee|guaranteed|pays for itself)\b(?!.*\b(?:price|prices|pricing|cost|how much|fee|setup|monthly)\b)/,
    answer: "Our Pays For Itself Guarantee applies if you have at least 200 past enquiries or quotes: if the jobs booked in your first 90 days don't add up to more than you've paid us, you pay no monthly fee until they do.",
    cta: 'The free audit checks whether you qualify.' },
  { id: 'approval', maxWords: 12,
    test: /\b(?:do|will|can|must|should) (?:i|we) (?:have to |need to )?(?:approve|review|check|see|sign off)\b|\bwho (?:writes|sends|approves)\b.*\b(?:messages?|texts?)\b|\b(?:without|before) (?:my|our) (?:approval|ok|permission)\b|\bdo you (?:send|text)\b.*\bwithout\b/,
    answer: 'Yes. You approve every message before it goes live.' },
  { id: 'software', maxWords: 12,
    test: /\b(?:do|will) (?:i|we) need\b.*\b(?:software|app|apps|tools?|system|crm|subscription)\b|\b(?:integrate|integrates|integration|integrations|compatible|compatibility)\b|\bwork with (?:my|our|jobber|housecall pro|zenmaid|quickbooks|booking koala)\b|\b(?:my|our) (?:current |existing )?(?:software|crm|tools?|system)\b/,
    answer: "We'll check whether your current tools can support it during the audit.", cta: BOOK },
];

const SERVICES: { id: string; test: RegExp; answer: string; core: boolean }[] = [
  { id: 'missed-call-rescue', test: /\bmissed call rescue\b/, core: true,
    answer: "Missed Call Rescue texts back anyone you miss within seconds, so they don't call another cleaner. You approve every message first." },
  { id: '60-second-response', test: /\b(?:60|sixty) second response\b/, core: true,
    answer: '60 Second Response replies to website, Facebook, Instagram and Google enquiries in under a minute. You approve every message first.' },
  { id: 'quote-chaser', test: /\bquote chaser\b/, core: true,
    answer: 'Quote Chaser follows up each new quote until you get a yes or a no. You approve every message first.' },
  { id: 'quote-revival', test: /\bquote revival\b/, core: true,
    answer: 'Quote Revival contacts old quotes that never booked, to see whether they still need a clean. You approve every message first.' },
  { id: 'recurring-booker', test: /\brecurring booker\b/, core: true,
    answer: 'Recurring Booker follows up with past clients and invites them to book regular cleans. You approve every message first.' },
  { id: '5-star-engine', test: /\b(?:5|five) star engine\b/, core: true,
    answer: '5 Star Engine asks every client for a review, with AI drafted replies you approve.' },
  { id: 'busy-season-ready', test: /\bbusy season ready\b/, core: true,
    answer: 'Busy Season Ready offers past clients first pick of dates before the spring rush. You approve every message first.' },
  { id: 'receptionist', test: /\b24 7 receptionist\b/, core: false,
    answer: '24/7 Receptionist is an optional extra: an AI voice assistant that answers calls day or night.' },
  { id: 'always-on-chat', test: /\balways on chat\b/, core: false,
    answer: 'Always On Chat is an optional extra: an AI chat assistant on your website.' },
  { id: 'one-inbox', test: /\bone inbox\b/, core: false,
    answer: 'One Inbox is an optional extra that puts every lead from every source in one place.' },
  { id: 'crew-updates', test: /\bcrew updates\b/, core: false,
    answer: 'Crew Updates is an optional extra that sends job details and changes to the right cleaner.' },
];
const ABOUT_SHAPE = /^(?:what is|whats|what are|what does|tell me about|tell me more about|explain|how does|how do|can you explain|more about|info on|information on)\b/;

export function cannedReply(message: string): CannedAnswer | undefined {
  let text = clean(message);
  if (!text || text.length > 120) return;
  if (GREETING_ONLY.test(text)) return { id: 'greeting', answer: GREETING_REPLY };
  text = text.replace(GREETING_PREFIX, '');
  // Joined parts ("is it free and do you do offices?") would be answered by half: leave those to the AI.
  if (wordCount(text) > 14 || /\b(?:and|also|plus|but|then)\b/.test(text)) return;

  const found: CannedAnswer[] = INTENTS
    .filter((intent) => wordCount(text) <= (intent.maxWords ?? 8) && intent.test.test(text))
    .map(({ id, answer, cta }) => ({ id, answer, cta }));

  const services = SERVICES.filter((service) => service.test.test(text));
  if (services.length === 1 && wordCount(text) <= 9 && (ABOUT_SHAPE.test(text) || clean(services[0].id.replace(/-/g, ' ')) === text || /\?\s*$/.test(message))) {
    found.push({ id: services[0].id, answer: services[0].answer, cta: services[0].core ? 'Book my free audit to see what it could be worth.' : undefined });
  } else if (services.length > 1) return;

  // Two different readings of one message means it is not clear: let the AI handle it.
  return found.length === 1 ? found[0] : undefined;
}

// The text to send: the nudge only appears before the visitor has started the audit.
export const cannedText = (canned: CannedAnswer, auditStarted: boolean) =>
  auditStarted || !canned.cta ? canned.answer : `${canned.answer}\n\n${canned.cta}`;
