import { COMPANY_SIZE_OPTIONS } from './freeAudit';

export type CompanySize = typeof COMPANY_SIZE_OPTIONS[number];

// If the visitor already told Invo their team size in the chat, the audit form uses it
// instead of asking again. Only clear answers count; anything vague leaves the form's question in place.
interface ChatLine { role: 'user' | 'assistant'; content: string; localOnly?: boolean }

const WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, twenty: 20, thirty: 30,
};
const NUMBER = `(\\d{1,3}|${Object.keys(WORDS).join('|')})`;
const UNIT = '(?:cleaners?|people|persons?|employees?|staff|workers?|crew|crews|team members?|technicians?|girls|guys|ladies|helpers?)';

// What Invo might have asked, in its own words.
const TEAM_QUESTION = /\bhow many (?:cleaners|people|employees|staff|team members|crew|workers|of you)\b|\b(?:team|company|crew) size\b|\bhow big (?:is|are) (?:your|the) (?:team|crew|business|company)\b|\bsolo\b.*\bor\b.*\bteam\b|\bdo you work alone\b/i;

const clean = (text: string) => text.toLowerCase().replace(/[’‘]/g, "'").replace(/[–—−]/g, '-').replace(/\s+/g, ' ').trim();
const toNumber = (value: string) => (/^\d+$/.test(value) ? Number(value) : WORDS[value]);

function bucket(count: number): CompanySize | null {
  if (!Number.isFinite(count) || count < 1) return null;
  return count === 1 ? 'Just me' : count <= 4 ? '2–4 cleaners' : count <= 10 ? '5–10 cleaners' : 'More than 10';
}

const SOLO = /^(?:just me|only me|me|solo|myself|by myself|alone|its just me|it's just me|just myself|i work alone|i work by myself|im solo|i'm solo|one man band|one man show)$/;
const SOLO_STATEMENT = /\b(?:i work (?:alone|by myself|solo)|i am (?:a )?solo|i'?m (?:a )?solo|work(?:ing)? by myself|(?:it'?s|its) just me(?!\s+and)|just me(?:,|\.|$))/;

// A reply to a team-size question: "2-4 cleaners", "just me", "5", "about 8 people", "over 10", "10+".
function answerTo(text: string): CompanySize | null {
  const t = clean(text).replace(/[.!]+$/, '');
  const exact = COMPANY_SIZE_OPTIONS.find((option) => clean(option) === t);
  if (exact) return exact;
  if (SOLO.test(t)) return 'Just me';
  if (/\b(?:more than|over|above|at least)\s*(?:10|ten)\b|\b1[1-9]\+?\s*(?:cleaners|people)\b|^(?:10|ten)\s*\+$/.test(t)) return 'More than 10';
  const range = t.match(new RegExp(`\\b${NUMBER}\\s*(?:-|to|or)\\s*${NUMBER}\\b`));
  if (range) {
    const [a, b] = [toNumber(range[1]), toNumber(range[2])];
    if (a && b && a < b) return bucket(Math.round((a + b) / 2));
  }
  const single = t.match(new RegExp(`^(?:about|around|roughly|approximately|we have|i have|there are|we are|were|we're|i've got|ive got|team of)?\\s*${NUMBER}(?:\\s*${UNIT})?(?:\\s+(?:in total|total|including me))?$`));
  return single ? bucket(toNumber(single[1])) : null;
}

// Something the visitor said without being asked: "I have 3 cleaners", "team of 6", "I work alone".
// A number only counts next to a word for people, so "120 old quotes" is never mistaken for a team.
function statedIn(text: string): CompanySize | null {
  const t = clean(text);
  if (SOLO_STATEMENT.test(t)) return 'Just me';
  const teamOf = t.match(new RegExp(`\\b(?:team|crew|staff) of ${NUMBER}\\b`));
  if (teamOf) return bucket(toNumber(teamOf[1]));
  const withUnit = t.match(new RegExp(`\\b(?:we have|i have|i've got|ive got|we've got|there are|there're|we are|we're|i employ|i manage|i run a)\\s+(?:a\\s+)?(?:about\\s+|around\\s+)?${NUMBER}[- ]${UNIT}\\b`));
  if (withUnit) return bucket(toNumber(withUnit[1]));
  const personTeam = t.match(new RegExp(`\\b${NUMBER}[- ](?:person|man|woman) (?:team|crew|company|business)\\b`));
  return personTeam ? bucket(toNumber(personTeam[1])) : null;
}

export function companySizeFromChat(messages: readonly ChatLine[]): CompanySize | null {
  let found: CompanySize | null = null;
  let lastAssistant = '';
  for (const message of messages) {
    if (message.localOnly) continue;
    if (message.role === 'assistant') { lastAssistant = message.content; continue; }
    // The audit's own questions carry answers such as "50–200" that are not about team size.
    const size = (TEAM_QUESTION.test(lastAssistant) ? answerTo(message.content) : null) ?? statedIn(message.content);
    if (size) found = size;
  }
  return found;
}
