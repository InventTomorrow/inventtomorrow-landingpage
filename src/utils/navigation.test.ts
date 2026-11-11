import test from 'node:test';
import assert from 'node:assert/strict';
import { NAV_ITEMS, calendlyLink, CALENDLY_URL } from './navigation';

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

test('calendlyLink fills in name and email', () => {
  const url = new URL(calendlyLink('Sam Lee', 'sam@example.com'));
  assert.equal(url.origin + url.pathname, CALENDLY_URL);
  assert.equal(url.searchParams.get('name'), 'Sam Lee');
  assert.equal(url.searchParams.get('email'), 'sam@example.com');
});

test('calendlyLink without details is the plain booking link', () => {
  assert.equal(calendlyLink(), CALENDLY_URL);
});

test('calendlyLink carries business details into the matching invitee questions without corrupting special characters', () => {
  const url = new URL(calendlyLink(' Sam Lee ', ' sam+audit@example.com ', {
    businessName: ' Bright & Clean = Home Services ',
    phone: ' +44 (0)20 7946 0958 ',
    description: 'Help with quotes & follow-ups.\nWe use Jobber. Can you help?',
  }));
  assert.equal(url.origin + url.pathname, CALENDLY_URL);
  assert.equal(url.searchParams.get('name'), 'Sam Lee');
  assert.equal(url.searchParams.get('email'), 'sam+audit@example.com');
  assert.equal(url.searchParams.get('a1'), 'Bright & Clean = Home Services');
  assert.equal(url.searchParams.get('a2'), '+44 (0)20 7946 0958');
  assert.equal(url.searchParams.get('a3'), 'Help with quotes & follow-ups.\nWe use Jobber. Can you help?');
  assert.equal([...url.searchParams].length, 5);
});

test('calendlyLink omits unanswered and whitespace-only fields', () => {
  assert.equal(calendlyLink(' ', '', { businessName: ' ', phone: '', description: '\n ' }), CALENDLY_URL);
  const url = new URL(calendlyLink('Sam Lee', 'sam@example.com', { businessName: 'Bright Home' }));
  assert.equal(url.searchParams.get('a1'), 'Bright Home');
  assert.equal(url.searchParams.has('a2'), false);
  assert.equal(url.searchParams.has('a3'), false);
});
