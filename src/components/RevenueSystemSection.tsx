// import { useEffect, useRef, useState } from 'react';
// import {
//   AnimatePresence,
//   animate,
//   motion,
//   useInView,
//   useMotionValue,
//   useMotionValueEvent,
//   useReducedMotion,
//   useScroll,
// } from 'motion/react';
// import {
//   RotateCcw,
//   PhoneCall,
//   PhoneMissed,
//   Zap,
//   Send,
//   Star,
//   CalendarRange,
//   Repeat,
//   FileText,
//   Globe,
//   CheckCircle2,
//   Check,
//   Sparkles,
//   type LucideIcon,
// } from 'lucide-react';
// import { useMediaQuery } from '../hooks/useMediaQuery';
// import { useParallaxStage } from '../hooks/useParallaxStage';
// import { SectionHeading } from './SectionHeading';
// import { TextLink } from './TextLink';
// import { AUDIT_PATH } from '../utils/navigation';
// import { getProgressAtStepCenter, getStepIndexFromProgress, getStepProgress } from '../utils/scrollSteps';
// import { smoothScrollTo } from '../utils/smoothScroll';

// interface Scene {
//   trigger: string;
//   triggerIcon: LucideIcon;
//   messages: { from: 'us' | 'them'; text: string }[];
//   result: string;
// }

// interface Fix {
//   title: string;
//   text: string;
//   icon: LucideIcon;
//   scene: Scene;
// }

// // Each automation comes with a short example conversation so visitors can see what it actually does.
// const FIXES: Fix[] = [
//   {
//     title: 'Quote Revival',
//     text: 'Old quotes become booked cleans.',
//     icon: RotateCcw,
//     scene: {
//       trigger: 'Quote from March · no reply',
//       triggerIcon: FileText,
//       messages: [
//         { from: 'us', text: 'Hi Sarah, it’s Bright Home Cleaning. You asked about a deep clean in March. We have openings next week. Still interested?' },
//         { from: 'them', text: 'Yes! Do you have Thursday?' },
//       ],
//       result: 'Booked · Deep clean, Thursday',
//     },
//   },
//   {
//     title: 'Missed Call Rescue',
//     text: 'Every missed call gets a text in seconds.',
//     icon: PhoneCall,
//     scene: {
//       trigger: 'Missed call · 2:14 pm',
//       triggerIcon: PhoneMissed,
//       messages: [
//         { from: 'us', text: 'Sorry we missed you! This is Bright Home Cleaning. What can we help with?' },
//         { from: 'them', text: 'Looking for a move-out clean on the 28th.' },
//       ],
//       result: 'Replied in 5 seconds',
//     },
//   },
//   {
//     title: '60-Second Response',
//     text: 'Every lead hears back in under a minute.',
//     icon: Zap,
//     scene: {
//       trigger: 'New website inquiry · 9:41 pm',
//       triggerIcon: Globe,
//       messages: [
//         { from: 'us', text: 'Thanks for reaching out, Mike! How big is your home, and how often would you like a clean?' },
//         { from: 'them', text: '3 bedrooms, every two weeks.' },
//       ],
//       result: 'Answered in 42 seconds',
//     },
//   },
//   {
//     title: 'Quote Chaser',
//     text: 'Every estimate gets followed up, automatically.',
//     icon: Send,
//     scene: {
//       trigger: 'Quote sent · 3 days ago',
//       triggerIcon: FileText,
//       messages: [
//         { from: 'us', text: 'Hi Jen, just checking in on your quote. Any questions I can answer?' },
//         { from: 'them', text: 'Sorry, been busy. Let’s book it!' },
//       ],
//       result: 'Quote accepted',
//     },
//   },
//   {
//     title: '5-Star Engine',
//     text: 'A review request after every clean.',
//     icon: Star,
//     scene: {
//       trigger: 'Clean completed · 4:30 pm',
//       triggerIcon: CheckCircle2,
//       messages: [
//         { from: 'us', text: 'Thanks for having us today, Priya! If you’re happy with the clean, would you leave us a quick review?' },
//         { from: 'them', text: '★★★★★ “Spotless as always!”' },
//       ],
//       result: 'New 5-star review',
//     },
//   },
//   {
//     title: 'Busy Season Ready',
//     text: 'First to every customer during spring-clean and move-out rushes.',
//     icon: CalendarRange,
//     scene: {
//       trigger: 'Spring rush · 3 weeks out',
//       triggerIcon: CalendarRange,
//       messages: [
//         { from: 'us', text: 'Spring cleaning season is almost here. Past clients get first pick of dates. Want me to save you a spot?' },
//         { from: 'them', text: 'Please! Same as last year?' },
//       ],
//       result: 'Booked before the rush',
//     },
//   },
//   {
//     title: 'Recurring Booker',
//     text: 'One-time clients become weekly and monthly regulars.',
//     icon: Repeat,
//     scene: {
//       trigger: 'One-time clean · 1 week ago',
//       triggerIcon: Sparkles,
//       messages: [
//         { from: 'us', text: 'Hope the house still feels fresh, Tom! Want us to come back every two weeks so it stays that way?' },
//         { from: 'them', text: 'Every two weeks sounds great.' },
//       ],
//       result: 'New regular · Every 2 weeks',
//     },
//   },
// ];

