import { Link } from 'react-router';
import { FadeUp } from './FadeUp';
import { formatDate, readMinutes, type Post } from '../content/blog';

// One article in a list. The whole card is the link.
export function PostCard({ post, delay = 0 }: { post: Post; delay?: number }) {
  return (
    <FadeUp delay={delay} y={18} className="h-full">
      <Link
        to={`/blog/${post.slug}`}
        className="spotlight group flex h-full flex-col rounded-2xl border border-ink/[0.08] bg-white p-7 transition-[border-color,box-shadow] duration-300 hover:border-ink/25 hover:shadow-hover-lift sm:p-8"
      >
        <span className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">{post.category}</span>
        <h3 className="mt-5 text-xl font-semibold leading-snug tracking-tight text-ink text-balance">{post.title}</h3>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{post.description}</p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-8 text-sm">
          <span className="text-muted">
            {formatDate(post.date)} · {readMinutes(post)} min read
          </span>
          <span className="font-semibold text-accent underline decoration-accent/30 decoration-2 underline-offset-4 transition-colors group-hover:decoration-accent">
            Read
          </span>
        </div>
      </Link>
    </FadeUp>
  );
}
