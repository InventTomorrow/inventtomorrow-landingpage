export interface Stat {
  value: string;
  // Small blue text after the number
  suffix?: string;
  label: string;
}

export const STATS: Stat[] = [
  { value: '18', suffix: ' new jobs', label: 'booked from old enquiries' },
  { value: 'Seconds', label: 'to text back a missed call' },
  { value: 'About 1', suffix: ' hour', label: 'of your time to start setup' },
  { value: '3 of 5', label: 'founding spots left' },
];
