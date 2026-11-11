# Invent Tomorrow: Portable Copy, Structure and Header Code

**Written for:** another AI or developer who must recreate this website's copy, section structure and animated header on a different site.

## 0. Read this first

- **What this is:** a complete extraction of a 12-page marketing site for "Invent Tomorrow", an automation/follow-up service for **cleaning service businesses**. It has the exact copy, the section order and layout of every page, and the full working code for the animated header.
- **Original stack:** Next.js 16 (App Router), React 19, plain global CSS, `lucide-react` and `react-icons` for icons, Plus Jakarta Sans font. Nothing in the header needs Next. The CSS is framework-free.
- **Look:** near-black background, one blue-to-rose gradient accent, rounded dark cards.
- **Primary CTA:** `Run My Audit`, which goes to `/free-leak-audit`.
- **Secondary CTA:** `Schedule a Call`, which goes to `/contact#book-or-message`.
- **Calendly URL (swap for yours):** `https://calendly.com/abdulhaadi-businesschat/30min`
- **Spelling:** British (`enquiries`, `organised`). Keep it.
- **Copy is verbatim.** Characters like `’` and the missing punctuation in some headings (for example `Three steps You stay focused`) are as shipped. Keep or fix on purpose.
- **Verify before reuse:** these claims are on the Home page and need confirming for any new business:
  - "About half of calls … never reach a real person"
  - "71% of companies take over an hour…"
  - "90-day guarantee"
  - "10 founding clients"
  - "$497 Quote Revival"
  - "work free until we do"

**What was machine-verified:** the header CSS in section 4 was compared against the live site in headless Chrome. It matched on every computed style of 9 header elements at every viewport width from 280px to 2600px, at viewport heights of 900px and 500px, in both the resting and scrolled states, and at retina (2x) pixel density. The scroll threshold and hover behaviour also matched. The hero code in section 5 was read from the source but **not** machine-tested.

---

## 1. Design tokens

~~~css
:root {
  --accent-blue: #6366f1;
  --accent-rose: #c64c63;
  --accent-gradient: linear-gradient(90deg, var(--accent-blue) 0%, var(--accent-rose) 100%);
  --accent-gradient-reverse: linear-gradient(90deg, var(--accent-rose) 0%, var(--accent-blue) 100%);
}
~~~

| Token | Value |
| --- | --- |
| Font | Plus Jakarta Sans, weights 200–800. Define `--font-plus-jakarta-sans: "Plus Jakarta Sans", sans-serif` |
| Page background | `#0f0f0f` body; sections use `#050507`, `#07080b`, `#08090d` |
| Body text | `#ffffff` headings; muted copy `#a5a9b4` / `#b8bac3` / `#9ba0ac` |
| Card | dark panel, `1px solid rgba(255,255,255,0.1)`, radius 14–26px, faint gradient glow |
| Content shell | max width `1200px` (`width: min(100%, 1200px)`) |
| Section height (desktop) | `min-height: 100svh`, content vertically centred; auto height on mobile |
| Eyebrow | small uppercase label, gradient text (`--accent-gradient`) |
| Primary button | `--accent-gradient` background, reverses on hover |
| Secondary button | transparent, `1px solid rgba(255,255,255,0.18)`, radius 10px |

---

## 2. Routes and SEO metadata

| Route | `<title>` | Meta description |
| --- | --- | --- |
| Root fallback | `Invent Tomorrow \| Focus on your jobs` | Follow-up systems for cleaning service businesses. Spend less time following up and more time getting jobs done. |
| `/` | `Invent Tomorrow \| Systems for Cleaning Service Businesses` | Win back missed enquiries, follow up quotes and build recurring bookings for your cleaning service business. |
| `/how-it-works` | `How It Works \| Invent Tomorrow` | Review your process, approve your messages and put a follow-up system in place for your cleaning business. |
| `/services` | `Services \| Invent Tomorrow` | Follow-up and booking systems for cleaning businesses. Enquiries answered, teams informed and less for you to chase. |
| `/who-we-help` | `Who We Help \| Invent Tomorrow` | Systems built around residential, commercial and specialist cleaning service businesses. |
| `/about` | `About Us \| Invent Tomorrow` | Invent Tomorrow builds simple, reliable automation systems that make everyday work easier for cleaning businesses. |
| `/faq` | `FAQ \| Invent Tomorrow` | Straight answers about follow-up systems, your current tools, messages, pricing and setup. |
| `/free-leak-audit` | `Your Business Audit \| Invent Tomorrow` | Find where time is being lost in your calls, quotes and bookings, and what our system could take off your hands. |
| `/contact` | `Schedule a Call \| Invent Tomorrow` | Talk through the calls, quotes and follow-ups taking up your day. |
| `/results` | `Results \| Invent Tomorrow` | Measure response times, follow-ups and the time saved behind each job. |
| `/privacy` | `Privacy Policy \| Invent Tomorrow` | How Invent Tomorrow collects, uses and protects information submitted through this website. |
| `/terms` | `Terms \| Invent Tomorrow` | Terms governing use of the Invent Tomorrow website. |
| `/sms-consent` | `SMS Consent Policy \| Invent Tomorrow` | Consent, frequency, opt-out and privacy terms for Invent Tomorrow text messages. |

Aliases (same page re-exported, not redirects): `/case-studies` shows `/results`; `/industries` and `/industries/roofing` show `/who-we-help`. Page order in the nav: Home, How It Works, Services, Who We Help, About Us, FAQ.

---

## 3. Site shell copy

**Header:** logo image + `Invent Tomorrow` (links to `/`). Nav links: `Home` `/`, `How It Works` `/how-it-works`, `Services` `/services`, `Who We Help` `/who-we-help`, `About Us` `/about`, `FAQ` `/faq`. Right-hand button: `Run My Audit` → `/free-leak-audit`. Logo aria-label `Invent Tomorrow home`; logo alt `Invent Tomorrow Logo`.

**Footer bottom (every page):**

- Brand: `Invent Tomorrow`. Tagline: `Win back the jobs you already earned.`
- **Explore:** Services, How It Works, Who We Help
- **Company:** Results, FAQ, About, Schedule a Call (`/contact`)
- **Legal:** Privacy Policy, Terms, SMS Consent
- Copyright: `© {current year} Invent Tomorrow. All rights reserved.`
- Layout: max width 1280px. Brand block plus three link columns in one row on desktop; stacks on mobile. The copyright sits under a divider.

