import { FIXES } from './fixes';

export interface Stat {
  value: number;
  // Small blue text after the number
  suffix?: string;
  label: string;
}

export const STATS: Stat[] = [
  { value: FIXES.length, suffix: ' Problems', label: 'We Fix' },
  { value: 90, suffix: ' day', label: 'Growth Guarantee or Refund' },
  { value: 5, suffix: ' Clients', label: 'Founding Spots' },
  { value: 15, suffix: ' min', label: 'Free Audit Call' },
];
