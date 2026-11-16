import assert from 'node:assert/strict';
import test from 'node:test';
import { formatUsPhoneInput, isValidUsPhone, normalizeUsPhone, normalizeWebsite, PHONE_PREFIX } from './contactChecks';

test('the phone box starts as +1 and shows whatever is typed or pasted in one US format', () => {
  assert.equal(PHONE_PREFIX, '+1 ');
  assert.equal(formatUsPhoneInput(''), '+1 ');
  const expected: Record<string, string> = {
    '2': '+1 (2', '202': '+1 (202', '2022': '+1 (202) 2', '202234': '+1 (202) 234', '2022345678': '+1 (202) 234-5678',
    '(202) 234-5678': '+1 (202) 234-5678', '202.234.5678': '+1 (202) 234-5678', '+1 202 234 5678': '+1 (202) 234-5678',
    '12022345678': '+1 (202) 234-5678', '+12022345678': '+1 (202) 234-5678', '+1 12022345678': '+1 (202) 234-5678',
    '+1 (202) 234-56789999': '+1 (202) 234-5678', 'abc': '+1 ', '1': '+1 ', '+1': '+1 ', '+1 (': '+1 ',
  };
  for (const [typed, shown] of Object.entries(expected)) assert.equal(formatUsPhoneInput(typed), shown, typed);
  // Deleting back through the formatting works: each step is a prefix of the last.
  assert.equal(formatUsPhoneInput('+1 (202) '), '+1 (202');
  assert.equal(formatUsPhoneInput('+1 (202'), '+1 (202');
  assert.equal(formatUsPhoneInput('+1 ('), '+1 ');
});

test('a number pasted with another country code is dropped, never turned into a different US number', () => {
  for (const pasted of ['+44 20 7946 0958', '+91 98765 43210', '+7 912 345 6789', '+61 412 345 678']) {
    assert.equal(formatUsPhoneInput(pasted), '+1 ', pasted);
  }
  assert.equal(formatUsPhoneInput('+15'), '+1 (5');
});

test('only complete, plausible US numbers are valid, in the formatted shape the form shows', () => {
  for (const good of ['+1 (202) 234-5678', '(202) 234-5678', '202-234-5678', '12022345678']) assert.ok(isValidUsPhone(formatUsPhoneInput(good)), good);
  for (const bad of ['+1 ', '+1 (202', '+1 (202) 234-567', '+1 (111) 234-5678', '+1 (202) 134-5678', '+1 (911) 234-5678', '+1 (555) 555-5555', '+1 (202) 555-0123']) {
    assert.equal(isValidUsPhone(bad), false, bad);
  }
  assert.equal(normalizeUsPhone('+1 (202) 234-5678'), '+12022345678');
});

test('a website must look like a real domain, and is turned into a clean https address', () => {
  const good: Record<string, string> = {
    'brighthome.com': 'https://brighthome.com/', 'BrightHome.com': 'https://brighthome.com/', 'www.brighthome.com/about': 'https://www.brighthome.com/about',
    'https://brighthome.com': 'https://brighthome.com/', 'http://bright-home.co.uk': 'http://bright-home.co.uk/', '  brighthome.com  ': 'https://brighthome.com/',
    'shop.brighthome.io': 'https://shop.brighthome.io/', 'münchen.de': 'https://xn--mnchen-3ya.de/', 'example.com:443': 'https://example.com/',
  };
  for (const [typed, clean] of Object.entries(good)) assert.equal(normalizeWebsite(typed), clean, typed);
  for (const bad of ['', '   ', 'brighthome', 'my website.com', 'a.b', 'x.c', 'localhost', '192.168.1.1', 'bright_home.com', '-bad.com', 'bad-.com', '.com', 'brighthome..com',
    'ftp://brighthome.com', 'javascript:alert(1)', 'http://user:pw@brighthome.com', 'brighthome.com:8080', 'no dots here', 'http://', 'https://.com', 'x'.repeat(2049) + '.com']) {
    assert.equal(normalizeWebsite(bad), '', bad.slice(0, 40));
  }
  assert.equal(normalizeWebsite(null), '');
  assert.equal(normalizeWebsite(42), '');
});