// // Each example plays its conversation (typing dots, then each message), holds on the result, then moves on.
// const SLIDE_SECONDS = 5;
// const FIRST_MESSAGE_AT = 0.9;
// const MESSAGE_GAP = 0.9;
// const TYPING_SECONDS = 0.55;
// const snappy = { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };
// const tabSpring = { type: 'spring', stiffness: 460, damping: 36 } as const;

// // Wide, tall screens pin the list while scrolling steps through the automations. Each one gets this much scroll.
// const SCROLL_MODE_QUERY = '(min-width: 64rem) and (min-height: 43.75rem)';
// const SCROLL_VH_PER_STEP = 45;
// // Set to false to go back to the auto-advancing list on every screen.
// const PIN_LIST_ON_SCROLL = true;

// const slideVariants = {
//   enter: ({ direction, isScrollMode }: SlideCustom) =>
//     isScrollMode ? { opacity: 0, y: 28 * direction, scale: 0.98 } : { opacity: 0, x: 20, scale: 0.98 },
//   center: { opacity: 1, x: 0, y: 0, scale: 1 },
//   exit: ({ direction, isScrollMode }: SlideCustom) =>
//     isScrollMode
//       ? { opacity: 0, y: -28 * direction, scale: 0.98, transition: { duration: 0.12 } }
//       : { opacity: 0, x: -20, scale: 0.98, transition: { duration: 0.12 } },
// };

// interface SlideCustom {
//   direction: 1 | -1;
//   isScrollMode: boolean;
// }

// const pad = (n: number) => String(n).padStart(2, '0');

// function TypingBubble({ from, delay }: { from: 'us' | 'them'; delay: number }) {
//   const isUs = from === 'us';
//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: [0, 1, 1, 0] }}
//       transition={{ delay, duration: TYPING_SECONDS, times: [0, 0.2, 0.85, 1] }}
//       className={`absolute top-0 flex gap-1 rounded-2xl px-4 py-3 ${
//         isUs ? 'right-0 rounded-br-md bg-accent' : 'left-0 rounded-bl-md border border-ink/[0.07] bg-white'
//       }`}
//       aria-hidden="true"
//     >
//       {[1, 2, 3].map((dot) => (
//         <span key={dot} className={`h-1.5 w-1.5 rounded-full ${isUs ? 'bg-white' : 'bg-ink/40'} illu-dot-${dot}`} />
//       ))}
//     </motion.div>
//   );
// }

// function PhonePreview({ fix }: { fix: Fix }) {
//   const { scene } = fix;
//   const TriggerIcon = scene.triggerIcon;
//   const resultAt = FIRST_MESSAGE_AT + scene.messages.length * MESSAGE_GAP;

//   return (
//     <div className="mx-auto w-full max-w-[22rem]">
//       <div className="overflow-hidden rounded-[2.25rem] border-[0.4rem] border-navy bg-white shadow-card-dark">
//         <div className="flex justify-center bg-navy pb-1.5">
//           <span className="h-1.5 w-16 rounded-full bg-white/25" />
//         </div>
//         <div className="flex items-center gap-3 border-b border-ink/[0.07] px-4 py-3.5">
//           <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">BH</span>
//           <div className="min-w-0 flex-1">
//             <p className="truncate text-sm font-semibold text-ink">Bright Home Cleaning</p>
//             <p className="text-xs text-muted">Example conversation</p>
//           </div>
//           <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[0.6875rem] font-semibold text-accent">Automated</span>
//         </div>

