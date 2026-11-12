export function appointmentNow(timeZone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

export function calendarDays(month: string): (string | null)[] {
  const first = new Date(`${month}-01T00:00:00Z`);
  const next = new Date(first);
  next.setUTCMonth(next.getUTCMonth() + 1);
  next.setUTCDate(0);
  const count = next.getUTCDate();
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - first.getUTCDay() + 1;
    return day >= 1 && day <= count ? `${month}-${String(day).padStart(2, '0')}` : null;
  });
}

export function shiftCalendarMonth(month: string, amount: number) {
  const date = new Date(`${month}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + amount);
  return date.getUTCFullYear() >= 1 && date.getUTCFullYear() <= 9999 ? date.toISOString().slice(0, 7) : month;
}

export function moveCalendarDate(value: string, key: string) {
  const date = new Date(`${value}T00:00:00Z`);
  const offsets: Record<string, number> = {
    ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7,
    Home: -date.getUTCDay(), End: 6 - date.getUTCDay(),
  };
  if (key in offsets) date.setUTCDate(date.getUTCDate() + offsets[key]);
  else if (key === 'PageUp' || key === 'PageDown') {
    const month = shiftCalendarMonth(value.slice(0, 7), key === 'PageUp' ? -1 : 1);
    const days = calendarDays(month).filter((day): day is string => day !== null);
    return `${month}-${String(Math.min(date.getUTCDate(), days.length)).padStart(2, '0')}`;
  } else return value;
  return date.getUTCFullYear() >= 1 && date.getUTCFullYear() <= 9999 ? date.toISOString().slice(0, 10) : value;
}

export function appointmentSlots(date: string, now: string) {
  if (!date) return [];
  return Array.from({ length: 48 }, (_, index) => `${String(Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`)
    .filter((time) => `${date}T${time}` > now);
}

export function appointmentTimeLabel(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
}

export function appointmentDateLabel(date: string, long = false) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC', weekday: long ? 'long' : 'short', month: long ? 'long' : 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(`${date}T00:00:00Z`));
}
