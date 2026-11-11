import { ArrowDown, Check, Quote } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { CaseStudyCard } from '../components/CaseStudyCard';
import { FadeUp } from '../components/FadeUp';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { SiteImage } from '../components/SiteImage';
import { TextLink } from '../components/TextLink';
import { CASE_STUDIES, type CaseStudy, type CaseStudyBlurb, type CaseStudyDetails } from '../content/caseStudies';
import { usePageMeta } from '../hooks/usePageMeta';
import { getCaseStudyMeta } from '../utils/seo';
import { NotFoundPage } from './NotFoundPage';

function StoryHeading({ children }: { children: string }) {
  return <h2 className="mt-12 text-2xl font-bold text-primary first:mt-0">{children}</h2>;
}

function Story({ study }: { study: CaseStudy }) {
  usePageMeta(getCaseStudyMeta(study));
  const others = CASE_STUDIES.filter((s) => s.slug !== study.slug);

  return (
    <>
      <PageHero
        eyebrow={study.category}
        title={study.title}
        description={study.summary}
        meta={[study.client.name, study.client.type, study.client.location].filter(Boolean).join(' · ')}
        size="compact"
      />

      <section className="relative z-10 w-full bg-stone section-y px-6 sm:px-12">
        <div className="mx-auto max-w-4xl">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {study.metrics.map((metric, i) => (
              <FadeUp key={metric.label} delay={0.05 + i * 0.06} y={14} className="rounded-2xl border border-border bg-paper p-6 text-center">
                <dd className="font-display text-3xl font-semibold text-accent sm:text-4xl">{metric.value}</dd>
                <dt className="mt-2 text-sm text-body">{metric.label}</dt>
              </FadeUp>
            ))}
          </dl>

          <SiteImage
            src={study.image?.coverSrc ?? study.image?.src}
            alt={study.image?.alt ?? `${study.client.name} at work`}
            label="Case study cover"
            width={1024}
            height={480}
            isEager
            className="mt-10 rounded-2xl"
          />
          {study.image?.caption && <p className="mt-3 text-xs text-body">{study.image.caption}</p>}

          <article className="mx-auto mt-12 max-w-2xl select-text">
            <StoryHeading>The challenge</StoryHeading>
            {study.challenge.map((text) => (
              <p key={text} className="mt-5 text-base leading-[1.75] text-primary/80">
                {text}
              </p>
            ))}

            <StoryHeading>What we set up</StoryHeading>
            <ol className="mt-5 space-y-3">
              {study.solution.map((text, i) => (
                <li key={text} className="flex gap-3 text-base leading-[1.7] text-primary/80">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{text}</span>
                </li>
              ))}
            </ol>

            <StoryHeading>The results</StoryHeading>
            <ul className="mt-5 space-y-3">
              {study.results.map((text) => (
                <li key={text} className="flex gap-3 text-base leading-[1.7] text-primary/80">
                  <Check className="mt-1.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>

            {study.quote && (
              <figure className="mt-12 rounded-2xl bg-navy-glow p-7 text-white sm:p-9">
                <Quote className="h-8 w-8 text-accent" strokeWidth={1.5} aria-hidden="true" />
                <blockquote className="mt-4 font-display text-xl font-medium leading-snug text-balance sm:text-2xl">“{study.quote.text}”</blockquote>
                <figcaption className="mt-5 text-sm text-white/70">
                  <span className="font-semibold text-white">{study.quote.name}</span>, {study.quote.role}
                </figcaption>
              </figure>
            )}

            <div className="mt-12">
              <p className="text-sm font-semibold uppercase text-primary">Tools in this setup</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {study.tools.map((tool) => (
                  <li key={tool} className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-primary">
                    {tool}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-14 border-t border-border pt-8 text-sm">
              <TextLink to="/our-work">Back to all work</TextLink>
            </div>
          </article>
        </div>
      </section>

      {others.length > 0 && (
        <Section bg="paper">
          <h2 className="text-center text-2xl font-bold text-primary sm:text-3xl">More case studies</h2>
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
            {others.slice(0, 2).map((s, i) => (
              <CaseStudyCard key={s.slug} study={s} delay={0.06 + i * 0.07} />
            ))}
          </div>
        </Section>
      )}

      <FinalCtaSection
        title="Want to be our next success story?"
        body="Run your audit and we'll show you where a system could take over first."
        smallLine="Audit first. Automate what matters."
      />
    </>
  );
}

const detailTextClass = 'text-base leading-relaxed text-primary/80';

function DetailHeading({ id, children }: { id: string; children: string }) {
  return <h2 id={id} className="text-2xl font-semibold leading-snug text-primary text-balance sm:text-3xl">{children}</h2>;
}

function BlurbGrid({ items, showCheck = false }: { items: CaseStudyBlurb[]; showCheck?: boolean }) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <FadeUp key={item.title} y={12} className="rounded-2xl border border-border bg-stone p-5 sm:p-7">
          {showCheck && <Check className="mb-3 h-5 w-5 text-accent" aria-hidden="true" />}
          <h3 className="text-lg font-semibold leading-snug text-primary">{item.title}</h3>
          <p className={`mt-3 ${detailTextClass}`}>{item.description}</p>
        </FadeUp>
      ))}
    </div>
  );
}

function FlowSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <li key={step} className="flex min-w-0 flex-col items-center">
          <p className="w-full rounded-xs border border-border bg-stone p-4 text-sm leading-relaxed text-primary">{step}</p>
          {i < steps.length - 1 && <ArrowDown className="mt-3 h-4 w-4 text-accent" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

function DetailedStory({ study, details }: { study: CaseStudy; details: CaseStudyDetails }) {
  usePageMeta(getCaseStudyMeta(study));
  const others = CASE_STUDIES.filter((other) => other.slug !== study.slug && other.isPublished && other.isReal);
  const breadcrumbLinkClass = 'inline-flex min-h-11 items-center rounded-xs text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent';

  return (
    <>
      <nav aria-label="Breadcrumb" className="relative z-10 bg-paper px-6 py-2 sm:px-12">
        <ol className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <li><Link to="/" className={breadcrumbLinkClass}>Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link to="/our-work" className={breadcrumbLinkClass}>Our Work</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-body">{study.client.name}</li>
        </ol>
      </nav>

      <PageHero
        eyebrow={study.preview?.eyebrow ?? study.category}
        title={details.title}
        description={details.intro}
        size="compact"
      />

      <Section bg="paper" width="max-w-4xl" showDecoration={false}>
        <figure>
          <SiteImage
            src={study.image?.coverSrc ?? study.image?.src}
            alt={study.image?.alt ?? `${study.client.name} project image`}
            label="Case study cover"
            width={1600}
            height={750}
            isEager
            className="rounded-2xl"
          />
          {study.image?.caption && <figcaption className="mt-3 text-xs text-primary/65">{study.image.caption}</figcaption>}
        </figure>

        <dl aria-label="Project facts" className="mt-8 grid gap-5 border-y border-border py-6 md:grid-cols-3 md:gap-8">
          {details.facts.map((fact) => (
            <div key={fact.label} className="min-w-0">
              <dt className="text-xs font-semibold uppercase text-primary/65">{fact.label}</dt>
              <dd className="mt-2 text-sm font-medium leading-relaxed text-primary">{fact.value}</dd>
            </div>
          ))}
        </dl>

        {study.metrics.length > 0 && (
          <dl aria-label="Campaign snapshot" className="mt-8 grid gap-6 rounded-2xl border border-border bg-stone p-5 sm:grid-cols-3 sm:p-7">
            {study.metrics.map((metric) => (
              <div key={metric.label} className="min-w-0">
                <dt className="text-sm text-primary/70">{metric.label}</dt>
                <dd className="mt-2 font-display text-2xl font-semibold text-primary">{metric.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <article className="mt-16 space-y-16 select-text sm:space-y-20">
          {details.comparisons && details.comparisons.length > 0 && (
            <section aria-labelledby="process-changes">
              <DetailHeading id="process-changes">What Changed in Their Daily Process</DetailHeading>
              <div className="mt-6 space-y-4">
                {details.comparisons.map((comparison) => (
                  <FadeUp key={comparison.before} y={12} className="rounded-2xl border border-border bg-paper p-5 sm:p-7">
                    <dl className="grid gap-5 md:grid-cols-2 md:gap-7">
                      <div>
                        <dt className="text-xs font-semibold uppercase text-primary/65">Before</dt>
                        <dd className={`mt-2 ${detailTextClass}`}>{comparison.before}</dd>
                      </div>
                      <div className="border-t border-border pt-5 md:border-l md:border-t-0 md:pl-7 md:pt-0">
                        <dt className="text-xs font-semibold uppercase text-accent">After the rebuild</dt>
                        <dd className={`mt-2 ${detailTextClass}`}>{comparison.after}</dd>
                      </div>
                    </dl>
                  </FadeUp>
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="the-challenge">
            <DetailHeading id="the-challenge">{details.challenge.title}</DetailHeading>
            {details.challenge.paragraphs.map((paragraph) => <p key={paragraph} className={`mt-5 ${detailTextClass}`}>{paragraph}</p>)}
            {details.challenge.context && (
              <aside aria-label="Historical campaign context" className="mt-6 rounded-2xl border border-border bg-stone p-5 sm:p-7">
                <p className={detailTextClass}><strong className="font-semibold text-primary">{details.challenge.context.label}</strong> {details.challenge.context.description}</p>
                <p className="mt-3 text-sm leading-relaxed text-primary/65">{details.challenge.context.note}</p>
              </aside>
            )}
          </section>

          {details.diagnosis && (
            <section aria-labelledby="audit-findings">
              <DetailHeading id="audit-findings">{details.diagnosis.title}</DetailHeading>
              <BlurbGrid items={details.diagnosis.findings} />
              <p className={`mt-6 ${detailTextClass}`}>{details.diagnosis.transition}</p>
            </section>
          )}

          <section aria-labelledby="the-rebuild">
            <DetailHeading id="the-rebuild">{details.solution.title}</DetailHeading>
            <div className="mt-6 space-y-5">
              {details.solution.groups.map((group) => (
                <FadeUp key={group.title} y={12} className="rounded-2xl border border-border bg-paper p-5 sm:p-7">
                  <h3 className="text-xl font-semibold leading-snug text-primary">{group.title}</h3>
                  {group.paragraphs.map((paragraph) => <p key={paragraph} className={`mt-4 ${detailTextClass}`}>{paragraph}</p>)}
                </FadeUp>
              ))}
            </div>
          </section>

          {details.workflow && (
            <section aria-labelledby="follow-up-process">
              <DetailHeading id="follow-up-process">{details.workflow.title}</DetailHeading>
              <div className="mt-6 grid items-start gap-5 md:grid-cols-2">
                <div className="min-w-0 rounded-2xl border border-border bg-paper p-5 sm:p-7">
                  <h3 className="mb-5 text-xl font-semibold text-primary">{details.workflow.enquiries.title}</h3>
                  <FlowSteps steps={details.workflow.enquiries.steps} />
                  <p className="mt-5 text-sm leading-relaxed text-primary/80">{details.workflow.enquiries.note}</p>
                </div>
                <div className="min-w-0 rounded-2xl border border-border bg-paper p-5 sm:p-7">
                  <h3 className="mb-5 text-xl font-semibold text-primary">{details.workflow.quotes.title}</h3>
                  <FlowSteps steps={details.workflow.quotes.steps} />
                  <ArrowDown className="mx-auto my-3 h-4 w-4 text-accent" aria-hidden="true" />
                  <div className="space-y-4">
                    <div className="rounded-xs border border-border p-4">
                      <h4 className="text-sm font-semibold text-primary">If accepted</h4>
                      <p className="mt-2 text-sm leading-relaxed text-primary/80">{details.workflow.quotes.accepted}</p>
                    </div>
                    <div className="rounded-xs border border-border p-4">
                      <h4 className="mb-3 text-sm font-semibold text-primary">If pending</h4>
                      <FlowSteps steps={details.workflow.quotes.pending} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section aria-labelledby="operational-changes">
            <DetailHeading id="operational-changes">{details.outcomes.title}</DetailHeading>
            <p className={`mt-5 ${detailTextClass}`}>{details.outcomes.intro}</p>
            <BlurbGrid items={details.outcomes.items} showCheck />
          </section>

          <section aria-labelledby="tools-and-scope">
            <DetailHeading id="tools-and-scope">{details.tools.title}</DetailHeading>
            <dl className="mt-6 divide-y divide-border border-y border-border">
              {details.tools.items.map((tool) => (
                <div key={tool.title} className="grid gap-1 py-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-5">
                  <dt className="text-sm font-semibold text-primary">{tool.title}</dt>
                  <dd className="text-sm leading-relaxed text-primary/80">{tool.description}</dd>
                </div>
              ))}
            </dl>
            <p className={`mt-5 ${detailTextClass}`}>{details.tools.sources}</p>
          </section>
        </article>
      </Section>

      <FinalCtaSection
        title={details.cta.title}
        body={details.cta.body}
        auditLabel={details.cta.primaryLabel}
        buttons="both"
        overlapFooter={false}
      />

      {others.length > 0 && (
        <Section bg="paper" showDecoration={false}>
          <h2 className="text-center text-2xl font-semibold text-primary sm:text-3xl">See More of Our Work</h2>
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
            {others.slice(0, 2).map((other, i) => <CaseStudyCard key={other.slug} study={other} delay={0.06 + i * 0.07} />)}
          </div>
        </Section>
      )}

      <nav aria-label="Case study navigation" className="relative z-10 bg-paper px-6 pb-12 sm:px-12">
        <div className="mx-auto max-w-4xl border-t border-border pt-6 text-sm">
          <TextLink to="/our-work" className="inline-flex min-h-11 items-center rounded-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">Back to all work</TextLink>
        </div>
      </nav>
    </>
  );
}

export function CaseStudyPage() {
  const { slug } = useParams();
  const study = CASE_STUDIES.find((s) => s.slug === slug);
  if (!study) return <NotFoundPage />;
  if (study.details) return <DetailedStory key={study.slug} study={study} details={study.details} />;
  // key: a fresh page (and animations) when moving from one case study to another
  return <Story key={study.slug} study={study} />;
}
