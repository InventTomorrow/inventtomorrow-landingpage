import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { X, Menu as MenuIcon } from 'lucide-react';
import { AUDIT_PATH, NAV_ITEMS } from '../utils/navigation';
import { CtaButton } from './CtaButton';
import { setScrollLocked, smoothScrollTo } from '../utils/smoothScroll';

// Height of the bar (4.75rem); heroes start their content below it.
const NAV_BOTTOM = 76;

export function Navbar() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [overHero, setOverHero] = useState(true);

  // See-through with white text while it sits over a page's grey hero. Once the hero has scrolled
  // away (or the page has none) it turns white with a bottom border.
  useEffect(() => {
    const update = () => {
      const hero = document.querySelector('[data-dark-hero]');
      setOverHero(!!hero && hero.getBoundingClientRect().bottom > NAV_BOTTOM);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [pathname]);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => setScrollLocked(menuOpen), [menuOpen]);

  const solid = !overHero || menuOpen;

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed inset-x-0 top-0 z-50 border-b px-6 pt-3 transition-[background-color,border-color] duration-300 select-none sm:px-12 ${
          solid ? 'border-ink/10 bg-white/95 backdrop-blur-md' : 'border-transparent bg-transparent'
        }`}
      >
        {/* Same width as the hero content, so the logo lines up with the headline. */}
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto] items-center gap-4 xl:grid-cols-[1fr_auto_1fr]">
          <Link
            to="/"
            onClick={() => pathname === '/' && smoothScrollTo(0)}
            className="flex items-center gap-2.5 justify-self-start"
            aria-label="Invent Tomorrow home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-xs font-bold text-white">
              IT
            </span>
            <span
              className={`whitespace-nowrap text-[0.9375rem] font-semibold tracking-tight transition-colors duration-300 ${
                solid ? 'text-ink' : 'text-white'
              }`}
            >
              Invent Tomorrow
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden h-16 items-stretch xl:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative flex items-center whitespace-nowrap px-3 text-sm font-medium transition-colors duration-300 ${
                    solid
                      ? isActive
                        ? 'text-ink'
                        : 'text-ink/60 hover:text-ink'
                      : isActive
                        ? 'text-white'
                        : 'text-white/75 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 bottom-0 h-0.5 bg-accent"
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 justify-self-end">
            <CtaButton size="sm" to={AUDIT_PATH}>
              <span className="sm:hidden">Free audit</span>
              <span className="hidden sm:inline">Run My Audit</span>
            </CtaButton>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className={`flex h-10 w-10 items-center justify-center rounded-md border transition-colors duration-300 cursor-pointer xl:hidden ${
                solid ? 'border-ink/15 text-ink hover:bg-ink/5' : 'border-white/30 text-white hover:bg-white/10'
              }`}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Menu for phones, tablets and small laptops: drops down from the bar */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-x-0 bottom-0 top-[4.75rem] z-40 xl:hidden" data-lenis-prevent>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink/30 cursor-default"
            />
            <motion.nav
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-h-full overflow-y-auto border-b border-ink/10 bg-white px-6 pb-6 shadow-[0_16px_30px_-20px_rgba(15,27,45,0.4)] sm:px-12"
            >
              <div className="mx-auto max-w-7xl">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex w-full items-center border-b border-ink/[0.07] py-4 text-left text-base font-medium transition-colors ${
                        isActive ? 'text-accent' : 'text-ink hover:text-[#626262]'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}

                <CtaButton className="mt-5 w-full" to={AUDIT_PATH} onClick={() => setMenuOpen(false)}>
                  Run My Audit
                </CtaButton>
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