//         <div className="space-y-3 bg-stone px-4 py-5">
//           <motion.div
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={snappy}
//             className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-ink/[0.08] bg-white px-3 py-1 text-[0.6875rem] font-medium text-muted"
//           >
//             <TriggerIcon className="h-3.5 w-3.5 text-accent" />
//             {scene.trigger}
//           </motion.div>

//           {scene.messages.map((message, i) => {
//             const at = FIRST_MESSAGE_AT + i * MESSAGE_GAP;
//             const isUs = message.from === 'us';
//             return (
//               <div key={i} className="relative">
//                 <TypingBubble from={message.from} delay={at - TYPING_SECONDS} />
//                 <motion.div
//                   initial={{ opacity: 0, y: 10, scale: 0.97 }}
//                   animate={{ opacity: 1, y: 0, scale: 1 }}
//                   transition={{ ...snappy, delay: at }}
//                   className={`flex ${isUs ? 'justify-end' : 'justify-start'}`}
//                 >
//                   <p
//                     className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-snug ${
//                       isUs ? 'rounded-br-md bg-accent text-white' : 'rounded-bl-md border border-ink/[0.07] bg-white text-ink'
//                     }`}
//                   >
//                     {message.text}
//                   </p>
//                 </motion.div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <motion.div
//         initial={{ opacity: 0, y: 10, scale: 0.97 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ ...snappy, delay: resultAt }}
//         className="mx-auto mt-5 flex items-center gap-3 rounded-2xl border border-accent/20 bg-white px-4 py-3 shadow-chip"
//       >
//         <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
//           <CheckCircle2 className="h-5 w-5" />
//         </span>
//         <div>
//           <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted">Result</p>
//           <p className="text-sm font-semibold text-ink">{scene.result}</p>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// interface RevenueSystemSectionProps {
//   // Home page: adds a link to the full Services page
//   showMoreLink?: boolean;
// }

// export function RevenueSystemSection({ showMoreLink = false }: RevenueSystemSectionProps) {
//   const [active, setActive] = useState(0);
//   const [direction, setDirection] = useState<1 | -1>(1);
//   const [hovered, setHovered] = useState(false);
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const rootRef = useRef<HTMLDivElement>(null);
//   const tabsRef = useRef<HTMLDivElement>(null);
//   const inView = useInView(rootRef, { amount: 0.35 });
//   const reduceMotion = useReducedMotion();
//   const isWideScreen = useMediaQuery(SCROLL_MODE_QUERY);
//   const isScrollMode = PIN_LIST_ON_SCROLL && isWideScreen && !reduceMotion;
//   const { scrollYProgress } = useScroll({ target: scrollRef, offset: ['start start', 'end end'] });
//   const parallax = useParallaxStage();
//   const progress = useMotionValue(0);
//   const controlsRef = useRef<ReturnType<typeof animate> | null>(null);
//   // Nothing plays until the section is on screen, so the first example animates in front of the visitor.
//   const [started, setStarted] = useState(false);

//   useEffect(() => {
//     if (inView) setStarted(true);
//   }, [inView]);

//   const showFix = (next: number) => {
//     setDirection(next >= active ? 1 : -1);
//     setActive(next);
//   };

//   // Pinned mode: the scroll position picks the automation and fills its progress bar.
//   const syncWithScroll = (value: number) => {
//     const next = getStepIndexFromProgress(value, FIXES.length);
//     progress.set(getStepProgress(value, FIXES.length));
//     if (next !== active) showFix(next);
//   };
//   useMotionValueEvent(scrollYProgress, 'change', (value) => {
//     if (isScrollMode) syncWithScroll(value);
//   });
//   useEffect(() => {
//     if (isScrollMode) syncWithScroll(scrollYProgress.get());
//     // Only needs to run when the mode turns on.
//   }, [isScrollMode]);

//   // Auto-advance: fill the progress bar, then move to the next automation.
//   useEffect(() => {
//     if (isScrollMode) return;
//     progress.set(0);
//     if (reduceMotion || !started) return;
//     const controls = animate(progress, 1, {
//       duration: SLIDE_SECONDS,
//       ease: 'linear',
//       onComplete: () => showFix((active + 1) % FIXES.length),
//     });
//     controlsRef.current = controls;
//     return () => controls.stop();
//     // `showFix` reads the current `active`, which is already a dependency.
//   }, [active, reduceMotion, progress, started, isScrollMode]);

