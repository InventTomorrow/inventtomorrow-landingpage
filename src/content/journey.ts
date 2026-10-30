import {
  MessageSquareText,
  FileText,
  CalendarCheck,
  Users,
  CreditCard,
  Repeat,
  type LucideIcon,
} from 'lucide-react';

export interface JourneyStage {
  title: string;
  text: string;
  points: string[];
  icon: LucideIcon;
}

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    title: 'Inquiries answered',
    text: "Give potential customers a clear next step while you're on a job.",
    points: ['Capture customer details', 'Send a prompt first reply', 'Bring questions to your team'],
    icon: MessageSquareText,
  },
  {
    title: 'Quotes followed up',
    text: 'Keep interested customers from becoming forgotten conversations.',
    points: ['Send timely reminders', 'Track replies', 'Stop chasing once they decide'],
    icon: FileText,
  },
  {
    title: 'Bookings confirmed',
    text: 'Help customers know what to expect before you arrive.',
    points: ['Confirm appointments', 'Send preparation instructions', 'Remind customers before the job'],
    icon: CalendarCheck,
  },
  {
    title: 'Teams informed',
    text: 'Make the next job easier to prepare for.',
    points: ['Share addresses and access details', 'Pass on customer requests', 'Keep job updates together'],
    icon: Users,
  },
  {
    title: 'Payments followed up',
    text: 'Keep outstanding invoices moving without sending every reminder yourself.',
    points: ['Send reminders on your schedule', 'Track payment updates where supported', 'Flag anything that needs attention'],
    icon: CreditCard,
  },
  {
    title: 'Customers brought back',
    text: 'Keep in touch beyond the first job.',
    points: ['Ask for feedback and reviews', 'Send repeat booking reminders', 'Reconnect with past customers'],
    icon: Repeat,
  },
];
