import { Link } from 'react-router';
import { FadeUp } from './FadeUp';
import { SiteImage } from './SiteImage';
import { formatDate, readMinutes, type Post } from '../content/blog';

// One article in a list: image, details, title and a "Read more" button. The whole card is the link.
export function PostCard({ post, delay = 0 }: { post: Post; delay?: number }) {
  return (
    <FadeUp delay={delay} y={18} className="h-full">
      <Link
        to={`/blog/${post.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-paper transition-colors duration-300 hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <div className="overflow-hidden">
          <SiteImage
            alt={`Illustration for ${post.title}`}
            label="Blog image"
            width={640}
            height={400}
            className="transition-transform duration-500 motion-safe:group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col p-7 sm:p-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">{post.category}</span>
            <span className="text-body">
              {formatDate(post.date)} · {readMinutes(post)} min read
            </span>
          </div>
          <h3 className="mt-4 text-xl font-semibold leading-snug text-primary text-balance">{post.title}</h3>
          <p className="mt-3 flex-1 text-base">{post.description}</p>
          <span className="relative isolate mt-6 inline-flex w-fit items-center overflow-hidden rounded-xs border border-border px-5 py-3 text-sm font-medium uppercase text-primary transition-colors duration-300 before:absolute before:inset-0 before:-z-10 before:origin-top before:scale-y-0 before:bg-accent-soft before:transition-transform before:duration-300 before:ease-out group-hover:text-accent group-hover:before:scale-y-100 motion-reduce:before:transition-none">
            Read more
          </span>
        </div>
      </Link>
    </FadeUp>
  );
}
