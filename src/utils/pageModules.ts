import { LEGAL_DOCS } from '../content/legal';

const PAGE_KEYS = {
  '/': 'HomePage',
  '/about': 'AboutPage',
  '/blog': 'BlogPage',
  '/contact': 'ContactPage',
  '/faq': 'FaqPage',
  '/free-audit': 'FreeAuditPage',
  '/free-audit-ads': 'FreeAuditAdsPage',
  '/free-leak-audit': 'FreeAuditPage',
  '/how-it-works': 'HowItWorksPage',
  '/our-work': 'OurWorkPage',
  '/case-studies': 'OurWorkPage',
  '/results': 'ResultsPage',
  '/services': 'ServicesPage',
} as const;

export type PageKey = typeof PAGE_KEYS[keyof typeof PAGE_KEYS] | 'BlogPostPage' | 'CaseStudyPage' | 'ServicePage' | 'LegalPage' | 'NotFoundPage';

// Shared by intent-based link prefetching and per-route HTML resource hints.
export function getPageKey(url: string): PageKey {
  const pathname = url.split(/[?#]/)[0].replace(/\/+$/, '').toLowerCase() || '/';
  if (Object.hasOwn(PAGE_KEYS, pathname)) return PAGE_KEYS[pathname as keyof typeof PAGE_KEYS];
  if (/^\/our-work\/[^/]+$/.test(pathname)) return 'CaseStudyPage';
  if (/^\/blog\/[^/]+$/.test(pathname)) return 'BlogPostPage';
  if (/^\/services\/[^/]+$/.test(pathname)) return 'ServicePage';
  if (LEGAL_DOCS.some((doc) => doc.path === pathname)) return 'LegalPage';
  return 'NotFoundPage';
}
