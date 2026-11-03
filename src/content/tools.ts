import { Phone, type LucideIcon } from 'lucide-react';

export interface Tool {
  name: string;
  // Path to the real logo in /public, e.g. '/tools/jobber.svg'. Until it is set, a placeholder tile is shown.
  logo?: string;
  // Placeholder glyph for entries that are not a brand (shown instead of the first letter)
  icon?: LucideIcon;
}

export const TOOLS: Tool[] = [
  { name: 'Jobber' },
  { name: 'Housecall Pro' },
  { name: 'Your business line', icon: Phone },
  { name: 'OpenPhone' },
  { name: 'Stripe' },
  { name: 'QuickBooks' },
  { name: 'Google Business Profile' },
  { name: 'HubSpot' },
  { name: 'Google Sheets' },
];
