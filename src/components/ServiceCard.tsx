import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import type { Fix } from '../content/fixes';
import { SiteImage } from './SiteImage';
import { SERVICE_CATALOG } from '../content/serviceCatalog';
import { prefetchPage } from '../pages/lazyPages';

interface ServiceCardProps {
  fix: Fix;
  number: number;
  isCopy?: boolean;
}

export function ServiceCard({ fix, number, isCopy = false }: ServiceCardProps) {
  const path = SERVICE_CATALOG.find((service) => service.title === fix.title)?.path ?? '/services';
  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-paper p-6">
      <div className="-mx-2 -mt-2 aspect-[8/5] overflow-hidden rounded-xl bg-white">
        <SiteImage
          src={fix.image.src}
          alt={fix.image.alt}
          label={fix.title}
          width={800}
          height={865}
          className="h-full! object-contain!"
        />
      </div>
      <h3 className="mt-5 text-pretty text-xl font-semibold leading-snug text-primary">{fix.problemTitle}</h3>
      <p className="mt-1 text-sm font-medium text-accent">{fix.title}</p>
      <hr className="my-4 border-border" />
      <p className="text-base">{fix.text}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-6">
        <span
          className="shrink-0 font-display text-5xl font-semibold text-primary/55"
          aria-hidden="true"
        >
          {String(number).padStart(2, '0')}
        </span>
        <Link
          to={path}
          onPointerEnter={() => prefetchPage(path)}
          onFocus={() => prefetchPage(path)}
          tabIndex={isCopy ? -1 : undefined}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium uppercase text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          Read more
          <span className="sr-only"> about {fix.problemTitle}</span>
        </Link>
      </div>
    </article>
  );
}
