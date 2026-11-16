import assert from 'node:assert/strict';
import test from 'node:test';
import { companySizeFromChat } from './companySize';

const chat = (...lines: string[]) => lines.map((content, index) => ({ role: (index % 2 ? 'assistant' : 'user') as 'user' | 'assistant', content }));
const asked = (answer: string) => companySizeFromChat([
  { role: 'user', content: 'Tell me more' }, { role: 'assistant', content: 'How many cleaners do you have?' }, { role: 'user', content: answer },
]);

test('an answer to Invo asking about team size is used by the form', () => {
  const expected: Record<string, string | null> = {
    'Just me': 'Just me', 'just me.': 'Just me', 'solo': 'Just me', 'by myself': 'Just me', '1': 'Just me', 'one': 'Just me',
    '2': '2–4 cleaners', '3 cleaners': '2–4 cleaners', 'about 4': '2–4 cleaners', '2-4': '2–4 cleaners', '2–4 cleaners': '2–4 cleaners',
    '5': '5–10 cleaners', 'about 8 people': '5–10 cleaners', '5 to 10': '5–10 cleaners', 'we have six': '5–10 cleaners', '10': '5–10 cleaners',
    '11': 'More than 10', '25 staff': 'More than 10', 'over 10': 'More than 10', 'More than 10': 'More than 10', '10+': 'More than 10',
    'a small team': null, 'it depends': null, 'why do you ask?': null, 'what is the audit': null,
  };
  for (const [answer, size] of Object.entries(expected)) assert.equal(asked(answer), size, answer);
});

test('a team size the visitor volunteers counts, but numbers about other things do not', () => {
  for (const [text, size] of Object.entries({
    'I have 3 cleaners and miss calls': '2–4 cleaners', "We're a team of 6": '5–10 cleaners', 'I run a 12-person team': 'More than 10',
    'I work alone': 'Just me', "it's just me": 'Just me', 'we have 15 staff': 'More than 10', 'I employ five people': '5–10 cleaners',
  })) assert.equal(companySizeFromChat(chat(text)), size, text);
  for (const text of ['I have 120 old quotes', 'We miss about 20 calls a week', 'A clean costs $150', 'I have 2 offices to clean', 'just me and my husband', '5 star reviews', 'Book my free audit']) {
    assert.equal(companySizeFromChat(chat(text)), null, text);
  }
});

test("the audit's own answers are never read as team size, and the latest clear answer wins", () => {
  assert.equal(companySizeFromChat([
    { role: 'user', content: 'Book my free audit' }, { role: 'assistant', content: 'What does a typical clean cost?' },
    { role: 'user', content: '$120–$180' }, { role: 'assistant', content: 'How many quotes from the past year never got booked?' }, { role: 'user', content: '50–200' },
  ]), null);
  assert.equal(companySizeFromChat([
    { role: 'assistant', content: 'What is your company size?' }, { role: 'user', content: 'just me' },
    { role: 'assistant', content: 'And how many cleaners now?' }, { role: 'user', content: '4' },
  ]), '2–4 cleaners');
  assert.equal(companySizeFromChat([
    { role: 'assistant', content: 'How many cleaners do you have?' }, { role: 'assistant', content: 'Sorry, connection failed.', localOnly: true }, { role: 'user', content: '7' },
  ]), '5–10 cleaners');
  assert.equal(companySizeFromChat([]), null);
});
