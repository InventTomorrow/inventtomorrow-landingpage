export interface Stat {
  value: string;
  // Small blue text after the number
  suffix?: string;
  label: string;
  // Part of the label shown in bold
  bold?: string;
}

export const STATS: Stat[] = [
  { value: '7', suffix: ' Problems', label: 'We Fix' },
  { value: '90', suffix: ' day', label: 'Growth Guarantee or Refund', bold: 'Growth Guarantee' },
  { value: '5', suffix: ' Clients', label: 'Founding Spots' },
  { value: '15', suffix: ' min', label: 'Free Audit Call' },
];
