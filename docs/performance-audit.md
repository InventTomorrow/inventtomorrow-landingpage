# Landing page performance audit

Date: November 11, 2026. Scope: desktop and mobile loading paths in the local production build.

## Findings and changes

1. The full-screen app loader waited at least 600 ms, could wait up to four seconds for page resources/fonts, then faded for another 500 ms. It also obscured the prerendered page. Removed it from the shared layout. The development-only bootstrap remains while JavaScript starts.
2. The page wrapper and hero text started at opacity zero in server HTML. The first screen now renders visibly before hydration. Page transitions on subsequent navigation and below-fold reveal animations remain.
3. Startup scheduled downloads of all 13 other page modules. Replaced that with hover/focus prefetching of the intended destination, skipped on data saver and slow 2G connections.
4. All landing-page code was part of the shared entry bundle. Home is now a lazy route, and its lower sections are a separate lazy chunk. Prerendering still waits for every section and includes the full content. The HTML preloads the current route and its static dependencies, including route CSS, without preloading the lower-section chunk.
5. Google Fonts added an external stylesheet and font connections to the critical path. DM Sans and Outfit are now local WOFF2 files with preload hints, font-display swap, content-hashed filenames, caching and their SIL Open Font Licenses.
6. Desktop scroll easing loaded on touch devices. Lenis now loads asynchronously during idle time only for wide screens with a fine pointer and no reduced-motion preference. Native scrolling is available immediately.
7. The services carousel kept requesting animation frames even offscreen, in a hidden tab or with reduced motion. Its loop now pauses in those states and resumes when visible.

The prior responsive image improvements remain: no homepage scene download below 48rem, responsive WebP images on desktop, and optimized team portraits.

## Local build comparison

These are generated-file measurements, not Lighthouse scores or real-device load times. Gzip sizes use the same Node gzip settings for both builds. The critical JavaScript count includes the entry script and unique JavaScript files explicitly preloaded by the homepage HTML.

| Measurement | Before this audit | After |
| --- | ---: | ---: |
| Initial JavaScript, uncompressed | 466,381 bytes | 377,470 bytes |
| Initial JavaScript, gzip estimate | 150,874 bytes | 124,341 bytes |
| Initial stylesheet, uncompressed | 98,760 bytes | 95,744 bytes |
| Prerendered homepage HTML | 134,301 bytes | 134,282 bytes |
| Automatic prefetch of other routes | 13 routes | 0 routes |
| Blocking app loader in HTML | Present | Absent |
| Hero starts hidden in HTML | Yes | No |
| External font stylesheet | Present | Absent |

Initial JavaScript is approximately 19% smaller uncompressed and 18% smaller by gzip estimate. HTML size remains effectively unchanged because content was preserved.

## Verification

- `npm run build:vercel` passed: both TypeScript checks, 78 tests, Vite build, prerendering of all 18 public pages and deployment artifact checks.
- Every public page retains its title, description, single H1 and prerendered content; sitemap, structured data, legal pages, case studies and 404 output remain.
- Added checks for current-route resource hints, visible first heading, local fonts, absence of the blocking loader and exclusion of the desktop scroll/lower-section chunks from critical preloads.
- Added route-module tests for all public URLs, deep links, booking anchors, redirects and trailing slashes.
- All 27 responsive image variants remain present in the build.
- The audit chat remains pinned, without its page footer; chat API tests and booking handoff tests pass.

## Limits and deployment

The browser access host was disconnected, so interactive desktop/mobile browser runs, screenshots, hydration-console checks and real LCP/INP/CLS measurements were unavailable. Public PageSpeed API requests for both mobile and desktop returned HTTP 429 quota-exceeded responses. No performance score or real-device timing is claimed.

Changes are local and uncommitted. No deployment or production verification was performed. After deployment, run PageSpeed/Lighthouse for mobile and desktop and verify navigation, scrolling and chat in a browser.

References: [React lazy loading](https://react.dev/reference/react/lazy), [Google's LCP guidance](https://web.dev/articles/optimize-lcp), [font loading guidance](https://web.dev/articles/font-best-practices).
