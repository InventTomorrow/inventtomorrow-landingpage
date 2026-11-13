import assert from 'node:assert/strict';
import test from 'node:test';
import { chatRequest, createChatSession, readChatSession, writeChatSession } from './chatSession';
import { getOrCreateSessionId, SESSION_ID_KEY, validSessionId, type SessionStorage } from './sessionId';

function memoryStorage(): SessionStorage {
  const entries = new Map<string, string>();
  return { getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => { entries.set(key, value); } };
}

test('the same browser ID survives reopening and connects both page histories and forms', () => {
  const storage = memoryStorage();
  const formSessionId = getOrCreateSessionId(storage);
  assert.equal(storage.getItem(SESSION_ID_KEY), formSessionId);
  for (const pagePath of ['/free-audit', '/free-audit-ads'] as const) {
    const chat = createChatSession(pagePath, getOrCreateSessionId(storage));
    chat.messages = [{ role: 'user', content: pagePath }];
    writeChatSession(storage, chat);
    const reopened = readChatSession(storage, pagePath)!;
    assert.equal(chatRequest(reopened).sessionId, formSessionId);
    assert.equal(reopened.messages[0].content, pagePath);
  }
  assert.equal(getOrCreateSessionId(storage), formSessionId);
  assert.notEqual(getOrCreateSessionId(memoryStorage()), formSessionId);
});

test('a form-first visit adopts an existing chat ID and the shared ID takes precedence', () => {
  for (const pagePath of ['/free-audit', '/free-audit-ads'] as const) {
    const storage = memoryStorage();
    writeChatSession(storage, createChatSession(pagePath, 'existing-chat'));
    assert.equal(getOrCreateSessionId(storage), 'existing-chat');
    storage.setItem(SESSION_ID_KEY, 'shared-browser');
    assert.equal(getOrCreateSessionId(storage), 'shared-browser');
  }
});

test('corrupt, unavailable and full storage still produce a usable session ID', () => {
  const corrupt = memoryStorage();
  corrupt.setItem(SESSION_ID_KEY, ' ');
  corrupt.setItem('invo-chat:v1:/free-audit', '{broken');
  const id = getOrCreateSessionId(corrupt);
  assert.ok(validSessionId(id));
  const blocked = { getItem() { throw new Error('Blocked'); }, setItem() { throw new Error('Quota'); } };
  assert.equal(getOrCreateSessionId(blocked, id), id);
  assert.ok(validSessionId(getOrCreateSessionId(blocked)));
  for (const value of [null, {}, '', ' ', 'a'.repeat(65), 'invalid\nvalue']) assert.equal(validSessionId(value), null);
});