//   // Pause while the visitor is reading (hovering) or the section is off screen.
//   useEffect(() => {
//     const controls = controlsRef.current;
//     if (!controls) return;
//     if (hovered || !inView) controls.pause();
//     else controls.play();
//   }, [hovered, inView, active, started]);

//   // On phones the tabs are a horizontal strip; keep the active one in view without moving the page.
//   useEffect(() => {
//     const strip = tabsRef.current;
//     const tab = strip?.children[active] as HTMLElement | undefined;
//     if (!strip || !tab || strip.scrollWidth <= strip.clientWidth) return;
//     strip.scrollTo({ left: tab.offsetLeft - 24, behavior: 'smooth' });
//   }, [active]);

//   const current = FIXES[active];

//   // In pinned mode a click scrolls to that automation's stretch of the page.
//   const selectFix = (index: number) => {
//     const wrapper = scrollRef.current;
//     if (!isScrollMode || !wrapper) {
//       showFix(index);
//       return;
//     }
//     const travel = wrapper.offsetHeight - window.innerHeight;
//     const top = wrapper.getBoundingClientRect().top + window.scrollY + getProgressAtStepCenter(index, FIXES.length) * travel;
//     smoothScrollTo(top);
//   };

//   return (
//     <section id="services" className="relative z-10 w-full border-t border-ink/[0.06] bg-fade-paper section-y px-6 sm:px-12">
//       <div className="mx-auto max-w-6xl">
//         <SectionHeading
//           eyebrow="The system"
//           title="Meet the Revenue Recovery System"
//           subtitle="Seven fixes that plug every leak. We build them, write them and run them."
//         />

//         <div
//           ref={scrollRef}
//           className="mt-14"
//           style={isScrollMode ? { height: `${100 + FIXES.length * SCROLL_VH_PER_STEP}vh` } : undefined}
//         >
//           <div className={isScrollMode ? 'sticky top-0 flex h-screen items-center pt-20' : ''}>
//             <motion.div
//               ref={rootRef}
//               onMouseEnter={() => setHovered(true)}
//               onMouseLeave={() => setHovered(false)}
//               initial={{ opacity: 0, y: 24 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ amount: 0.15 }}
//               transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
//               className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-10"
//             >
//               {/* Phone: horizontal tab strip */}
//               <div
//                 ref={tabsRef}
//                 role="tablist"
//                 aria-label="Automations"
//                 className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] lg:hidden"
//               >
//                 {FIXES.map((fix, i) => (
//                   <button
//                     key={fix.title}
//                     type="button"
//                     role="tab"
//                     aria-selected={active === i}
//                     onClick={() => selectFix(i)}
//                     className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
//                       active === i ? 'border-ink bg-navy text-white' : 'border-ink/15 bg-white text-ink/70'
//                     }`}
//                   >
//                     {fix.title}
//                   </button>
//                 ))}
//               </div>

