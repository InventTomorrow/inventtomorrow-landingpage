import { POSTS } from '../content/blog';
import { CtaButton } from './CtaButton';
import { FadeUp } from './FadeUp';
import { PostCard } from './PostCard';
import { SectionHeading } from './SectionHeading';

const PREVIEW_COUNT = 3;

export function BlogPreviewSection() {
  return (
    <section id="blog" className="relative z-10 w-full bg-fade-stone section-y px-6 sm:px-12">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="From the blog"
          title="Practical ideas" titleMuted="for cleaning business owners"
          subtitle="Short guides on calls, quotes, reviews and repeat bookings. Things you can use this week."
        />
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {POSTS.slice(0, PREVIEW_COUNT).map((post, index) => (
            <PostCard key={post.slug} post={post} delay={0.06 + index * 0.07} />
          ))}
        </div>
        <FadeUp delay={0.15} y={12} className="mt-12 flex justify-center">
          <CtaButton variant="outline" to="/blog">
            See all articles
          </CtaButton>
        </FadeUp>
      </div>
    </section>
  );
}