**Closing CTA block (above the footer on inner pages).** The copy depends on the route:

| Route | Heading | Body | Small line |
| --- | --- | --- | --- |
| default (how-it-works, results, legal, any other) | Discover the revenue you could reclaim | Walk us through how you handle calls, quotes, and bookings. Your audit shows where time is being lost and what our system could take off your hands. | Know what to improve. Know where to start. |
| `/services` | Simplify what happens behind every job | See which enquiries, follow-ups, and reminders your system could handle first. | Start with one process. Build from there. |
| `/who-we-help` | See how it could fit your business | Show us how your cleaning service works. We'll find the best place to start. | Built around your tools and workflow. |
| `/faq` | Still have a question? | Tell us what you need clarity on. We'll help you find the right next step. | No pressure. Just clear answers. |
| `/about` | Let's Get in Touch | Show us how work moves through your business. We'll find the best place to automate first. | Audit first. Automate what matters. |
| `/free-leak-audit` | Prefer to talk it through? | Choose a time to walk through your business and the tasks taking up your day. | (none) |

Buttons: primary `Run My Audit` → `/free-leak-audit` and secondary `Schedule a Call` → `/contact#book-or-message`. On `/free-leak-audit` there is only one button, `Schedule a Call`. The block is **hidden on `/` and `/contact`**. Layout: centred, heading max about 54px, description max about 20px, buttons in a row (stacked on mobile).

---

## 4. HEADER (animated navbar): full working code

### 4.1 What it does

1. A **fixed** bar sits at the top of the page. At rest it is transparent and full width (max 1400px) with the logo on the left, the 6 links centred and the gradient `Run My Audit` button on the right.
2. When `window.scrollY > 80` (strictly greater, so 80 stays resting and 81 triggers), JavaScript adds the class `navbar-scrolled`. Below 80 it removes it. That is the only JavaScript.
3. **The animation is one CSS transition:** `transition: all 0.4s ease` on `.navbar`. Every property that changes animates over 400ms:
   - Width shrinks from 1400px to 1200px (`min(1200px, 100% - 32px)`).
   - Padding shrinks from `18px 60px` to `12px 24px`.
   - `margin-top` grows from 0 to 15px at 992–1439px, 18px at 1440–1599px, 20px at 1600px and up, 12px at 787–991px, and 0 at 786px and below.
   - A 1.5px border and 14px corner radius appear.
   - A blur backdrop (`backdrop-filter: blur(10px)`) and a drop shadow appear.

   Result: a floating glass pill with a blue-to-rose gradient border. The gradient border is made with two stacked backgrounds, `padding-box` for the dark fill and `border-box` for the gradient, over a transparent border.
4. Measured at a 1440px viewport, the resting bar is 1400px wide and the scrolled pill is 1200px wide and 70px tall, offset 18px from the top. The animation takes about 420ms.
5. The active page link has a blue underline (`text-decoration-color: var(--accent-blue)`, offset 8px). The button lifts 2px and reverses its gradient on hover.
6. **At 900px and below** the bar becomes a flat, full-width, two-row bar. Row 1 holds the logo and button. Row 2 holds the links, which scroll horizontally with the scrollbar hidden. The pill effect is switched off there, so only the dark background changes on scroll.
7. **The 12px quirk (kept to match the original):** at 787–900px, the scrolled bar still has a 12px top margin. That leaves a 12px gap above it. If you don't want it, set `margin-top: 0` on `.navbar.navbar-scrolled` inside the `max-width: 900px` block.

### 4.2 Markup (as rendered)

~~~html
<nav class="navbar">
  <a class="nav-left" href="/" aria-label="Invent Tomorrow home">
    <img src="/logo-small.png" alt="Invent Tomorrow Logo" width="40" height="40">
    <span class="logo">Invent Tomorrow</span>
  </a>
  <div class="nav-menu" aria-label="Primary navigation">
    <a class="nav-link nav-link-active" href="/">Home</a>
    <a class="nav-link" href="/how-it-works">How It Works</a>
    <a class="nav-link" href="/services">Services</a>
    <a class="nav-link" href="/who-we-help">Who We Help</a>
    <a class="nav-link" href="/about">About Us</a>
    <a class="nav-link" href="/faq">FAQ</a>
  </div>
  <a class="btn-consult" href="/free-leak-audit">Run My Audit</a>
</nav>
~~~

`nav-link-active` goes on the link for the current page.

### 4.3 JavaScript: framework-free version (tested)

