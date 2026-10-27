import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Menu as MenuIcon } from 'lucide-react';
import { NAV_ITEMS } from '../utils/navigation';
import { AuditModal } from './AuditModal';
import { CtaButton } from './CtaButton';
import { setScrollLocked, smoothScrollTo } from '../utils/smoothScroll';

interface NavbarProps {
  activeSection?: string;
  onNavigate?: (id: string) => void;
  onReplayHero?: () => void;
  onOpenAudit?: () => void;
}

export function Navbar({ activeSection = 'home', onNavigate, onReplayHero, onOpenAudit }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [internalAuditOpen, setInternalAuditOpen] = useState(false);

  // Over the hero the bar is see-through with no border. From the next section on it turns white with a
  // bottom border. It also turns white while the phone menu is open, so the menu has something behind it.
  const solid = activeSection !== 'home' || menuOpen;

  useEffect(() => setScrollLocked(menuOpen), [menuOpen]);

  const handleOpenAudit = () => {
    if (onOpenAudit) {
      onOpenAudit();
    } else {
      setInternalAuditOpen(true);
    }
  };

  const handleNavClick = (id: string, href: string) => {
    setMenuOpen(false);

    if (onNavigate) {
      onNavigate(id);
      return;
    }

    const target = document.getElementById(href.replace('#', ''));
    if (target) smoothScrollTo(target);
  };

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
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <button
            type="button"
            onClick={onReplayHero}
            className="flex items-center gap-2.5 justify-self-start cursor-pointer"
            title="Back to top"
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
          </button>

          <nav aria-label="Primary Navigation" className="hidden h-16 items-stretch gap-1 lg:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id, item.href)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`relative flex items-center whitespace-nowrap px-3.5 text-sm font-medium transition-colors duration-300 cursor-pointer ${
                    solid
                      ? isActive
                        ? 'text-ink'
                        : 'text-ink/60 hover:text-ink'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3.5 bottom-0 h-0.5 bg-accent"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 justify-self-end">
            <CtaButton size="sm" onClick={handleOpenAudit}>
              <span className="sm:hidden">Free audit</span>
              <span className="hidden sm:inline">Get free audit</span>
            </CtaButton>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className={`flex h-10 w-10 items-center justify-center rounded-md border transition-colors duration-300 cursor-pointer lg:hidden ${
                solid ? 'border-ink/15 text-ink hover:bg-ink/5' : 'border-white/30 text-white hover:bg-white/10'
              }`}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {!onOpenAudit && (
        <AuditModal isOpen={internalAuditOpen} onClose={() => setInternalAuditOpen(false)} />
      )}

      {/* Phone menu: drops down from the bar */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-x-0 bottom-0 top-[4.75rem] z-40 lg:hidden" data-lenis-prevent>
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
              aria-label="Mobile Navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative border-b border-ink/10 bg-white px-6 pb-6 shadow-[0_16px_30px_-20px_rgba(15,27,45,0.4)] sm:px-12"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id, item.href)}
                    className={`flex w-full items-center border-b border-ink/[0.07] py-4 text-left text-base font-medium transition-colors cursor-pointer ${
                      isActive ? 'text-accent' : 'text-ink hover:text-[#626262]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              <CtaButton
                className="mt-5 w-full"
                onClick={() => {
                  setMenuOpen(false);
                  handleOpenAudit();
                }}
              >
                Get my free audit
              </CtaButton>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
