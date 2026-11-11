import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import type { CaseStudy } from '../content/caseStudies';
import { FadeUp } from './FadeUp';
import { SiteImage } from './SiteImage';

// The whole card is one link; approved previews use scope labels rather than setup counts.
export function CaseStudyCard({ study, delay = 0 }: { study: CaseStudy; delay?: number }) {
  const preview = study.preview;

  return (
    <FadeUp delay={delay} y={18} className="h-full">
      <Link
        to={`/our-work/${study.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-paper transition-colors duration-300 hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <div className={preview ? 'relative aspect-video overflow-hidden' : 'overflow-hidden'}>
          <SiteImage
            src={study.image?.src}
            alt={study.image?.alt ?? `${study.client.name} at work`}
            label="Case study image"
            width={640}
            height={preview ? 360 : 400}
            className={`${preview ? 'absolute inset-0 h-full! ' : ''}transition-transform duration-500 motion-safe:group-hover:scale-105 motion-reduce:transition-none`}
          />
        </div>

        <div className={`flex flex-1 flex-col ${preview ? 'p-5 sm:p-7' : 'p-7 sm:p-8'}`}>
          {preview ? (
            <p className="text-xs font-semibold text-primary/65">{preview.eyebrow}</p>
          ) : (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">{study.category}</span>
              <span className="text-body">
                {study.client.type}{study.client.location && ` · ${study.client.location}`}
              </span>
            </div>
          )}

          <h3 className="mt-4 text-xl font-semibold leading-snug text-primary text-balance">{study.title}</h3>
          <p className={`mt-3 text-base ${preview ? 'text-primary/70' : 'text-body'}`}>{study.summary}</p>

          {preview ? (
            <ul aria-label="Project scope" className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5 text-xs text-primary/70">
              {preview.scope.slice(0, 3).map((label) => (
                <li key={label} className="rounded-full border border-border bg-stone px-3 py-1">{label}</li>
              ))}
            </ul>
          ) : (
            study.metrics.length > 0 && (
              <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5">
                {study.metrics.map((metric) => (
                  <div key={metric.label} className="min-w-0">
                    <dt className="sr-only">{metric.label}</dt>
                    <dd className="font-display text-xl font-semibold text-primary sm:text-2xl">{metric.value}</dd>
                    <p className="mt-1 text-xs leading-snug text-body" aria-hidden="true">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </dl>
            )
          )}

          <span className={`${preview ? 'mt-auto min-h-11 pt-6' : 'mt-6 uppercase'} inline-flex w-fit items-center gap-2 text-sm font-semibold text-accent`}>
            {preview?.ctaLabel ?? 'Read the story'}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </FadeUp>
  );
}
