export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: string;
}

// Temporarily hide LinkedIn across team cards and brand social buttons.
export const SHOW_LINKEDIN_LINKS = false;

// Brand profiles shared by the top bar, footer and side panel.
export const SOCIAL_LINKS: SocialLink[] = [
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/company/inventtomorrow', icon: '/social/linkedin.svg' },
  { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61595906557583', icon: '/social/facebook.svg' },
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/invent.tomorrow.marketing/', icon: '/social/instagram.svg' },
].filter(({ id }) => SHOW_LINKEDIN_LINKS || id !== 'linkedin');
