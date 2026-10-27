import { ButtonHTMLAttributes } from 'react';

interface CtaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline-light';
  size?: 'sm' | 'md' | 'lg';
}

// Solid fill, a slightly darker 1px edge and a faint top highlight, so it reads like a real button.
const VARIANTS = {
  primary:
    'border border-[#2552bb] bg-accent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_1px_2px_rgba(15,27,45,0.22)] hover:bg-accent-hover active:bg-[#1f47a3]',
  // For dark backgrounds (the hero)
  'outline-light': 'border border-white/40 bg-white/[0.06] text-white hover:border-white/60 hover:bg-white/[0.12]',
};

const SIZES = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-11 px-5 text-[0.9375rem]',
  lg: 'h-12 px-7 text-base',
};

// The main "get the audit" button, used everywhere on the page.
export function CtaButton({ variant = 'primary', size = 'md', className = '', type = 'button', ...rest }: CtaButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg font-semibold transition-colors duration-150 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent cursor-pointer ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    />
  );
}
