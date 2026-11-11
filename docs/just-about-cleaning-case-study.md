# Just About Cleaning case study source and imagery

Sources: the supplied `Case Study — Just About Cleaning CRM & Automation Rebuild.pdf`, dated November 10, 2026, three pages; and the approved `invent_tomorrow_case_study_card.md` and `invent_tomorrow_case_study_details.md` implementation briefs.

The existing Our Work grid, route, theme and reusable components are retained. The approved card replaces the earlier implementation-count strip with neutral scope labels. The detail page follows the section order in the supplied brief. No client location, team size, testimonial or measured post-launch lift was supplied, so none is invented. Advertising spend and lead count appear only in the historical challenge callout. Configuration facts are explained in the solution and workflow sections.

The existing cover is retained and labelled as illustrative. No approved, authentic client CRM screenshot was available in the case study assets. The alt text follows the approved card brief exactly; the image is not represented as the client's actual system. No new images were generated for this update.

## Generated assets

Mode: built-in image_gen.
- `public/images/work/just-about-cleaning-crm-card.webp` — 1280 × 800, optimised WebP.
- `public/images/work/just-about-cleaning-crm-cover.webp` — 1600 × 750, optimised WebP.
- Original generated PNG retained at `C:\Users\Dev\.codex\generated_images\01a1c5c4-f689-79f1-983d-1c695e557712\exec-b94caecc-1f2f-4d98-8831-384083d96ae4.png`.

## Final generation prompt

Use case: photorealistic-natural
Asset type: editorial cover photograph for a cleaning company's CRM and automation case study, landscape 1600 x 1000 composition.
Primary request: A polished, believable small cleaning-business operations workspace, showing the practical connection between office organisation and cleaning work.
Scene/backdrop: A modest, immaculately clean office with a light oak desk beside a large window; the edge of a professional cleaning trolley softly out of focus in the background.
Subject: On the desk, a realistic open laptop in a three-quarter view, an ordinary smartphone lying flat beside it, a neatly closed notebook and a single pen. The laptop has a restrained generic CRM board with pale cards and navy and blue accents; all screen contents are naturally out of focus and unreadable. No visible invented metrics or exact screenshots.
Style/medium: High-end commercial editorial photography, realistic materials and proportions, no people.
Composition/framing: Wide landscape, the desk and laptop are the central focal point, comfortable breathing room around all important objects; subject remains readable in a wide centre crop for a website cover and in a 16:10 card crop.
Lighting/mood: Soft natural daylight, professional, calm, approachable; realistic shadows and slightly imperfect everyday textures.
Constraints: No logos, no company names, no overlaid text, no watermarks, no robots, no floating UI, no sci-fi effects, no identifiable client location or staff, no plastic CGI appearance.


## Approved implementation

Updated the existing /our-work card and /our-work/just-about-cleaning-crm-automation-rebuild detail route. No route aliases, navigation, global styles, dependencies or unrelated pages were changed.

Files changed in this update:

- src/content/caseStudies.ts: approved copy, project facts and structured story data; old record fields remain compatible.
- src/components/CaseStudyCard.tsx: 16:9 photo, neutral eyebrow and scope, bottom-aligned CTA, no numeric KPI strip on this preview.
- src/pages/CaseStudyPage.tsx: approved page structure, two workflow tracks, breadcrumbs, metadata, related-story filtering and final back link.
- src/components/FinalCtaSection.tsx: optional auditLabel, retaining the existing default everywhere else.
- src/pages/CaseStudyPage.test.tsx: integration render checks.
- docs/just-about-cleaning-case-study.md: updated source, imagery and implementation notes.

### Final section order

Breadcrumb → hero and project image → project facts → before/after → challenge and historical context → diagnosis → three solution groups → two workflow tracks → delivered operational changes → tools and scope → CTA → related real published stories, when available → Back to all work.

Just About Cleaning is currently the only real published story, so the related block is omitted.

### Final card copy

CLIENT STORY · CLEANING SERVICES

**Just About Cleaning: Fixing Lead and Quote Follow-Up**

Leads were coming in, but some never reached the right place and quotes went unchased. We rebuilt the existing system to capture contact details, route enquiries correctly, and keep quote follow-ups moving.

Lead capture · Quote tracking · Scheduled follow-ups

View case study

Alt text: Laptop on a desk in a cleaning business workspace.

### Final hero copy

CLIENT STORY · CLEANING SERVICES

**How We Rebuilt Lead and Quote Follow-Up for Just About Cleaning**

Leads were getting lost and quotes went unchased. We rebuilt Just About Cleaning's CRM to capture contact details, route enquiries, and automate follow-ups.

### Final operational results copy

**Less Guesswork. Better Visibility. More Consistent Follow-Up.**

The rebuild changed how enquiries and quotes move through the business. These are operational improvements delivered, not claimed post-launch financial results.

- **More contactable enquiries.** Facebook and Instagram intake captures basic contact details before the remaining form process.
- **Less manual routing.** New leads can be placed into the right workflow without relying on staff to remember the correct tag.
- **Clearer quote tracking.** Quoted-but-undecided leads have a visible place in the pipeline, and acceptance can be handled through the three documented routes.
- **Old quotes back in follow-up.** The previously idle backlog is included in a scheduled sequence, with replies stopping further automated chasing.

### Verified links and limits

- Card: /our-work/just-about-cleaning-crm-automation-rebuild
- Breadcrumbs: / and /our-work; current client is not a link.
- Primary CTA: /free-audit, labelled Run My Free Audit.
- Secondary CTA: /contact#book-or-message, labelled Schedule a Call.
- Final back link: /our-work.
- No new claims about bookings, revenue, return on advertising spend, time saved, zero lost leads or universal Xero syncing were added.
- Browser and native UI access were unavailable in this session, so mobile/desktop visual and keyboard interaction checks could not be completed. Responsive layout rules, semantic structure, focus classes and routes were checked through source and server-render tests.

Validation commands:

Build and TypeScript checks passed. All 42 existing tests and all 6 case study render tests passed.

```text
npm run build
npx tsc --noEmit
node --import tsx --test src/pages/CaseStudyPage.test.tsx
npm test
```
