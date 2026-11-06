import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import type { Fix } from '../content/fixes';
import { SiteImage } from './SiteImage';

interface ServiceCardProps {
  fix: Fix;
  number: number;
  isCopy?: boolean;
}

export function ServiceCard({ fix, number, isCopy = false }: ServiceCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-paper p-7 transition-colors duration-300 hover:border-accent">
      <div className="-mx-3 -mt-3 aspect-[4/3] overflow-hidden rounded-xl bg-white">
        <SiteImage
          src={fix.image.src}
          alt={fix.image.alt}
          label={fix.title}
          width={800}
          height={865}
          className="h-full! object-contain!"
        />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-primary">{fix.problemTitle}</h3>
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
          tabIndex={isCopy ? -1 : undefined}
          className="inline-flex items-center gap-2 text-sm font-medium uppercase text-primary transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-accent-soft text-accent">
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          Read more
          <span className="sr-only"> about {fix.problemTitle}</span>
        </Link>
      </div>
    </article>
  );
}
