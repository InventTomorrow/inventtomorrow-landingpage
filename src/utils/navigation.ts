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

// Live domain. The bare domain redirects here, so canonical links, the sitemap and structured data all use it.
export const SITE_URL = 'https://www.inventtomorrow.pro';

export function absoluteUrl(path: string) {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

export const AUDIT_PATH = '/free-audit';
export const AUDIT_ADS_PATH = '/free-audit-ads';
export const BOOKING_PATH = '/contact#book-or-message';
