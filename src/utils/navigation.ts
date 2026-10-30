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
  { id: 'about', label: 'About Us', to: '/about' },
  { id: 'blog', label: 'Blog', to: '/blog' },
];

export const AUDIT_PATH = '/free-audit';
export const BOOKING_PATH = '/contact#book-or-message';

// Booking calendar. The audit form sends visitors here with their name and email filled in.
export const CALENDLY_URL = 'https://calendly.com/abdulhaadi-businesschat/30min';

export function calendlyLink(name?: string, email?: string) {
  const url = new URL(CALENDLY_URL);
  if (name) url.searchParams.set('name', name);
  if (email) url.searchParams.set('email', email);
  return url.toString();
}
