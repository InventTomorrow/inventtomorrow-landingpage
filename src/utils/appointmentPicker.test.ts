import assert from 'node:assert/strict';
import test from 'node:test';
import { appointmentDateLabel, appointmentNow, appointmentSlots, appointmentTimeLabel, calendarDays, moveCalendarDate, shiftCalendarMonth } from './appointmentPicker';

test('calendar months align weekdays and include leap days without spilling into adjacent months', () => {
  const november = calendarDays('2026-11');
  assert.equal(november.length, 42);
  assert.equal(november[0], '2026-11-01');
  assert.equal(november[29], '2026-11-30');
  assert.equal(november[30], null);
  const february = calendarDays('2028-02');
  assert.equal(february[0], null);
  assert.equal(february[2], '2028-02-01');
  assert.equal(february.filter(Boolean).length, 29);
  assert.ok(february.includes('2028-02-29'));
});

test('calendar month navigation and keyboard movement handle year boundaries and short months', () => {
  assert.equal(shiftCalendarMonth('2026-12', 1), '2027-01');
  assert.equal(shiftCalendarMonth('2027-01', -1), '2026-12');
  assert.equal(shiftCalendarMonth('9999-12', 1), '9999-12');
  assert.equal(moveCalendarDate('2028-01-31', 'PageDown'), '2028-02-29');
  assert.equal(moveCalendarDate('2027-01-31', 'PageDown'), '2027-02-28');
  assert.equal(moveCalendarDate('2026-12-31', 'ArrowRight'), '2027-01-01');
  assert.equal(moveCalendarDate('2026-11-11', 'ArrowUp'), '2026-11-04');
  assert.equal(moveCalendarDate('2026-11-11', 'Home'), '2026-11-08');
  assert.equal(moveCalendarDate('2026-11-11', 'End'), '2026-11-14');
});

test('appointment slots exclude expired times and retain the full next day in 30-minute steps', () => {
  assert.deepEqual(appointmentSlots('', '2030-06-15T14:15'), []);
  assert.deepEqual(appointmentSlots('2030-06-14', '2030-06-15T14:15'), []);
  assert.equal(appointmentSlots('2030-06-15', '2030-06-15T14:15')[0], '14:30');
  assert.equal(appointmentSlots('2030-06-15', '2030-06-15T14:30')[0], '15:00');
  assert.deepEqual(appointmentSlots('2030-06-15', '2030-06-15T23:30'), []);
  const tomorrow = appointmentSlots('2030-06-16', '2030-06-15T14:15');
  assert.equal(tomorrow.length, 48);
  assert.equal(tomorrow[0], '00:00');
  assert.equal(tomorrow.at(-1), '23:30');
});

test('the scheduler clock follows US zones across midnight and daylight saving changes', () => {
  const date = new Date('2030-06-16T04:30:00Z');
  assert.equal(appointmentNow('America/New_York', date), '2030-06-16T00:30');
  assert.equal(appointmentNow('America/Los_Angeles', date), '2030-06-15T21:30');
  assert.equal(appointmentNow('Pacific/Honolulu', date), '2030-06-15T18:30');
  assert.equal(appointmentNow('America/New_York', new Date('2026-03-08T06:30:00Z')), '2026-03-08T01:30');
  assert.equal(appointmentNow('America/New_York', new Date('2026-03-08T07:30:00Z')), '2026-03-08T03:30');
});

test('appointment summaries use readable US date and time labels including midnight and noon', () => {
  assert.equal(appointmentTimeLabel('00:00'), '12:00 AM');
  assert.equal(appointmentTimeLabel('12:00'), '12:00 PM');
  assert.equal(appointmentTimeLabel('14:30'), '2:30 PM');
  assert.equal(appointmentDateLabel('2026-11-12'), 'Thu, Nov 12, 2026');
});
