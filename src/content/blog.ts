export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  // An example text message, shown as a chat bubble
  | { type: 'message'; text: string };

export interface Post {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string; // ISO date
  image: { src: string; alt: string; width: number; height: number };
  body: Block[];
}

export const POSTS: Post[] = [
  {
    slug: 'missed-calls-cleaning-business',
    title: 'What to do when you miss a call in the middle of a clean',
    description:
      "You can't answer the phone with gloves on. Here's a simple way to make sure a missed call still turns into a booked job.",
    category: 'Missed calls',
    image: {
      src: '/images/blog/missed-calls.webp',
      alt: 'Blue-gloved hands wiping a desk beside a laptop and cleaning spray.',
      width: 640,
      height: 400,
    },
    date: '2026-10-27',
    body: [
      {
        type: 'p',
        text: "Every cleaning business owner knows the moment. The phone buzzes while you're halfway through a bathroom. You can't stop, and by the time you call back, the caller has often moved on to the next business on their list.",
      },
      {
        type: 'p',
        text: "You don't need to answer every call live. You need to make sure nobody who calls you is left waiting.",
      },
      { type: 'h2', text: 'A missed call is a customer who was ready' },
      {
        type: 'p',
        text: 'Someone who picks up the phone usually wants to book. They have a date in mind, a move-out deadline or guests arriving this weekend. A web form can sit for an hour. A caller is comparing options right now, and if nobody answers, the easiest thing for them to do is call the next number.',
      },
      { type: 'h2', text: 'Reply in minutes, not hours' },
      {
        type: 'p',
        text: "A short text sent right after the missed call does most of the work. It tells the caller they've reached a real business, and it gives them an easy way to keep going without waiting for you to finish the job.",
      },
      { type: 'h2', text: 'What a good missed-call text looks like' },
      {
        type: 'ul',
        items: [
          'Say who you are, so they know the text is from the business they called.',
          "Explain why you didn't answer. \"We're on a job\" is honest and reassuring.",
          'Ask one easy question they can answer in a few words.',
          'Keep it short enough to read on a lock screen. No price lists, no links to forms.',
        ],
      },
      {
        type: 'message',
        text: "Hi, it's Bright Home Cleaning. Sorry we missed your call, we're on a job right now. What kind of clean are you looking for, and when?",
      },
      { type: 'h2', text: 'Pick the conversation up with an answer' },
      {
        type: 'p',
        text: 'When you get a break, you already know what they need. Reply with available times or a rough quote instead of "How can I help?" Every message that moves things forward makes it easier for them to say yes.',
      },
      { type: 'h2', text: 'Make it automatic' },
      {
        type: 'p',
        text: "You can do this by hand with a saved reply on your phone, but it's easy to forget on a busy day. Many business phone apps can send a text automatically after a missed call. Our Missed Call Rescue does exactly that, written in your voice and approved by you before it goes live.",
      },
      {
        type: 'p',
        text: 'Start with one change this week: make sure every caller hears back from you within a few minutes, even when you can\'t pick up.',
      },
    ],
  },
  {
    slug: 'follow-up-on-cleaning-quotes',
    title: 'How to follow up on a cleaning quote without being pushy',
    description:
      "Most quotes don't get a no. They get forgotten. Here's a simple, friendly follow-up plan you can start using today.",
    category: 'Quotes',
    image: {
      src: '/images/blog/quote-follow-ups.webp',
      alt: 'Two cleaning professionals checking a mobile device together.',
      width: 640,
      height: 400,
    },
    date: '2026-10-27',
    body: [
      {
        type: 'p',
        text: "You walk the house, send a fair price, and then hear nothing. It's tempting to read the silence as a no. Usually it isn't. People get busy, the email gets buried, or they meant to ask a question and never got around to it.",
      },
      {
        type: 'p',
        text: 'A polite follow-up is not pushy. It is good service. It reminds the customer you are ready when they are.',
      },
      { type: 'h2', text: 'A simple follow-up plan' },
      {
        type: 'ol',
        items: [
          'Same day: send the quote by text as well as email, with one line on what is included.',
          'Two days later: a short check-in asking if they have any questions.',
          'About a week later: offer a specific date you have open.',
          'Two weeks later: a friendly last note that leaves the door open.',
        ],
      },
      { type: 'h2', text: 'What to say' },
      { type: 'p', text: 'Keep each message short and make it easy to reply. A few examples:' },
      { type: 'message', text: 'Hi Jen, just checking you got the quote for your deep clean. Any questions I can answer?' },
      {
        type: 'message',
        text: "Hi Jen, we've had an opening come up next Thursday morning. Would you like me to hold it for your deep clean?",
      },
      {
        type: 'message',
        text: "Hi Jen, I won't keep messaging, but your quote is here whenever you're ready. Just reply to this text and we'll find you a time.",
      },
      { type: 'h2', text: 'What not to do' },
      {
        type: 'ul',
        items: [
          "Don't cut your price in the first follow-up. Answer questions first.",
          "Don't send the same message twice. Each one should add something: an answer, a date, a reminder of what's included.",
          "Don't make people feel guilty for not replying.",
          'Stop as soon as they say no, and thank them.',
        ],
      },
      { type: 'h2', text: "Don't forget your old quotes" },
      {
        type: 'p',
        text: 'Quotes from months ago are still worth a message, especially before busy seasons like spring cleaning or the end of a school term. A short "We have openings next week, still interested?" can bring back customers who simply forgot.',
      },
      {
        type: 'p',
        text: 'This is what our Quote Chaser and Quote Revival do: every estimate gets followed up, and old quotes get a second chance, without you having to remember who to message.',
      },
    ],
  },
  {
    slug: 'get-more-google-reviews-cleaning-business',
    title: 'How to get more Google reviews for your cleaning business',
    description:
      'Happy clients rarely leave a review on their own. Here is when to ask, what to say, and what to avoid.',
    category: 'Reviews',
    image: {
      src: '/images/blog/google-reviews.webp',
      alt: 'Hands holding a card inviting customers to leave a Google review.',
      width: 640,
      height: 400,
    },
    date: '2026-10-27',
    body: [
      {
        type: 'p',
        text: "Reviews are often the first thing a new customer looks at before they call. Most of your happy clients would leave one if you asked. They just don't think of it on their own.",
      },
      { type: 'h2', text: 'Ask at the right moment' },
      {
        type: 'p',
        text: 'The best time to ask is the same day, soon after the clean, while the house still looks its best and the customer is enjoying it. A week later, the moment has passed.',
      },
      { type: 'h2', text: 'Make it one tap' },
      {
        type: 'p',
        text: 'Send your direct review link, not your website or a search for your business name. You can copy a link to your review form from your Google Business Profile. The fewer steps, the more reviews you get.',
      },
      {
        type: 'message',
        text: 'Thanks for having us today, Priya! If you have a minute, a quick review really helps a small business like ours. Here is the link.',
      },
      { type: 'h2', text: 'Ask every customer' },
      {
        type: 'p',
        text: "Ask everyone, not only the clients you expect to be delighted. Google's review rules don't allow offering discounts or gifts in exchange for reviews, or asking only the customers you think will be happy. A steady flow of honest reviews is also more convincing than a handful of perfect ones.",
      },
      { type: 'h2', text: 'Reply to every review' },
      {
        type: 'ul',
        items: [
          'Thank people by name for good reviews and mention the job if you can.',
          'Reply calmly to critical reviews, say what you will do about it, and offer to talk directly.',
          'Future customers read your replies too. They show how you treat people.',
        ],
      },
      { type: 'h2', text: 'Make it a habit' },
      {
        type: 'p',
        text: "The businesses with the most reviews aren't always the best. They're the ones that ask every time. Our 5 Star Engine sends a review request after every clean, so asking never depends on remembering at the end of a long day.",
      },
    ],
  },
];

export function readMinutes(post: Post) {
  const words = post.body
    .flatMap((b) => ('text' in b ? [b.text] : b.items))
    .join(' ')
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
