import assert from 'node:assert/strict';
import test from 'node:test';
import { canKeepChatAlive, chatRequest, createChatSession, readChatSession, writeChatSession, type ChatStorage } from './chatSession';

function memoryStorage(): ChatStorage {
  const entries = new Map<string, string>();
  return { getItem: (key) => entries.get(key) || null, setItem: (key, value) => { entries.set(key, value); } };
}

test('reload restores the same session, first message, pending delivery and booking state on both pages', () => {
  const storage = memoryStorage();
  for (const pagePath of ['/free-audit', '/free-audit-ads'] as const) {
    const session = createChatSession(pagePath);
    session.messages = [{ role: 'user', content: 'I keep missing calls' }];
    session.pendingLog = true;
    session.contact = { email: 'dana@example.com', phone: '+12022345678' };
    session.directLink = true;
    assert.equal(writeChatSession(storage, session), true);
    assert.deepEqual(readChatSession(storage, pagePath), session);
  }
  assert.notEqual(readChatSession(storage, '/free-audit')!.sessionId, readChatSession(storage, '/free-audit-ads')!.sessionId);
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
