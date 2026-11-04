import { X } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { AUDIT_PATH, BOOKING_PATH, NAV_ITEMS } from '../utils/navigation';
import { AccentHeading } from './AccentHeading';
import { BrandLogo } from './BrandLogo';
import { CtaButton } from './CtaButton';
import { RecentPostsList } from './RecentPostsList';
import { SocialLinks } from './SocialLinks';

export const SITE_SHEET_ID = 'site-sheet';

interface SiteSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

// The side panel opened by the header's menu button: who we are, recent posts and the ways to get in touch.
// On small screens it also holds the page links, because the header hides them.
export function SiteSheet({ isOpen, onClose }: SiteSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useEscapeKey(isOpen, onClose);

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60]">
          <m.button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 cursor-default bg-primary/60"
          />
          <m.aside
            id={SITE_SHEET_ID}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            data-lenis-prevent
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto bg-navy-glow px-6 pb-10 pt-6 text-white sm:px-10"
          >
            <div className="flex items-center justify-between gap-4">
              <BrandLogo isOnDark onClick={onClose} />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="relative isolate flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-paper text-primary transition-colors duration-300 before:absolute before:inset-0 before:-z-10 before:origin-top before:scale-y-0 before:bg-accent before:transition-transform before:duration-300 before:ease-out hover:text-on-primary hover:before:scale-y-100 motion-reduce:before:transition-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <p className="mt-8 text-base text-white/70">
              Win back the jobs you already earned. Spend less time following up and more time getting jobs done.
            </p>
            <SocialLinks isSquare className="mt-6" />

            <nav aria-label="Pages" className="mt-10 xl:hidden">
              <AccentHeading>Pages</AccentHeading>
              <ul className="mt-3 flex flex-col">
                {NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `block border-b border-white/10 py-3 text-sm font-medium uppercase transition-colors hover:text-white ${isActive ? 'text-white' : 'text-white/70'}`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <section className="mt-10" aria-label="Recent posts">
              <AccentHeading>Recent posts</AccentHeading>
              <div className="mt-4">
                <RecentPostsList onNavigate={onClose} />
              </div>
            </section>

            <section className="mt-10" aria-label="Get in touch">
              <AccentHeading>Get in touch</AccentHeading>
              <p className="mt-3 text-base text-white/70">Find out what's costing you jobs, or talk it through on a call.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <CtaButton variant="accent" to={AUDIT_PATH} onClick={onClose}>
                  Run My Audit
                </CtaButton>
                <CtaButton variant="outline-light" to={BOOKING_PATH} onClick={onClose}>
                  Schedule a Call
                </CtaButton>
              </div>
            </section>
          </m.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
