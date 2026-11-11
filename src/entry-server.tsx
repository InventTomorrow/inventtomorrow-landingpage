import { prerender } from 'react-dom/static';
import { StaticRouter } from 'react-router';
import { SiteLayout } from './components/SiteLayout';

// Renders one URL to HTML at build time, waiting for lazy pages so the output holds the full page text.
// No chunk size limit: React then writes each page inline instead of adding reveal scripts, which the CSP would block.
export async function renderPage(url: string) {
  const { prelude } = await prerender(
    <StaticRouter location={url}>
      <SiteLayout />
    </StaticRouter>,
    { progressiveChunkSize: Number.POSITIVE_INFINITY },
  );
  return new Response(prelude).text();
}
