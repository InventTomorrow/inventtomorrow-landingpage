import { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
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

// Solid fill, a slightly darker 1px edge and a faint top highlight, so it reads like a real button.
const VARIANTS: Record<Variant, string> = {
  primary:
    'border border-[#2552bb] bg-accent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_1px_2px_rgba(15,27,45,0.22)] hover:bg-accent-hover active:bg-[#1f47a3]',
  // For dark backgrounds (heroes, closing call to action)
  'outline-light': 'border border-white/40 bg-white/[0.06] text-white hover:border-white/60 hover:bg-white/[0.12]',
  // For light backgrounds
  outline: 'border border-ink/20 bg-white text-ink hover:border-[#626262]/45 hover:bg-[#f1f1f1]',
};

const SIZES: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-11 px-5 text-[0.9375rem]',
  lg: 'h-12 px-7 text-base',
};

export function CtaButton(props: CtaButtonProps) {
  const { variant = 'primary', size = 'md', className = '' } = props;
  const classes = `inline-flex items-center justify-center whitespace-nowrap rounded-lg font-semibold transition-colors duration-150 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent cursor-pointer ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (props.to !== undefined) {
    const { to, variant: _v, size: _s, className: _c, ...rest } = props;
    return <Link to={to} className={classes} {...rest} />;
  }

  const { variant: _v, size: _s, className: _c, type = 'button', to: _t, ...rest } = props;
  return <button type={type} className={classes} {...rest} />;
}
