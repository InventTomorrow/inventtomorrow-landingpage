import { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import { getCtaIconForPath } from '../utils/ctaIcon';

type Variant = 'primary' | 'accent' | 'outline' | 'outline-light';
type Size = 'sm' | 'md' | 'lg';

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  // Defaults to the icon for the audit and booking links; other buttons show none.
  icon?: LucideIcon;
}

// The button is as wide as its label (never wraps it); parents stack or fill buttons where space is tight.
// Pass `to` for a link to another page, otherwise it renders a <button>.
type CtaButtonProps =
  | (Common & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined })
  | (Common & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string });

// Filled buttons keep their colour on hover and a light band shimmers across them.
const SHIMMER =
  'after:pointer-events-none after:absolute after:inset-y-0 after:-left-2/5 after:w-[30%] after:-skew-x-[20deg] after:bg-white/25 hover:after:translate-x-[500%] hover:after:transition-transform hover:after:duration-700 hover:after:ease-out motion-reduce:hover:after:hidden';

// Same shimmer, tinted blue so it shows on a white button.
const SHIMMER_ON_WHITE =
  'after:pointer-events-none after:absolute after:inset-y-0 after:-left-2/5 after:w-[30%] after:-skew-x-[20deg] after:bg-accent/20 hover:after:translate-x-[500%] hover:after:transition-transform hover:after:duration-700 hover:after:ease-out motion-reduce:hover:after:hidden';

// Outlined buttons change colour on hover: the fill (the ::before layer) drops in from the top.
const FILL_FROM_TOP =
  'before:absolute before:inset-0 before:-z-10 before:origin-top before:scale-y-0 before:transition-transform before:duration-300 before:ease-out hover:before:scale-y-100 motion-reduce:before:transition-none';

const VARIANTS: Record<Variant, string> = {
  primary: `border border-primary bg-primary text-on-primary ${SHIMMER}`,
  // The main button on navy bands (heroes, closing call to action): navy's counterpart, solid white
  accent: `border border-paper bg-paper text-primary ${SHIMMER_ON_WHITE}`,
  outline: `border border-primary text-primary before:bg-primary hover:text-on-primary ${FILL_FROM_TOP}`,
  'outline-light': `border border-white/60 text-white before:bg-paper hover:border-paper hover:text-primary ${FILL_FROM_TOP}`,
};

const SIZES: Record<Size, string> = {
  sm: 'min-h-10 px-[clamp(0.875rem,2vw,1.25rem)] py-2',
  md: 'min-h-12 px-[clamp(1rem,3vw,1.75rem)] py-3',
  lg: 'min-h-14 px-[clamp(1.25rem,3vw,1.875rem)] py-3',
};

export function CtaButton(props: CtaButtonProps) {
  const { variant = 'primary', size = 'md', className = '' } = props;
  const Icon = props.icon ?? (props.to !== undefined ? getCtaIconForPath(props.to) : undefined);
  const classes = `group relative isolate inline-flex w-auto shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xs text-center text-sm font-semibold uppercase leading-snug transition-[color,border-color] duration-300 ease-out motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent cursor-pointer ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  // Small buttons live in the navbar, which has no room for an icon on phones.
  const leading = Icon && <Icon className={`h-[1.125rem] w-[1.125rem] shrink-0 transition-transform duration-300 motion-safe:group-hover:scale-110 ${size === 'sm' ? 'max-sm:hidden' : ''}`} aria-hidden="true" />;

  if (props.to !== undefined) {
    const { to, variant: _v, size: _s, className: _c, icon: _i, children, ...rest } = props;
    return (
      <Link to={to} className={classes} {...rest}>
        {leading}
        <span>{children}</span>
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, icon: _i, type = 'button', to: _t, children, ...rest } = props;
  return (
    <button type={type} className={classes} {...rest}>
      {leading}
      <span>{children}</span>
    </button>
  );
}
