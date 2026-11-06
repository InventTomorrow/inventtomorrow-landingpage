import { Facebook, Instagram, Linkedin, LucideIcon } from 'lucide-react';

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: LucideIcon;
}

// Brand profiles shared by the top bar, footer and side panel.
export const SOCIAL_LINKS: SocialLink[] = [
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/company/inventtomorrow', icon: Linkedin },
  { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61595906557583', icon: Facebook },
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/invent.tomorrow.marketing/', icon: Instagram },
];
