import { Menu } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { AUDIT_PATH, NAV_ITEMS } from '../utils/navigation';
import { setScrollLocked, smoothScrollTo } from '../utils/smoothScroll';
import { BrandLogoImage } from './BrandLogoImage';
import { CtaButton } from './CtaButton';
import { SITE_SHEET_ID, SiteSheet } from './SiteSheet';

// Keep the sticky bar and its layout height identical so scrolling never opens a gap above the page.
// The menu button opens the side sheet.
export function Navbar() {
  const { pathname } = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setIsSheetOpen(false), [pathname]);
  useEffect(() => {
    setScrollLocked(isSheetOpen);
    return () => setScrollLocked(false);
  }, [isSheetOpen]);

  const closeSheet = useCallback(() => {
    setIsSheetOpen(false);
    menuButtonRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-50 h-16 w-full bg-header shadow-[0_8px_20px_-8px_rgb(1_15_52/0.35)] select-none sm:h-[5.625rem]"
      >
          <div className="mx-auto flex h-full max-w-7xl items-center px-5 sm:px-12">
            <Link
              to="/"
              onClick={() => pathname === '/' && smoothScrollTo(0)}
              aria-label="Invent Tomorrow home"
              className="relative flex h-full shrink-0 items-center gap-2.5 rounded-br-[1.75rem] bg-paper pr-5 before:absolute before:right-[calc(100%-2px)] before:top-0 before:h-full before:w-screen before:bg-paper sm:rounded-br-[2.25rem] sm:pr-8"
            >
              <BrandLogoImage className="h-10 sm:h-14" />
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

            <div className="ml-auto flex shrink-0 items-center gap-3">
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
      </header>

      <SiteSheet isOpen={isSheetOpen} onClose={closeSheet} />
    </>
  );
}
