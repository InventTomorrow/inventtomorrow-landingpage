import { useRef } from 'react';
import { POSTS } from '../content/blog';
import { CtaButton } from './CtaButton';
import { FadeUp } from './FadeUp';
import { PostCard } from './PostCard';
import { RoundArrowButton } from './RoundArrowButton';
import { SectionHeading } from './SectionHeading';

const PREVIEW_COUNT = 3;

export function BlogPreviewSection() {
  const stripRef = useRef<HTMLUListElement>(null);
  const previews = POSTS.slice(0, PREVIEW_COUNT);

  // Move by one card (plus the gap) so each arrow press lands on the next snap point.
  const scrollByCard = (direction: 1 | -1) => {
    const strip = stripRef.current;
    const firstCard = strip?.firstElementChild as HTMLElement | null;
    if (!strip || !firstCard) return;
    const gap = parseFloat(getComputedStyle(strip).columnGap || '0');
    strip.scrollBy({ left: direction * (firstCard.getBoundingClientRect().width + gap), behavior: 'smooth' });
  };

  return (
    <section id="blog" className="relative z-10 w-full bg-stone section-y px-6 sm:px-12">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="From the blog"
          size="compact"
          title="Practical ways" titleMuted="to book more cleans"
          subtitle="Short guides on calls, quotes, reviews and repeat bookings. Things you can use this week."
        />

        {/* Phones: a swipe carousel, one article at a time with the next one peeking in. */}
        <div className="mt-10 md:hidden">
          <ul
            ref={stripRef}
            aria-label="Latest articles"
            className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-6 pb-2 [scroll-padding-inline:1.5rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {previews.map((post) => (
              <li key={post.slug} className="w-[80%] shrink-0 snap-start">
                <PostCard post={post} />
              </li>
            ))}
          </ul>
          <div className="mt-5 flex justify-center gap-3" role="group" aria-label="Article navigation">
            <RoundArrowButton direction="previous" label="Previous article" onClick={() => scrollByCard(-1)} />
            <RoundArrowButton direction="next" label="Next article" onClick={() => scrollByCard(1)} />
          </div>
        </div>

        <div className="mt-14 hidden grid-cols-2 gap-6 md:grid lg:grid-cols-3">
          {previews.map((post, index) => (
            <PostCard key={post.slug} post={post} delay={0.06 + index * 0.07} />
          ))}
        </div>

        <FadeUp delay={0.15} y={12} className="mt-10 flex justify-center md:mt-12">
          <CtaButton variant="outline" to="/blog">
            See all articles
          </CtaButton>
        </FadeUp>
      </div>
    </section>
  );
}
