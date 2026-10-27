import test from 'node:test';
import assert from 'node:assert/strict';
import { NAV_ITEMS } from './navigation';

test('NAV_ITEMS lists the main sections in page order', () => {
  const ids = NAV_ITEMS.map((item) => item.id);
  assert.deepEqual(ids, ['the-leaks', 'services', 'how-it-works', 'before-after', 'faq']);
});

test('every nav item links to its own section', () => {
  for (const item of NAV_ITEMS) {
    assert.equal(item.href, `#${item.id}`);
    assert.ok(item.label.length > 0);
  }
});
