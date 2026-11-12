import { Fragment } from 'react';
import { Link } from 'react-router';

// Only the inline formatting used in the briefs: links and emphasis. React escapes all text.
export function ServiceCopy({ text }: { text: string }) {
  const parts = text.replace(/\\([\[\]])/g, '$1').split(/(\*\*.+?\*\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g);
  return parts.map((part, index) => {
    if (part.startsWith('**')) return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (link) {
      const [, label, url] = link;
      const path = url.replace(/^https:\/\/(?:www\.)?inventtomorrow\.pro(?=\/|$)/, '') || '/';
      const className = 'font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent';
      return path.startsWith('/')
        ? <Link key={index} to={path} className={className}>{label}</Link>
        : <a key={index} href={url} className={className}>{label}</a>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}
