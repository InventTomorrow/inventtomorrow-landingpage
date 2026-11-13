import { Check, CheckCircle2, ChevronDown, ChevronRight, MessageSquareText } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { CtaButton } from '../components/CtaButton';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { SectionHeading } from '../components/SectionHeading';
import { ServiceCopy } from '../components/ServiceCopy';
import { ServiceIcon } from '../components/ServiceIcon';
import { ServiceOverviewCard } from '../components/ServiceOverviewCard';
import { SERVICE_CATALOG, type ServiceSummary } from '../content/serviceCatalog';
import { SERVICE_DETAILS, type ServiceDetail } from '../content/serviceDetails';
import { SERVICE_IMAGES } from '../content/serviceImages';
import { usePageMeta } from '../hooks/usePageMeta';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';
import { NotFoundPage } from './NotFoundPage';

export function ServicePage() {
  const { slug } = useParams();
  const path = `/services/${slug}`;
  const summary = SERVICE_CATALOG.find((service) => service.path === path);
  const service = SERVICE_DETAILS.find((service) => service.path === path);
  if (!summary || !service) return <NotFoundPage />;
  return <ServiceContent key={path} summary={summary} service={service} />;
}

function ServiceContent({ summary, service }: { summary: ServiceSummary; service: ServiceDetail }) {
  usePageMeta(summary.meta);
  const related = SERVICE_CATALOG.filter((item) => service.related.includes(item.title));
  const image = SERVICE_IMAGES[summary.path];

  return (
    <>
      <PageHero
        visual={<img src={image.src} srcSet={image.srcSet} sizes="(min-width: 1024px) 45vw, 100vw" alt={image.alt} width={image.width} height={image.height} loading="eager" fetchPriority="high" decoding="async" className="aspect-video w-full rounded-2xl border border-white/15 object-cover" />}
        breadcrumb={
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-xs text-white/65 sm:text-sm">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight className="size-3" /></li>
              <li><Link to="/services" className="hover:text-white">Services</Link></li>
              <li aria-hidden="true"><ChevronRight className="size-3" /></li>
              <li aria-current="page" className="text-white">{summary.title}</li>
            </ol>
          </nav>
        }
        eyebrow={service.eyebrow}
        title={service.headline}
        description={service.intro}
      >
        <CtaButton size="lg" variant="accent" to={AUDIT_PATH}>Find my missed jobs</CtaButton>
        <CtaButton size="lg" variant="outline-light" to={BOOKING_PATH}>Book a 15-minute call</CtaButton>
      </PageHero>

      <div className="border-b border-border bg-paper px-6 sm:px-12">
        <dl aria-label="Service facts" className="mx-auto grid max-w-7xl divide-y divide-border py-3 md:grid-cols-[1fr_1.4fr_0.8fr] md:divide-x md:divide-y-0 md:py-7">
          {service.facts.map((fact) => (
            <div key={fact.label} className="py-5 md:px-7 md:py-0 md:first:pl-0 md:last:pr-0">
              <dt className="text-xs font-semibold uppercase tracking-wider text-accent">{fact.label}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-primary">{fact.text}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Section bg="stone" width="max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading eyebrow="The problem" title="Sound familiar?" align="left" size="compact" />
            <p className="mt-6 text-lg leading-relaxed text-ink"><ServiceCopy text={service.problem} /></p>
            <div className="mt-8 flex items-center gap-3 border-t border-border pt-6 text-sm font-medium text-primary">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><ServiceIcon title={summary.title} className="size-5" /></span>
              {summary.title} takes care of the follow-through.
            </div>
          </div>
          <aside aria-label={`Example ${service.example.kind}`} className="rounded-2xl border border-border bg-paper p-5 sm:p-8">
            <div className="flex items-center gap-3 border-b border-border pb-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"><MessageSquareText className="size-5" aria-hidden="true" /></span>
              <div><p className="font-display font-semibold text-primary">See it in action</p><p className="text-xs text-ink">Example {service.example.kind} · Bright Home Cleaning</p></div>
            </div>
            <p className="my-6 text-center text-xs font-medium text-ink">{service.example.trigger}</p>
            <div className="flex flex-col gap-5">
              {service.example.messages.map((message, index) => (
                <div key={message.from} className={`max-w-[94%] ${index === 0 ? 'self-start' : 'self-end'}`}>
                  <p className={`mb-1.5 text-xs font-medium text-ink ${index === 0 ? '' : 'text-right'}`}>{message.from}</p>
                  <p className={`rounded-2xl px-5 py-4 text-sm leading-relaxed ${index === 0 ? 'rounded-tl-sm bg-primary text-white' : 'rounded-tr-sm bg-accent-soft text-primary'}`}><ServiceCopy text={message.text} /></p>
                </div>
              ))}
            </div>
            <p className="mt-7 flex items-center justify-center gap-2 rounded-lg bg-stone px-3 py-3 text-center text-xs font-semibold text-accent"><CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />{service.example.result}</p>
          </aside>
        </div>
      </Section>

      <Section width="max-w-7xl">
        <SectionHeading eyebrow="How it works" title="Set up for you." titleMuted="Built around your business." size="compact" />
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {service.steps.map((step, index) => (
            <li key={step.title} className="border-t-2 border-accent pt-6">
              <span className="font-display text-4xl font-semibold text-accent/50" aria-hidden="true">0{index + 1}</span>
              <h3 className="mt-4 text-xl font-semibold leading-snug text-primary">{step.title}</h3>
              {step.body && <p className="mt-3 text-base text-ink"><ServiceCopy text={step.body} /></p>}
            </li>
          ))}
        </ol>
        {service.proof && (
          <aside aria-label="Client proof" className="mt-12 rounded-xl border-l-4 border-accent bg-stone p-6 sm:p-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">From our work</p>
            <p className="text-base leading-relaxed text-primary"><ServiceCopy text={service.proof} /></p>
          </aside>
        )}
      </Section>

      <Section bg="stone" width="max-w-7xl">
        <SectionHeading eyebrow="What changes for you" title="Less for you to chase." size="compact" />
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {service.benefits.map((benefit) => (
            <li key={benefit.title} className="rounded-2xl border border-border bg-paper p-6 sm:p-8">
              <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent"><Check className="size-5" aria-hidden="true" /></span>
              <h3 className="mt-5 text-xl font-semibold leading-snug text-primary">{benefit.title}</h3>
              {benefit.body && <p className="mt-3 text-base text-ink"><ServiceCopy text={benefit.body} /></p>}
            </li>
          ))}
        </ul>
      </Section>

      <Section width="max-w-4xl">
        <SectionHeading eyebrow="Questions" title="Good questions. Straight answers." size="compact" />
        <div className="mt-10 divide-y divide-border border-y border-border">
          {service.questions.map((question) => (
            <details key={question.q} name={`faq-${summary.path}`} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left font-display text-lg font-medium text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
                {question.q}<ChevronDown className="size-5 shrink-0 text-accent transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
              </summary>
              <p className="pb-6 pr-6 text-base leading-relaxed text-ink"><ServiceCopy text={question.a} /></p>
            </details>
          ))}
        </div>
        {service.reading && <p className="mt-7 text-sm text-ink">Further reading: <ServiceCopy text={service.reading} /></p>}
      </Section>

      <Section bg="stone" width="max-w-7xl">
        <SectionHeading eyebrow="Related services" title="Keep the next step covered." size="compact" />
        <ul className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
          {related.map((item) => <li key={item.path}><ServiceOverviewCard service={item} /></li>)}
        </ul>
        <div className="mt-8 text-center"><Link to="/services" className="text-sm font-medium text-accent underline underline-offset-4">Back to all services</Link></div>
      </Section>

      <FinalCtaSection title={service.cta.heading} body={<ServiceCopy text={service.cta.body} />} auditLabel="Find my missed jobs" callLabel="Book a 15-minute call" />
    </>
  );
}
