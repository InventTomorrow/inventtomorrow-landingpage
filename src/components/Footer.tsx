import { Link } from 'react-router';
import { BOOKING_PATH } from '../utils/navigation';
import { SocialLinks } from './SocialLinks';
// import { SocialLinks } from './SocialLinks';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { to: '/services', label: 'Services' },
      { to: '/how-it-works', label: 'How It Works' },
      // { to: '/who-we-help', label: 'Who We Help' },
      { to: '/blog', label: 'Blog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/results', label: 'Results' },
      { to: '/faq', label: 'FAQ' },
      { to: '/about', label: 'About' },
      { to: BOOKING_PATH, label: 'Schedule a Call' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms' },
      { to: '/sms-consent', label: 'SMS Consent' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 mx-2 overflow-hidden rounded-t-[2rem] bg-footer px-6 pt-16 pb-12 sm:mx-4 sm:rounded-t-[3.5rem] sm:px-12 [main:has(.final-cta)+&]:pt-44 sm:[main:has(.final-cta)+&]:pt-60">
      <div className="graphic-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="graphic-drop-outline pointer-events-none absolute -bottom-40 -right-24 h-[30rem] w-[30rem]" aria-hidden="true" />
      <div className="graphic-drop pointer-events-none absolute -bottom-24 right-40 hidden h-40 w-40 opacity-60 md:block" aria-hidden="true" />
      <div className="graphic-glow pointer-events-none absolute -bottom-64 left-1/4 h-[28rem] w-[40rem] opacity-30" aria-hidden="true" />
      <div className="relative mx-auto max-w-[90rem]">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 border-b border-white/10 pb-12 md:grid-cols-12">
          <div className="col-span-2 md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-drop bg-primary text-xs font-bold text-on-primary">IT</span>
              <span className="text-lg font-semibold tracking-tight text-white">Invent Tomorrow</span>
            </Link>
            <p className="mt-4 text-base text-white/95">Win back the jobs you already earned.</p>
            <SocialLinks className="mt-6" />
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-3 text-sm md:col-span-2 md:last:col-span-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{column.title}</span>
              {column.links.map((link) => (
                <Link key={link.label} to={link.to} className="text-white/85 transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <p className="pt-8 text-xs text-white/65">© {new Date().getFullYear()} Invent Tomorrow. All rights reserved.</p>
      </div>
    </footer>
  );
}
