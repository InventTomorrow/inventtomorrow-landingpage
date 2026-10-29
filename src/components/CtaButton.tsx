import { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { ChevronsRight } from 'lucide-react';
import { Link } from 'react-router';

type Variant = 'primary' | 'outline-light' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
}

// Pass `to` for a link to another page, otherwise it renders a <button>.
type CtaButtonProps =
  | (Common & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined })
  | (Common & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string });

// Brand yellow fill with navy text, no border: the one standout action on any screen.
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active',
  // For dark backgrounds (heroes, closing call to action)
  'outline-light': 'border border-white/40 bg-white/[0.06] text-white hover:border-white/60 hover:bg-white/[0.12]',
  // For light backgrounds
  outline: 'border border-ink/20 bg-white text-ink hover:border-ink/45 hover:bg-surface-raised',
};

const SIZES: Record<Size, string> = {
  sm: 'h-10 px-5 text-sm',
  md: 'h-11 px-6 text-[0.9375rem]',
  lg: 'h-12 px-8 text-base',
};

// The white arrow disc on the left of the main yellow button, as in the brand's button style.
function ArrowDisc() {
  return (
    <span className="-ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-primary" aria-hidden="true">
      <ChevronsRight className="h-4 w-4" />
    </span>
  );
}

export function CtaButton(props: CtaButtonProps) {
  const { variant = 'primary', size = 'md', className = '' } = props;
  const hasArrowDisc = variant === 'primary' && size !== 'sm';
  const classes = `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-colors duration-150 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue cursor-pointer ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (props.to !== undefined) {
    const { to, variant: _v, size: _s, className: _c, children, ...rest } = props;
    return (
      <Link to={to} className={classes} {...rest}>
        {hasArrowDisc && <ArrowDisc />}
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, type = 'button', to: _t, children, ...rest } = props;
  return (
    <button type={type} className={classes} {...rest}>
      {hasArrowDisc && <ArrowDisc />}
      {children}
    </button>
  );
}
