// Service names, routes and search metadata from the supplied service-page briefs.
// Navigation uses this catalog without loading the full page copy.
import type { PageMeta } from './pages';

export interface ServiceSummary {
  title: string;
  path: string;
  group: string;
  tier: 'core' | 'add-on';
  ai: boolean;
  summary: string;
  meta: PageMeta;
}

export const SERVICE_GROUPS = [
  { title: 'Win the lead', id: 'win-the-lead', description: 'Be there when a new customer reaches out.' },
  { title: 'Book the job', id: 'book-the-job', description: 'Keep every quote moving towards a decision.' },
  { title: 'Run the job', id: 'run-the-job', description: 'Keep clients and crew ready for every clean.' },
  { title: 'Get paid', id: 'get-paid', description: 'Follow up invoices without the awkward chasing.' },
  { title: 'Bring them back', id: 'bring-them-back', description: 'Build reviews, regulars and referrals.' },
];

export const SERVICE_CATALOG: ServiceSummary[] = [
  {
    "title": "24/7 Receptionist",
    "path": "/services/24-7-receptionist",
    "group": "Win the lead",
    "tier": "add-on",
    "ai": true,
    "summary": "Every call answered, day or night.",
    "meta": {
      "path": "/services/24-7-receptionist",
      "title": "24/7 AI Receptionist for Cleaning Companies | Invent Tomorrow",
      "description": "Every call answered, day or night. Our AI receptionist answers questions, books estimates and takes messages for your cleaning company."
    }
  },
  {
    "title": "Missed Call Rescue",
    "path": "/services/missed-call-rescue",
    "group": "Win the lead",
    "tier": "core",
    "ai": false,
    "summary": "A text in seconds after every missed call.",
    "meta": {
      "path": "/services/missed-call-rescue",
      "title": "Missed Call Text Back for Cleaning Companies | Invent Tomorrow",
      "description": "Every missed call gets a text from your business in seconds, so callers book with you instead of the next cleaner on Google. Done for you."
    }
  },
  {
    "title": "60 Second Response",
    "path": "/services/60-second-response",
    "group": "Win the lead",
    "tier": "core",
    "ai": false,
    "summary": "Every new enquiry answered in under a minute.",
    "meta": {
      "path": "/services/60-second-response",
      "title": "Instant Lead Response for Cleaning Companies | Invent Tomorrow",
      "description": "Website, Facebook, Instagram and Google messages answered in under a minute, day or night, in your voice. More enquiries become booked cleans."
    }
  },
  {
    "title": "Always-On Chat",
    "path": "/services/website-chat",
    "group": "Win the lead",
    "tier": "add-on",
    "ai": true,
    "summary": "A website assistant that answers and books, around the clock.",
    "meta": {
      "path": "/services/website-chat",
      "title": "AI Website Chat for Cleaning Companies | Invent Tomorrow",
      "description": "An AI chat assistant on your website that answers questions, shares your prices and books cleans at any hour. Built and run for your cleaning company."
    }
  },
  {
    "title": "Instant Price & Book",
    "path": "/services/online-booking",
    "group": "Win the lead",
    "tier": "add-on",
    "ai": false,
    "summary": "Your prices and available slots, ready to book online.",
    "meta": {
      "path": "/services/online-booking",
      "title": "Online Booking and Instant Quotes for Cleaning Companies | Invent Tomorrow",
      "description": "Let customers see their price and book a clean online, using your prices and your calendar. Set up and run for your cleaning company."
    }
  },
  {
    "title": "One Inbox",
    "path": "/services/one-inbox",
    "group": "Win the lead",
    "tier": "add-on",
    "ai": false,
    "summary": "Every lead and conversation in one place.",
    "meta": {
      "path": "/services/one-inbox",
      "title": "All Your Cleaning Leads in One Inbox | Invent Tomorrow",
      "description": "Calls, texts, Facebook, Instagram, Google, Bark and Thumbtack leads in one place, sent to the right person, so no enquiry gets lost."
    }
  },
  {
    "title": "Quote Chaser",
    "path": "/services/quote-chaser",
    "group": "Book the job",
    "tier": "core",
    "ai": false,
    "summary": "Friendly follow-ups for every open quote.",
    "meta": {
      "path": "/services/quote-chaser",
      "title": "Cleaning Quote Follow Up, Done for You | Invent Tomorrow",
      "description": "Every cleaning quote followed up until it's a yes or a no, in your voice. Most quotes don't get rejected. They get forgotten."
    }
  },
  {
    "title": "Quote Revival",
    "path": "/services/quote-revival",
    "group": "Book the job",
    "tier": "core",
    "ai": false,
    "summary": "Turn old quotes into new booked cleans.",
    "meta": {
      "path": "/services/quote-revival",
      "title": "Turn Old Cleaning Quotes Into Booked Jobs | Invent Tomorrow",
      "description": "We contact the old quotes and enquiries sitting in your system and turn them into booked cleans. One campaign booked 18 new jobs from old enquiries."
    }
  },
  {
    "title": "Ready at the Door",
    "path": "/services/appointment-reminders",
    "group": "Run the job",
    "tier": "add-on",
    "ai": false,
    "summary": "Confirmations, reminders and on-my-way texts.",
    "meta": {
      "path": "/services/appointment-reminders",
      "title": "Cleaning Appointment Reminders and On-My-Way Texts | Invent Tomorrow",
      "description": "Booking confirmations, day-before reminders and on-my-way texts for your cleaning clients, so every clean starts on time with the door open."
    }
  },
  {
    "title": "Crew Updates",
    "path": "/services/crew-updates",
    "group": "Run the job",
    "tier": "add-on",
    "ai": false,
    "summary": "The right job details, straight to the right cleaner.",
    "meta": {
      "path": "/services/crew-updates",
      "title": "Job Updates for Cleaning Crews | Invent Tomorrow",
      "description": "Job details, access notes and last-minute changes sent straight to the right cleaner's phone, so your crew always knows where to be and what to do."
    }
  },
  {
    "title": "Payment Chaser",
    "path": "/services/payment-reminders",
    "group": "Get paid",
    "tier": "add-on",
    "ai": false,
    "summary": "Friendly invoice reminders until the job is paid.",
    "meta": {
      "path": "/services/payment-reminders",
      "title": "Invoice Payment Reminders for Cleaning Companies | Invent Tomorrow",
      "description": "Friendly invoice reminders with a pay-now link, sent until every clean is paid. Works with QuickBooks, Stripe, Jobber and Housecall Pro."
    }
  },
  {
    "title": "5 Star Engine",
    "path": "/services/review-requests",
    "group": "Bring them back",
    "tier": "core",
    "ai": false,
    "summary": "A review request after every clean, and replies for you to approve.",
    "meta": {
      "path": "/services/review-requests",
      "title": "Get More Google Reviews for Your Cleaning Business | Invent Tomorrow",
      "description": "A review request after every clean and an AI-drafted reply to every review, so more people choose you on Google. Done the way Google's rules allow."
    }
  },
  {
    "title": "Recurring Booker",
    "path": "/services/recurring-bookings",
    "group": "Bring them back",
    "tier": "core",
    "ai": false,
    "summary": "Turn one-time cleans into weekly and monthly regulars.",
    "meta": {
      "path": "/services/recurring-bookings",
      "title": "Turn One-Time Cleans Into Recurring Clients | Invent Tomorrow",
      "description": "Every one-time clean is followed up with an offer to come back weekly, biweekly or monthly. One new biweekly regular is worth about $4,000 a year."
    }
  },
  {
    "title": "Busy Season Ready",
    "path": "/services/busy-season",
    "group": "Bring them back",
    "tier": "core",
    "ai": false,
    "summary": "Give past clients first pick before the seasonal rush.",
    "meta": {
      "path": "/services/busy-season",
      "title": "Book Your Spring Cleaning Rush Early | Invent Tomorrow",
      "description": "Past clients get first pick of dates before the spring cleaning and move-out rush, so your busiest weeks are booked before they start."
    }
  },
  {
    "title": "Win-Back",
    "path": "/services/win-back",
    "group": "Bring them back",
    "tier": "add-on",
    "ai": false,
    "summary": "A friendly way back for regulars who have gone quiet.",
    "meta": {
      "path": "/services/win-back",
      "title": "Win Back Cleaning Clients Who Stopped Booking | Invent Tomorrow",
      "description": "Regulars who've gone quiet get a friendly check-in before they find another cleaner. Done for you, in your voice."
    }
  },
  {
    "title": "Referral Engine",
    "path": "/services/referral-program",
    "group": "Bring them back",
    "tier": "add-on",
    "ai": false,
    "summary": "Make it easy for your best clients to refer a friend.",
    "meta": {
      "path": "/services/referral-program",
      "title": "Referral Program for Cleaning Companies | Invent Tomorrow",
      "description": "Happy clients are asked to pass you on, with a thank-you for every referral that books. Set up, tracked and run for your cleaning company."
    }
  }
];
