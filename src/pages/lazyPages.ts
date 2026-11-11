import { lazy } from 'react';

// Every page except the home page loads on demand, so the first visit downloads only what it needs.
const loaders = {
  AboutPage: () => import('./AboutPage').then((module) => ({ default: module.AboutPage })),
  BlogPage: () => import('./BlogPage').then((module) => ({ default: module.BlogPage })),
  BlogPostPage: () => import('./BlogPostPage').then((module) => ({ default: module.BlogPostPage })),
  CaseStudyPage: () => import('./CaseStudyPage').then((module) => ({ default: module.CaseStudyPage })),
  ContactPage: () => import('./ContactPage').then((module) => ({ default: module.ContactPage })),
  FaqPage: () => import('./FaqPage').then((module) => ({ default: module.FaqPage })),
  FreeAuditPage: () => import('./FreeAuditPage').then((module) => ({ default: module.FreeAuditPage })),
  HowItWorksPage: () => import('./HowItWorksPage').then((module) => ({ default: module.HowItWorksPage })),
  LegalPage: () => import('./LegalPage').then((module) => ({ default: module.LegalPage })),
  NotFoundPage: () => import('./NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
  OurWorkPage: () => import('./OurWorkPage').then((module) => ({ default: module.OurWorkPage })),
  ResultsPage: () => import('./ResultsPage').then((module) => ({ default: module.ResultsPage })),
  ServicesPage: () => import('./ServicesPage').then((module) => ({ default: module.ServicesPage })),
};

export const AboutPage = lazy(loaders.AboutPage);
export const BlogPage = lazy(loaders.BlogPage);
export const BlogPostPage = lazy(loaders.BlogPostPage);
export const CaseStudyPage = lazy(loaders.CaseStudyPage);
export const ContactPage = lazy(loaders.ContactPage);
export const FaqPage = lazy(loaders.FaqPage);
export const FreeAuditPage = lazy(loaders.FreeAuditPage);
export const HowItWorksPage = lazy(loaders.HowItWorksPage);
export const LegalPage = lazy(loaders.LegalPage);
export const NotFoundPage = lazy(loaders.NotFoundPage);
export const OurWorkPage = lazy(loaders.OurWorkPage);
export const ResultsPage = lazy(loaders.ResultsPage);
export const ServicesPage = lazy(loaders.ServicesPage);

// Downloads the other pages in the background once the browser is idle, so links open instantly. Skipped on data saver.
export function prefetchPages() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return;
  const load = () => Object.values(loaders).forEach((loader) => void loader());
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(load, { timeout: 4000 });
  else window.setTimeout(load, 2000);
}
