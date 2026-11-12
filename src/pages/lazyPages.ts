import { lazy } from 'react';
import { getPageKey } from '../utils/pageModules';

// Routes load on demand, including home, so other pages do not download the landing page.
const loaders = {
  HomePage: () => import('./HomePage').then((module) => ({ default: module.HomePage })),
  AboutPage: () => import('./AboutPage').then((module) => ({ default: module.AboutPage })),
  BlogPage: () => import('./BlogPage').then((module) => ({ default: module.BlogPage })),
  BlogPostPage: () => import('./BlogPostPage').then((module) => ({ default: module.BlogPostPage })),
  CaseStudyPage: () => import('./CaseStudyPage').then((module) => ({ default: module.CaseStudyPage })),
  ContactPage: () => import('./ContactPage').then((module) => ({ default: module.ContactPage })),
  FaqPage: () => import('./FaqPage').then((module) => ({ default: module.FaqPage })),
  FreeAuditPage: () => import('./FreeAuditPage').then((module) => ({ default: module.FreeAuditPage })),
  FreeAuditAdsPage: () => import('./FreeAuditAdsPage').then((module) => ({ default: module.FreeAuditAdsPage })),
  HowItWorksPage: () => import('./HowItWorksPage').then((module) => ({ default: module.HowItWorksPage })),
  LegalPage: () => import('./LegalPage').then((module) => ({ default: module.LegalPage })),
  NotFoundPage: () => import('./NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
  OurWorkPage: () => import('./OurWorkPage').then((module) => ({ default: module.OurWorkPage })),
  ResultsPage: () => import('./ResultsPage').then((module) => ({ default: module.ResultsPage })),
  ServicesPage: () => import('./ServicesPage').then((module) => ({ default: module.ServicesPage })),
  ServicePage: () => import('./ServicePage').then((module) => ({ default: module.ServicePage })),
};

export const HomePage = lazy(loaders.HomePage);
export const AboutPage = lazy(loaders.AboutPage);
export const BlogPage = lazy(loaders.BlogPage);
export const BlogPostPage = lazy(loaders.BlogPostPage);
export const CaseStudyPage = lazy(loaders.CaseStudyPage);
export const ContactPage = lazy(loaders.ContactPage);
export const FaqPage = lazy(loaders.FaqPage);
export const FreeAuditPage = lazy(loaders.FreeAuditPage);
export const FreeAuditAdsPage = lazy(loaders.FreeAuditAdsPage);
export const HowItWorksPage = lazy(loaders.HowItWorksPage);
export const LegalPage = lazy(loaders.LegalPage);
export const NotFoundPage = lazy(loaders.NotFoundPage);
export const OurWorkPage = lazy(loaders.OurWorkPage);
export const ResultsPage = lazy(loaders.ResultsPage);
export const ServicesPage = lazy(loaders.ServicesPage);
export const ServicePage = lazy(loaders.ServicePage);

const prefetched = new Set<string>();

// Warm only the link a visitor focuses or hovers; never download every route on startup.
export function prefetchPage(to: string) {
  if (typeof navigator === 'undefined' || !to.startsWith('/') || to.startsWith('//')) return;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (connection?.saveData || /^(slow-)?2g$/.test(connection?.effectiveType ?? '')) return;
  const key = getPageKey(to);
  if (prefetched.has(key)) return;
  prefetched.add(key);
  void loaders[key]().catch(() => prefetched.delete(key));
}
