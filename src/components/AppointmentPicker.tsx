import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { APPOINTMENT_TIME_ZONES } from '../utils/appointment';
import { appointmentDateLabel, appointmentNow, appointmentSlots, appointmentTimeLabel, calendarDays, moveCalendarDate, shiftCalendarMonth } from '../utils/appointmentPicker';
import styles from './AppointmentPicker.module.css';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CALENDAR_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];

export function AppointmentPicker({ value, timeZone, onChange, invalid = false }: {
  value: string;
  timeZone: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [clock, setClock] = useState('');
  const [selectedDate, setSelectedDate] = useState(value.slice(0, 10));
  const [month, setMonth] = useState(value.slice(0, 7));
  const [focusedDate, setFocusedDate] = useState(value.slice(0, 10));
  const [focusedTime, setFocusedTime] = useState('09:00');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);
  const focusCalendar = useRef(false);
  const today = clock.slice(0, 10);
  const selectedTime = value.startsWith(`${selectedDate}T`) ? value.slice(11) : '';
  const zoneLabel = APPOINTMENT_TIME_ZONES.find((zone) => zone.value === timeZone)?.label ?? '';
  const times = appointmentSlots(selectedDate, clock);
  const days = month ? calendarDays(month) : [];
  const monthLabel = month ? new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' })
    .format(new Date(`${month}-01T00:00:00Z`)) : '';

  useEffect(() => {
    const refresh = () => setClock(appointmentNow(timeZone));
    refresh();
    const timer = window.setInterval(refresh, 30_000);
    return () => window.clearInterval(timer);
  }, [timeZone]);

  useEffect(() => {
    if (!today) return;
    if (!month || month < today.slice(0, 7)) setMonth(today.slice(0, 7));
    if (!focusedDate || focusedDate < today) setFocusedDate(today);
    if (selectedDate && selectedDate < today) setSelectedDate('');
    if (value && value <= clock) onChange('');
  }, [clock, today, month, focusedDate, selectedDate, value, onChange]);

  useEffect(() => {
    if (!invalid) return;
    focusCalendar.current = true;
    setOpen(true);
  }, [invalid]);

  useEffect(() => {
    if (!open || !focusCalendar.current || !focusedDate) return;
    const button = calendarRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusedDate}"]`);
    if (button) {
      button.focus();
      focusCalendar.current = false;
    }
  }, [open, focusedDate, month]);

  useEffect(() => {
    if (!open || !selectedDate) return;
    const options = appointmentSlots(selectedDate, clock);
    const preferred = options.includes(selectedTime) ? selectedTime : options.includes(focusedTime) ? focusedTime
      : options.includes('09:00') ? '09:00' : options[0];
    if (!preferred) return;
    setFocusedTime(preferred);
    const button = slotsRef.current?.querySelector<HTMLButtonElement>(`[data-time="${preferred}"]`);
    if (button && slotsRef.current) slotsRef.current.scrollTop = Math.max(0, button.offsetTop - 4);
  }, [open, selectedDate, selectedTime, clock]);

  const toggle = () => {
    if (!open) {
      const date = value.slice(0, 10) || selectedDate || today;
      setMonth(date.slice(0, 7));
      setFocusedDate(date);
      focusCalendar.current = true;
    }
    setOpen(!open);
  };

  const navigateMonth = (amount: number) => {
    const next = shiftCalendarMonth(month, amount);
    setMonth(next);
    setFocusedDate(next === today.slice(0, 7) ? today : `${next}-01`);
  };

  const onDateKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: string) => {
    if (!CALENDAR_KEYS.includes(event.key)) return;
    event.preventDefault();
    const next = moveCalendarDate(date, event.key);
    if (next === date) return;
    const target = next < today ? today : next;
    focusCalendar.current = true;
    setMonth(target.slice(0, 7));
    setFocusedDate(target);
  };

  const onTimeKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = Math.min(times.length - 1, index + 1);
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = Math.max(0, index - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = times.length - 1;
    else return;
    event.preventDefault();
    setFocusedTime(times[next]);
    slotsRef.current?.querySelector<HTMLButtonElement>(`[data-time="${times[next]}"]`)?.focus();
  };

  return (
    <div className={styles.picker} onKeyDown={(event) => {
      if (open && event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }}>
      <label htmlFor={`${id}-trigger`} className={styles.label}>Appointment datetime</label>
      <input type="hidden" name="appointment datetime" value={value} />
      <input type="hidden" name="appointmentTimeZone" value={timeZone} />
      <button
        id={`${id}-trigger`}
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={toggle}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        aria-invalid={invalid || undefined}
        aria-describedby={`${id}-hint`}
        aria-label={value ? `Change appointment: ${appointmentDateLabel(value.slice(0, 10))}, ${appointmentTimeLabel(value.slice(11))}` : 'Choose appointment date and time'}
      >
        <CalendarDays className={styles.calendarIcon} aria-hidden="true" />
        <span className={styles.triggerText}>
          <span>{value ? `${appointmentDateLabel(value.slice(0, 10))} at ${appointmentTimeLabel(value.slice(11))}` : 'Select a date & time'}</span>
          <span>{zoneLabel} · 30-minute audit</span>
        </span>
        <ChevronDown className={styles.chevron} data-open={open} aria-hidden="true" />
      </button>

      {open && month && (
        <div id={`${id}-panel`} className={styles.panel} role="region" aria-label="Choose a preferred appointment">
          <div className={styles.panelHeading}>
            <div>
              <h3>Select a date & time</h3>
              <p>Choose your preferred time for a free audit.</p>
            </div>
            <span className={styles.duration}><Clock3 aria-hidden="true" />30 min</span>
          </div>

          <div className={styles.scheduler}>
            <div className={styles.calendar} ref={calendarRef}>
              <div className={styles.monthHeading}>
                <p id={`${id}-month`} aria-live="polite">{monthLabel}</p>
                <div className={styles.monthControls}>
                  <button type="button" onClick={() => navigateMonth(-1)} disabled={month <= today.slice(0, 7)} aria-label="Previous month"><ChevronLeft aria-hidden="true" /></button>
                  <button type="button" onClick={() => navigateMonth(1)} disabled={month === '9999-12'} aria-label="Next month"><ChevronRight aria-hidden="true" /></button>
                </div>
              </div>
              <div role="grid" aria-labelledby={`${id}-month`} className={styles.calendarGrid}>
                <div role="row" className={styles.weekdays}>
                  {WEEKDAYS.map((day) => <span key={day} role="columnheader" aria-label={day}>{day.slice(0, 3)}</span>)}
                </div>
                {Array.from({ length: 6 }, (_, week) => (
                  <div role="row" key={week} className={styles.week}>
                    {days.slice(week * 7, week * 7 + 7).map((date, day) => (
                      <div key={date ?? `empty-${day}`} role="gridcell" aria-selected={date ? date === selectedDate : undefined}>
                        {date && (
                          <button
                            type="button"
                            data-date={date}
                            className={styles.day}
                            disabled={date < today}
                            aria-label={appointmentDateLabel(date, true)}
                            aria-current={date === today ? 'date' : undefined}
                            tabIndex={date === focusedDate ? 0 : -1}
                            onFocus={() => setFocusedDate(date)}
                            onKeyDown={(event) => onDateKeyDown(event, date)}
                            onClick={() => { setSelectedDate(date); onChange(''); }}
                          >{Number(date.slice(8))}</button>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.timePane}>
              <p className={styles.timeHeading}>{selectedDate ? appointmentDateLabel(selectedDate).replace(/, \d{4}$/, '') : 'Pick a day to get started'}</p>
              {selectedDate && times.length > 0 ? (
                <div ref={slotsRef} className={styles.slots} role="listbox" aria-label="Preferred appointment time">
                  {times.map((time, index) => (
                    <button
                      type="button"
                      key={time}
                      role="option"
                      aria-selected={time === selectedTime}
                      data-time={time}
                      tabIndex={time === focusedTime ? 0 : -1}
                      className={styles.slot}
                      onFocus={() => setFocusedTime(time)}
                      onKeyDown={(event) => onTimeKeyDown(event, index)}
                      onClick={() => { onChange(`${selectedDate}T${time}`); setOpen(false); triggerRef.current?.focus(); }}
                    >{appointmentTimeLabel(time)}{time === selectedTime && <Check aria-hidden="true" />}</button>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyTimes}>
                  <CalendarDays aria-hidden="true" />
                  <p>{selectedDate ? 'Please choose another date to see more times.' : 'Select a date on the calendar, then choose a time.'}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
      <p id={`${id}-hint`} className={invalid ? styles.error : styles.hint} role={invalid ? 'alert' : undefined}>
        {invalid ? 'Please select an appointment date and time.' : 'Your preferred time will be confirmed by our team.'}
      </p>
    </div>
  );
}
