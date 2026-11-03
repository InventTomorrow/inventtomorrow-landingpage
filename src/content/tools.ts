import { Calendar, CreditCard, Database, Phone, Star, type LucideIcon } from 'lucide-react';

export interface Tool {
  name: string;
  // Path to the real logo in /public, e.g. '/tools/jobber.svg'. Until it is set, a placeholder tile is shown.
  logo?: string;
  // Placeholder glyph for entries that are not a brand (shown instead of the first letter)
  icon?: LucideIcon;
}

export interface ToolCategory {
  category: string;
  tools: Tool[];
  icon: LucideIcon;
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  { category: 'Booking and scheduling', tools: [{ name: 'Jobber' }, { name: 'Housecall Pro' }], icon: Calendar },
  { category: 'Calls and texts', tools: [{ name: 'Your business line', icon: Phone }, { name: 'OpenPhone' }], icon: Phone },
  { category: 'Payments and invoicing', tools: [{ name: 'Stripe' }, { name: 'QuickBooks' }], icon: CreditCard },
  { category: 'Reviews', tools: [{ name: 'Google Business Profile' }], icon: Star },
  { category: 'CRM and leads', tools: [{ name: 'HubSpot' }, { name: 'Google Sheets' }], icon: Database },
];
