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

// Mobile and tablet menus show page links. The desktop drawer keeps the additional site information.
export function SiteSheet({ isOpen, onClose }: SiteSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  useEscapeKey(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;
    closeButtonRef.current?.focus({ preventScroll: true });

    const keepFocusInside = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const controls = [...panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')]
        .filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', keepFocusInside);
    return () => document.removeEventListener('keydown', keepFocusInside);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60]">
          <m.button
            type="button"
            tabIndex={-1}
            aria-label="Close menu"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 cursor-default bg-primary/60"
          />
          <m.aside
            ref={panelRef}
            id={SITE_SHEET_ID}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            data-lenis-prevent
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-0 flex h-dvh w-full max-w-md flex-col overflow-y-auto overscroll-contain bg-navy-glow px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] text-white sm:px-10"
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

            <p className="mt-8 hidden text-base text-white/70 xl:block">
              Win back the jobs you already earned. Spend less time following up and more time getting jobs done.
            </p>
            <div className="hidden xl:block">
              <SocialLinks isSquare className="mt-6" />
            </div>

            <nav aria-label="Pages" className="mt-8 xl:hidden">
              <ul className="flex flex-col">
                {NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `block border-b border-white/10 py-4 text-lg font-medium transition-colors hover:text-white ${isActive ? 'text-white' : 'text-white/70'}`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Phones and tablets: the same two actions the wide menu shows under "Get in touch". */}
            <div className="mt-8 flex flex-col gap-3 xl:hidden">
              <CtaButton size="lg" variant="accent" to={AUDIT_PATH} onClick={onClose}>
                Run My Audit
              </CtaButton>
              <CtaButton size="lg" variant="outline-light" to={BOOKING_PATH} onClick={onClose}>
                Schedule a Call
              </CtaButton>
            </div>

            <section className="mt-10 hidden xl:block" aria-label="Recent posts">
              <AccentHeading>Recent posts</AccentHeading>
              <div className="mt-4">
                <RecentPostsList onNavigate={onClose} />
              </div>
            </section>

            <section className="mt-10 hidden xl:block" aria-label="Get in touch">
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
