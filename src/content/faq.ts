export interface Faq {
  q: string;
  a: string;
}

// The full list, shown on the FAQ page. The first nine come from the original site.
export const ALL_FAQS: Faq[] = [
  {
    q: 'What can your system handle?',
    a: 'Inquiry replies, quote follow ups, appointment reminders, team updates, payment reminders and messages after a job. Your audit helps identify the right starting point.',
  },
  {
    q: 'Will it work with my current tools?',
    a: 'Wherever possible. Compatibility is checked before work begins, and any additional tools are discussed with you.',
  },
  {
    q: 'Will the messages sound like my business?',
    a: 'Yes. The wording is prepared around your services and tone. You approve the messages and their timing before they go live.',
  },
  {
    q: 'What if a customer needs to speak to someone?',
    a: 'Your system can notify your team and hand over the conversation. We agree on when a person should step in during setup.',
  },
  {
    q: 'Can I start with just one process?',
    a: 'Yes. Start with the task taking up the most time or the follow up most likely to be missed.',
  },
  {
    q: 'Will my team know what to do?',
    a: 'Your team receives guidance on where to find updates, what the system handles and what still needs their attention.',
  },
  {
    q: 'How long does it take to get started?',
    a: 'That depends on your tools and the processes involved. You receive an agreed scope and timeline before work begins.',
  },
  {
    q: 'How much does it cost?',
    a: 'Pricing depends on what your system needs to handle and the ongoing support required. You receive a clear price before work begins.',
  },
  {
    q: 'What happens if something stops working?',
    a: 'Monitoring and support are defined in your service agreement, including how issues are reported and resolved.',
  },
  {
    q: 'Do I have to learn new software?',
    a: 'No. We set it up and run it. You keep using the tools you already have.',
  },
  {
    q: 'How fast will I see results?',
    a: 'Missed Call Rescue works from the day we switch it on. Quote Revival is built to book cleans within 14 days.',
  },
  {
    q: "What if it doesn't work?",
    a: "That's what the 90 day guarantee is for. If we don't book jobs that cover our fee within 90 days, we keep working for free until we do.",
  },
  {
    q: 'Am I locked into a contract?',
    a: "No. It's month to month. Pause or cancel any time.",
  },
];

const pick = (...questions: string[]) => questions.map((q) => ALL_FAQS.find((f) => f.q === q)!);

// The short list on the home page.
export const HOME_FAQS: Faq[] = pick(
  'Will the messages sound like my business?',
  'Do I have to learn new software?',
  'Will it work with my current tools?',
  'How fast will I see results?',
  "What if it doesn't work?",
  'Am I locked into a contract?',
);
