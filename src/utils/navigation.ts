export interface NavItem {
  id: string;
  label: string;
  to: string;
}

// Main pages, in navbar order.
export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', to: '/' },
  { id: 'how-it-works', label: 'How It Works', to: '/how-it-works' },
  { id: 'services', label: 'Services', to: '/services' },
  // { id: 'who-we-help', label: 'Who We Help', to: '/who-we-help' },
  { id: 'our-work', label: 'Our Work', to: '/our-work' },
  { id: 'about', label: 'About Us', to: '/about' },
  // { id: 'blog', label: 'Blog', to: '/blog' },
];

export const AUDIT_PATH = '/free-audit';
export const BOOKING_PATH = '/contact#book-or-message';

// Booking calendar shared by the audit form and contact page.
export const CALENDLY_URL = 'https://calendly.com/abdulhaadi-businesschat/30min';

export interface BookingDetails {
  businessName?: string;
  phone?: string;
  description?: string;
}

// These must match the event's Invitee form question order. See docs/booking-setup.md.
const CALENDLY_QUESTIONS = { businessName: 'a1', phone: 'a2', description: 'a3' } as const;

export function calendlyLink(name?: string, email?: string, details: BookingDetails = {}) {
  const url = new URL(CALENDLY_URL);
  if (name?.trim()) url.searchParams.set('name', name.trim());
  if (email?.trim()) url.searchParams.set('email', email.trim());
  for (const field of Object.keys(CALENDLY_QUESTIONS) as (keyof BookingDetails)[]) {
    const value = details[field]?.trim();
    if (value) url.searchParams.set(CALENDLY_QUESTIONS[field], value);
  }
  return url.toString();
}
