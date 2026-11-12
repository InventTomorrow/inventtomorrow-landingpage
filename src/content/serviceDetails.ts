// Page copy imported from the 16 supplied service briefs. Editorial notes are excluded.
export interface ServiceDetail {
  path: string;
  eyebrow: string;
  headline: string;
  intro: string;
  facts: { label: string; text: string }[];
  problem: string;
  steps: { title: string; body: string }[];
  example: { kind: string; trigger: string; messages: { from: string; text: string }[]; result: string };
  proof?: string;
  benefits: { title: string; body: string }[];
  questions: { q: string; a: string }[];
  cta: { heading: string; body: string };
  reading?: string;
  related: string[];
}

export const SERVICE_DETAILS: ServiceDetail[] = [
  {
    "path": "/services/24-7-receptionist",
    "eyebrow": "SERVICE · WIN THE LEAD · ADD-ON · AI",
    "headline": "Every call answered, even when you're mid-clean.",
    "intro": "An AI voice assistant picks up when you can't. It answers common questions, books estimates into your calendar and sends you a summary of every call.",
    "facts": [
      {
        "label": "Fixes",
        "text": "calls that ring out or go to voicemail"
      },
      {
        "label": "Works with",
        "text": "your business line, Quo (OpenPhone), your calendar"
      },
      {
        "label": "Included in",
        "text": "optional add-on"
      }
    ],
    "problem": "When your phone rings mid-clean, you have two bad options: stop working or let it go. Plenty of callers won't leave a voicemail. They call the next cleaner on Google instead. Evenings and weekends are worse, because that's when people finally get around to booking.",
    "steps": [
      {
        "title": "We write the script with you.",
        "body": "Your services, prices, service area, what it can book and what it passes to you."
      },
      {
        "title": "It answers when you can't.",
        "body": "After a set number of rings, after hours, or every call. Your choice. It tells callers up front that they're speaking with an AI assistant."
      },
      {
        "title": "You get the summary.",
        "body": "Who called, what they need and what was booked, by text and in your inbox."
      }
    ],
    "example": {
      "kind": "call",
      "trigger": "Incoming call · 7:48 pm",
      "messages": [
        {
          "from": "Assistant",
          "text": "Thanks for calling Bright Home Cleaning. You're speaking with our AI assistant. Are you looking for a regular clean or a one-time clean?"
        },
        {
          "from": "Caller",
          "text": "A deep clean before my parents visit, sometime next week."
        }
      ],
      "result": "Estimate booked · Tuesday 10 am"
    },
    "benefits": [
      {
        "title": "Every caller reaches someone.",
        "body": "Day, night or weekend."
      },
      {
        "title": "Estimates land in your calendar.",
        "body": "Not on a sticky note in the van."
      },
      {
        "title": "Urgent jobs reach you first.",
        "body": "Same-week move-outs and deep cleans are flagged to you straight away."
      }
    ],
    "questions": [
      {
        "q": "Will callers know it's AI?",
        "a": "Yes. It says so at the start of every call, and it can take a message or pass the caller to you at any point."
      },
      {
        "q": "Can it give prices?",
        "a": "Only the prices you approve, like a starting price for a standard clean. Anything custom becomes an estimate visit or a callback."
      },
      {
        "q": "What if it can't handle a call?",
        "a": "It takes a message and texts you the details straight away."
      },
      {
        "q": "I use Jobber. Doesn't it have an AI receptionist?",
        "a": "It does. If it covers what you need, we'll set it up and write its script for you. If you're on another tool, or need it to handle more, we build one for you."
      }
    ],
    "cta": {
      "heading": "How many calls went to voicemail last week?",
      "body": "Your free 15-minute audit shows how many calls you're missing and what they're worth. Available as an add-on, priced on your audit call."
    },
    "related": [
      "Missed Call Rescue",
      "Always-On Chat"
    ]
  },
  {
    "path": "/services/missed-call-rescue",
    "eyebrow": "SERVICE · WIN THE LEAD · CORE",
    "headline": "Missed a call? They get a text in seconds.",
    "intro": "When you can't pick up, the caller gets a friendly text from your business straight away. The conversation keeps going until you're free to take over.",
    "facts": [
      {
        "label": "Fixes",
        "text": "callers who try the next cleaner"
      },
      {
        "label": "Works with",
        "text": "your business line, Quo (OpenPhone), Jobber, Housecall Pro"
      },
      {
        "label": "Included in",
        "text": "our core package"
      }
    ],
    "problem": "You can't answer the phone with gloves on. By the time you call back after the clean, the person who rang may already have booked someone else. Every missed call is a job you paid to win through ads, Google or referrals.",
    "steps": [
      {
        "title": "We connect your business line.",
        "body": "A missed call triggers a text within seconds."
      },
      {
        "title": "We write the text in your voice.",
        "body": "You approve it before it goes live."
      },
      {
        "title": "Replies land in one place.",
        "body": "You pick up the conversation when you're free."
      }
    ],
    "example": {
      "kind": "conversation",
      "trigger": "Missed call · 2:14 pm",
      "messages": [
        {
          "from": "Business",
          "text": "Sorry we missed you! This is Bright Home Cleaning. What can we help with?"
        },
        {
          "from": "Customer",
          "text": "Looking for a move out clean on the 28th."
        }
      ],
      "result": "Replied in 5 seconds"
    },
    "benefits": [
      {
        "title": "Callers hear back while they're still looking.",
        "body": "Not hours later."
      },
      {
        "title": "You keep cleaning.",
        "body": "No stopping for every ring."
      },
      {
        "title": "Every missed caller becomes a written conversation.",
        "body": "You can see it and pick it up from anywhere."
      }
    ],
    "questions": [
      {
        "q": "Do I need a new number?",
        "a": "No. It works with the number you already have."
      },
      {
        "q": "What if the caller is an existing client?",
        "a": "They get the same friendly text, and you see who it is before you reply."
      },
      {
        "q": "Do I need to register anything?",
        "a": "US phone carriers make businesses register before sending texts. We handle that registration for you as part of setup."
      },
      {
        "q": "Is this AI?",
        "a": "No. The text is a message we write with you and you approve. Replies come straight to you, and you take it from there."
      }
    ],
    "cta": {
      "heading": "How many calls did you miss last week?",
      "body": "Your free 15-minute audit shows how many callers never heard back and what those jobs were worth. Part of our core package, backed by our Pays For Itself Guarantee."
    },
    "related": [
      "24/7 Receptionist",
      "60 Second Response"
    ],
    "reading": "[What to do when you miss a call in the middle of a clean](https://www.inventtomorrow.pro/blog/missed-calls-cleaning-business)"
  },
  {
    "path": "/services/60-second-response",
    "eyebrow": "SERVICE · WIN THE LEAD · CORE",
    "headline": "Every enquiry answered in under a minute.",
    "intro": "Website forms, Facebook, Instagram and Google messages all get a reply in under a minute, day or night. It asks the questions you'd ask, so the lead is ready to quote when you are.",
    "facts": [
      {
        "label": "Fixes",
        "text": "enquiries that wait hours for a reply"
      },
      {
        "label": "Works with",
        "text": "your website forms, Facebook, Instagram, Google Business Profile"
      },
      {
        "label": "Included in",
        "text": "our core package"
      }
    ],
    "problem": "People rarely ask just one cleaning company. They fill in two or three forms and book whoever answers first and sounds sure. If your reply comes after the job you're on, it often arrives after someone else's.",
    "steps": [
      {
        "title": "We connect every place enquiries come in.",
        "body": "Website, Facebook, Instagram and Google."
      },
      {
        "title": "Each new enquiry gets an instant reply.",
        "body": "It asks for home size, how often and preferred dates."
      },
      {
        "title": "The answers wait for you.",
        "body": "You can quote in a single message."
      }
    ],
    "example": {
      "kind": "conversation",
      "trigger": "New website enquiry · 9:41 pm",
      "messages": [
        {
          "from": "Business",
          "text": "Thanks for reaching out, Mike! How big is your home, and how often would you like a clean?"
        },
        {
          "from": "Customer",
          "text": "3 bedrooms, every two weeks."
        }
      ],
      "result": "Answered in 42 seconds"
    },
    "benefits": [
      {
        "title": "You're first to reply.",
        "body": "Even at 9:41 pm."
      },
      {
        "title": "Every lead arrives ready to quote.",
        "body": "With the details you need."
      },
      {
        "title": "No more \"sorry for the slow reply.\"",
        "body": "Every enquiry starts with a fast, confident reply."
      }
    ],
    "questions": [
      {
        "q": "Does it quote prices?",
        "a": "Only if you want it to. Otherwise it gathers the details and you send the quote."
      },
      {
        "q": "Does it work for leads from Facebook ads?",
        "a": "Yes. Ad leads get the same instant reply as everyone else."
      },
      {
        "q": "Is this AI?",
        "a": "No. The replies are messages we write with you and you approve before they go live."
      }
    ],
    "cta": {
      "heading": "How fast do your leads hear back today?",
      "body": "Your free 15-minute audit times your replies and shows how many enquiries go cold while you're on a job. Part of our core package, backed by our Pays For Itself Guarantee."
    },
    "related": [
      "Missed Call Rescue",
      "One Inbox"
    ],
    "proof": "For [Just About Cleaning](https://www.inventtomorrow.pro/our-work/just-about-cleaning-crm-automation-rebuild), Facebook and Instagram leads were being sent to a form before anyone had their details. Now the first message asks for their name, email and phone, so every social lead can be contacted."
  },
  {
    "path": "/services/website-chat",
    "eyebrow": "SERVICE · WIN THE LEAD · ADD-ON · AI",
    "headline": "Your website books cleans while you sleep.",
    "intro": "An AI chat assistant on your website answers visitors' questions, shares the prices you approve and books them in, at any hour. Anything it can't handle comes straight to you.",
    "facts": [
      {
        "label": "Fixes",
        "text": "visitors who leave without getting in touch"
      },
      {
        "label": "Works with",
        "text": "your website, your calendar, Jobber, Housecall Pro"
      },
      {
        "label": "Included in",
        "text": "optional add-on"
      }
    ],
    "problem": "Plenty of people visit a cleaning website late at night, read a page and leave without filling in a form. They had a question, nobody was there to answer it, and they moved on to the next site.",
    "steps": [
      {
        "title": "We train it on your business.",
        "body": "Services, service area, the prices you approve and the questions customers ask most."
      },
      {
        "title": "It answers and books.",
        "body": "When a visitor is ready, it takes their details or books them in."
      },
      {
        "title": "You see everything.",
        "body": "Every conversation and booking, with anything tricky flagged for you."
      }
    ],
    "example": {
      "kind": "conversation",
      "trigger": "Website chat · 11:02 pm",
      "messages": [
        {
          "from": "Business",
          "text": "Hi, I'm Bright Home's AI assistant. Tell me your bedrooms and how often, and I'll give you a price."
        },
        {
          "from": "Customer",
          "text": "2 bedrooms, every two weeks. Can you do Fridays?"
        }
      ],
      "result": "Booked · Fridays, every 2 weeks"
    },
    "benefits": [
      {
        "title": "Late-night visitors become bookings.",
        "body": "Instead of closed tabs."
      },
      {
        "title": "Questions get the same answer every time.",
        "body": "Your prices, your policies."
      },
      {
        "title": "You can step in whenever you like.",
        "body": "Every conversation is saved for you."
      }
    ],
    "questions": [
      {
        "q": "Want to try one first?",
        "a": "Our [free audit page](https://www.inventtomorrow.pro/free-audit) runs on the same kind of assistant."
      },
      {
        "q": "Will it make things up?",
        "a": "It's set up to stick to what you've approved. If it doesn't know the answer, it takes the visitor's details and passes the question to you."
      },
      {
        "q": "Can I read the conversations?",
        "a": "Yes. Every chat is saved for you to read."
      }
    ],
    "cta": {
      "heading": "What are your website visitors asking at 11 pm?",
      "body": "Your free 15-minute audit looks at how your site turns visitors into enquiries and where they drop off. Available as an add-on, priced on your audit call."
    },
    "related": [
      "Instant Price & Book",
      "60 Second Response"
    ]
  },
  {
    "path": "/services/online-booking",
    "eyebrow": "SERVICE · WIN THE LEAD · ADD-ON",
    "headline": "They see the price. They pick a time. Booked.",
    "intro": "Customers enter their home size and the clean they want, see your price, and choose a slot from your calendar. No phone tag, no waiting for a quote.",
    "facts": [
      {
        "label": "Fixes",
        "text": "people who won't call for a quote"
      },
      {
        "label": "Works with",
        "text": "Jobber, Housecall Pro, Stripe, your calendar"
      },
      {
        "label": "Included in",
        "text": "optional add-on"
      }
    ],
    "problem": "Some customers don't want to call, and they won't wait a day for a quote. If they can't see a price on your site, they find a company that shows one.",
    "steps": [
      {
        "title": "We turn your price list into a simple calculator.",
        "body": "Bedrooms, bathrooms, type of clean and add-ons."
      },
      {
        "title": "Customers see their price and pick a slot.",
        "body": "Only the times you actually have free."
      },
      {
        "title": "The booking lands in your tool.",
        "body": "With a deposit taken, if you want one."
      }
    ],
    "example": {
      "kind": "conversation",
      "trigger": "Booking page · 6:15 am",
      "messages": [
        {
          "from": "Business",
          "text": "Your price: $165 for a standard clean, 3 bed, 2 bath. Pick a time that suits you."
        },
        {
          "from": "Customer",
          "text": "Thursday 9 am works."
        }
      ],
      "result": "Booked online · Thursday 9 am"
    },
    "benefits": [
      {
        "title": "Price shoppers book instead of leaving.",
        "body": "The answer they wanted is right there."
      },
      {
        "title": "Less back-and-forth.",
        "body": "No more five-message threads to agree a time."
      },
      {
        "title": "Fewer last-minute cancellations.",
        "body": "Optional deposits mean clients have something at stake."
      }
    ],
    "questions": [
      {
        "q": "What about homes that need a custom quote?",
        "a": "Deep cleans, move-outs or anything unusual can go to a quote request instead of an instant price."
      },
      {
        "q": "Can I change my prices later?",
        "a": "Yes. Tell us and we update the calculator."
      },
      {
        "q": "Is this AI?",
        "a": "No. It's a price calculator built from your own price list, so every price comes straight from you."
      }
    ],
    "cta": {
      "heading": "Ready to let customers book themselves?",
      "body": "Your free 15-minute audit checks whether your pricing suits an instant quote, and which cleans should stay quote-only. Available as an add-on, priced on your audit call."
    },
    "related": [
      "Always-On Chat",
      "Ready at the Door"
    ]
  },
  {
    "path": "/services/one-inbox",
    "eyebrow": "SERVICE · WIN THE LEAD · ADD-ON",
    "headline": "Every lead, from everywhere, in one place.",
    "intro": "Calls, texts, website forms, Facebook, Instagram, Google, Bark and Thumbtack all land in one inbox. Each lead goes to the right person, and nothing sits unanswered in an app you forgot to check.",
    "facts": [
      {
        "label": "Fixes",
        "text": "leads lost across too many apps"
      },
      {
        "label": "Works with",
        "text": "Facebook, Instagram, Google Business Profile, Bark, Thumbtack, your business line, HubSpot"
      },
      {
        "label": "Included in",
        "text": "optional add-on"
      }
    ],
    "problem": "Most cleaning companies get leads from five or six places, each with its own app and notifications. Leads slip through the cracks, or two people reply to the same one.",
    "steps": [
      {
        "title": "We connect every source you use.",
        "body": "Everything flows into one shared inbox."
      },
      {
        "title": "Each lead is sorted automatically.",
        "body": "Residential, commercial, contractor or existing client, each to the right person."
      },
      {
        "title": "Your team sees who's handling what.",
        "body": "Nothing missed, nothing answered twice."
      }
    ],
    "example": {
      "kind": "conversation",
      "trigger": "Thumbtack lead · 1:30 pm",
      "messages": [
        {
          "from": "Business",
          "text": "Hi Dana, thanks for your request. This is Bright Home Cleaning. What date did you have in mind for the move-out clean?"
        },
        {
          "from": "Customer",
          "text": "The 30th. It's a 3-bedroom."
        }
      ],
      "result": "Quoted within the hour"
    },
    "benefits": [
      {
        "title": "One place to check.",
        "body": "Not six apps."
      },
      {
        "title": "Every lead goes to the right place.",
        "body": "Automatically."
      },
      {
        "title": "No duplicate replies, no forgotten messages.",
        "body": "Everyone sees the same inbox."
      }
    ],
    "questions": [
      {
        "q": "Do I have to stop using Bark or Thumbtack?",
        "a": "No. They keep sending you leads. You just answer them all from one place."
      },
      {
        "q": "Can my team use it too?",
        "a": "Yes. Everyone sees the same inbox and who's handling each lead."
      },
      {
        "q": "Is this AI?",
        "a": "No. Leads are sorted by simple rules we set up with you, like where they came from and what they asked for."
      }
    ],
    "cta": {
      "heading": "Where are your leads getting lost?",
      "body": "Your free 15-minute audit maps every place your leads come from and where they slip through. Available as an add-on, priced on your audit call."
    },
    "related": [
      "60 Second Response",
      "Quote Chaser"
    ],
    "proof": "[Just About Cleaning](https://www.inventtomorrow.pro/our-work/just-about-cleaning-crm-automation-rebuild) gets leads from Facebook, Instagram, Bark and phone calls. Getting each lead to the right place used to depend on staff remembering to label it correctly. We rebuilt it so leads land in the right place on their own."
  },
  {
    "path": "/services/quote-chaser",
    "eyebrow": "SERVICE · BOOK THE JOB · CORE",
    "headline": "Every quote followed up until it's a yes or a no.",
    "intro": "Most quotes don't get a no. They get forgotten. We follow up every one on a schedule, in your voice, and stop the moment they reply.",
    "facts": [
      {
        "label": "Fixes",
        "text": "quotes that go quiet"
      },
      {
        "label": "Works with",
        "text": "Jobber, Housecall Pro, QuickBooks, Xero, HubSpot"
      },
      {
        "label": "Included in",
        "text": "our core package"
      }
    ],
    "problem": "You send a quote, the customer says they'll think about it, and then a busy week happens on both sides. Chasing feels pushy, so it doesn't get done. The job goes to whoever followed up.",
    "steps": [
      {
        "title": "Every quote starts a follow-up schedule.",
        "body": "Automatically, the moment it's sent."
      },
      {
        "title": "Friendly check-ins go out over the following weeks.",
        "body": "Each one makes it easy to say yes, ask a question or decline."
      },
      {
        "title": "A reply stops the messages.",
        "body": "The conversation is yours from there."
      }
    ],
    "example": {
      "kind": "conversation",
      "trigger": "Quote sent · 3 days ago",
      "messages": [
        {
          "from": "Business",
          "text": "Hi Jen, just checking in on your quote. Any questions I can answer?"
        },
        {
          "from": "Customer",
          "text": "Sorry, been busy. Let's book it!"
        }
      ],
      "result": "Quote accepted"
    },
    "benefits": [
      {
        "title": "No quote is left hanging.",
        "body": "Every one gets followed up."
      },
      {
        "title": "You don't have to remember.",
        "body": "Follow-up runs on its own."
      },
      {
        "title": "Nobody feels chased.",
        "body": "A reply stops the messages straight away."
      }
    ],
    "questions": [
      {
        "q": "Won't it annoy customers?",
        "a": "The messages are short, friendly and spaced out, and they stop as soon as someone replies or says no thanks."
      },
      {
        "q": "Does it work for commercial proposals?",
        "a": "Yes. Site visits and proposals get their own follow-up schedule."
      },
      {
        "q": "Doesn't Jobber already send quote follow-ups?",
        "a": "It can. If you use Jobber or Housecall Pro, we start with what your tool already does: we switch it on, write the messages and set the timing. Where it falls short, like commercial proposals or your old quote backlog, we build the rest."
      },
      {
        "q": "Is this AI?",
        "a": "No. Every follow-up is a message we write with you and you approve."
      }
    ],
    "cta": {
      "heading": "How many of your quotes never got a second message?",
      "body": "Your free 15-minute audit shows how many open quotes you have and what they're worth. Part of our core package, backed by our Pays For Itself Guarantee."
    },
    "related": [
      "Quote Revival",
      "One Inbox"
    ],
    "proof": "For [Just About Cleaning](https://www.inventtomorrow.pro/our-work/just-about-cleaning-crm-automation-rebuild), we gave quotes waiting on an answer their own follow-up list, and switched follow-up back on for their old quotes. After the first four-week chase, follow-up continues about every two weeks until the lead replies.",
    "reading": "[How to follow up on a cleaning quote without being pushy](https://www.inventtomorrow.pro/blog/follow-up-on-cleaning-quotes)"
  },
  {
    "path": "/services/quote-revival",
    "eyebrow": "SERVICE · BOOK THE JOB · CORE",
    "headline": "Your old quotes are full of booked cleans.",
    "intro": "Every cleaning company has a list of people who asked for a price and never booked. We contact them in your voice and turn them into jobs.",
    "facts": [
      {
        "label": "Fixes",
        "text": "old quotes and enquiries nobody followed up"
      },
      {
        "label": "Works with",
        "text": "Jobber, Housecall Pro, Google Sheets, HubSpot, QuickBooks"
      },
      {
        "label": "Included in",
        "text": "our core package"
      }
    ],
    "problem": "These people already wanted a clean. They asked, got busy, and nobody followed up. Months later they still need cleaning, and some of them still haven't booked anyone.",
    "steps": [
      {
        "title": "We pull out your old quotes and enquiries.",
        "body": "Then we clean up the list."
      },
      {
        "title": "A short series of friendly messages goes out.",
        "body": "Each one offers real open dates."
      },
      {
        "title": "Anyone who replies comes straight to you.",
        "body": "Ready to book."
      }
    ],
    "example": {
      "kind": "conversation",
      "trigger": "Quote from March · no reply",
      "messages": [
        {
          "from": "Business",
          "text": "Hi Sarah, it's Bright Home Cleaning. You asked about a deep clean in March. We have openings next week. Still interested?"
        },
        {
          "from": "Customer",
          "text": "Yes! Do you have Thursday?"
        }
      ],
      "result": "Booked · Deep clean, Thursday"
    },
    "benefits": [
      {
        "title": "New jobs from leads you already paid for.",
        "body": "No new ad spend."
      },
      {
        "title": "A clean, organized list.",
        "body": "Ready to use again."
      },
      {
        "title": "A campaign you can repeat.",
        "body": "Whenever a month looks slow."
      }
    ],
    "questions": [
      {
        "q": "How old can the quotes be?",
        "a": "Any age. Older lists tend to reply less, so we start with the most recent."
      },
      {
        "q": "Won't it feel odd to hear from us months later?",
        "a": "Not when the message is short and offers something real, like open dates next week."
      },
      {
        "q": "Text or email?",
        "a": "Email for anyone on the list. Text only for people who agreed to receive texts."
      },
      {
        "q": "Is this AI?",
        "a": "No. Every message is written with you and approved by you before it goes out."
      }
    ],
    "cta": {
      "heading": "What could your old quotes be worth?",
      "body": "Your free 15-minute audit counts the old quotes and enquiries in your system and estimates what they could book. Part of our core package, backed by our Pays For Itself Guarantee."
    },
    "related": [
      "Quote Chaser",
      "Win-Back"
    ],
    "proof": "**18 new jobs booked from old enquiries in a single campaign.** [Read the case study](https://www.inventtomorrow.pro/our-work/old-leads-revenue-recovery)"
  },
  {
    "path": "/services/appointment-reminders",
    "eyebrow": "SERVICE · RUN THE JOB · ADD-ON",
    "headline": "Every clean starts on time, with the door open.",
    "intro": "Clients get a confirmation when they book, a reminder the day before and a text when your crew is on the way. How you'll get in is sorted before you arrive.",
    "facts": [
      {
        "label": "Fixes",
        "text": "lockouts, no-shows and \"I forgot you were coming\""
      },
      {
        "label": "Works with",
        "text": "Jobber, Housecall Pro, your calendar"
      },
      {
        "label": "Included in",
        "text": "optional add-on"
      }
    ],
    "problem": "A locked door or a forgotten appointment costs you the whole slot: the drive, the time and the money for that clean. Chasing access details by phone the night before eats your evening.",
    "steps": [
      {
        "title": "A confirmation goes out the moment the clean is booked.",
        "body": ""
      },
      {
        "title": "The day before, clients confirm the time and how you'll get in.",
        "body": ""
      },
      {
        "title": "On the day, an on-my-way text goes out when the crew heads over.",
        "body": ""
      }
    ],
    "example": {
      "kind": "conversation",
      "trigger": "Day before the clean · 5:00 pm",
      "messages": [
        {
          "from": "Business",
          "text": "Hi Laura, we're booked for tomorrow at 10 am. Will someone be home, or should we use the lockbox?"
        },
        {
          "from": "Customer",
          "text": "Lockbox, code is in my notes. Thanks!"
        }
      ],
      "result": "Access confirmed"
    },
    "benefits": [
      {
        "title": "Fewer wasted trips.",
        "body": "And fewer lost slots."
      },
      {
        "title": "Access sorted before the day.",
        "body": "No more calls the night before."
      },
      {
        "title": "Clients feel looked after.",
        "body": "From booking to clean."
      }
    ],
    "questions": [
      {
        "q": "Can clients reschedule from the reminder?",
        "a": "Yes. They reply to ask for a new time, and you approve the change."
      },
      {
        "q": "Does it send lockbox codes by text?",
        "a": "No. Access codes stay in your booking tool. The text only confirms how you'll get in."
      },
      {
        "q": "Is this AI?",
        "a": "No. These are reminders you approve once, then they go out automatically at the right time."
      }
    ],
    "cta": {
      "heading": "How many cleans did a locked door cost you this year?",
      "body": "Your free 15-minute audit looks at your confirmations and reminders and where cleans fall through. Available as an add-on, priced on your audit call."
    },
    "related": [
      "Crew Updates",
      "Instant Price & Book"
    ]
  },
  {
    "path": "/services/crew-updates",
    "eyebrow": "SERVICE · RUN THE JOB · ADD-ON",
    "headline": "Your crew always knows where to be and what to do.",
    "intro": "Job details, access notes, client requests and last-minute changes go straight to the right cleaner's phone. No more group-chat chaos or calls at 7 am.",
    "facts": [
      {
        "label": "Fixes",
        "text": "missed details, wrong times and calls from the van"
      },
      {
        "label": "Works with",
        "text": "Jobber, Housecall Pro, Google Sheets, your calendar"
      },
      {
        "label": "Included in",
        "text": "optional add-on"
      }
    ],
    "problem": "When a client moves a time or adds a request, someone has to tell the crew. If that someone is you, it means texts and calls between your own jobs. Miss one, and the crew turns up at the wrong time or skips the fridge the client asked for.",
    "steps": [
      {
        "title": "Each cleaner gets tomorrow's jobs the evening before.",
        "body": "Addresses, times and notes."
      },
      {
        "title": "Any change goes to the right cleaner straight away.",
        "body": "The moment it's made in your booking tool."
      },
      {
        "title": "Cleaners confirm with a reply.",
        "body": "So you know they've seen it."
      }
    ],
    "example": {
      "kind": "conversation",
      "trigger": "Job changed · 8:10 am",
      "messages": [
        {
          "from": "Business (to the cleaner)",
          "text": "Maria: 14 Elm St has moved to 11 am. Side door, friendly dog. Client asked for inside the fridge."
        },
        {
          "from": "Cleaner",
          "text": "Got it, heading there after my 9 am."
        }
      ],
      "result": "Crew updated"
    },
    "benefits": [
      {
        "title": "Fewer calls from the van.",
        "body": "The details are already on their phone."
      },
      {
        "title": "Client requests actually get done.",
        "body": "Notes reach the person doing the clean."
      },
      {
        "title": "You know every change has been seen.",
        "body": "No more \"nobody told me.\""
      }
    ],
    "questions": [
      {
        "q": "Do my cleaners need an app?",
        "a": "No. Updates come by text to the phone they already use."
      },
      {
        "q": "Can I still message them myself?",
        "a": "Of course. This handles the routine updates so you're free for everything else."
      },
      {
        "q": "Is this AI?",
        "a": "No. Updates come straight from your booking tool and go to the right cleaner automatically."
      }
    ],
    "cta": {
      "heading": "How many calls does your crew make to you each day?",
      "body": "Your free 15-minute audit maps how job details reach your team and where they get lost. Available as an add-on, priced on your audit call."
    },
    "related": [
      "Ready at the Door",
      "Payment Chaser"
    ]
  },
  {
    "path": "/services/payment-reminders",
    "eyebrow": "SERVICE · GET PAID · ADD-ON",
    "headline": "Every clean paid, without the awkward chasing.",
    "intro": "Unpaid invoices get friendly reminders with a pay-now link, on a schedule you set, until they're paid. You stop being the one who has to ask.",
    "facts": [
      {
        "label": "Fixes",
        "text": "late payments and awkward chasing"
      },
      {
        "label": "Works with",
        "text": "QuickBooks, Stripe, Jobber, Housecall Pro, Xero"
      },
      {
        "label": "Included in",
        "text": "optional add-on"
      }
    ],
    "problem": "Asking a good client for money feels awkward, so it gets put off. Small unpaid invoices add up, and your cash flow takes the hit.",
    "steps": [
      {
        "title": "The reminder schedule starts when the invoice goes out.",
        "body": ""
      },
      {
        "title": "Friendly reminders with a pay-now link go out until it's paid.",
        "body": ""
      },
      {
        "title": "The moment it's paid, the reminders stop.",
        "body": ""
      }
    ],
    "example": {
      "kind": "conversation",
      "trigger": "Invoice due · 3 days ago",
      "messages": [
        {
          "from": "Business",
          "text": "Hi Greg, a quick reminder that Monday's invoice ($180) is ready. You can pay here in 30 seconds: \\[link\\]"
        },
        {
          "from": "Customer",
          "text": "Done, thanks for the reminder!"
        }
      ],
      "result": "Paid"
    },
    "benefits": [
      {
        "title": "Invoices don't sit forgotten.",
        "body": "Every one is followed up."
      },
      {
        "title": "You never send the awkward text yourself.",
        "body": "The reminders do it."
      },
      {
        "title": "You see who's paid at a glance.",
        "body": "And who hasn't."
      }
    ],
    "questions": [
      {
        "q": "Can regulars be treated differently?",
        "a": "Yes. They can get gentler reminders, or you can keep a card on file so they never see an invoice."
      },
      {
        "q": "What about commercial clients on 30-day terms?",
        "a": "Their reminders follow their terms."
      },
      {
        "q": "Is this AI?",
        "a": "No. The reminders are friendly messages you approve once, sent automatically until the invoice is paid."
      }
    ],
    "cta": {
      "heading": "How much is sitting in unpaid invoices right now?",
      "body": "Your free 15-minute audit looks at how you invoice and how long you wait to get paid. Available as an add-on, priced on your audit call."
    },
    "related": [
      "Crew Updates",
      "Recurring Booker"
    ]
  },
  {
    "path": "/services/review-requests",
    "eyebrow": "SERVICE · BRING THEM BACK · CORE",
    "headline": "More Google reviews, so more people pick you.",
    "intro": "Every client gets a short review request after their clean, and every review you receive gets an AI-drafted reply for you to approve. Your Google profile keeps growing without you remembering to ask.",
    "facts": [
      {
        "label": "Fixes",
        "text": "too few reviews, and reviews left unanswered"
      },
      {
        "label": "Works with",
        "text": "Google Business Profile, Jobber, Housecall Pro"
      },
      {
        "label": "Included in",
        "text": "our core package"
      }
    ],
    "problem": "Happy clients rarely leave a review on their own. Meanwhile, people choosing a cleaner compare star ratings and review counts before they ever call. A thin profile loses jobs to a competitor with more reviews.",
    "steps": [
      {
        "title": "After each clean, the client gets a short request.",
        "body": "With a direct link to your Google review page."
      },
      {
        "title": "One gentle reminder follows if they don't respond.",
        "body": "Then nothing more."
      },
      {
        "title": "AI drafts a reply to every new review, in your voice.",
        "body": "You approve it before it's posted."
      }
    ],
    "example": {
      "kind": "conversation",
      "trigger": "Clean completed · 4:30 pm",
      "messages": [
        {
          "from": "Business",
          "text": "Thanks for having us today, Priya! Would you take 30 seconds to tell others how we did? \\[review link\\]"
        },
        {
          "from": "Customer",
          "text": "★★★★★ \"Spotless as always!\""
        }
      ],
      "result": "New 5 star review · Reply drafted"
    },
    "benefits": [
      {
        "title": "A steady stream of new reviews.",
        "body": "Not just when you remember to ask."
      },
      {
        "title": "Every review answered.",
        "body": "Future clients notice."
      },
      {
        "title": "Asked the right way.",
        "body": "Every client, the same way, as Google's rules require."
      }
    ],
    "questions": [
      {
        "q": "Can you only ask the happy clients?",
        "a": "No, and you shouldn't. [Google's policy](https://support.google.com/contributionpolicy/answer/7400114) bans selectively asking for positive reviews, so we ask every client the same way."
      },
      {
        "q": "What about a bad review?",
        "a": "You see it straight away, with a calm, professional reply drafted for you to approve."
      },
      {
        "q": "Can I offer a discount for reviews?",
        "a": "No. Rewarding reviews breaks Google's rules too. Keep rewards for referrals instead."
      },
      {
        "q": "Is this AI?",
        "a": "Partly. The review requests are messages you approve once. The replies to your reviews are drafted by AI, and nothing is posted until you approve it."
      }
    ],
    "cta": {
      "heading": "How many reviews did you get last month?",
      "body": "Your free 15-minute audit compares your Google profile with the cleaners you're up against. Part of our core package, backed by our Pays For Itself Guarantee."
    },
    "related": [
      "Recurring Booker",
      "Referral Engine"
    ],
    "reading": "[How to get more Google reviews for your cleaning business](https://www.inventtomorrow.pro/blog/get-more-google-reviews-cleaning-business)"
  },
  {
    "path": "/services/recurring-bookings",
    "eyebrow": "SERVICE · BRING THEM BACK · CORE",
    "headline": "Turn one-time cleans into regulars.",
    "intro": "After every one-time clean, the client gets a well-timed offer to make it regular: weekly, biweekly (every two weeks) or monthly. The ones who say yes go straight into your calendar.",
    "facts": [
      {
        "label": "Fixes",
        "text": "one-time clients who never come back"
      },
      {
        "label": "Works with",
        "text": "Jobber, Housecall Pro, your calendar"
      },
      {
        "label": "Included in",
        "text": "our core package"
      }
    ],
    "problem": "You paid to win a one-time client, did a great job, and then never asked again. At a typical $120–$200 a visit, a biweekly regular is worth roughly $3,000–$5,000 a year. Every one-time client who drifts away takes that with them.",
    "steps": [
      {
        "title": "A week after a one-time clean, the client hears from you.",
        "body": "While the house still feels fresh."
      },
      {
        "title": "The message offers a regular slot.",
        "body": "Weekly, biweekly or monthly, at your recurring rate."
      },
      {
        "title": "Every yes goes into your calendar.",
        "body": "As a recurring booking."
      }
    ],
    "example": {
      "kind": "conversation",
      "trigger": "One-time clean · 1 week ago",
      "messages": [
        {
          "from": "Business",
          "text": "Hope the house still feels fresh, Tom! Want us to come back every two weeks so it stays that way?"
        },
        {
          "from": "Customer",
          "text": "Every two weeks sounds great."
        }
      ],
      "result": "New regular · Every 2 weeks"
    },
    "benefits": [
      {
        "title": "More regulars from clients you already have.",
        "body": "No new marketing needed."
      },
      {
        "title": "A steadier, more predictable calendar.",
        "body": "Easier to staff and plan."
      },
      {
        "title": "Revenue that keeps coming.",
        "body": "Long after the first clean."
      }
    ],
    "questions": [
      {
        "q": "What if they say \"not now\"?",
        "a": "They get one gentle check-in later, then nothing more unless they reply."
      },
      {
        "q": "Can I offer a recurring discount?",
        "a": "Yes. We use whatever recurring rate you set."
      },
      {
        "q": "Is this AI?",
        "a": "No. The offer is a message we write with you and you approve before it goes out."
      }
    ],
    "cta": {
      "heading": "How many one-time clients never heard from you again?",
      "body": "One new biweekly regular brings in about $4,000 a year. That's roughly a year of our retainer. Your free 15-minute audit shows how many one-time clients you could still convert. Part of our core package, backed by our Pays For Itself Guarantee."
    },
    "related": [
      "Busy Season Ready",
      "Win-Back"
    ]
  },
  {
    "path": "/services/busy-season",
    "eyebrow": "SERVICE · BRING THEM BACK · CORE",
    "headline": "Book the rush before it starts.",
    "intro": "A few weeks before spring cleaning and move-out season, your past clients get first pick of dates. Your busiest weeks fill up early, with clients you already know.",
    "facts": [
      {
        "label": "Fixes",
        "text": "peak weeks that go to whoever asks first"
      },
      {
        "label": "Works with",
        "text": "Jobber, Housecall Pro, your client list"
      },
      {
        "label": "Included in",
        "text": "our core package"
      }
    ],
    "problem": "Every spring and every moving season, demand jumps. The companies that ask their past clients first get those weeks booked early. Everyone else scrambles for whatever's left.",
    "steps": [
      {
        "title": "We plan your seasons with you.",
        "body": "Spring cleaning, summer move-outs, holiday deep cleans."
      },
      {
        "title": "Three weeks before each one, past clients get first pick of dates.",
        "body": ""
      },
      {
        "title": "Bookings land in your calendar before the rush hits.",
        "body": ""
      }
    ],
    "example": {
      "kind": "conversation",
      "trigger": "Spring rush · 3 weeks out",
      "messages": [
        {
          "from": "Business",
          "text": "Spring cleaning season is almost here. Past clients get first pick of dates. Want me to save you a spot?"
        },
        {
          "from": "Customer",
          "text": "Please! Same as last year?"
        }
      ],
      "result": "Booked before the rush"
    },
    "benefits": [
      {
        "title": "Peak weeks booked early.",
        "body": "At your full price."
      },
      {
        "title": "Past clients feel looked after.",
        "body": "First pick feels like a perk, not a sales pitch."
      },
      {
        "title": "Fewer last-minute scrambles.",
        "body": "You know how busy the rush will be before it starts, so you can staff for it."
      }
    ],
    "questions": [
      {
        "q": "Who gets these messages?",
        "a": "Only past clients who've agreed to hear from you."
      },
      {
        "q": "Does it work for other seasons?",
        "a": "Yes. Any time that's busy for you, from summer move-outs to holiday deep cleans."
      },
      {
        "q": "Is this AI?",
        "a": "No. Every seasonal message is written with you and approved before it goes out."
      }
    ],
    "cta": {
      "heading": "Is your spring already booked?",
      "body": "Your free 15-minute audit checks how many past clients you could offer first pick to before the rush. Part of our core package, backed by our Pays For Itself Guarantee."
    },
    "related": [
      "Recurring Booker",
      "Win-Back"
    ]
  },
  {
    "path": "/services/win-back",
    "eyebrow": "SERVICE · BRING THEM BACK · ADD-ON",
    "headline": "Bring back the regulars who went quiet.",
    "intro": "When a regular skips a few cleans, they get a friendly check-in with an easy way back. Often they just got busy.",
    "facts": [
      {
        "label": "Fixes",
        "text": "regulars who drift away"
      },
      {
        "label": "Works with",
        "text": "Jobber, Housecall Pro, your client list"
      },
      {
        "label": "Included in",
        "text": "optional add-on"
      }
    ],
    "problem": "Regulars rarely cancel. They just stop booking. By the time you notice, they've been gone for months, and some have found someone else.",
    "steps": [
      {
        "title": "We spot regulars who've gone past their usual gap.",
        "body": "Based on their booking history."
      },
      {
        "title": "They get a short check-in.",
        "body": "With their usual slot offered."
      },
      {
        "title": "If something went wrong, the reply comes to you.",
        "body": "So you can put it right."
      }
    ],
    "example": {
      "kind": "conversation",
      "trigger": "Last clean · 9 weeks ago",
      "messages": [
        {
          "from": "Business",
          "text": "Hi Tom, it's been a while! Want us to book you back in? Your usual Thursday slot is open next week."
        },
        {
          "from": "Customer",
          "text": "Yes please, life got busy!"
        }
      ],
      "result": "Back on the calendar · Every 2 weeks"
    },
    "benefits": [
      {
        "title": "Lost regulars come back.",
        "body": "Before they're gone for good."
      },
      {
        "title": "You hear about problems.",
        "body": "Ones you'd never have known about."
      },
      {
        "title": "Less of your recurring revenue leaks away.",
        "body": "Quietly, month after month."
      }
    ],
    "questions": [
      {
        "q": "How is this different from Quote Revival?",
        "a": "Quote Revival is for people who never booked. Win-Back is for clients who did book, then stopped."
      },
      {
        "q": "When does it send?",
        "a": "After whatever gap you choose, for example two or three missed cleans."
      },
      {
        "q": "Is this AI?",
        "a": "No. The check-in is a message you approve once, sent automatically when a regular goes quiet."
      }
    ],
    "cta": {
      "heading": "How many regulars have you lost without noticing?",
      "body": "Your free 15-minute audit finds the clients who've gone quiet and what they used to be worth. Available as an add-on, priced on your audit call."
    },
    "related": [
      "Recurring Booker",
      "Quote Revival"
    ]
  },
  {
    "path": "/services/referral-program",
    "eyebrow": "SERVICE · BRING THEM BACK · ADD-ON",
    "headline": "Your best clients, bringing you more like them.",
    "intro": "Once a client has been with you a while, they're invited to pass you on, with a reward for both sides when a referral books. It's tracked, thanked and run for you.",
    "facts": [
      {
        "label": "Fixes",
        "text": "word of mouth you never ask for"
      },
      {
        "label": "Works with",
        "text": "Jobber, Housecall Pro, Stripe"
      },
      {
        "label": "Included in",
        "text": "optional add-on"
      }
    ],
    "problem": "Your happiest clients would recommend you if you asked. Most cleaning companies never ask, so referrals only happen by luck. Referred clients tend to trust you from day one.",
    "steps": [
      {
        "title": "After a client's third clean, they get a short invite.",
        "body": "To refer a friend."
      },
      {
        "title": "Their friend gets a simple way to book.",
        "body": "The referral is tracked automatically."
      },
      {
        "title": "When the referral books, both get the thank-you you set.",
        "body": "Like money off their next clean."
      }
    ],
    "example": {
      "kind": "conversation",
      "trigger": "3rd clean completed · 2:00 pm",
      "messages": [
        {
          "from": "Business",
          "text": "So glad you're enjoying your cleans, Ana! Know anyone who'd love the same? If they book, you both get \\[$25\\] off."
        },
        {
          "from": "Customer",
          "text": "My sister's been looking. Sending her your number!"
        }
      ],
      "result": "Referral booked"
    },
    "benefits": [
      {
        "title": "New clients who already trust you.",
        "body": "Because a friend sent them."
      },
      {
        "title": "Every referral tracked and thanked.",
        "body": "Nothing to remember."
      },
      {
        "title": "Your best clients feel appreciated.",
        "body": "And stay longer."
      }
    ],
    "questions": [
      {
        "q": "What reward should I offer?",
        "a": "Money off the next clean works well because it brings both clients back. You choose the amount."
      },
      {
        "q": "Can I reward clients for reviews too?",
        "a": "No. Keep rewards for referrals only. Rewarding reviews breaks Google's rules."
      },
      {
        "q": "Is this AI?",
        "a": "No. The invites and thank-yous are messages you approve once, and referrals are tracked automatically."
      }
    ],
    "cta": {
      "heading": "Who would your best clients send you?",
      "body": "Your free 15-minute audit shows how many of your clients are ready to be asked. Available as an add-on, priced on your audit call."
    },
    "related": [
      "5 Star Engine",
      "Recurring Booker"
    ]
  }
];
