import { DefaultClosingCta } from '../components/FinalCtaSection';
import { PageHero } from '../components/PageHero';
import { PostCard } from '../components/PostCard';
import { Section } from '../components/Section';
import { POSTS } from '../content/blog';
import { usePageMeta } from '../hooks/usePageMeta';

export function BlogPage() {
  usePageMeta(
    'Blog | Invent Tomorrow',
    'Practical guides for cleaning business owners on missed calls, quote follow-up, reviews and repeat bookings.',
  );

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Practical ideas"
        titleMuted="for cleaning business owners"
        description="Short guides on calls, quotes, reviews and repeat bookings. Things you can use this week."
      />

      <Section bg="paper">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((post, i) => (
            <PostCard key={post.slug} post={post} delay={0.06 + i * 0.07} />
          ))}
        </div>
      </Section>

      <DefaultClosingCta />
    </>
  );
}
