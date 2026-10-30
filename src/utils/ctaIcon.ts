import { CalendarDays, ClipboardCheck, type LucideIcon } from 'lucide-react';
import { AUDIT_PATH, BOOKING_PATH } from './navigation';

const ICONS_BY_PATH = new Map<string, LucideIcon>([
  [AUDIT_PATH, ClipboardCheck],
  [BOOKING_PATH, CalendarDays],
]);

export function getCtaIconForPath(path: string): LucideIcon | undefined {
  return ICONS_BY_PATH.get(path);
}
