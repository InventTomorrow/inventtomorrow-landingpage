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
    a: 'Yes. We write them around your services, prices and tone, and nothing goes out until you approve it.',
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
    a: 'Founding clients pay $1,500 to set up (or two payments of $750) and $345 a month, locked for life. There are 5 founding spots, closing on 15 January 2027 or when all 5 are taken.',
  },
  {
    q: 'What happens if something stops working?',
    a: 'Monitoring and support are defined in your service agreement, including how issues are reported and resolved.',
  },
  {
    q: 'Do I have to learn new software?',
    a: 'No. We work inside the tools you already use.',
  },
  {
    q: 'How fast will I see results?',
    a: 'Missed calls and new enquiries get replies from the day you go live. Quote Revival starts sending that same day. We agree your setup timeline before work begins. The guarantee is measured at day 90.',
  },
  {
    q: "What if it doesn't work?",
    a: "You're covered by the Pays For Itself Guarantee. If the cleans we book you in 90 days don't add up to more than you've paid us, you pay no monthly fee until they do. The full terms are in your agreement.",
  },
  {
    q: 'Am I locked into a contract?',
    a: "No. After setup it's month to month. You stay because it books you cleans.",
  },
];

const pick = (...questions: string[]) => questions.map((q) => ALL_FAQS.find((f) => f.q === q)!);

// The short list on the home page.
export const HOME_FAQS: Faq[] = pick(
  'How much does it cost?',
  "What if it doesn't work?",
  'How fast will I see results?',
  'Will the messages sound like my business?',
  'Do I have to learn new software?',
  'Am I locked into a contract?',
);