~~~js
(function () {
  var nav = document.querySelector(".navbar");
  if (!nav) return;

  function onScroll() {
    nav.classList.toggle("navbar-scrolled", window.scrollY > 80);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();
~~~

### 4.4 JavaScript: the original React component (Next.js)

~~~jsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "./assets/a.png";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/services", label: "Services" },
  { href: "/who-we-help", label: "Who We Help" },
  { href: "/about", label: "About Us" },
  { href: "/faq", label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <Link href="/" className="nav-left" aria-label="Invent Tomorrow home">
        <Image src={logo} alt="Invent Tomorrow Logo" width={40} height={40} />
        <span className="logo">Invent Tomorrow</span>
      </Link>

      <div className="nav-menu" aria-label="Primary navigation">
        {navigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? "nav-link-active" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <Link href="/free-leak-audit" className="btn-consult">Run My Audit</Link>
    </nav>
  );
}
~~~

### 4.5 CSS: consolidated and verified

The original stylesheet has about 110 overlapping navbar rules across 7,800 lines, including `!important` fights and dead code. The CSS below is a cleaned-up equivalent. Do not reorder it: the cascade depends on the source order.

Needs the font variable set on `body`: `--font-plus-jakarta-sans: "Plus Jakarta Sans", sans-serif`. The `* { max-width: 100% }` rule in section 0 is part of the original and affects layout.

~~~css
/* ---------- 0. Tokens + the global resets the header relies on ---------- */
:root {
  --accent-blue: #6366f1;
  --accent-rose: #c64c63;
  --accent-gradient: linear-gradient(90deg, var(--accent-blue) 0%, var(--accent-rose) 100%);
  --accent-gradient-reverse: linear-gradient(90deg, var(--accent-rose) 0%, var(--accent-blue) 100%);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;
  -webkit-hyphens: auto;
  -ms-hyphens: auto;
  hyphens: auto;
  max-width: 100%;
}

html,
body {
  overflow-x: clip;
  width: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-plus-jakarta-sans), sans-serif;
  background-color: #0f0f0f;
  color: #ffffff;
  line-height: 1.6;
  overflow-y: visible;
}

a {
  text-decoration: none;
  color: inherit;
}

img {
  max-width: 100%;
  height: auto;
}

/* ---------- 1. Header bar: resting state (transparent, full width) ---------- */
.navbar {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1400px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 60px;
  background: transparent;
  transition: all 0.4s ease; /* <- drives the whole shrink animation */
  z-index: 1000;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
}

.nav-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(14px, 2vw, 28px);
  margin: 0 auto;
}

.nav-link {
  color: #b6bac3;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.nav-link:hover,
.nav-link-active {
  color: #ffffff;
}

.nav-link-active {
  text-decoration: underline;
  text-decoration-color: var(--accent-blue);
  text-underline-offset: 8px;
}

.btn-consult {
  background: var(--accent-gradient);
  color: #ffffff;
  padding: 10px 22px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.18);
  transition: all 0.3s ease;
}

.btn-consult:hover {
  background: var(--accent-gradient-reverse);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(198, 76, 99, 0.22);
}

/* ---------- 2. Header bar: scrolled state (floating glass pill) ---------- */
.navbar.navbar-scrolled {
  width: min(1200px, calc(100% - 32px));
  max-width: 1200px;
  transform: translateX(-50%);
  padding: 12px 24px;
  margin-top: 15px;
  background:
    linear-gradient(rgba(5, 5, 7, 0.94), rgba(5, 5, 7, 0.94)) padding-box,
    var(--accent-gradient) border-box;
  backdrop-filter: blur(10px);
  border: 1.5px solid transparent;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.navbar-scrolled .nav-left {
  gap: 11px;
}

.navbar-scrolled .btn-consult {
  margin-left: 12px;
  padding: 10px 18px;
  width: auto;
  white-space: nowrap;
}

/* Retina screens get a tighter shadow */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .navbar.navbar-scrolled {
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
  }
}

/* ---------- 3. Large-screen tuning ---------- */
@media (min-width: 1440px) and (max-width: 1599px) {
  .navbar { padding: 20px 70px; }
  .navbar.navbar-scrolled { margin-top: 18px; }
  .logo { font-size: 22px; }
  .btn-consult { padding: 11px 25px; }
}

@media (min-width: 1600px) {
  .navbar { padding: 22px 80px; }
  .navbar.navbar-scrolled { margin-top: 20px; }
  .logo { font-size: 24px; }
  .btn-consult { padding: 12px 28px; border-radius: 8px; }
}

/* ---------- 4. Laptop / tablet landscape ---------- */
@media (min-width: 992px) and (max-width: 1199px) {
  .navbar { padding: 16px 50px; }
  .btn-consult { padding: 8px 20px; }
}

@media (max-width: 1199px) {
  .logo { font-size: 18px; }
}

@media (max-width: 991px) {
  .navbar.navbar-scrolled { margin-top: 12px; }
  .btn-consult { padding: 8px 18px; }
}

/* short viewports */
@media (max-height: 600px) {
  .navbar { padding: 10px 40px; }
  .navbar.navbar-scrolled { margin-top: 8px; }
}

@media (max-width: 992px) {
  .navbar { padding: 16px 30px; }
}

@media (max-width: 1180px) {
  .navbar { padding-inline: 28px; }
}

@media (min-width: 901px) and (max-width: 1180px) {
  .nav-menu { gap: 12px; }
  .btn-consult { padding-inline: 14px; }
}

/* ---------- 5. <= 900px: two-row flat bar, links scroll horizontally ---------- */
@media (max-width: 900px) {
  .navbar,
  .navbar.navbar-scrolled {
    left: 0;
    width: 100%;
    max-width: none;
    padding: 12px 20px;
    transform: none;
    flex-wrap: wrap;
    row-gap: 8px;
    background: rgba(0, 0, 0, 0.94);
    border: 0;
    border-radius: 0;
    overflow: hidden;
  }

  .nav-left { min-width: 0; }

  .nav-menu {
    order: 3;
    justify-content: flex-start;
    width: 100%;
    flex: 0 0 100%;
    min-width: 0;
    max-width: 100%;
    gap: 13px;
    padding: 5px 0 2px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .nav-menu::-webkit-scrollbar { display: none; }

  .nav-link { font-size: 14px; }
  .nav-link-active { text-underline-offset: 5px; }

  .btn-consult {
    flex: 0 0 auto;
    margin-left: auto;
  }
}

/* ---------- 6. <= 786px ---------- */
@media (max-width: 786px) {
  .navbar { backdrop-filter: blur(10px); }

  .navbar.navbar-scrolled {
    margin-top: 0;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
    border: none;
    border-radius: 0;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }

  .btn-consult { padding: 8px 18px; }
}

@media (max-width: 768px) {
  .navbar { column-gap: 15px; }
}

/* ---------- 7. <= 620px ---------- */
@media (max-width: 620px) {
  .nav-left img { width: 32px; height: 32px; }
  .logo { font-size: 16px; }
  .nav-menu { gap: 18px; }
  .btn-consult,
  .navbar-scrolled .btn-consult { padding: 7px 12px; font-size: 12px; }
}

/* ---------- 8. Tiny phones ---------- */
@media (max-width: 479px) {
  .btn-consult { border-radius: 4px; }
}

@media (max-width: 359px) {
  .btn-consult { border-radius: 3px; }
}
~~~

**Dead code you can ignore if you see it elsewhere:** `transform: scale(0.85)` on the scrolled bar (overridden), and most `.navbar-scrolled` width percentages (35%, 38%, 40%, 50%, 70%…), which are all overridden by `min(1200px, calc(100% - 32px))`.

**Breakpoints used:** 1600, 1440, 1200/1199, 1180, 992, 991, 900, 786, 768, 620, 479, 359 (widths) and `max-height: 600px`.

---

## 5. HERO (page-top section): code and animation

The hero is the large first section on every page. This part was read from the source, not machine-tested like the header.

### 5.1 Component (React)

~~~jsx
import Image from "next/image";

const BOOKING_LINK = "https://calendly.com/abdulhaadi-businesschat/30min";

export default function HeroSection({
  eyebrow = "For cleaning service businesses",
  title,
  description = "Spend less time following up and more time getting jobs done.",
  secondaryLine = "",
  buttonLabel = "Schedule a Call",
  buttonHref = BOOKING_LINK,
  secondaryButtonLabel,
  secondaryButtonHref,
  trustItems = [],
  compact = false,
}) {
  const isExternal = buttonHref.startsWith("http");

  return (
    <section className={`hero ${compact ? "hero-inner" : ""}`}>
      <div className="hero-grid-bg">
        <Image src="/hero1.png" alt="" width={1896} height={1200} priority />
      </div>

      <div className="hero-shaded-overlay" aria-hidden="true" />

      <div className="hero-content">
        <div className="ai-cons">
          <span className="green-circle" />
          <span className="sub-text">{eyebrow}</span>
        </div>
        <h1>
          {title || (
            <>
              Focus on your jobs.<br /><span className="hero-gradient-text">Our system handles the rest.</span>
            </>
          )}
        </h1>
        <p>
          {description}
          {secondaryLine && (
            <>
              <br />
              {secondaryLine}
            </>
          )}
        </p>
        <div className="hero-actions">
          {buttonLabel && (
            <a
              href={buttonHref}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="btn-hero"
            >
              {buttonLabel}
            </a>
          )}
          {secondaryButtonLabel && secondaryButtonHref && (
            <a className="btn-hero-secondary" href={secondaryButtonHref}>{secondaryButtonLabel}</a>
          )}
        </div>
        {trustItems.length > 0 && (
          <div className="hero-trust" aria-label="Service promises">
            {trustItems.map((item) => <span key={item}>{item}</span>)}
          </div>
        )}
      </div>
    </section>
  );
}
~~~

### 5.2 Entrance animation: the JavaScript that triggers it

An `IntersectionObserver` adds `visible` to the hero when 20% of it is on screen (bottom margin −100px). The CSS then fades the badge, headline, paragraph and primary button up together. There is no stagger.

~~~jsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollAnimation() {
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -100px 0px" },
    );

    const elements = document.querySelectorAll(
      ".hero, .break-section, .how-section, .ai-section, .ai-stack-section, .footer-section, " +
      ".break-card, .how-card, .ai-statItem, .ai-stack-item, .contact-panel, " +
      ".break-section h2, .break-subtext, .how-title, .how-subtitle, " +
      ".ai-headline, .ai-stack-title, .ai-stack-description, .cta-title, .cta-description",
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
~~~

### 5.3 Hero CSS (home variant)

~~~css
/* wrapper (home page <main class="home-page recovery-home revenue-home">) */
.home-page { position: relative; isolation: isolate; overflow: clip;
  background: radial-gradient(circle at 12% 30%, rgba(99,102,241,.075), transparent 30%),
              radial-gradient(circle at 88% 62%, rgba(198,76,99,.065), transparent 28%), #050507; }

.hero {
  position: relative; display: flex; justify-content: center; align-items: center;
  width: 100%; min-height: 100svh; overflow: hidden; text-align: center; background: transparent;
  padding: clamp(180px, 16vw, 250px) 24px clamp(120px, 11vw, 180px);
}
@media (max-width: 900px) { .hero { padding-top: 190px; } }
@media (max-width: 620px) { .hero { padding: 170px 18px 105px; } }

/* bottom fade into the next section */
.hero::after { content: ""; position: absolute; inset: auto 0 0 0; z-index: 3;
  height: clamp(120px, 14vw, 210px); pointer-events: none;
  background: linear-gradient(180deg, rgba(5,5,7,0), #050507); }

/* grid image behind everything: /hero1.png (1896x1200) */
.hero-grid-bg { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.hero-grid-bg img { width: 100%; height: 100%; object-fit: cover; object-position: center;
  opacity: .38; mask-image: linear-gradient(to bottom, #000 0%, #000 72%, transparent 100%); }

/* blue-to-rose glow at the top centre (an empty div, pure CSS) */
.hero-shaded-overlay { position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: min(760px, 68vw); height: min(620px, 68%); z-index: 2; pointer-events: none; filter: blur(8px);
  background: radial-gradient(ellipse at 50% 0%, rgba(99,102,241,.23) 0%, rgba(136,87,177,.17) 34%,
              rgba(198,76,99,.1) 56%, rgba(198,76,99,0) 86%); }
@media (max-width: 900px) { .hero-shaded-overlay { width: 100vw; height: 58%; } }

.hero-content { position: relative; z-index: 10; width: 100%; max-width: 1180px; margin: 0 auto; padding: 0 20px; }
@media (max-width: 620px) { .hero-content { max-width: 100%; } }

/* eyebrow pill */
.ai-cons { display: flex; align-items: center; justify-content: center; gap: 8px; width: fit-content;
  margin: 0 auto; max-width: 367px; padding: 8px 18px; border: 1px solid rgba(255,255,255,.42);
  border-radius: 50px; background: rgba(10,10,14,.58); backdrop-filter: blur(14px); font-size: 15px; }
.sub-text { font-size: 15px; color: #999; }
@media (max-width: 620px) { .ai-cons, .sub-text { font-size: 13px; } }

/* blinking dot */
.green-circle { width: 10px; height: 10px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, var(--accent-blue), var(--accent-rose));
  box-shadow: 0 0 12px rgba(198,76,99,.55); animation: blink 2s ease-in-out infinite; }
@keyframes blink { 0% { opacity: 1; } 50% { opacity: .3; } 100% { opacity: 1; } }

/* headline */
.hero h1 { max-width: 1120px; margin: clamp(30px, 4vw, 48px) auto 24px;
  font-size: clamp(44px, 6vw, 72px); font-weight: 700; line-height: 1.16;
  letter-spacing: -0.03em; text-wrap: balance; }
@media (max-width: 900px) { .hero h1 { font-size: clamp(38px, 8vw, 58px); letter-spacing: -0.025em; } }
@media (max-width: 620px) { .hero h1 { font-size: clamp(34px, 10vw, 46px); letter-spacing: -0.02em; margin-top: 28px; } }

/* gradient second line */
.hero-gradient-text { display: inline-block; padding-bottom: .15em; margin-bottom: -.15em; white-space: normal;
  background: var(--accent-gradient); background-size: 100% 100%; background-position: center;
  -webkit-background-clip: text; background-clip: text; color: transparent; }

.hero p { max-width: 760px; margin: 0 auto 38px; color: #b8bac3; text-wrap: balance;
  font-size: clamp(17px, 1.35vw, 20px); line-height: 1.65; }
@media (max-width: 620px) { .hero p { font-size: 16px; line-height: 1.6; margin-bottom: 30px; } }

.hero-actions { display: flex; align-items: center; justify-content: center; gap: 16px; }
.btn-hero { padding: 15px 30px; border-radius: 10px; border: 0; cursor: pointer; color: #fff;
  font-size: 15px; font-weight: 600; background: var(--accent-gradient); box-shadow: 0 8px 24px rgba(99,102,241,.18); }
.btn-hero:hover { background: var(--accent-gradient-reverse); box-shadow: 0 10px 30px rgba(198,76,99,.22); }
.btn-hero-secondary { display: inline-flex; align-items: center; justify-content: center; min-height: 52px;
  padding: 13px 24px; border: 1px solid rgba(255,255,255,.18); border-radius: 10px; color: #f4f4f5;
  font-size: 15px; font-weight: 600; transition: border-color .2s, background .2s, transform .2s; }
.btn-hero-secondary:hover { border-color: rgba(255,255,255,.38); background: rgba(255,255,255,.06); transform: translateY(-2px); }
@media (max-width: 700px) { .hero-actions { flex-direction: column; }
  .btn-hero, .btn-hero-secondary { width: min(100%, 310px); } }

.hero-trust { display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
  gap: 10px 26px; margin-top: 28px; color: #9ba0ac; font-size: 13px; font-weight: 600; }
.hero-trust span { display: inline-flex; align-items: center; gap: 12px; }
.hero-trust span:not(:first-child)::before { content: ""; width: 4px; height: 4px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-rose)); }
@media (max-width: 700px) { .hero-trust span:not(:first-child)::before { display: none; } }
@media (max-width: 620px) { .hero-trust { flex-direction: row; gap: 10px 16px; font-size: 12px; } }

/* ENTRANCE ANIMATION: hidden until .visible is added by the observer */
.hero .ai-cons, .hero h1, .hero p, .hero .btn-hero {
  opacity: 0; transform: translateY(30px); transition: all .8s cubic-bezier(.4, 0, .2, 1); }
.hero p { transform: translateY(20px); transition: all .8s ease; }
.hero.visible .ai-cons, .hero.visible h1, .hero.visible p, .hero.visible .btn-hero {
  opacity: 1; transform: translateY(0); }
@media (prefers-reduced-motion: reduce) {
  .hero .ai-cons, .hero h1, .hero p, .hero .btn-hero { opacity: 1; transform: none; transition: none; } }
~~~

Notes:

- The secondary button and trust row are **not** animated; they are visible immediately.
- If JavaScript fails, the badge, headline, paragraph and primary button stay at `opacity: 0`. Keep the observer, or make the hidden state conditional on a JS-set class.
- **Inner pages (compact hero):** same component with `compact`. `.hero-inner` uses `min-height: 68svh` and `padding: 180px 20px 120px` (`165px 18px 80px` at 620px and below), background `#050507`, and a 1px bottom divider on some pages.
- Per-page inner hero widths (content / headline max / paragraph max):

  | Page | Content / headline / paragraph | Height |
  | --- | --- | --- |
  | How It Works | 960 / 880 / 680 | `100svh` |
  | Services | 1120 / 1080 / 760 | `100svh` |
  | Who We Help | 1200 / 980 / 720 | `100svh` |
  | FAQ | 1200 / 1000 / 680 | `100svh` |
  | About | 1200 shell, centred copy | `100svh` |

  Each inner page (including `/contact`, `/results` and `/free-leak-audit`) uses the shared hero with these overrides.

---

## 6. Page copy and structure

Legend: **Eyebrow** is the small gradient label above a heading. "Gradient line" means that line of the headline uses the blue-to-rose gradient text. Every page starts with the hero in section 5.

### 6.1 Home `/`

**Section order:** Hero → Stay focused timeline → Tools → Leaks → Myth → System → How it works → Done for you → Before/After → Founding clients → Promise + starter offer → Final CTA → footer (no shared CTA block).

**1. Hero**

- Eyebrow: `For cleaning service businesses`
- Heading: `Focus on your jobs` / gradient line `Our system handles the rest`
- Body: `Spend less time following up and more time getting jobs done.`
- Buttons: `Run My Audit` (primary), `Schedule a Call` (secondary)
- Trust row: `Done for you` · `You approve every message` · `90-day guarantee`

**2. Stay focused.** Eyebrow `Stay focused`. Heading `It’s 2:14 pm You’re on a job`.

Three timeline stages (time, text):

- `2:14`: Your phone rings. You keep working.
- `2:14`: Our system texts the customer back in seconds.
- `2:20`: The lead is handled without interrupting the clean.

Closing line: `You stay focused. The opportunity keeps moving.`

Structure: three columns connected by a gradient line with a dot per stage (vertical timeline on mobile).

**3. Tools.** Eyebrow `Works with your tools`. Heading `Built around the tools you already use`. Body: `No new software to learn. We plug into your booking, calling and review tools and run the follow-up on top.`

Five cards, each with brand logo(s), a title and a line:

- **Booking and scheduling:** Jobber · Housecall Pro
- **Calls and texts:** Your business line · OpenPhone
- **Payments and invoicing:** Stripe · QuickBooks
- **Reviews:** Google Business Profile
- **CRM and leads:** HubSpot · Google Sheets

Note: `Don’t see yours? We confirm compatibility in your audit.`

Structure: 6-column grid, each card spans 2, so 3 on the first row and 2 centred on the second (the 4th card starts at column 2). Two columns under 920px, one under 620px. Brand marks sit in 40px white rounded squares.

**4. Leaks.** Eyebrow `The leaks`. Heading `Jobs slip through the same three cracks every week`.

- `01` The missed call: About half of calls to home service businesses never reach a real person.
- `02` The slow reply: 71% of companies take over an hour to answer a web lead. Customers won’t wait.
- `03` The forgotten quote: You send the estimate, follow up once, then get busy.

Closing: `That’s not a sales problem.` + gradient `It’s a follow-up problem.`

Structure: 3 equal cards with a big number and a thin gradient top edge.

**5. Myth.** Eyebrow `The myth`. Heading `“You just need more leads”`.

- `That’s what every agency says. More ads, more SEO, more Thumbtack.`
- `But more leads into a leaky bucket just means paying more to lose more.`
- Emphasis: `Fix the leaks first, and every lead you already pay for starts paying you back.`

Right-hand "leaky bucket" panel with the labels `Your lead bucket`, `Missed calls`, `Slow replies`, `Forgotten quotes`. aria-label: `A leaky bucket representing lost jobs`. Structure: two columns, argument on the left and bucket panel on the right.

**6. System** (anchor `#services`). Eyebrow `The system`. Heading `Meet the Revenue Recovery System`. Body: `Seven fixes that plug every leak. We build them, write them and run them.`

Seven icon cards (Lucide icon in brackets):

1. Quote Revival [RotateCcw]: Old quotes become booked cleans.
2. Missed Call Rescue [PhoneCall]: Every missed call gets a text in seconds.
3. 60 Second Response [Clock3]: Every lead hears back in under a minute.
4. Quote Chaser [MessageSquareText]: Every estimate gets followed up, automatically.
5. 5 Star Engine [Star]: A review request after every clean.
6. Busy Season Ready [CloudLightning]: First to every customer during spring-clean and move-out rushes.
7. Recurring Booker [CalendarCheck]: One-time clients become weekly and monthly regulars.

Structure: 4 across then 3 centred (2 columns on tablet, 1 on mobile).

**7. How it works** (anchor `#how-it-works`). Eyebrow `How it works`. Heading `Three steps You stay focused`.

- `01` Find the distractions: We audit the calls, quotes and follow-ups pulling your attention away from the work.
- `02` Build the system: We write the messages, connect your tools and set up every follow-up for you.
- `03` Focus on the clean: We handle calls, quotes and rebooking while you focus on doing great work.

Button: `Run My Audit`. Structure: numbered vertical list with dividers; button centred below.

**8. Done for you.** Eyebrow `Done for you`. Heading `You focus on the clean` / `We handle the follow up`. Body: `A clear split of responsibilities so nothing gets missed and nothing pulls you away from the job`.

- Left card **Your focus** (check icons): Join one 45 minute kickoff call · Approve your messages once · Deliver great cleaning work
- Right card **Our system**: one large gradient statement `Everything else`

Closing: `You stay present on the job` + gradient `Every opportunity keeps moving`. Structure: two balanced cards.

**9. Before and after.** Eyebrow `Before and after`. Progress labels `Before` and `After`.

- **01 Before** ✗ icons. Body: Calls, quotes and follow-ups keep pulling you away from the work.
  - Stop during a job to answer calls
  - Chase quotes between jobs
  - You text customers at 10pm
  - Ask for reviews manually
  - Remember who needs rebooking
  - Hint: `Keep scrolling to see the shift`
- **02 After** ✓ icons. Body: The system keeps every opportunity moving while you stay focused on the clean.
  - Keep cleaning while every caller gets a reply
  - Every quote gets followed up automatically
  - Your evenings are yours again
  - Review requests go out after every clean
  - Regulars are prompted to book again
  - Hint: `Continue to what comes next`

Structure and behaviour: a sticky, full-viewport "scroll story". It starts on Before. The first wheel or touch scroll down while it is pinned switches to After with a transition of about 0.85s. Scrolling up while pinned switches back. After the switch the page scrolls on normally. Reduced-motion users should see both states.

**10. Founding clients.** Eyebrow `Founding clients`. Heading `Become one of our 10 founding clients`. Body: `Founding pricing and a direct line to the founders. In return, your results become our first case study.` Right side: label `10 founding spots` and button `Claim a founding spot`. Structure: one large bordered card, copy on the left and action on the right.

**11. Promise + starter offer.** Two cards side by side (the guarantee card is slightly wider).

- Eyebrow `Our promise`. Heading: `If we don’t book jobs that cover our fee within 90 days, we work free until we do`
- Eyebrow `An easy start`. Heading: `Not ready for the full system? Start small`. Copy: `Quote Revival: $497, one time.` (bold) `We revive your old quotes in 14 days. Upgrade later and it’s credited to your setup.` Button: `Start with Quote Revival`.

**12. Final CTA.** Heading `Find out what you’re losing It’s free`. Body: `We test your business in secret, then walk you through the results in a 15-minute call.` Button: `Run My Audit`. Small line: `No contract. No pressure. Just the numbers.` Structure: centred dark card, max width about 980px, with a soft top glow.

---

### 6.2 How It Works `/how-it-works`

- Hero: eyebrow `How it works`; `Great work starts with` / gradient `a better process`; body `A clear four step path from audit to launch, built around the way your team already works`; button `Run My Audit` (no secondary).
- **The process:** eyebrow `The process`; heading `A smarter way to connect everything`; body `Each step has a clear purpose, a clear owner and a practical result`. Four numbered icon cards in a 2-column grid (1 column under 760px):
  - `01` Start with your audit: Walk through your calls, quotes and bookings to find where time is being lost and what can come off your list.
  - `02` Shape your system: Choose what to improve first, then agree on the messages, timing and moments where your team should step in.
  - `03` Put it to work: Connect your tools, test each step and show your team exactly what they need to know before launch.
  - `04` Keep it working: Review the process and make focused adjustments as your customers, team and business change.
- **Roles:** heading `Clear roles at every step`; body `You make the decisions that need your expertise while the system keeps the agreed process moving`. Two equal cards:
  - **Your role:** Share how your business works · Approve the messages and timing · Handle decisions that need your expertise
  - **Our system:** Send the agreed follow ups · Keep customer and job details moving · Flag anything that needs your attention
- Then the default closing CTA.

### 6.3 Services `/services`

- Hero: eyebrow `Services`; `Less chasing` / gradient `behind every job`; body `From the first enquiry to the next booking, our system takes care of the routine follow-through.`; buttons `Run My Audit`, `Schedule a Call`.
- **Journey** (anchor `#services-system`): heading `From enquiry to repeat business.`; body `See what your system takes care of, every step of the way.`. Six cards, each showing `0N / 06`, an icon, a title, a description, a divider and 3 checked points:
  1. Enquiries answered: Give potential customers a clear next step while you’re on a job. (Capture customer details · Send a prompt first reply · Bring questions to your team)
  2. Quotes followed up: Keep interested customers from becoming forgotten conversations. (Send timely reminders · Track replies · Stop chasing once they decide)
  3. Bookings confirmed: Help customers know what to expect before you arrive. (Confirm appointments · Send preparation instructions · Remind customers before the job)
  4. Teams informed: Make the next job easier to prepare for. (Share addresses and access details · Pass on customer requests · Keep job updates together)
  5. Payments followed up: Keep outstanding invoices moving without sending every reminder yourself. (Send reminders on your schedule · Track payment updates where supported · Flag anything that needs attention)
  6. Customers brought back: Keep in touch beyond the first job. (Ask for feedback and reviews · Send repeat booking reminders · Reconnect with past customers)
  - Note: `You approve the messages. Our system handles the follow-through.`
  - Structure: a horizontal scroll-snap carousel in a 1220px shell. Cards are about 38.5% wide on desktop so the next one peeks (about 68% under 900px, 86.5% under 760px). Previous/next buttons (`View previous stage`, `View next stage`), mouse drag, touch, left/right arrow keys, a progress bar and a counter `01 / 06`. Mouse-follow gradient border glow on each card.
- Then the Services closing CTA.

### 6.4 Who We Help `/who-we-help`

- Hero: eyebrow `Who we help`; `Your Workflow` / gradient `Our Flexibility`; body `We adapt to your cleaning business with flexible automation that simplifies tasks, streamlines follow-ups, and keeps operations running smoothly.`; buttons `Run My Audit`, `Schedule a Call`.
- **Types** (anchor `#service-types`): heading `Built Around the Services You Offer`; body `The jobs may be different. The need for clear, consistent follow-through is the same.`. Four icon cards, 2 columns (1 under 760px):
  - Residential cleaning: Keep regular customers and new enquiries organised. (Recurring bookings · Appointment reminders · Customer preferences)
  - Commercial cleaning: Keep client communication and team handoffs consistent. (Site visit reminders · Quote follow-ups · Job and client updates)
  - End of tenancy and deep cleaning: Keep time-sensitive enquiries and one-off jobs moving. (Quote details · Booking confirmations · Access instructions)
  - Specialist cleaning: Support the details around carpet, window, upholstery and other specialist jobs. (Service enquiries · Preparation instructions · Repeat booking reminders)
  - Note: `Your business has its own way of working. Your system should support it.`
- Then the Who We Help closing CTA.

### 6.5 About `/about`

- Hero: eyebrow `About Invent Tomorrow`; `Making Cleaning Businesses` / gradient `Easier to Run.`; body `We're Invent Tomorrow, a team that works with cleaning businesses to solve everyday challenges and build simpler ways to work.`; buttons `Run My Audit`, `Schedule a Call`.
- **Our Mission** (gradient heading `Our Mission`): `We build simple systems that cut paperwork, save time, reduce costs, and help cleaning businesses grow.` Three outcome cards in one row:
  - Save time [Clock3]: Reduce the repetitive work that slows down the day.
  - Reduce costs [CircleDollarSign]: Use smarter workflows to remove avoidable effort.
  - Create focus [Focus]: Give owners and teams more room for what matters.
- **What We Believe** (gradient heading): `Three principles guide every system we design and every decision we make.` Three tall numbered cards, each with an icon, number, title and description:
  - `01` [Handshake] People First. Always.: We build systems that fit your team, not the other way around.
  - `02` [Workflow] Solve Real Problems: We build practical systems that fix real problems and make everyday work easier.
  - `03` [ShieldCheck] Keep It Simple: We make work easier, not more complicated.
- **Our Team:** eyebrow `Our Team`; heading `The Minds Behind Invent Tomorrow`; body `We're practical thinkers who make everyday work easier.` Left-aligned heading with a large panel on the right. Panel: a Users icon; text `We combine technical expertise and fresh ideas to build simple systems that work.`; three strength tiles (Wrench `Technical skills`, Lightbulb `Fresh ideas`, Focus `Practical approach`); sign-off `Meet the People Behind Invent Tomorrow`. Two columns on desktop, stacked on mobile.
- Then the About closing CTA.

### 6.6 FAQ `/faq`

- Hero: eyebrow `FAQ`; `Fair questions` / gradient `Straight answers`; body `What your system handles and how you stay in control.`; button `Run My Audit`.
- **Section:** eyebrow `Before you start`; heading `What business owners ask`; body `Clear answers about setup, tools, messages, support and what happens next.`

  Structure: two columns. A sticky intro on the left, an accordion on the right. Each item is a native `<details>`/`<summary>` in a bordered rounded panel, with a `+` that rotates when open. **The first item is open by default.** One column under 920px.

  Questions and answers:

  1. **What can your system handle?** Enquiry replies, quote follow-ups, appointment reminders, team updates, payment reminders and messages after a job. Your audit helps identify the right starting point.
  2. **Will it work with my current tools?** Wherever possible. Compatibility is checked before work begins, and any additional tools are discussed with you.
  3. **Will the messages sound like my business?** Yes. The wording is prepared around your services and tone. You approve the messages and their timing before they go live.
  4. **What if a customer needs to speak to someone?** Your system can notify your team and hand over the conversation. We agree on when a person should step in during setup.
  5. **Can I start with just one process?** Yes. Start with the task taking up the most time or the follow-up most likely to be missed.
  6. **Will my team know what to do?** Your team receives guidance on where to find updates, what the system handles and what still needs their attention.
  7. **How long does it take to get started?** That depends on your tools and the processes involved. You receive an agreed scope and timeline before work begins.
  8. **How much does it cost?** Pricing depends on what your system needs to handle and the ongoing support required. You receive a clear price before work begins.
  9. **What happens if something stops working?** Monitoring and support are defined in your service agreement, including how issues are reported and resolved.
- Then the FAQ closing CTA.

### 6.7 Results `/results`

- Hero: eyebrow `Results`; heading `See what comes off your list`; body `Start with how your business runs today. Then measure what changes once your system is in place.`; buttons `Run My Audit`, `Schedule a Call`.
- Heading `What to keep track of` (no subtitle). Five cards in a 3-column grid:
  - Quicker replies: How quickly new enquiries hear back.
  - Consistent follow-ups: Which quotes receive a reminder and move towards a booking.
  - Time back: Which repeated tasks your team no longer handles by hand.
  - Booking progress: Where enquiries move forward and where they stop.
  - Repeat business: How customers respond to reminders to book again.
  - Note: `Agree on what to measure before launch, using the information available in your tools.`
- Then the default closing CTA.

### 6.8 Free audit `/free-leak-audit`

- Hero (no button): eyebrow `Your business audit`; heading `Discover the revenue you could reclaim`; body `Walk us through how you handle calls, quotes, and bookings. Your audit shows where time is being lost and what our system could take off your hands.`
- **Form section:** eyebrow `A clear starting point`; heading `What’s taking up your day?`; body `Choose a time to walk through your business. Bring the tasks you keep putting off and the follow-ups you keep chasing.`
  - Bullets: Review your calls, quotes and bookings · Identify what could come off your list · Leave with a clear next step
  - Form: `Full name` (required, autocomplete name) · `Work email` (required, email, autocomplete email)
  - Note: `Next, choose a time in our booking calendar. Your audit is booked when you complete the calendar confirmation.`
  - Button: `Choose My Audit Time`
  - Behaviour: on submit, build the Calendly URL, set `name` and `email` query params, then `window.location.assign(url)`.
  - Structure: two columns in a 1120px shell, the left copy sticky and the right a bordered form card (one column under 820px).
- Then the audit closing CTA (single `Schedule a Call` button).

### 6.9 Contact `/contact`

- Hero: eyebrow `Schedule a call`; heading `Let’s talk about your working day`; body `The tasks taking too long. The details you keep chasing. See where a system could help.`; button `Choose a Time` → `#book-or-message`.
- **Booking** (id `book-or-message`): heading `Pick a time that works for you`. An iframe of `https://calendly.com/abdulhaadi-businesschat/30min?hide_gdpr_banner=1` (title `Schedule a call with Invent Tomorrow`, lazy, min-height 760px, panel max width 1000px). Below it: `Can’t see the calendar? ` + link `Open the booking page` (new tab) + `.`
- No shared closing CTA on this page.

### 6.10 Legal pages `/privacy`, `/terms`, `/sms-consent`

Shared template: eyebrow `Legal` → H1 → intro → `Last updated October 21, 2026` → policy sections → a final **Contact** section (`Questions about this policy can be sent through our contact page.`, with a link on "contact page" to `/contact`) → default closing CTA → footer. Hero content max width 880px, article max width 820px, subtle dividers between sections. Have a lawyer review the text and update the date before reuse.

**Privacy Policy** (intro: `This policy explains what information we collect through this website and how we use it.`)

- **Information we collect:** When you request an audit, book a call or contact us, we may collect your name, business name, email address, phone number, website and the information you include in your message. Our hosting and scheduling providers may also process basic technical information needed to operate their services.
- **How we use information:** We use submitted information to respond to requests, arrange audits and calls, provide services, maintain business records, improve our website and protect against misuse. We collect only the information we reasonably need for those purposes.
- **How information is shared:** We may share information with service providers that help us host the site, schedule calls, communicate with you or operate our business. We do not sell personal information. We may disclose information when required by law or needed to protect rights, safety and security.
- **Retention and security:** We retain information only as long as reasonably necessary for the purpose it was collected, our business records and applicable legal obligations. We use reasonable safeguards, but no online system can guarantee absolute security.
- **Your choices:** You may ask us to correct or delete information you submitted, subject to legal and operational requirements. You may opt out of marketing email using its unsubscribe method and opt out of text messages as described in our SMS Consent Policy.
- **Children:** This website is intended for business users and is not directed to children under 13. We do not knowingly collect personal information from children under 13.
- **Changes:** We may update this policy as our services or practices change. The date above shows the latest revision.

**Website Terms** (intro: `These terms govern your use of the Invent Tomorrow website.`)

- **Website use:** You may use this website for lawful business purposes. You may not interfere with its operation, attempt unauthorized access or use its content to mislead others.
- **Information on this site:** Website content is general information, not legal, financial or professional advice. Examples, timelines and outcomes are illustrative unless a written client agreement states otherwise.
- **Service agreements:** Submitting a form or booking a call does not create a client relationship. Scope, price, guarantees, responsibilities and service terms are established only in a separate written agreement accepted by both parties.
- **Intellectual property:** The website, branding and original content are owned by Invent Tomorrow or used with permission. You may not reproduce or distribute them for commercial use without written permission.
- **Third party services:** The site may link to or embed third-party services. Their availability and practices are governed by their own terms and policies.
- **Disclaimer and limitation:** The website is provided on an “as available” basis. To the extent permitted by law, Invent Tomorrow disclaims implied warranties and is not liable for indirect or consequential loss resulting solely from use of this website.
- **Changes:** We may update these terms from time to time. Continued use after an update means the revised terms apply to future website use.

**SMS Consent Policy** (intro: `This policy explains how consent works when you ask Invent Tomorrow to contact you by text message.`)

- **Consent:** When you enter your mobile number and affirmatively select the SMS consent checkbox, you agree to receive text messages from Invent Tomorrow about your audit request, appointments, service questions and related follow-up. Consent is not a condition of purchasing any service.
- **Message frequency and charges:** Message frequency varies based on your request and conversation. Message and data rates may apply according to your mobile plan.
- **Opting out:** You can opt out at any time by replying STOP, QUIT, END, REVOKE, OPT OUT, CANCEL or UNSUBSCRIBE, or by contacting us through the website. We will honor reasonable opt-out requests. You may receive one non-promotional confirmation that your opt-out was processed.
- **Help:** Reply HELP for assistance or contact us through the website. If a messaging channel does not support replies, use the contact page to request help or revoke consent.
- **Privacy:** Mobile information is used to communicate with you and operate the requested service. We do not sell mobile information or share it with third parties for their own marketing. Service providers may process it only to support our communications and operations.
- **Your responsibility:** You confirm that you are authorized to provide the mobile number and will notify us if it changes or is reassigned.

---

## 7. Porting checklist

- [ ] Load Plus Jakarta Sans and set `--font-plus-jakarta-sans`.
- [ ] Paste the section 1 tokens and the section 4.5 header CSS **in order**. Use the section 4.3 script or the 4.4 component.
- [ ] Give `body` a dark background. The header sits on top, so use `padding-top` or a full-bleed hero under it.
- [ ] Build the hero from section 5, keep the observer (5.2), and keep the reduced-motion rule.
- [ ] Reproduce the section order per page in section 6, and the closing-CTA rules in section 3 (hidden on `/` and `/contact`).
- [ ] Replace the Calendly URL, brand name, logo, sitemap domain and legal text for the new business.
- [ ] Re-verify every statistic, price and guarantee flagged in section 0.
- [ ] Not included here: the CSS and JS for the Home Before/After scroll story and the Services carousel. Behaviour is described above; the source files are `BeforeAfterScroll.js` and `BreakSection.js` in the original repo.