//               {/* Desktop: numbered list, pinned while scrolling steps through it */}
//               <div className="relative hidden lg:block">
//                 {isScrollMode && (
//                   <span className="absolute -left-5 bottom-3 top-3 w-0.5 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
//                     <motion.span className="block h-full origin-top bg-accent" style={{ scaleY: scrollYProgress }} />
//                   </span>
//                 )}
//                 <div role="tablist" aria-label="Automations" className="flex flex-col gap-2.5">
//                   {FIXES.map((fix, i) => {
//                     const Icon = fix.icon;
//                     const isActive = active === i;
//                     const isDone = isScrollMode && i < active;
//                     return (
//                       <button
//                         key={fix.title}
//                         type="button"
//                         role="tab"
//                         aria-selected={isActive}
//                         onClick={() => selectFix(i)}
//                         className={`spotlight relative overflow-hidden rounded-2xl border px-5 py-4 text-left transition-colors duration-300 cursor-pointer ${
//                           isActive ? 'border-transparent' : 'border-ink/10 bg-white/60 hover:border-ink/20 hover:bg-white'
//                         }`}
//                       >
//                         {isActive && (
//                           <motion.span
//                             layoutId="fix-active-tab"
//                             transition={tabSpring}
//                             className="absolute inset-0 -z-10 rounded-2xl border border-accent/30 bg-white shadow-chip"
//                             aria-hidden="true"
//                           />
//                         )}
//                         <div className="flex items-center gap-4">
//                           <span className="relative shrink-0">
//                             {isActive && !reduceMotion && (
//                               <motion.span
//                                 className="absolute inset-0 rounded-drop bg-accent/40"
//                                 initial={{ scale: 1, opacity: 0.6 }}
//                                 animate={{ scale: 1.55, opacity: 0 }}
//                                 transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
//                                 aria-hidden="true"
//                               />
//                             )}
//                             <span
//                               className={`relative flex h-10 w-10 items-center justify-center rounded-drop transition-colors duration-300 ${
//                                 isActive ? 'bg-accent text-white' : 'bg-accent-soft text-accent'
//                               }`}
//                             >
//                               <Icon className="h-5 w-5" strokeWidth={1.75} />
//                             </span>
//                           </span>
//                           <span className={`flex-1 font-semibold transition-colors ${isActive ? 'text-ink' : 'text-ink/70'}`}>{fix.title}</span>
//                           <span
//                             className={`flex h-6 w-6 items-center justify-center text-xs font-semibold tabular-nums transition-colors ${
//                               isActive ? 'text-accent' : 'text-ink/25'
//                             }`}
//                           >
//                             {isDone ? (
//                               <motion.span
//                                 initial={{ scale: 0 }}
//                                 animate={{ scale: 1 }}
//                                 transition={{ type: 'spring', stiffness: 500, damping: 22 }}
//                                 className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white"
//                               >
//                                 <Check className="h-3 w-3" strokeWidth={3} />
//                               </motion.span>
//                             ) : (
//                               pad(i + 1)
//                             )}
//                           </span>
//                         </div>
//                         <AnimatePresence initial={false}>
//                           {isActive && (
//                             <motion.p
//                               key="text"
//                               initial={{ height: 0, opacity: 0 }}
//                               animate={{ height: 'auto', opacity: 1 }}
//                               exit={{ height: 0, opacity: 0 }}
//                               transition={snappy}
//                               className="overflow-hidden pl-14 text-sm leading-relaxed text-muted"
//                             >
//                               <span className="block pt-1.5">{fix.text}</span>
//                             </motion.p>
//                           )}
//                         </AnimatePresence>
//                         {isActive && (
//                           <span className="absolute inset-x-5 bottom-0 h-0.5 overflow-hidden rounded-full bg-ink/[0.06]">
//                             <motion.span className="block h-full origin-left bg-accent" style={{ scaleX: progress }} />
//                           </span>
//                         )}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* Example conversation for the selected automation */}
//               <div
//                 ref={parallax.stageRef}
//                 onPointerMove={reduceMotion ? undefined : parallax.onPointerMove}
//                 onPointerLeave={reduceMotion ? undefined : parallax.onPointerLeave}
//                 className="relative flex min-h-[38rem] flex-col justify-center overflow-hidden rounded-[2rem] border border-ink/[0.06] bg-[radial-gradient(120%_90%_at_50%_0%,var(--color-accent-soft)_0%,var(--color-mist)_45%,var(--color-stone)_100%)] px-5 py-10 sm:px-10"
//               >
//                 <motion.div style={reduceMotion ? undefined : parallax.back} className="pointer-events-none absolute inset-0" aria-hidden="true">
//                   <span className="illu-float-slow absolute -right-16 -top-12 h-64 w-64 rounded-drop bg-primary/10" />
//                   <span className="absolute -left-10 bottom-4 h-44 w-44 rounded-drop border border-primary/20" />
//                   <span className="illu-float absolute bottom-16 right-10 h-14 w-14 rounded-drop bg-sky/50" />
//                   <span className="illu-float-slow absolute left-12 top-14 h-5 w-5 rounded-drop bg-primary/40" />
//                 </motion.div>

//                 <motion.div
//                   key={active}
//                   initial={{ opacity: 0, y: 8 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={snappy}
//                   className="relative mb-7 text-center"
//                 >
//                   <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
//                     Example {pad(active + 1)} / {pad(FIXES.length)}
//                   </p>
//                   <p className="mt-2 text-lg font-semibold text-ink">{current.title}</p>
//                   <p className="mt-1 text-sm text-muted">{current.text}</p>
//                   <span className="mx-auto mt-4 block h-0.5 w-24 overflow-hidden rounded-full bg-ink/10 lg:hidden">
//                     <motion.span className="block h-full origin-left bg-accent" style={{ scaleX: progress }} />
//                   </span>
//                 </motion.div>

