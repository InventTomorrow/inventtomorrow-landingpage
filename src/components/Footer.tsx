import { Link } from 'react-router';
import { BOOKING_PATH } from '../utils/navigation';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { to: '/services', label: 'Services' },
      { to: '/how-it-works', label: 'How It Works' },
      { to: '/who-we-help', label: 'Who We Help' },
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
    <footer className="relative z-10 w-full border-t border-white/10 bg-ink-deep px-6 pt-16 pb-12 sm:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 border-b border-white/10 pb-12 md:grid-cols-12">
          <div className="col-span-2 md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-white">IT</span>
              <span className="text-lg font-semibold tracking-tight text-white">Invent Tomorrow</span>
            </Link>
            <p className="mt-4 text-base text-white/80">Win back the jobs you already earned.</p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-3 text-sm md:col-span-2 md:last:col-span-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">{column.title}</span>
              {column.links.map((link) => (
                <Link key={link.label} to={link.to} className="text-white/60 transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <p className="pt-8 text-xs text-white/40">© {new Date().getFullYear()} Invent Tomorrow. All rights reserved.</p>
      </div>
    </footer>
  );
}
