import assert from 'node:assert/strict';
import test from 'node:test';
import { canKeepChatAlive, chatRequest, clearAuditDraft, createChatSession, readAuditDraft, readChatSession, writeAuditDraft, writeChatSession, type AuditDraft, type ChatStorage } from './chatSession';
import { getOrCreateSessionId } from './sessionId';

function memoryStorage(): ChatStorage & Pick<Storage, 'removeItem'> {
  const entries = new Map<string, string>();
  return { getItem: (key) => entries.get(key) || null, setItem: (key, value) => { entries.set(key, value); }, removeItem: (key) => { entries.delete(key); } };
}

test('reload restores the same session, first message, pending delivery and booking state on both pages', () => {
  const storage = memoryStorage();
  for (const pagePath of ['/free-audit', '/free-audit-ads'] as const) {
    const session = createChatSession(pagePath, getOrCreateSessionId(storage));
    session.messages = [{ role: 'user', content: 'I keep missing calls' }];
    session.pendingLog = true;
    session.contact = { email: 'dana@example.com', phone: '+12022345678' };
    session.directLink = true;
    assert.equal(writeChatSession(storage, session), true);
    assert.deepEqual(readChatSession(storage, pagePath), session);
  }
  assert.equal(readChatSession(storage, '/free-audit')!.sessionId, readChatSession(storage, '/free-audit-ads')!.sessionId);
});

test('detailed assistant replies survive reload with all paragraphs intact', () => {
  const storage = memoryStorage();
  const session = createChatSession('/free-audit-ads', 'long-answer-session');
  const explanation = 'Here is how owner-approved follow-up works.\n\n'.repeat(60);
  session.messages = [{ role: 'user', content: 'Explain the service.' }, { role: 'assistant', content: explanation }];
  writeChatSession(storage, session);
  assert.equal(readChatSession(storage, '/free-audit-ads')?.messages[1].content, explanation);
});

test('recovery forwards visitor and AI messages but excludes local connection-error bubbles', () => {
  const session = createChatSession('/free-audit-ads');
  session.messages = [
    { role: 'user', content: 'Help me with old leads' },
    { role: 'assistant', content: 'Sorry, connection failed.', localOnly: true },
  ];
  const request = chatRequest(session, true);
  assert.equal(request.mode, 'log');
  assert.equal(request.sessionId, session.sessionId);
  assert.equal(request.pagePath, '/free-audit-ads');
  assert.deepEqual(request.messages, [{ role: 'user', content: 'Help me with old leads' }]);
  assert.equal(chatRequest(session).mode, undefined);
});

test('a successful delivery acknowledgement persists while malformed or blocked storage does not break chat', () => {
  const storage = memoryStorage();
  const session = createChatSession('/free-audit');
  session.messages = [{ role: 'user', content: 'Help with reviews' }];
  session.pendingLog = true;
  writeChatSession(storage, session);
  writeChatSession(storage, { ...session, pendingLog: false });
  assert.equal(readChatSession(storage, '/free-audit')!.pendingLog, false);
  assert.equal(readChatSession({ ...storage, getItem: () => '{broken' }, '/free-audit'), null);
  assert.equal(readChatSession({ ...storage, getItem: () => JSON.stringify({ ...session, messages: [{ role: 'system', content: 'bad' }] }) }, '/free-audit'), null);
  const blocked = { getItem() { throw new Error('Blocked'); }, setItem() { throw new Error('Quota'); } };
  assert.equal(readChatSession(blocked, '/free-audit'), null);
  assert.equal(writeChatSession(blocked, session), false);
});

test('keepalive stays within the browser byte limit, including non-ASCII messages', () => {
  assert.equal(canKeepChatAlive('small request'), true);
  assert.equal(canKeepChatAlive('x'.repeat(60_000)), false);
  assert.equal(canKeepChatAlive('🙂'.repeat(16_000)), false);
});

test('both audit pages restore the question progress, locked state, tracking and completed results independently', () => {
  const storage = memoryStorage();
  for (const pagePath of ['/free-audit', '/free-audit-ads'] as const) {
    const session = createChatSession(pagePath);
    session.audit = { started: true, answers: { businessName: 'Bright Home', missedCalls: '6–15', oldQuotes: 'Not sure', typicalClean: 'Under $120' }, tracking: { utm_source: 'test' } };
    writeChatSession(storage, session);
    assert.deepEqual(readChatSession(storage, pagePath)?.audit, session.audit);
    assert.equal(readChatSession(storage, pagePath)?.audit?.results, undefined);
    session.audit.results = { missedCallsMonth: 43, missedCallValue: 850, oldQuotesNumber: null, revivalValue: null, guaranteeStatus: 'none' };
    writeChatSession(storage, session);
    assert.deepEqual(readChatSession(storage, pagePath)?.audit?.results, session.audit.results);
    assert.equal(chatRequest(session).experience, 'guided-audit');
  }
});

