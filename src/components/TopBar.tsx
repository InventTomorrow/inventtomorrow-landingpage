import { Link } from 'react-router';
import { SocialLinks } from './SocialLinks';
// import { SocialLinks } from './SocialLinks';

const LINKS = [
  { to: '/faq', label: 'FAQ' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
];

// Sits above the navbar in normal flow, so it scrolls away while the navbar stays.
export function TopBar() {
  return (
    <div className="relative z-50 -mb-px w-full bg-top-bar px-6 text-xs font-bold text-white/80 sm:px-12">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-4">
        <p className="truncate">Win back the jobs you already earned.</p>
        <div className="flex items-center gap-5">
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
