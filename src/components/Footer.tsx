import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { BOOKING_PATH } from '../utils/navigation';
import { AccentHeading } from './AccentHeading';
import { RecentPostsList } from './RecentPostsList';
import { SocialLinks } from './SocialLinks';
import { Stagger } from './Stagger';
import { StaggerItem } from './StaggerItem';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { to: '/services', label: 'Services' },
      { to: '/how-it-works', label: 'How It Works' },
      { to: '/our-work', label: 'Our Work' },
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
];

const LEGAL_LINKS = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms' },
  { to: '/sms-consent', label: 'SMS Consent' },
];

export function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden bg-navy-glow text-white [main:has(.final-cta)+&]:pt-32 sm:[main:has(.final-cta)+&]:pt-36">
      <div className="graphic-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="graphic-drop-outline pointer-events-none absolute -bottom-40 -right-24 h-[30rem] w-[30rem]" aria-hidden="true" />

      <div className="relative px-6 pb-12 pt-14 sm:px-12 sm:pt-16">
        <Stagger gap={0.1} className="mx-auto grid max-w-7xl grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,4fr)_auto_auto_minmax(0,4fr)] lg:gap-x-12">
          <StaggerItem className="col-span-2 lg:col-span-1">
            <AccentHeading>Invent Tomorrow</AccentHeading>
            <p className="mt-4 font-display text-lg font-semibold text-white">Win back the jobs you already earned.</p>
            <p className="mt-3 max-w-sm text-base text-white/70">
              We book cleaning companies extra cleans from the calls, quotes and past clients they already have. Done for you, and guaranteed.
            </p>
            <SocialLinks isSquare className="mt-6" />
          </StaggerItem>

          {COLUMNS.map((column) => (
            <StaggerItem key={column.title} className="flex flex-col gap-3 text-base">
              <AccentHeading>{column.title}</AccentHeading>
              {column.links.map((link) => (
                <Link key={link.label} to={link.to} className="group inline-flex w-fit items-center gap-2 whitespace-nowrap text-white/70 transition-colors hover:text-white">
                  <ArrowRight className="h-4 w-4 text-accent transition-transform duration-300 motion-safe:group-hover:translate-x-1" aria-hidden="true" />
                  {link.label}
                </Link>
              ))}
            </StaggerItem>
          ))}

          <StaggerItem className="col-span-2 lg:col-span-1">
            <AccentHeading>Recent posts</AccentHeading>
            <div className="mt-4">
              <RecentPostsList />
            </div>
          </StaggerItem>
        </Stagger>
      </div>

      <div className="relative bg-header px-6 py-5 text-on-primary">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm sm:flex-row sm:pr-20">
          <p>© {new Date().getFullYear()} Invent Tomorrow. All rights reserved.</p>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="underline-offset-4 transition-colors hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
