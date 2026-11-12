import {
  CalendarCheck, CalendarRange, CreditCard, DoorOpen, Headset, Inbox,
  MessageCircle, PhoneMissed, Repeat, RotateCcw, Send, Star, Users, UserRoundPlus, Zap,
} from 'lucide-react';

const ICONS = {
  '24/7 Receptionist': Headset,
  'Missed Call Rescue': PhoneMissed,
  '60 Second Response': Zap,
  'Always-On Chat': MessageCircle,
  'Instant Price & Book': CalendarCheck,
  'One Inbox': Inbox,
  'Quote Chaser': Send,
  'Quote Revival': RotateCcw,
  'Ready at the Door': DoorOpen,
  'Crew Updates': Users,
  'Payment Chaser': CreditCard,
  '5 Star Engine': Star,
  'Recurring Booker': Repeat,
  'Busy Season Ready': CalendarRange,
  'Win-Back': RotateCcw,
  'Referral Engine': UserRoundPlus,
};

export function ServiceIcon({ title, className = 'size-6' }: { title: string; className?: string }) {
  const Icon = ICONS[title as keyof typeof ICONS] ?? Zap;
  return <Icon className={className} strokeWidth={1.5} aria-hidden="true" />;
}
