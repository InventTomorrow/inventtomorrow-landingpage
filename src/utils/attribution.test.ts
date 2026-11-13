import assert from 'node:assert/strict';
import test from 'node:test';
import { ATTRIBUTION_KEY, captureAttribution, isTrackingKey, pickTracking, readAttribution, trackingFromSearch } from './attribution';

function memoryStorage(): Pick<Storage, 'getItem' | 'setItem'> {
  const entries = new Map<string, string>();
  return { getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => { entries.set(key, value); } };
}

test('only allowlisted ad tags are kept, with sane values', () => {
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'gclid', 'fbclid', 'msclkid']) assert.equal(isTrackingKey(key), true, key);
  for (const key of ['utm_other', 'ref', 'email', 'book']) assert.equal(isTrackingKey(key), false, key);
  assert.deepEqual(trackingFromSearch('?utm_source=facebook&book=1&email=dana%40example.com&gclid=abc'), { utm_source: 'facebook', gclid: 'abc' });
  assert.deepEqual(pickTracking({ utm_source: 'x'.repeat(501), utm_medium: '', utm_campaign: 7, utm_term: 'ok' }), { utm_term: 'ok' });
  assert.deepEqual(pickTracking(null), {});
  assert.deepEqual(pickTracking(['utm_source']), {});
});

test('the first ad that brought the visitor wins, so later navigation keeps its attribution', () => {
  const storage = memoryStorage();
  assert.deepEqual(captureAttribution('', storage), {}, 'an untagged visit stores nothing');
  assert.equal(storage.getItem(ATTRIBUTION_KEY), null);
  assert.deepEqual(captureAttribution('?utm_source=facebook&utm_campaign=spring', storage), { utm_source: 'facebook', utm_campaign: 'spring' });
  // A later page (client-side navigation drops the query) or a different ad does not overwrite it.
  assert.deepEqual(captureAttribution('', storage), { utm_source: 'facebook', utm_campaign: 'spring' });
  assert.deepEqual(captureAttribution('?utm_source=google', storage), { utm_source: 'facebook', utm_campaign: 'spring' });
  assert.deepEqual(readAttribution(storage), { utm_source: 'facebook', utm_campaign: 'spring' });
});

test('corrupt or blocked storage never prevents capture', () => {
  const corrupt = memoryStorage();
  corrupt.setItem(ATTRIBUTION_KEY, '{not json');
  assert.deepEqual(readAttribution(corrupt), {});
  corrupt.setItem(ATTRIBUTION_KEY, JSON.stringify({ utm_source: 'ok', injected: 'drop' }));
  assert.deepEqual(readAttribution(corrupt), { utm_source: 'ok' });
  const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
  assert.deepEqual(readAttribution(blocked), {});
  assert.deepEqual(captureAttribution('?utm_source=facebook', blocked), { utm_source: 'facebook' });
});
