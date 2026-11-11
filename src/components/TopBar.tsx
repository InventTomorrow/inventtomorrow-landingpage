import { Link } from 'react-router';
import { SocialLinks } from './SocialLinks';

const LINKS = [
  { to: '/faq', label: 'FAQ' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
];

// Sits above the navbar in normal flow, so it scrolls away while the navbar stays.
export function TopBar() {
  return (
    <div className="relative z-50 -mb-px w-full bg-top-bar px-5 text-[0.6875rem] font-bold text-white/80 sm:px-12 sm:text-xs">
      <div className="mx-auto flex min-h-8 max-w-7xl items-center justify-center gap-4 py-1 sm:h-10 sm:justify-between sm:py-0">
        <p className="text-center sm:text-left">Win back the jobs you already earned.</p>
        <div className="hidden items-center gap-5 sm:flex">
          <nav aria-label="Secondary navigation" className="hidden items-center gap-5 sm:flex">
            {LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
          <SocialLinks size="sm" />
        </div>
      </div>
    </div>
  );
}
