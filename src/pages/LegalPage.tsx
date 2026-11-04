import { PageHero } from '../components/PageHero';
import { TextLink } from '../components/TextLink';
import { DefaultClosingCta } from '../components/FinalCtaSection';
import { usePageMeta } from '../hooks/usePageMeta';
import { LAST_UPDATED, type LegalDoc } from '../content/legal';

// Privacy Policy, Terms and SMS Consent all use this layout.
export function LegalPage({ doc }: { doc: LegalDoc }) {
  usePageMeta(doc.metaTitle, doc.description);

  return (
    <>
      <PageHero eyebrow="Legal" title={doc.title} description={doc.intro} meta={`Last updated ${LAST_UPDATED}`} size="compact" />

      <section className="relative z-10 w-full bg-paper px-6 py-20 sm:px-12 sm:py-24">
        <article className="mx-auto max-w-[51.25rem] select-text">
          {doc.sections.map((section) => (
            <div key={section.heading} className="border-b border-border py-8 first:pt-0">
              <h2 className="text-xl font-semibold text-primary">{section.heading}</h2>
              <p className="mt-3 text-base text-body">{section.text}</p>
            </div>
          ))}
          <div className="py-8">
            <h2 className="text-xl font-semibold text-primary">Contact</h2>
            <p className="mt-3 text-base text-body">
              Questions about this policy can be sent through our <TextLink to="/contact">contact page</TextLink>.
            </p>
          </div>
        </article>
      </section>

      <DefaultClosingCta />
    </>
  );
}