//                 <motion.div style={reduceMotion ? undefined : parallax.front} className="relative">
//                   <AnimatePresence mode="wait" custom={{ direction, isScrollMode }}>
//                     {started && (
//                       <motion.div
//                         key={active}
//                         custom={{ direction, isScrollMode }}
//                         variants={slideVariants}
//                         initial="enter"
//                         animate="center"
//                         exit="exit"
//                         transition={snappy}
//                       >
//                         <div className="illu-float">
//                           <PhonePreview fix={current} />
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </motion.div>
//               </div>
//             </motion.div>
//           </div>
//         </div>

//         <p className="mt-10 text-center text-sm text-muted">
//           Not sure which you need? <TextLink to={AUDIT_PATH}>Your free audit shows which leak costs you the most</TextLink>
//           {showMoreLink && (
//             <>
//               <span className="mx-3 text-ink/20" aria-hidden="true">
//                 |
//               </span>
//               <TextLink to="/services">See all services</TextLink>
//             </>
//           )}
//         </p>
//       </div>
//     </section>
//   );
// }

// Previous version (restore: comment out the component above, uncomment this block, merge the imports)
import {
  CalendarRange,
  CheckCircle2,
  FileText,
  Globe,
  PhoneCall,
  PhoneMissed,
  Repeat,
  RotateCcw,
  Send,
  Sparkles,
  Star,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useParallaxStage } from '../hooks/useParallaxStage';
import { AUDIT_PATH } from '../utils/navigation';
import { SectionHeading } from './SectionHeading';
import { TextLink } from './TextLink';

interface Scene {
  trigger: string;
  triggerIcon: LucideIcon;
  messages: { from: 'us' | 'them'; text: string }[];
  result: string;
}

interface Fix {
  title: string;
  text: string;
  icon: LucideIcon;
  scene: Scene;
}

// Each automation comes with a short example conversation so visitors can see what it actually does.
const FIXES: Fix[] = [
  {
    title: 'Quote Revival',
    text: 'Old quotes become booked cleans.',
    icon: RotateCcw,
    scene: {
      trigger: 'Quote from March · no reply',
      triggerIcon: FileText,
      messages: [
        { from: 'us', text: 'Hi Sarah, it’s Bright Home Cleaning. You asked about a deep clean in March. We have openings next week. Still interested?' },
        { from: 'them', text: 'Yes! Do you have Thursday?' },
      ],
      result: 'Booked · Deep clean, Thursday',
    },
  },
  {
    title: 'Missed Call Rescue',
    text: 'Every missed call gets a text in seconds.',
    icon: PhoneCall,
    scene: {
      trigger: 'Missed call · 2:14 pm',
      triggerIcon: PhoneMissed,
      messages: [
        { from: 'us', text: 'Sorry we missed you! This is Bright Home Cleaning. What can we help with?' },
        { from: 'them', text: 'Looking for a move-out clean on the 28th.' },
      ],
      result: 'Replied in 5 seconds',
    },
  },
  {
    title: '60-Second Response',
    text: 'Every lead hears back in under a minute.',
    icon: Zap,
    scene: {
      trigger: 'New website inquiry · 9:41 pm',
      triggerIcon: Globe,
      messages: [
        { from: 'us', text: 'Thanks for reaching out, Mike! How big is your home, and how often would you like a clean?' },
        { from: 'them', text: '3 bedrooms, every two weeks.' },
      ],
      result: 'Answered in 42 seconds',
    },
  },
  {
    title: 'Quote Chaser',
    text: 'Every estimate gets followed up, automatically.',
    icon: Send,
    scene: {
      trigger: 'Quote sent · 3 days ago',
      triggerIcon: FileText,
      messages: [
        { from: 'us', text: 'Hi Jen, just checking in on your quote. Any questions I can answer?' },
        { from: 'them', text: 'Sorry, been busy. Let’s book it!' },
      ],
      result: 'Quote accepted',
    },
  },
  {
    title: '5-Star Engine',
    text: 'A review request after every clean.',
    icon: Star,
    scene: {
      trigger: 'Clean completed · 4:30 pm',
      triggerIcon: CheckCircle2,
      messages: [
        { from: 'us', text: 'Thanks for having us today, Priya! If you’re happy with the clean, would you leave us a quick review?' },
        { from: 'them', text: '★★★★★ “Spotless as always!”' },
      ],
      result: 'New 5-star review',
    },
  },
  {
    title: 'Busy Season Ready',
    text: 'First to every customer during spring-clean and move-out rushes.',
    icon: CalendarRange,
    scene: {
      trigger: 'Spring rush · 3 weeks out',
      triggerIcon: CalendarRange,
      messages: [
        { from: 'us', text: 'Spring cleaning season is almost here. Past clients get first pick of dates. Want me to save you a spot?' },
        { from: 'them', text: 'Please! Same as last year?' },
      ],
      result: 'Booked before the rush',
    },
  },
  {
    title: 'Recurring Booker',
    text: 'One-time clients become weekly and monthly regulars.',
    icon: Repeat,
    scene: {
      trigger: 'One-time clean · 1 week ago',
      triggerIcon: Sparkles,
      messages: [
        { from: 'us', text: 'Hope the house still feels fresh, Tom! Want us to come back every two weeks so it stays that way?' },
        { from: 'them', text: 'Every two weeks sounds great.' },
      ],
      result: 'New regular · Every 2 weeks',
    },
  },
];

