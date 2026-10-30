import test from 'node:test';
import assert from 'node:assert/strict';
import { CalendarDays, ClipboardCheck } from 'lucide-react';
import { getCtaIconForPath } from './ctaIcon';
import { AUDIT_PATH, BOOKING_PATH } from './navigation';

test('getCtaIconForPath gives the audit link a clipboard icon', () => {
  assert.equal(getCtaIconForPath(AUDIT_PATH), ClipboardCheck);
});

test('getCtaIconForPath gives the booking link a calendar icon', () => {
  assert.equal(getCtaIconForPath(BOOKING_PATH), CalendarDays);
});

test('getCtaIconForPath returns nothing for other paths', () => {
  assert.equal(getCtaIconForPath('/'), undefined);
  assert.equal(getCtaIconForPath('constructor'), undefined);
});
