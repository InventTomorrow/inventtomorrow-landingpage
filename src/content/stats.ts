import { FIXES } from './fixes';

export interface Stat {
  value: number;
  // Small blue text after the number
  suffix?: string;
  label: string;
}

export const STATS: Stat[] = [
  { value: FIXES.length, label: 'Fixes built and run for you' },
  { value: 90, suffix: '-day', label: 'Guarantee' },
  { value: 10, label: 'Founding client spots' },
  { value: 15, suffix: ' min', label: 'Free audit call' },
];