test('chat logs carry the quick-audit lead only after the popup has been accepted', () => {
  const session = createChatSession('/free-audit', 'browser-session');
  session.audit = { started: true, answers: { businessName: 'Bright Home', missedCalls: '6–15', oldQuotes: 'Not sure', typicalClean: 'Under $120' } };
  assert.equal(chatRequest(session, true).state.audit, undefined, 'answers alone are not a captured lead');
  session.audit.results = { missedCallsMonth: 43, missedCallValue: 850, oldQuotesNumber: null, revivalValue: null, guaranteeStatus: 'none' };
  assert.equal(chatRequest(session, true).state.audit, undefined, 'results without the accepted contact details are not a lead');
  session.audit.contact = { email: 'dana@example.com', phone: '(202) 234-5678' };
  assert.deepEqual(chatRequest(session, true).state.audit, { businessName: 'Bright Home', email: 'dana@example.com', phone: '(202) 234-5678' });
  assert.equal(chatRequest(session).state.audit?.businessName, 'Bright Home');
});

test('a pending audit draft restores every field and the retry ID after reload, independently on each page', () => {
  const storage = memoryStorage();
  const draft: AuditDraft = {
    sessionId: 'browser-session', submissionId: 'audit-request-123456789',
    answers: { businessName: 'Bright Home', missedCalls: '6–15', oldQuotes: 'Not sure', typicalClean: 'Under $120' },
    email: 'dana@example.com', phone: '(202) 234-5678', website: 'https://bright.example', companySize: 'Just me', noWebsite: true,
  };
  writeAuditDraft(storage, '/free-audit-ads', draft);
  assert.deepEqual(readAuditDraft(storage, '/free-audit-ads', draft.sessionId, draft.answers), draft);
  assert.equal(readAuditDraft(storage, '/free-audit', draft.sessionId, draft.answers), null);
  assert.equal(readAuditDraft(storage, '/free-audit-ads', 'another-browser', draft.answers), null);
  assert.equal(readAuditDraft(storage, '/free-audit-ads', draft.sessionId, { ...draft.answers, businessName: 'Other Cleaning' }), null);
  clearAuditDraft(storage, '/free-audit-ads');
  assert.equal(readAuditDraft(storage, '/free-audit-ads', draft.sessionId, draft.answers), null);
});

test('malformed audit drafts or unavailable storage never prevent a fresh submission', () => {
  const answers = { businessName: 'Bright Home', missedCalls: '6–15', oldQuotes: 'Not sure', typicalClean: 'Under $120' } as const;
  const storage = memoryStorage();
  const draft: AuditDraft = { sessionId: 'browser-session', submissionId: 'audit-request-123456789', answers,
    email: '', phone: '', website: '', companySize: '', noWebsite: false };
  for (const changes of [{ submissionId: '' }, { noWebsite: 'false' }, { email: 'x'.repeat(255) }, { companySize: '100 people' }, { answers: {} }]) {
    storage.setItem('invo-audit-draft:v1:/free-audit-ads', JSON.stringify({ ...draft, ...changes }));
    assert.equal(readAuditDraft(storage, '/free-audit-ads', draft.sessionId, answers), null);
  }
  const blocked = { getItem() { throw new Error('Blocked'); }, setItem() { throw new Error('Quota'); }, removeItem() { throw new Error('Blocked'); } };
  assert.equal(readAuditDraft(blocked, '/free-audit-ads', draft.sessionId, answers), null);
  assert.doesNotThrow(() => writeAuditDraft(blocked, '/free-audit-ads', draft));
  assert.doesNotThrow(() => clearAuditDraft(blocked, '/free-audit-ads'));
});

test('restored malformed audit results stay locked and unrecognized answers are discarded', () => {
  const storage = memoryStorage();
  const session = createChatSession('/free-audit-ads');
  session.audit = { started: true, answers: { businessName: 'Bright Home', missedCalls: '6–15', oldQuotes: 'Not sure', typicalClean: 'Under $120' },
    results: { missedCallsMonth: 43, missedCallValue: 999999, oldQuotesNumber: null, revivalValue: null, guaranteeStatus: 'none' } };
  writeChatSession(storage, session);
  assert.equal(readChatSession(storage, '/free-audit-ads')?.audit?.results, undefined);
  storage.setItem('invo-chat:v1:/free-audit-ads', JSON.stringify({ ...session, audit: { started: true, answers: [] } }));
  assert.equal(readChatSession(storage, '/free-audit-ads')?.audit, undefined);
  storage.setItem('invo-chat:v1:/free-audit-ads', JSON.stringify({ ...session, audit: { started: true, answers: { missedCalls: '1000' } } }));
  assert.equal(readChatSession(storage, '/free-audit-ads')?.audit, undefined);
});
