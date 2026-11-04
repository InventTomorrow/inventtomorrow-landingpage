import { Menu } from 'lucide-react';
import { m } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { AUDIT_PATH, NAV_ITEMS } from '../utils/navigation';
import { useIsScrolled } from '../hooks/useIsScrolled';
import { setScrollLocked, smoothScrollTo } from '../utils/smoothScroll';
import { CtaButton } from './CtaButton';
import { SITE_SHEET_ID, SiteSheet } from './SiteSheet';

// The blue bar. The white logo block on the left hangs a little below it, and the bar and logo shrink once the page scrolls.
// The menu button opens the side sheet.
export function Navbar() {
  const { pathname } = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isScrolled = useIsScrolled();

  useEffect(() => setIsSheetOpen(false), [pathname]);
  useEffect(() => setScrollLocked(isSheetOpen), [isSheetOpen]);

  const closeSheet = useCallback(() => {
    setIsSheetOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  return (
    <>
      <m.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none sticky top-0 z-50 h-[4.5rem] w-full select-none sm:h-[5.625rem]"
      >
        <div
          className={`pointer-events-auto bg-accent transition-[height] duration-300 ease-out motion-reduce:transition-none ${
            isScrolled ? 'h-[3.75rem] sm:h-[4.5rem]' : 'h-[4.5rem] sm:h-[5.625rem]'
          }`}
        >
          <div className="mx-auto flex h-full max-w-7xl items-center px-6 sm:px-12">
            <Link
              to="/"
              onClick={() => pathname === '/' && smoothScrollTo(0)}
              aria-label="Invent Tomorrow home"
              className="relative flex h-[calc(100%+1rem)] shrink-0 items-center gap-2.5 self-start rounded-br-[1.75rem] bg-paper pr-5 before:absolute before:right-full before:top-0 before:h-full before:w-screen before:bg-paper sm:rounded-br-[2.25rem] sm:pr-8"
            >
              <span
                className={`flex items-center justify-center rounded-xs bg-primary font-bold text-on-primary transition-[width,height,font-size] duration-300 ease-out motion-reduce:transition-none ${
                  isScrolled ? 'size-8 text-xs' : 'size-10 text-sm'
                }`}
              >
                IT
              </span>
              <span
                className={`whitespace-nowrap font-display font-bold text-primary transition-[font-size] duration-300 ease-out motion-reduce:transition-none ${
                  isScrolled ? 'text-sm sm:text-lg' : 'text-base sm:text-xl'
                }`}
              >
                Invent Tomorrow
              </span>
            </Link>

            <nav aria-label="Primary navigation" className="ml-10 hidden items-center gap-8 xl:flex">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `group relative py-2 text-sm font-medium uppercase transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/80 hover:text-white'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      <span
                        className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-white transition-transform duration-300 ease-out motion-reduce:transition-none ${
                          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-3">
              <span className="hidden sm:inline-flex">
                <CtaButton size="sm" to={AUDIT_PATH}>
                  Run My Audit
                </CtaButton>
              </span>
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setIsSheetOpen(true)}
                aria-label="Open menu"
                aria-haspopup="dialog"
                aria-expanded={isSheetOpen}
                aria-controls={SITE_SHEET_ID}
                className="relative isolate flex size-11 items-center justify-center overflow-hidden rounded-full bg-paper text-primary transition-colors duration-300 before:absolute before:inset-0 before:-z-10 before:origin-top before:scale-y-0 before:bg-primary before:transition-transform before:duration-300 before:ease-out hover:text-on-primary hover:before:scale-y-100 motion-reduce:before:transition-none sm:size-12 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
          </div>
          </div>
        </div>
      </m.header>

      <SiteSheet isOpen={isSheetOpen} onClose={closeSheet} />
    </>
  );
}
