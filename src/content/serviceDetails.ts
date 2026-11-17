// Service page copy. Short, plain and written from a cleaning business owner's point of view.
export interface ServiceDetail {
  path: string;
  eyebrow: string;
  headline: string;
  intro: string;
  facts: { label: string; text: string }[];
  problem: string;
  steps: { title: string; body: string }[];
  proof?: string;
  benefits: { title: string; body: string }[];
  questions: { q: string; a: string }[];
  cta: { heading: string; body: string };
  reading?: string;
  related: string[];
}

export const SERVICE_DETAILS: ServiceDetail[] = [
  {
    path: "/services/24-7-receptionist",
    eyebrow: "SERVICE · WIN THE LEAD · OPTIONAL EXTRA · AI",
    headline: "Every call answered, even when you're mid clean.",
    intro: "An AI voice assistant answers when you can't, books estimates and texts you a summary of every call.",
    facts: [
      { label: "Fixes", text: "calls that ring out or go to voicemail" },
      { label: "Works with", text: "your business line, Quo (OpenPhone), your calendar" },
      { label: "Included in", text: "optional extra" },
    ],
    problem: "Your phone rings mid clean. You stop working or let it go. Most callers won't leave a voicemail. They call the next cleaner on Google. Evenings and weekends are worst.",
    steps: [
      { title: "We write the script with you.", body: "Services, prices, area, and what it passes to you." },
      { title: "It answers when you can't.", body: "After a few rings, after hours, or every call. It tells callers it's an AI assistant." },
      { title: "You get a summary.", body: "Who called, what they need, what's booked." },
    ],
    benefits: [
      { title: "Every caller gets answered.", body: "Day, night and weekends." },
      { title: "Estimates go in your calendar.", body: "Not on a sticky note." },
      { title: "Urgent jobs reach you first.", body: "Move outs and deep cleans get flagged." },
    ],
    questions: [
      { q: "Will callers know it's AI?", a: "Yes. It says so at the start of every call, and can pass the caller to you at any point." },
      { q: "Can it give prices?", a: "Only prices you approve. Custom jobs become an estimate visit or a callback." },
      { q: "What if it can't handle a call?", a: "It takes a message and texts you right away." },
      { q: "I use Jobber. Doesn't it have an AI receptionist?", a: "It does. If it does what you need, we set it up and write the script. If not, we build one." },
    ],
    cta: {
      heading: "How many calls went to voicemail last week?",
      body: "Your free 15 minute audit shows how many calls you're missing and what they're worth. Optional extra, priced on your audit call.",
    },
    related: ["Missed Call Rescue", "Always On Chat"],
  },
  {
    path: "/services/missed-call-rescue",
    eyebrow: "SERVICE · WIN THE LEAD · CORE",
    headline: "Missed a call? They get a text in seconds.",
    intro: "When you can't pick up, the caller gets a friendly text from your business. You take over when you're free.",
    facts: [
      { label: "Fixes", text: "callers who try the next cleaner" },
      { label: "Works with", text: "your business line, Quo (OpenPhone), Jobber, Housecall Pro" },
      { label: "Included in", text: "our core package" },
    ],
    problem: "You can't answer the phone with gloves on. By the time you call back, they've booked someone else. Every missed call is a lead you paid for.",
    steps: [
      { title: "We connect your business line.", body: "A missed call triggers a text in seconds." },
      { title: "We write the text in your voice.", body: "You approve it first." },
      { title: "Replies land in one place.", body: "You answer when you're free." },
    ],
    benefits: [
      { title: "Callers hear back fast.", body: "Not hours later." },
      { title: "You keep cleaning.", body: "No stopping for every ring." },
      { title: "Every call becomes a conversation.", body: "See it and reply from anywhere." },
    ],
    questions: [
      { q: "Do I need a new number?", a: "No. We use the number you already have." },
      { q: "What if the caller is an existing client?", a: "They get the same friendly text, and you see who it is before you reply." },
      { q: "Do I need to register anything?", a: "US carriers require it for business texting. We handle it during setup." },
      { q: "Is this AI?", a: "No. You approve the text we write. Replies come straight to you." },
    ],
    cta: {
      heading: "How many calls did you miss last week?",
      body: "Your free 15 minute audit shows how many callers never heard back and what those jobs were worth. Core package, backed by our Pays For Itself Guarantee.",
    },
    related: ["24/7 Receptionist", "60 Second Response"],
    reading: "[What to do when you miss a call in the middle of a clean](https://www.inventtomorrow.pro/blog/missed-calls-cleaning-business)",
  },
  {
    path: "/services/60-second-response",
    eyebrow: "SERVICE · WIN THE LEAD · CORE",
    headline: "Every inquiry answered in under a minute.",
    intro: "Website, Facebook, Instagram and Google messages get a reply in under a minute, day or night. It asks what you'd ask, so leads are ready to quote.",
    facts: [
      { label: "Fixes", text: "inquiries that wait hours for a reply" },
      { label: "Works with", text: "your website forms, Facebook, Instagram, Google Business Profile" },
      { label: "Included in", text: "our core package" },
    ],
    problem: "People send two or three inquiries and book whoever replies first. If your reply waits until your job is done, someone else already has theirs.",
    steps: [
      { title: "We connect every inbox.", body: "Website, Facebook, Instagram and Google." },
      { title: "New inquiries get an instant reply.", body: "It asks home size, how often and preferred dates." },
      { title: "The answers wait for you.", body: "Send your quote in one message." },
    ],
    benefits: [
      { title: "You reply first.", body: "Even at 9 pm." },
      { title: "Leads arrive ready to quote.", body: "Details already collected." },
      { title: "No more slow reply apologies.", body: "Every inquiry starts fast." },
    ],
    questions: [
      { q: "Does it quote prices?", a: "Only if you want it to. Otherwise it collects the details and you send the quote." },
      { q: "Does it work for Facebook ad leads?", a: "Yes. Ad leads get the same instant reply." },
      { q: "Is this AI?", a: "No. You approve every message before it goes live." },
    ],
    cta: {
      heading: "How fast do your leads hear back today?",
      body: "Your free 15 minute audit times your replies and shows how many inquiries go cold while you're on a job. Core package, backed by our Pays For Itself Guarantee.",
    },
    related: ["Missed Call Rescue", "One Inbox"],
    proof: "For [Just About Cleaning](https://www.inventtomorrow.pro/our-work/just-about-cleaning-crm-automation-rebuild), Facebook and Instagram leads were sent to a form before anyone had their details. Now the first message asks for name, email and phone, so every social lead can be contacted.",
  },
  {
    path: "/services/website-chat",
    eyebrow: "SERVICE · WIN THE LEAD · OPTIONAL EXTRA · AI",
    headline: "Your website books jobs while you sleep.",
    intro: "An AI chat assistant on your website answers questions, shares your approved prices and books visitors, any hour. Anything tricky comes to you.",
    facts: [
      { label: "Fixes", text: "visitors who leave without getting in touch" },
      { label: "Works with", text: "your website, your calendar, Jobber, Housecall Pro" },
      { label: "Included in", text: "optional extra" },
    ],
    problem: "People browse cleaning websites late at night, have a question, and nobody's there to answer. They close the tab and try the next company.",
    steps: [
      { title: "We train it on your business.", body: "Services, area, approved prices and common questions." },
      { title: "It answers and books.", body: "Ready visitors leave their details or book." },
      { title: "You see everything.", body: "Every chat saved, with tricky ones flagged." },
    ],
    benefits: [
      { title: "Late night visitors become bookings.", body: "Not closed tabs." },
      { title: "Same answer every time.", body: "Your prices, your policies." },
      { title: "Step in anytime.", body: "Every chat is saved." },
    ],
    questions: [
      { q: "Want to try one first?", a: "Our [free audit page](https://www.inventtomorrow.pro/free-audit) runs on the same kind of assistant." },
      { q: "Will it make things up?", a: "It sticks to what you've approved. If it doesn't know, it takes the visitor's details and asks you." },
      { q: "Can I read the chats?", a: "Yes. Every chat is saved." },
    ],
    cta: {
      heading: "What are your visitors asking at 11 pm?",
      body: "Your free 15 minute audit shows where your website loses visitors. Optional extra, priced on your audit call.",
    },
    related: ["Instant Price & Book", "60 Second Response"],
  },
  {
    path: "/services/online-booking",
    eyebrow: "SERVICE · WIN THE LEAD · OPTIONAL EXTRA",
    headline: "They see the price. They pick a time. Booked.",
    intro: "Customers enter home size and clean type, see your price and pick a time from your calendar. No phone tag. No waiting for a quote.",
    facts: [
      { label: "Fixes", text: "people who won't call for a quote" },
      { label: "Works with", text: "Jobber, Housecall Pro, Stripe, your calendar" },
      { label: "Included in", text: "optional extra" },
    ],
    problem: "Some customers won't call, and won't wait a day for a quote. If your site shows no price, they book someone who shows one.",
    steps: [
      { title: "We turn your price list into a calculator.", body: "Bedrooms, bathrooms, clean type and optional extras." },
      { title: "Customers see a price and pick a time.", body: "Only slots you actually have free." },
      { title: "The booking lands in your tool.", body: "With a deposit, if you want one." },
    ],
    benefits: [
      { title: "Price shoppers book.", body: "They don't leave." },
      { title: "Less back and forth.", body: "No five message threads." },
      { title: "Fewer cancellations.", body: "Deposits keep clients committed." },
    ],
    questions: [
      { q: "What about custom quotes?", a: "Deep cleans, move outs and unusual jobs can go to a quote request instead of an instant price." },
      { q: "Can I change prices later?", a: "Yes. Tell us and we update the calculator." },
      { q: "Is this AI?", a: "No. It's a calculator built from your own price list." },
    ],
    cta: {
      heading: "Ready to let customers book themselves?",
      body: "Your free 15 minute audit shows which cleans suit instant pricing and which should stay quote only. Optional extra, priced on your audit call.",
    },
    related: ["Always On Chat", "Ready at the Door"],
  },
  {
    path: "/services/one-inbox",
    eyebrow: "SERVICE · WIN THE LEAD · OPTIONAL EXTRA",
    headline: "Every lead, from everywhere, in one place.",
    intro: "Calls, texts, forms, Facebook, Instagram, Google, Bark and Thumbtack land in one inbox. Each lead goes to the right person.",
    facts: [
      { label: "Fixes", text: "leads lost across too many apps" },
      { label: "Works with", text: "Facebook, Instagram, Google Business Profile, Bark, Thumbtack, your business line, HubSpot" },
      { label: "Included in", text: "optional extra" },
    ],
    problem: "Leads come from five or six apps. Some get missed. Others get answered twice.",
    steps: [
      { title: "We connect every source.", body: "All leads flow into one inbox." },
      { title: "Leads are sorted for you.", body: "Residential, commercial or existing client, each to the right person." },
      { title: "Your team sees who's on it.", body: "Nothing missed. Nothing answered twice." },
    ],
    benefits: [
      { title: "One place to check.", body: "Not six apps." },
      { title: "Every lead reaches the right person.", body: "Automatically." },
      { title: "No double replies.", body: "Everyone sees the same inbox." },
    ],
    questions: [
      { q: "Do I have to stop using Bark or Thumbtack?", a: "No. They keep sending leads. You answer them all from one place." },
      { q: "Can my team use it too?", a: "Yes. Everyone sees the same inbox and who's handling each lead." },
      { q: "Is this AI?", a: "No. Simple rules we set with you sort leads by source and request." },
    ],
    cta: {
      heading: "Where are your leads getting lost?",
      body: "Your free 15 minute audit maps where your leads come from and where they slip through. Optional extra, priced on your audit call.",
    },
    related: ["60 Second Response", "Quote Chaser"],
    proof: "[Just About Cleaning](https://www.inventtomorrow.pro/our-work/just-about-cleaning-crm-automation-rebuild) gets leads from Facebook, Instagram, Bark and phone calls. Staff used to label each one by hand. We rebuilt it so leads land in the right place on their own.",
  },
  {
    path: "/services/quote-chaser",
    eyebrow: "SERVICE · BOOK THE JOB · CORE",
    headline: "Every quote followed up until it's a yes or a no.",
    intro: "Most quotes don't get a no. They get forgotten. We follow up on a schedule, in your voice, and stop when they reply.",
    facts: [
      { label: "Fixes", text: "quotes that go quiet" },
      { label: "Works with", text: "Jobber, Housecall Pro, QuickBooks, Xero, HubSpot" },
      { label: "Included in", text: "our core package" },
    ],
    problem: "You send a quote. They say they'll think about it. Then a busy week hits. Chasing feels pushy, so it doesn't happen. The job goes to whoever followed up.",
    steps: [
      { title: "Every quote starts a follow up schedule.", body: "The moment it's sent." },
      { title: "Friendly check ins go out over weeks.", body: "Easy to say yes, ask a question or decline." },
      { title: "A reply stops the messages.", body: "The conversation is yours." },
    ],
    benefits: [
      { title: "No quote left hanging.", body: "Every one gets followed up." },
      { title: "Nothing to remember.", body: "It runs on its own." },
      { title: "Nobody feels chased.", body: "A reply stops it straight away." },
    ],
    questions: [
      { q: "Won't it annoy customers?", a: "Messages are short, friendly and spaced out. They stop when someone replies or says no thanks." },
      { q: "Does it work for commercial proposals?", a: "Yes. Proposals get their own follow up schedule." },
      { q: "Doesn't Jobber already send quote follow ups?", a: "It can. We start with what your tool does: switch it on, write the messages and set the timing. Then we build the rest, like commercial proposals and your old quote backlog." },
      { q: "Is this AI?", a: "No. You approve every message we write." },
    ],
    cta: {
      heading: "How many of your quotes never got a second message?",
      body: "Your free 15 minute audit shows how many open quotes you have and what they're worth. Core package, backed by our Pays For Itself Guarantee.",
    },
    related: ["Quote Revival", "One Inbox"],
    proof: "For [Just About Cleaning](https://www.inventtomorrow.pro/our-work/just-about-cleaning-crm-automation-rebuild), we gave waiting quotes their own follow up list and switched follow up back on for old quotes. After the first four weeks, messages continue about every two weeks until the lead replies.",
    reading: "[How to follow up on a cleaning quote without being pushy](https://www.inventtomorrow.pro/blog/follow-up-on-cleaning-quotes)",
  },
  {
    path: "/services/quote-revival",
    eyebrow: "SERVICE · BOOK THE JOB · CORE",
    headline: "Your old quotes are full of booked jobs.",
    intro: "Every cleaning company has people who asked for a price and never booked. We message them in your voice and turn them into jobs.",
    facts: [
      { label: "Fixes", text: "old quotes and inquiries nobody followed up" },
      { label: "Works with", text: "Jobber, Housecall Pro, Google Sheets, HubSpot, QuickBooks" },
      { label: "Included in", text: "our core package" },
    ],
    problem: "They already wanted a clean. Then life got busy and nobody followed up. Months later, many still need cleaning.",
    steps: [
      { title: "We pull your old quotes and inquiries.", body: "Then we clean up the list." },
      { title: "A short series of friendly messages goes out.", body: "Each offers real open dates." },
      { title: "Replies come straight to you.", body: "Ready to book." },
    ],
    benefits: [
      { title: "New jobs from leads you paid for.", body: "No new ad spend." },
      { title: "A clean, organized list.", body: "Ready to use again." },
      { title: "A campaign you can repeat.", body: "Whenever a month looks slow." },
    ],
    questions: [
      { q: "How old can the quotes be?", a: "Any age. Older lists reply less, so we start with the most recent." },
      { q: "Won't it feel odd to hear from us months later?", a: "Not when the message is short and offers real open dates." },
      { q: "Text or email?", a: "Email for everyone on the list. Text only for people who agreed to texts." },
      { q: "Is this AI?", a: "No. You approve every message before it goes out." },
    ],
    cta: {
      heading: "What could your old quotes be worth?",
      body: "Your free 15 minute audit counts your old quotes and inquiries and estimates what they could book. Core package, backed by our Pays For Itself Guarantee.",
    },
    related: ["Quote Chaser", "Win Back"],
    proof: "**13 new jobs booked from old inquiries in a single campaign.** [Read the case study](https://www.inventtomorrow.pro/our-work/old-leads-revenue-recovery)",
  },
  {
    path: "/services/appointment-reminders",
    eyebrow: "SERVICE · RUN THE JOB · OPTIONAL EXTRA",
    headline: "Every clean starts on time, with the door open.",
    intro: "Clients get a confirmation when they book, a reminder the day before and an on my way text. Access is sorted before you arrive.",
    facts: [
      { label: "Fixes", text: "lockouts, no shows and \"I forgot you were coming\"" },
      { label: "Works with", text: "Jobber, Housecall Pro, your calendar" },
      { label: "Included in", text: "optional extra" },
    ],
    problem: "A locked door or forgotten appointment costs you the whole slot: the drive, the time, the money. Chasing access details the night before eats your evening.",
    steps: [
      { title: "A confirmation goes out when the clean is booked.", body: "" },
      { title: "The day before, clients confirm the time and access.", body: "" },
      { title: "On the day, an on my way text goes out.", body: "" },
    ],
    benefits: [
      { title: "Fewer wasted trips.", body: "Fewer lost slots." },
      { title: "Access sorted early.", body: "No calls the night before." },
      { title: "Clients feel looked after.", body: "From booking to clean." },
    ],
    questions: [
      { q: "Can clients reschedule from the reminder?", a: "Yes. They reply with a new time and you approve it." },
      { q: "Does it text lockbox codes?", a: "No. Codes stay in your booking tool. The text only confirms how you'll get in." },
      { q: "Is this AI?", a: "No. You approve the reminders once, then they send at the right time." },
    ],
    cta: {
      heading: "How many cleans did a locked door cost you this year?",
      body: "Your free 15 minute audit shows where cleans fall through. Optional extra, priced on your audit call.",
    },
    related: ["Crew Updates", "Instant Price & Book"],
  },
  {
    path: "/services/crew-updates",
    eyebrow: "SERVICE · RUN THE JOB · OPTIONAL EXTRA",
    headline: "Your crew always knows where to be and what to do.",
    intro: "Job details, access notes and last minute changes go straight to the right cleaner's phone. No group chat chaos. No 7 am calls.",
    facts: [
      { label: "Fixes", text: "missed details, wrong times and calls from the van" },
      { label: "Works with", text: "Jobber, Housecall Pro, Google Sheets, your calendar" },
      { label: "Included in", text: "optional extra" },
    ],
    problem: "A client moves a time or adds a request, and you have to tell the crew between your own jobs. Miss one, and someone shows up late or skips the fridge.",
    steps: [
      { title: "Cleaners get tomorrow's jobs the evening before.", body: "Addresses, times and notes." },
      { title: "Changes go out instantly.", body: "The moment you make them in your booking tool." },
      { title: "Cleaners confirm with a reply.", body: "So you know they saw it." },
    ],
    benefits: [
      { title: "Fewer calls from the van.", body: "Details are already on their phone." },
      { title: "Client requests get done.", body: "Notes reach the cleaner." },
      { title: "Every change confirmed.", body: "No more \"nobody told me.\"" },
    ],
    questions: [
      { q: "Do my cleaners need an app?", a: "No. Updates come by text to the phone they already use." },
      { q: "Can I still message them myself?", a: "Of course. This handles the routine updates." },
      { q: "Is this AI?", a: "No. Updates come from your booking tool and go to the right cleaner." },
    ],
    cta: {
      heading: "How many calls does your crew make to you each day?",
      body: "Your free 15 minute audit shows where job details get lost. Optional extra, priced on your audit call.",
    },
    related: ["Ready at the Door", "Payment Chaser"],
  },
  {
    path: "/services/payment-reminders",
    eyebrow: "SERVICE · GET PAID · OPTIONAL EXTRA",
    headline: "Every clean paid, without the awkward chasing.",
    intro: "Unpaid invoices get friendly reminders with a pay now link until they're paid. You stop being the one who has to ask.",
    facts: [
      { label: "Fixes", text: "late payments and awkward chasing" },
      { label: "Works with", text: "QuickBooks, Stripe, Jobber, Housecall Pro, Xero" },
      { label: "Included in", text: "optional extra" },
    ],
    problem: "Asking a good client for money feels awkward, so it waits. Small unpaid invoices add up, and your cash flow takes the hit.",
    steps: [
      { title: "Reminders start when the invoice goes out.", body: "" },
      { title: "Friendly reminders with a pay now link follow.", body: "" },
      { title: "Once it's paid, they stop.", body: "" },
    ],
    benefits: [
      { title: "No forgotten invoices.", body: "Every one gets followed up." },
      { title: "No awkward texts from you.", body: "The reminders do it." },
      { title: "See who's paid.", body: "And who hasn't." },
    ],
    questions: [
      { q: "Can regulars be treated differently?", a: "Yes. They can get gentler reminders, or a card on file so they never see an invoice." },
      { q: "What about commercial clients on 30 day terms?", a: "Their reminders follow their terms." },
      { q: "Is this AI?", a: "No. You approve friendly messages once, and they send until the invoice is paid." },
    ],
    cta: {
      heading: "How much is sitting unpaid right now?",
      body: "Your free 15 minute audit shows how you invoice and how long you wait to get paid. Optional extra, priced on your audit call.",
    },
    related: ["Crew Updates", "Recurring Booker"],
  },
  {
    path: "/services/review-requests",
    eyebrow: "SERVICE · BRING THEM BACK · CORE",
    headline: "More Google reviews, so more people pick you.",
    intro: "Every client gets a short review request after their clean. Every new review gets an AI drafted reply for you to approve.",
    facts: [
      { label: "Fixes", text: "too few reviews, and reviews left unanswered" },
      { label: "Works with", text: "Google Business Profile, Jobber, Housecall Pro" },
      { label: "Included in", text: "our core package" },
    ],
    problem: "Happy clients rarely review on their own. People compare stars and review counts before they call. A thin profile loses jobs to a competitor with more.",
    steps: [
      { title: "After each clean, a short request goes out.", body: "With a direct link to your Google review page." },
      { title: "One gentle reminder if they don't reply.", body: "Then nothing more." },
      { title: "AI drafts a reply to every new review.", body: "In your voice. You approve it first." },
    ],
    benefits: [
      { title: "A steady flow of new reviews.", body: "Without remembering to ask." },
      { title: "Every review answered.", body: "Future clients notice." },
      { title: "Asked the right way.", body: "Every client, as Google's rules require." },
    ],
    questions: [
      { q: "Can you only ask the happy clients?", a: "No. [Google's policy](https://support.google.com/contributionpolicy/answer/7400114) bans asking only for positive reviews, so we ask every client the same way." },
      { q: "What about a bad review?", a: "You see it right away, with a calm, professional reply drafted for you to approve." },
      { q: "Can I offer a discount for reviews?", a: "No. Google's rules ban that too. Keep rewards for referrals." },
      { q: "Is this AI?", a: "Partly. You approve the requests once. AI drafts the review replies, and nothing posts until you approve it." },
    ],
    cta: {
      heading: "How many reviews did you get last month?",
      body: "Your free 15 minute audit compares your Google profile with your competitors'. Core package, backed by our Pays For Itself Guarantee.",
    },
    related: ["Recurring Booker", "Referral Engine"],
    reading: "[How to get more Google reviews for your cleaning business](https://www.inventtomorrow.pro/blog/get-more-google-reviews-cleaning-business)",
  },
  {
    path: "/services/recurring-bookings",
    eyebrow: "SERVICE · BRING THEM BACK · CORE",
    headline: "Turn one time cleans into regulars.",
    intro: "A week after a one time clean, clients get an offer to go weekly, every two weeks or monthly. Every yes goes into your calendar.",
    facts: [
      { label: "Fixes", text: "one time clients who never come back" },
      { label: "Works with", text: "Jobber, Housecall Pro, your calendar" },
      { label: "Included in", text: "our core package" },
    ],
    problem: "You won the job, did great work, and never asked them back. At $120 to $200 a visit, one biweekly regular is worth $3,000 to $5,000 a year. Every one time client who drifts away takes that with them.",
    steps: [
      { title: "A week after a one time clean, they hear from you.", body: "While the house still feels fresh." },
      { title: "The message offers a regular slot.", body: "Weekly, every two weeks or monthly, at your recurring rate." },
      { title: "Every yes goes on your calendar.", body: "As a recurring booking." },
    ],
    benefits: [
      { title: "More regulars, no new marketing.", body: "From clients you already have." },
      { title: "A steadier calendar.", body: "Easier to staff and plan." },
      { title: "Revenue that keeps coming.", body: "Long after the first clean." },
    ],
    questions: [
      { q: "What if they say \"not now\"?", a: "They get one gentle check in later. Then nothing unless they reply." },
      { q: "Can I offer a recurring discount?", a: "Yes. We use the rate you set." },
      { q: "Is this AI?", a: "No. You approve the offer we write before it goes out." },
    ],
    cta: {
      heading: "How many one time clients never heard from you again?",
      body: "One new biweekly regular brings in about $4,000 a year, roughly a year of our retainer. Your free 15 minute audit shows how many you could still convert. Core package, backed by our Pays For Itself Guarantee.",
    },
    related: ["Busy Season Ready", "Win Back"],
  },
  {
    path: "/services/busy-season",
    eyebrow: "SERVICE · BRING THEM BACK · CORE",
    headline: "Book the rush before it starts.",
    intro: "Weeks before spring cleaning and move out season, past clients get first pick of dates. Your busiest weeks fill early, with people you know.",
    facts: [
      { label: "Fixes", text: "peak weeks that go to whoever asks first" },
      { label: "Works with", text: "Jobber, Housecall Pro, your client list" },
      { label: "Included in", text: "our core package" },
    ],
    problem: "Demand jumps every spring and moving season. Companies that ask past clients first fill those weeks early. Everyone else scrambles for what's left.",
    steps: [
      { title: "We plan your seasons with you.", body: "Spring cleaning, summer move outs, holiday deep cleans." },
      { title: "Three weeks out, past clients get first pick of dates.", body: "" },
      { title: "Bookings land in your calendar before the rush.", body: "" },
    ],
    benefits: [
      { title: "Peak weeks booked early.", body: "At your full price." },
      { title: "Past clients feel looked after.", body: "First pick feels like a perk." },
      { title: "Fewer last minute scrambles.", body: "Know how busy you'll be, and staff for it." },
    ],
    questions: [
      { q: "Who gets these messages?", a: "Only past clients who agreed to hear from you." },
      { q: "Does it work for other seasons?", a: "Yes. Any busy stretch, from summer move outs to holiday deep cleans." },
      { q: "Is this AI?", a: "No. You approve every seasonal message before it goes out." },
    ],
    cta: {
      heading: "Is your spring already booked?",
      body: "Your free 15 minute audit shows how many past clients you could offer first pick before the rush. Core package, backed by our Pays For Itself Guarantee.",
    },
    related: ["Recurring Booker", "Win Back"],
  },
  {
    path: "/services/win-back",
    eyebrow: "SERVICE · BRING THEM BACK · OPTIONAL EXTRA",
    headline: "Bring back the regulars who went quiet.",
    intro: "When a regular skips a few cleans, they get a friendly check in with an easy way back. Often they just got busy.",
    facts: [
      { label: "Fixes", text: "regulars who drift away" },
      { label: "Works with", text: "Jobber, Housecall Pro, your client list" },
      { label: "Included in", text: "optional extra" },
    ],
    problem: "Regulars rarely cancel. They just stop booking. By the time you notice, months have passed and some have found someone else.",
    steps: [
      { title: "We spot regulars past their usual gap.", body: "Based on their booking history." },
      { title: "They get a short check in.", body: "With their usual slot offered." },
      { title: "Problems come to you.", body: "So you can put them right." },
    ],
    benefits: [
      { title: "Lost regulars come back.", body: "Before they're gone for good." },
      { title: "You hear about problems.", body: "Ones you'd never know about." },
      { title: "Less recurring revenue leaks away.", body: "Month after month." },
    ],
    questions: [
      { q: "How is this different from Quote Revival?", a: "Quote Revival is for people who never booked. Win Back is for clients who booked, then stopped." },
      { q: "When does it send?", a: "After the gap you choose, like two or three missed cleans." },
      { q: "Is this AI?", a: "No. You approve the check in once. It sends when a regular goes quiet." },
    ],
    cta: {
      heading: "How many regulars have you lost without noticing?",
      body: "Your free 15 minute audit finds the clients who've gone quiet and what they used to be worth. Optional extra, priced on your audit call.",
    },
    related: ["Recurring Booker", "Quote Revival"],
  },
  {
    path: "/services/referral-program",
    eyebrow: "SERVICE · BRING THEM BACK · OPTIONAL EXTRA",
    headline: "Your best clients, bringing you more like them.",
    intro: "After a few cleans, happy clients are invited to refer a friend. Both get a thank you when the referral books. We track it all.",
    facts: [
      { label: "Fixes", text: "word of mouth you never ask for" },
      { label: "Works with", text: "Jobber, Housecall Pro, Stripe" },
      { label: "Included in", text: "optional extra" },
    ],
    problem: "Your happiest clients would refer you if asked. Most cleaners never ask, so referrals happen by luck. Referred clients trust you from day one.",
    steps: [
      { title: "After a client's third clean, they get an invite.", body: "To refer a friend." },
      { title: "Their friend gets an easy way to book.", body: "The referral is tracked automatically." },
      { title: "When it books, both get a thank you.", body: "Like money off their next clean." },
    ],
    benefits: [
      { title: "New clients who already trust you.", body: "A friend sent them." },
      { title: "Every referral tracked and thanked.", body: "Nothing to remember." },
      { title: "Best clients feel appreciated.", body: "And stay longer." },
    ],
    questions: [
      { q: "What reward should I offer?", a: "Money off the next clean works well. It brings both clients back. You pick the amount." },
      { q: "Can I reward reviews too?", a: "No. Keep rewards for referrals. Rewarding reviews breaks Google's rules." },
      { q: "Is this AI?", a: "No. You approve the invites and thank yous once. Referrals are tracked automatically." },
    ],
    cta: {
      heading: "Who would your best clients send you?",
      body: "Your free 15 minute audit shows how many of your clients are ready to be asked. Optional extra, priced on your audit call.",
    },
    related: ["5 Star Engine", "Recurring Booker"],
  },
];
