import test from 'node:test';
import assert from 'node:assert/strict';
import { NAV_ITEMS, calendlyLink, CALENDLY_URL } from './navigation';

test('NAV_ITEMS lists the main pages in navbar order', () => {
  const ids = NAV_ITEMS.map((item) => item.id);
  assert.deepEqual(ids, ['home', 'how-it-works', 'services', 'about', 'blog']);
});

test('every nav item links to its own page', () => {
  for (const item of NAV_ITEMS) {
    assert.ok(item.to.startsWith('/'));
    assert.ok(item.label.length > 0);
  }
  assert.equal(new Set(NAV_ITEMS.map((item) => item.to)).size, NAV_ITEMS.length);
});

test('calendlyLink fills in name and email', () => {
  const url = new URL(calendlyLink('Sam Lee', 'sam@example.com'));
  assert.equal(url.origin + url.pathname, CALENDLY_URL);
  assert.equal(url.searchParams.get('name'), 'Sam Lee');
  assert.equal(url.searchParams.get('email'), 'sam@example.com');
});

test('calendlyLink without details is the plain booking link', () => {
  assert.equal(calendlyLink(), CALENDLY_URL);
});
