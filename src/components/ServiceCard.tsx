import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import type { Fix } from '../content/fixes';

interface ServiceCardProps {
  fix: Fix;
  number: number;
}

export function ServiceCard({ fix, number }: ServiceCardProps) {
  const Icon = fix.icon;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-paper p-7 transition-colors duration-300 hover:border-accent">
      <Icon className="h-11 w-11 text-accent" strokeWidth={1.25} aria-hidden="true" />
      <h3 className="mt-5 text-xl font-semibold text-primary">{fix.title}</h3>
      <hr className="my-5 border-border" />
      <p className="text-base">{fix.text}</p>
      <div className="mt-auto flex items-center justify-between pt-8">
        <span
          className="font-display text-5xl font-semibold text-transparent [-webkit-text-stroke:1px_var(--color-border)]"
          aria-hidden="true"
        >
          {String(number).padStart(2, '0')}
        </span>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm font-medium uppercase text-primary transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-accent-soft text-accent">
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          Read more
          <span className="sr-only"> about {fix.title}</span>
        </Link>
      </div>
    </article>
  );
}