// Each example plays in under a second, holds briefly, then moves on.
const SLIDE_SECONDS = 3.2;
const MESSAGE_GAP = 0.28;
const snappy = { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };
const tabSpring = { type: 'spring', stiffness: 460, damping: 36 } as const;

function ScenePreview({ fix }: { fix: Fix }) {
  const { scene } = fix;
  const TriggerIcon = scene.triggerIcon;
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="overflow-hidden rounded-[1.75rem] border border-ink/[0.08] bg-white shadow-card-lg">
        <div className="flex items-center gap-3 border-b border-ink/[0.07] px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">BH</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">Bright Home Cleaning</p>
            <p className="text-xs text-muted">Example conversation</p>
          </div>
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[0.6875rem] font-semibold text-accent">Automated</span>
        </div>

        <div className="space-y-3 bg-paper/60 px-5 py-5">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={snappy}
            className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-ink/[0.06] px-3 py-1 text-[0.6875rem] font-medium text-muted"
          >
            <TriggerIcon className="h-3.5 w-3.5" />
            {scene.trigger}
          </motion.div>

          {scene.messages.map((message, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...snappy, delay: 0.15 + i * MESSAGE_GAP }}
              className={`flex ${message.from === 'us' ? 'justify-end' : 'justify-start'}`}
            >
              <p
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-snug ${
                  message.from === 'us'
                    ? 'rounded-br-md bg-accent text-white'
                    : 'rounded-bl-md border border-ink/[0.07] bg-white text-ink'
                }`}
              >
                {message.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...snappy, delay: 0.15 + scene.messages.length * MESSAGE_GAP }}
        className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm"
      >
        <CheckCircle2 className="h-4 w-4 text-accent" />
        {scene.result}
      </motion.div>
    </div>
  );
}

interface RevenueSystemSectionProps {
  // Home page: adds a link to the full Services page
  showMoreLink?: boolean;
}

export function RevenueSystemSection({ showMoreLink = false }: RevenueSystemSectionProps) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const parallax = useParallaxStage();
  const progress = useMotionValue(0);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);
  // Nothing plays until the section is on screen, so the first example animates in front of the visitor.
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (inView) setStarted(true);
  }, [inView]);

  // Auto-advance: fill the progress bar, then move to the next automation.
  useEffect(() => {
    progress.set(0);
    if (reduceMotion || !started) return;
    const controls = animate(progress, 1, {
      duration: SLIDE_SECONDS,
      ease: 'linear',
      onComplete: () => setActive((a) => (a + 1) % FIXES.length),
    });
    controlsRef.current = controls;
    return () => controls.stop();
  }, [active, reduceMotion, progress, started]);

  // Pause while the visitor is reading (hovering) or the section is off screen.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (hovered || !inView) controls.pause();
    else controls.play();
  }, [hovered, inView, active, started]);

  // On phones the tabs are a horizontal strip; keep the active one in view without moving the page.
  useEffect(() => {
    const strip = tabsRef.current;
    const tab = strip?.children[active] as HTMLElement | undefined;
    if (!strip || !tab || strip.scrollWidth <= strip.clientWidth) return;
    strip.scrollTo({ left: tab.offsetLeft - 24, behavior: 'smooth' });
  }, [active]);

  const current = FIXES[active];

  return (
    <section id="services" className="relative z-10 w-full border-t border-ink/[0.06] bg-fade-paper section-y px-6 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="The system"
          title="Meet the Revenue Recovery System"
          subtitle="Seven fixes that plug every leak. We build them, write them and run them."
        />

        <motion.div
          ref={rootRef}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.15 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10"
        >
          {/* Phone: horizontal tab strip */}
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Automations"
            className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] lg:hidden"
          >
            {FIXES.map((fix, i) => (
              <button
                key={fix.title}
                type="button"
                role="tab"
                aria-selected={active === i}
                onClick={() => setActive(i)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  active === i ? 'border-ink bg-navy text-white' : 'border-ink/15 bg-white text-ink/70'
                }`}
              >
                {fix.title}
              </button>
            ))}
          </div>

          {/* Desktop: vertical list */}
          <div role="tablist" aria-label="Automations" className="hidden flex-col gap-1.5 lg:flex">
            {FIXES.map((fix, i) => {
              const Icon = fix.icon;
              const isActive = active === i;
              return (
                <button
                  key={fix.title}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  className={`spotlight relative overflow-hidden rounded-2xl border px-5 py-4 text-left transition-colors duration-300 cursor-pointer ${
                    isActive ? 'border-transparent' : 'border-transparent hover:border-ink/15 hover:bg-ink/[0.05]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="fix-active-tab"
                      transition={tabSpring}
                      className="absolute inset-0 -z-10 rounded-2xl border border-ink/10 bg-white shadow-chip"
                      aria-hidden="true"
                    />
                  )}
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-drop transition-colors duration-300 ${
                        isActive ? 'bg-accent text-white' : 'bg-accent-soft text-accent'
                      }`}
                    >
                      <Icon className="h-[1.125rem] w-[1.125rem]" />
                    </span>
                    <span className={`font-semibold transition-colors ${isActive ? 'text-ink' : 'text-ink/70'}`}>{fix.title}</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.p
                        key="text"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={snappy}
                        className="overflow-hidden pl-[3.25rem] text-sm leading-relaxed text-muted"
                      >
                        <span className="block pt-1.5">{fix.text}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <span className="absolute inset-x-5 bottom-0 h-0.5 overflow-hidden rounded-full bg-ink/[0.06]">
                      <motion.span className="block h-full origin-left bg-accent" style={{ scaleX: progress }} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Example conversation for the selected automation */}
          <div
            ref={parallax.stageRef}
            onPointerMove={reduceMotion ? undefined : parallax.onPointerMove}
            onPointerLeave={reduceMotion ? undefined : parallax.onPointerLeave}
            className="relative flex min-h-[32.5rem] flex-col justify-center overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_90%_at_50%_0%,var(--color-accent-soft)_0%,var(--color-mist)_45%,var(--color-stone)_100%)] px-5 py-10 sm:px-10"
          >
            <motion.div style={reduceMotion ? undefined : parallax.back} className="pointer-events-none absolute inset-0" aria-hidden="true">
              <span className="absolute -right-16 -top-12 h-64 w-64 rounded-drop bg-primary/10" />
              <span className="absolute -left-10 bottom-4 h-44 w-44 rounded-drop border border-primary/20" />
              <span className="absolute bottom-16 right-10 h-14 w-14 rounded-drop bg-sky/50" />
              <span className="absolute left-12 top-14 h-5 w-5 rounded-drop bg-primary/40" />
            </motion.div>

            <div className="mb-6 text-center lg:hidden">
              <p className="font-semibold text-ink">{current.title}</p>
              <p className="mt-1 text-sm text-muted">{current.text}</p>
              <span className="mx-auto mt-4 block h-0.5 w-24 overflow-hidden rounded-full bg-ink/10">
                <motion.span className="block h-full origin-left bg-accent" style={{ scaleX: progress }} />
              </span>
            </div>

            <motion.div style={reduceMotion ? undefined : parallax.front} className="relative">
              <AnimatePresence mode="wait">
                {started && (
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, x: 20, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.98, transition: { duration: 0.12 } }}
                    transition={snappy}
                  >
                    <ScenePreview fix={current} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>

        <p className="mt-10 text-center text-sm text-muted">
          Not sure which you need? <TextLink to={AUDIT_PATH}>Your free audit shows which leak costs you the most</TextLink>
          {showMoreLink && (
            <>
              <span className="mx-3 text-ink/20" aria-hidden="true">
                |
              </span>
              <TextLink to="/services">See all services</TextLink>
            </>
          )}
        </p>
      </div>
    </section>
  );
}
