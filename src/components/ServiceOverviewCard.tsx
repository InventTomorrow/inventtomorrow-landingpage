import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import type { ServiceSummary } from '../content/serviceCatalog';
import { prefetchPage } from '../pages/lazyPages';
import { ServiceIcon } from './ServiceIcon';
import { SERVICE_IMAGES } from '../content/serviceImages';

export function ServiceOverviewCard({ service }: { service: ServiceSummary }) {
  const image = SERVICE_IMAGES[service.path];
  return (
    <Link
      to={service.path}
      onPointerEnter={() => prefetchPage(service.path)}
      onFocus={() => prefetchPage(service.path)}
      className="group flex h-full flex-col rounded-2xl border border-border bg-paper p-6 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:p-7"
    >
      <img src={image.thumbnail} alt={image.alt} width={480} height={270} loading="lazy" decoding="async" className="mb-5 aspect-video w-full rounded-xl object-cover" />
      <div className="flex items-center justify-between gap-3">
        <span className="flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <ServiceIcon title={service.title} />
        </span>
        <span className="rounded-full bg-stone px-3 py-1 text-xs font-medium text-ink">
          {service.tier === 'core' ? 'Core package' : 'Add-on'}{service.ai ? ' · AI' : ''}
        </span>
      </div>
      <h3 className="mt-6 text-2xl font-semibold text-primary">{service.title}</h3>
      <p className="mt-3 text-base text-ink">{service.summary}</p>
      <span className="mt-auto flex items-center justify-between gap-3 pt-7 text-sm font-medium text-accent">
        Explore service
        <ArrowUpRight className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
      </span>
    </Link>
  );
}
