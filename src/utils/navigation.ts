export interface NavItem {
  id: string;
  label: string;
  modernLabel: string;
  href: string;
  description: string;
}

// The logo already takes you back to the top, so "Home" isn't listed.
export const NAV_ITEMS: NavItem[] = [
  {
    id: 'the-leaks',
    label: 'The Problem',
    modernLabel: 'The Leaks',
    href: '#the-leaks',
    description: 'The 3 cracks where cleaning jobs slip',
  },
  {
    id: 'services',
    label: 'The System',
    modernLabel: 'The System',
    href: '#services',
    description: 'The 7-part Revenue Recovery System',
  },
  {
    id: 'how-it-works',
    label: 'How It Works',
    modernLabel: 'How It Works',
    href: '#how-it-works',
    description: 'Three simple steps to hands-free follow-up',
  },
  {
    id: 'before-after',
    label: 'Before & After',
    modernLabel: 'Before / After',
    href: '#before-after',
    description: 'The operational shift for cleaning owners',
  },
  {
    id: 'faq',
    label: 'FAQ',
    modernLabel: 'FAQ',
    href: '#faq',
    description: 'Fair questions and transparent answers',
  },
];
