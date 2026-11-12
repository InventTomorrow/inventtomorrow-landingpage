import { ArrowRight, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { SERVICE_CATALOG, SERVICE_GROUPS } from '../content/serviceCatalog';
import { prefetchPage } from '../pages/lazyPages';

const PANEL_ID = 'desktop-services-menu';

export function ServicesMenu({ disabled = false }: { disabled?: boolean }) {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const close = () => { cancelClose(); setIsOpen(false); };

  useEffect(() => { setIsOpen(false); }, [pathname, disabled]);
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);
  useEffect(() => {
    if (!isOpen) return;
    const outside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = null;
      setIsOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [isOpen]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      cancelClose();
      setIsOpen(true);
      requestAnimationFrame(() => {
        const links = [...(panelRef.current?.querySelectorAll<HTMLAnchorElement>('[data-service-link]') ?? [])];
        const current = links.indexOf(document.activeElement as HTMLAnchorElement);
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const next = current < 0 ? (event.key === 'ArrowUp' ? links.length - 1 : 0) : (current + step + links.length) % links.length;
        links[next]?.focus();
      });
    }
  };

  return (
    <div
      ref={rootRef}
      onPointerEnter={(event) => { if (event.pointerType === 'mouse' && !disabled) { cancelClose(); setIsOpen(true); } }}
      onPointerLeave={(event) => { if (event.pointerType === 'mouse') closeTimer.current = setTimeout(() => setIsOpen(false), 180); }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}
      onKeyDown={handleKeyDown}
      className="flex items-center"
    >
      <NavLink
        to="/services"
        onClick={close}
        onPointerEnter={() => prefetchPage('/services')}
        onFocus={() => prefetchPage('/services')}
        className={({ isActive }) => `relative py-2 text-sm font-medium uppercase transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${isActive ? 'text-white after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-white' : 'text-white/80'}`}
      >Services</NavLink>
      <button
        ref={toggleRef}
        type="button"
        aria-label={isOpen ? 'Hide services' : 'Show services'}
        aria-expanded={isOpen}
        aria-controls={PANEL_ID}
        onClick={() => { cancelClose(); setIsOpen((open) => !open); }}
        className="ml-1 flex size-8 cursor-pointer items-center justify-center rounded-md text-white/85 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      ><ChevronDown className={`size-4 transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" /></button>

      <div id={PANEL_ID} ref={panelRef} hidden={!isOpen} className="absolute inset-x-0 top-full mx-auto max-w-7xl px-5 sm:px-12">
        <nav aria-label="Services" data-lenis-prevent className="max-h-[calc(100dvh-8rem)] overflow-y-auto overscroll-contain border border-t-0 border-border bg-paper text-primary shadow-float">
          <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)]">
            <div className="bg-stone px-8 py-9">
              <p className="font-display text-2xl font-medium tracking-tight">Services</p>
              <Link
                to="/services"
                onClick={close}
                onPointerEnter={() => prefetchPage('/services')}
                onFocus={() => prefetchPage('/services')}
                className="group mt-5 block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <img
                  src="/images/services/services-menu-feature-v2.webp"
                  alt="Abstract navy metal and glass blocks connected by flowing blue data lines."
                  width={960}
                  height={540}
                  loading="lazy"
                  decoding="async"
                  className="aspect-video w-full bg-primary object-cover"
                />
                <p className="mt-5 font-display text-xl font-medium leading-snug tracking-tight">Less chasing.<br />More booked cleans.</p>
                <p className="mt-2 text-sm leading-relaxed text-ink">Simple systems for every step, from the first enquiry to the next booking.</p>
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary transition-colors group-hover:text-accent">
                  Explore all services<ArrowRight className="size-4 text-accent transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-10 px-11 py-10">
              {[SERVICE_GROUPS.slice(0, 2), SERVICE_GROUPS.slice(2)].map((groups, column) => (
                <div key={column} className="space-y-7">
                  {groups.map((group) => (
                    <div key={group.id}>
                      <p className="mb-2 font-display text-lg font-medium leading-snug text-primary">{group.title}</p>
                      <ul>
                        {SERVICE_CATALOG.filter((service) => service.group === group.title).map((service) => (
                          <li key={service.path}>
                            <NavLink
                              data-service-link
                              to={service.path}
                              onClick={close}
                              onPointerEnter={() => prefetchPage(service.path)}
                              onFocus={() => prefetchPage(service.path)}
                              className={({ isActive }) => `group inline-flex max-w-full items-center gap-2 py-1.5 text-sm leading-relaxed transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${isActive ? 'font-medium text-accent' : 'text-ink'}`}
                            >
                              {service.title}<ArrowRight className="size-3.5 shrink-0 text-accent transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
