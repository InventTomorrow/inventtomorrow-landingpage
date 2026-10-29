import { Facebook, Instagram, Linkedin, LucideIcon } from 'lucide-react';

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: LucideIcon;
}

// Replace each url with the real profile link.
export const SOCIAL_LINKS: SocialLink[] = [
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/', icon: Linkedin },
  { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/', icon: Facebook },
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/', icon: Instagram },
];
