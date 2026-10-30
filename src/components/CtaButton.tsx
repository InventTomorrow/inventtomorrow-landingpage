import { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { ChevronsRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import { getCtaIconForPath } from '../utils/ctaIcon';

type Variant = 'primary' | 'outline-light' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  // Defaults to the icon for the audit and booking links; other buttons show none.
  icon?: LucideIcon;
}

// Pass `to` for a link to another page, otherwise it renders a <button>.
type CtaButtonProps =
  | (Common & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined })
  | (Common & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string });

// Each variant has a soft ring that reads on its background, and a glow on hover.
const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary ring-[3px] ring-sky/40 hover:bg-primary-hover hover:ring-sky/60 hover:shadow-lg hover:shadow-primary/50 active:bg-primary-active',
  // For dark backgrounds (heroes, closing call to action)
  'outline-light':
    'border border-white/40 bg-white/[0.06] text-white ring-[3px] ring-white/10 hover:border-white/60 hover:bg-white/[0.12] hover:ring-white/25 hover:shadow-lg hover:shadow-white/15',
  // For light backgrounds
  outline:
    'border border-ink/20 bg-white text-ink ring-[3px] ring-primary/10 hover:border-ink/45 hover:bg-surface-raised hover:ring-primary/25 hover:shadow-lg hover:shadow-ink/20',
};

const SIZES: Record<Size, string> = {
  sm: 'h-10 px-5 text-sm',
  md: 'h-11 px-6 text-[0.9375rem]',
  lg: 'h-12 px-8 text-base',
};

// The white disc on the left of the main blue button, as in the brand's button style.
function IconDisc({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="-ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-primary" aria-hidden="true">
      <Icon className="h-4 w-4" />
    </span>
  );
}

export function CtaButton(props: CtaButtonProps) {
  const { variant = 'primary', size = 'md', className = '' } = props;
  const Icon = props.icon ?? (props.to !== undefined ? getCtaIconForPath(props.to) : undefined);
  const hasDisc = variant === 'primary' && size !== 'sm';
  const classes = `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition duration-200 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue cursor-pointer ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  // Small buttons live in the navbar, which has no room for an icon on phones.
  const leading = hasDisc ? (
    <IconDisc icon={Icon ?? ChevronsRight} />
  ) : (
    Icon && <Icon className={`h-[1.125rem] w-[1.125rem] shrink-0 ${size === 'sm' ? 'max-sm:hidden' : ''}`} aria-hidden="true" />
  );

  if (props.to !== undefined) {
    const { to, variant: _v, size: _s, className: _c, icon: _i, children, ...rest } = props;
    return (
      <Link to={to} className={classes} {...rest}>
        {leading}
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, icon: _i, type = 'button', to: _t, children, ...rest } = props;
  return (
    <button type={type} className={classes} {...rest}>
      {leading}
      {children}
    </button>
  );
}
