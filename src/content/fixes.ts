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
import { SERVICE_IMAGES } from './serviceImages';

export interface Scene {
  trigger: string;
  triggerIcon: LucideIcon;
  messages: { from: 'us' | 'them'; text: string }[];
  result: string;
}

export interface Fix {
  title: string;
  problemTitle: string;
  image: { src: string; alt: string };
  text: string;
  icon: LucideIcon;
  scene: Scene;
}

// Each automation comes with a short example conversation so visitors can see what it actually does.
export const FIXES: Fix[] = [
  {
    title: 'Quote Revival',
    problemTitle: 'Cold Quotes',
    image: SERVICE_IMAGES['/services/quote-revival'],
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
    problemTitle: 'Missed Calls',
    image: SERVICE_IMAGES['/services/missed-call-rescue'],
    text: 'Every missed call gets a text in seconds.',
    icon: PhoneCall,
    scene: {
      trigger: 'Missed call · 2:14 pm',
      triggerIcon: PhoneMissed,
      messages: [
        { from: 'us', text: 'Sorry we missed you! This is Bright Home Cleaning. What can we help with?' },
        { from: 'them', text: 'Looking for a move out clean on the 28th.' },
      ],
      result: 'Replied in 5 seconds',
    },
  },
  {
    title: '60 Second Response',
    problemTitle: 'Late Replies',
    image: SERVICE_IMAGES['/services/60-second-response'],
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
    problemTitle: 'Missed Follow Ups',
    image: SERVICE_IMAGES['/services/quote-chaser'],
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
    title: '5 Star Engine',
    problemTitle: 'Too Few Reviews',
    image: SERVICE_IMAGES['/services/review-requests'],
    text: 'A review request after every clean.',
    icon: Star,
    scene: {
      trigger: 'Clean completed · 4:30 pm',
      triggerIcon: CheckCircle2,
      messages: [
        { from: 'us', text: 'Thanks for having us today, Priya! If you’re happy with the clean, would you leave us a quick review?' },
        { from: 'them', text: '★★★★★ “Spotless as always!”' },
      ],
      result: 'New 5 star review',
    },
  },
  {
    title: 'Busy Season Ready',
    problemTitle: 'Seasonal Booking Gaps',
    image: SERVICE_IMAGES['/services/busy-season'],
    text: 'First to every customer during spring cleaning and move out rushes.',
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
    problemTitle: 'No Repeat Bookings',
    image: SERVICE_IMAGES['/services/recurring-bookings'],
    text: 'One time clients become weekly and monthly regulars.',
    icon: Repeat,
    scene: {
      trigger: 'One time clean · 1 week ago',
      triggerIcon: Sparkles,
      messages: [
        { from: 'us', text: 'Hope the house still feels fresh, Tom! Want us to come back every two weeks so it stays that way?' },
        { from: 'them', text: 'Every two weeks sounds great.' },
      ],
      result: 'New regular · Every 2 weeks',
    },
  },
];
