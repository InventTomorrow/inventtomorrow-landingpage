import { useParams } from 'react-router';
import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { PostCard } from '../components/PostCard';
import { TextLink } from '../components/TextLink';
import { DefaultClosingCta } from '../components/FinalCtaSection';
import { POSTS, formatDate, readMinutes, type Block, type Post } from '../content/blog';
import { usePageMeta } from '../hooks/usePageMeta';
import { NotFoundPage } from './NotFoundPage';

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'h2':
      return <h2 className="mt-12 text-2xl font-bold tracking-tight text-ink">{block.text}</h2>;
    case 'p':
      return <p className="mt-5 text-[1.0625rem] leading-[1.75] text-ink/80">{block.text}</p>;
    case 'ul':
      return (
        <ul className="mt-5 space-y-3">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 text-[1.0625rem] leading-[1.7] text-ink/80">
              <span className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="mt-5 space-y-3">
          {block.items.map((item, i) => (
            <li key={item} className="flex gap-3 text-[1.0625rem] leading-[1.7] text-ink/80">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                {i + 1}
              </span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      );
    case 'message':
      return (
        <figure className="my-7 flex justify-end">
          <p className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-5 py-3.5 text-[0.9375rem] leading-snug text-white shadow-bubble">
            {block.text}
          </p>
        </figure>
      );
  }
}

function Article({ post }: { post: Post }) {
  usePageMeta(`${post.title} | Invent Tomorrow`, post.description);
  const others = POSTS.filter((p) => p.slug !== post.slug);

  return (
    <>
      <PageHero
        eyebrow={post.category}
        title={post.title}
        description={post.description}
        meta={`${formatDate(post.date)} · ${readMinutes(post)} min read`}
        size="compact"
      />

      <section className="relative z-10 w-full bg-paper px-6 py-20 sm:px-12 sm:py-24">
        <article className="mx-auto max-w-2xl select-text">
          {post.body.map((block, i) => (
            <BlockView key={i} block={block} />
          ))}
          <div className="mt-14 border-t border-ink/10 pt-8 text-sm">
            <TextLink to="/blog">Back to all articles</TextLink>
          </div>
        </article>
      </section>

      {others.length > 0 && (
        <Section bg="stone">
          <h2 className="text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">Keep reading</h2>
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
            {others.slice(0, 2).map((p, i) => (
              <PostCard key={p.slug} post={p} delay={0.06 + i * 0.07} />
            ))}
          </div>
        </Section>
      )}

      <DefaultClosingCta />
    </>
  );
}

export function BlogPostPage() {
  const { slug } = useParams();
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return <NotFoundPage />;
  // key: a fresh page (and animations) when moving from one article to another
  return <Article key={post.slug} post={post} />;
}
