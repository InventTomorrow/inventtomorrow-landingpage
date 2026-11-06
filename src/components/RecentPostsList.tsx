import { Link } from 'react-router';
import { POSTS, formatDate } from '../content/blog';
import { SiteImage } from './SiteImage';

interface RecentPostsListProps {
  count?: number;
  onNavigate?: () => void;
}

// The newest articles with a small image, for navy panels (footer and side sheet).
export function RecentPostsList({ count = 2, onNavigate }: RecentPostsListProps) {
  return (
    <ul className="flex flex-col gap-5">
      {POSTS.slice(0, count).map((post) => (
        <li key={post.slug}>
          <Link to={`/blog/${post.slug}`} onClick={onNavigate} className="group flex items-center gap-4">
            <div className="aspect-[8/7] w-20 shrink-0 overflow-hidden rounded-lg">
              <SiteImage
                src={post.image.src}
                alt={post.image.alt}
                label="Blog image"
                width={post.image.width}
                height={post.image.height}
                className="h-full!"
                isCaptionHidden
              />
            </div>
            <span className="flex flex-col gap-1">
              <span className="font-display text-base font-semibold leading-snug text-white transition-colors group-hover:text-accent">
                {post.title}
              </span>
              <span className="text-sm text-white/60">{formatDate(post.date)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
