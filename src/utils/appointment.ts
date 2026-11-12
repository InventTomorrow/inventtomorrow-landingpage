export const DEFAULT_APPOINTMENT_TIME_ZONE = 'America/New_York';

export const APPOINTMENT_TIME_ZONES = [
  { value: 'America/New_York', label: 'Eastern time (New York)' },
  { value: 'America/Chicago', label: 'Central time (Chicago)' },
  { value: 'America/Denver', label: 'Mountain time (Denver)' },
  { value: 'America/Los_Angeles', label: 'Pacific time (Los Angeles)' },
  { value: 'America/Phoenix', label: 'Arizona (Phoenix)' },
  { value: 'America/Anchorage', label: 'Alaska (Anchorage)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (Honolulu)' },
];

export function isUsAppointmentTimeZone(value: unknown): value is string {
  return typeof value === 'string' && APPOINTMENT_TIME_ZONES.some((zone) => zone.value === value);
}
