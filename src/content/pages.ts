export interface PageMeta {
  path: string;
  title: string;
  description: string;
  isIndexable?: boolean;
}

// Search titles and descriptions for the fixed pages. Blog posts and legal pages take theirs from blog.ts and legal.ts.
export const PAGE_META = {
  home: {
    path: '/',
    title: 'Invent Tomorrow | Systems for Cleaning Service Businesses',
    description: 'Win back missed enquiries, follow up quotes and build recurring bookings for your cleaning service business.',
  },
  howItWorks: {
    path: '/how-it-works',
    title: 'How It Works | Invent Tomorrow',
    description: 'Review your process, approve your messages and put a follow-up system in place for your cleaning business.',
  },
  services: {
    path: '/services',
    title: 'Services | Invent Tomorrow',
    description:
      'Follow-up and booking systems for cleaning businesses. Enquiries answered, teams informed and less for you to chase.',
  },
  whoWeHelp: {
    path: '/who-we-help',
    title: 'Who We Help | Invent Tomorrow',
    description: 'Systems built around residential, commercial and specialist cleaning service businesses.',
  },
  about: {
    path: '/about',
    title: 'About Us | Invent Tomorrow',
    description:
      'Invent Tomorrow builds simple, reliable automation systems that make everyday work easier for cleaning businesses.',
  },
  faq: {
    path: '/faq',
    title: 'FAQ | Invent Tomorrow',
    description: 'Straight answers about follow-up systems, your current tools, messages, pricing and setup.',
  },
  results: {
    path: '/results',
    title: 'Results | Invent Tomorrow',
    description: 'Measure response times, follow-ups and the time saved behind each job.',
  },
  freeAudit: {
    path: '/free-audit',
    title: 'Your Business Audit | Invent Tomorrow',
    description:
      'Find where time is being lost in your calls, quotes and bookings, and what our system could take off your hands.',
  },
  contact: {
    path: '/contact',
    title: 'Schedule a Call | Invent Tomorrow',
    description: 'Talk through the calls, quotes and follow-ups taking up your day.',
  },
  blog: {
    path: '/blog',
    title: 'Blog | Invent Tomorrow',
    description: 'Practical guides for cleaning business owners on missed calls, quote follow-up, reviews and repeat bookings.',
  },
  notFound: {
    path: '/404',
    title: 'Page not found | Invent Tomorrow',
    description: "This page doesn't exist.",
    isIndexable: false,
  },
} satisfies Record<string, PageMeta>;
