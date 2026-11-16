import assert from 'node:assert/strict';
import test from 'node:test';
import { cannedReply, cannedText, GREETING_REPLY, stripGreeting } from './cannedAnswers';

const id = (message: string) => cannedReply(message)?.id;

test('greetings and small talk get an instant reply', () => {
  for (const message of ['hi', 'Hello!', 'hey there', 'Good morning', 'HIYA', 'hello invo', 'hi invo how are you', 'Howdy.']) {
    assert.equal(id(message), 'greeting', message);
  }
  assert.equal(cannedReply('hi')?.answer, GREETING_REPLY);
  assert.equal(id('how are you'), 'how-are-you');
  assert.equal(id('Thanks!'), 'thanks');
  assert.equal(id('thank you so much'), 'thanks');
  assert.equal(id('ok'), 'ack');
  assert.equal(id('bye'), 'goodbye');
});

test('the most common questions have fixed answers', () => {
  const expected: Record<string, string> = {
    'Is the audit free?': 'audit-free', 'is it free': 'audit-free', 'does the call cost anything': 'audit-free',
    'how long is the call': 'audit-length', 'How long does the audit take?': 'audit-length',
    'how does the audit work?': 'audit-what', 'What happens on the call?': 'audit-what', 'what is the audit': 'audit-what',
    'Are you human?': 'human', 'are you a robot?': 'human', 'is this a bot': 'human', 'am I talking to a real person': 'human',
    'who are you': 'about', 'what do you do': 'about', 'what services do you offer': 'about',
    'what is the guarantee': 'guarantee', 'how does the guarantee work': 'guarantee',
    'do I have to approve the messages?': 'approval', 'who writes the messages': 'approval',
    'do I need new software?': 'software', 'does it work with Jobber?': 'software', 'is it compatible with my CRM': 'software',
    'What is Quote Revival?': 'quote-revival', 'how does missed call rescue work': 'missed-call-rescue',
    'tell me about 5 star engine': '5-star-engine', 'what is one inbox': 'one-inbox', 'Crew Updates': 'crew-updates',
    'what is 60 second response': '60-second-response', 'tell me about the 24/7 receptionist': 'receptionist',
  };
  for (const [message, answer] of Object.entries(expected)) assert.equal(id(message), answer, message);
});

test('a greeting in front of a question does not stop it being understood', () => {
  assert.equal(id('Hi, is the audit free?'), 'audit-free');
  assert.equal(id('hello are you a bot'), 'human');
  assert.equal(stripGreeting('hi, I am missing calls'), 'I am missing calls');
  assert.equal(stripGreeting("Hello Invo - I'm missing calls"), "I'm missing calls");
  assert.equal(stripGreeting('Hi'), 'Hi', 'a bare greeting is left for the greeting reply');
});

test('anything long, unclear or covering several things goes to the AI instead', () => {
  for (const message of [
    'How do you handle after-hours enquiries?', 'Do you cover commercial offices?', 'how long does setup take',
    'I run a 5 person team in Austin and miss about 20 calls a week, what should I do first?',
    'what is quote chaser and quote revival', 'is the audit free and what do you charge per month',
    'what is the guarantee and how much does it cost', 'What does the guarantee cover if I only have 120 quotes and no old leads at all?',
    'what is the audit cost', 'is the audit free and do you do offices', 'is the audit free but how long is it',
    'Quote Revival and how much', 'tell me everything', '', '   ', '🙂',
  ]) assert.equal(cannedReply(message), undefined, message);
});

test('every fixed answer is short, plain, calm and accurate', () => {
  const messages = ['hi', 'how are you', 'thanks', 'ok', 'bye', 'Is the audit free?', 'how long is the call', 'what is the audit', 'are you human', 'who are you',
    'what is the guarantee', 'do I have to approve the messages', 'do I need new software', 'What is Quote Revival?', 'how does missed call rescue work',
    'what is quote chaser', 'what is recurring booker', 'what is busy season ready', 'what is 5 star engine', 'what is 60 second response',
    'what is the 24/7 receptionist', 'what is always on chat', 'what is one inbox', 'what is crew updates'];
  for (const message of messages) {
    const canned = cannedReply(message)!;
    const text = cannedText(canned, false);
    assert.ok(canned.answer.split(/\s+/).length <= 45, `${message}: ${canned.answer.split(/\s+/).length} words`);
    assert.doesNotMatch(text, /[!*#`]|\]\(|\bpipeline|\bCRM\b|automation|workflow|leverage/i, message);
    assert.equal(cannedText(canned, true), canned.answer, 'the audit nudge disappears once the audit has started');
  }
  // Facts that must stay exactly right.
  assert.match(cannedReply('is the audit free')!.answer, /free and takes 15 minutes/);
  assert.match(cannedReply('what is the guarantee')!.answer, /at least 200 past enquiries or quotes/);
  assert.match(cannedReply('what is the guarantee')!.answer, /first 90 days/);
  assert.doesNotMatch(cannedReply('what is the guarantee')!.answer, /unconditional|guaranteed revenue/i);
  assert.equal(cannedReply('do I need new software')!.answer, "We'll check whether your current tools can support it during the audit.");
  assert.match(cannedReply('are you human')!.answer, /AI assistant/);
  assert.match(cannedReply('what is the 24/7 receptionist')!.answer, /AI voice/);
  assert.match(cannedReply('what is 5 star engine')!.answer, /AI drafted replies you approve/);
  assert.match(cannedReply('what is quote revival')!.answer, /You approve every message first/);
});
