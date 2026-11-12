import test from 'node:test';
import assert from 'node:assert/strict';
import { NAV_ITEMS } from './navigation';

test('NAV_ITEMS lists the main pages in navbar order', () => {
  const ids = NAV_ITEMS.map((item) => item.id);
  assert.deepEqual(ids, ['home', 'how-it-works', 'services', 'our-work', 'about']);
});

test('every nav item links to its own page', () => {
  for (const item of NAV_ITEMS) {
    assert.ok(item.to.startsWith('/'));
    assert.ok(item.label.length > 0);
  }
  assert.equal(new Set(NAV_ITEMS.map((item) => item.to)).size, NAV_ITEMS.length);
});