export interface TeamMember {
  name: string;
  role: string;
  // Path under /public, e.g. "/images/team/founder.webp" (800 × 1000 px, portrait). Leave out to show a placeholder.
  image?: string;
  linkedin?: string;
}

export interface TeamTier {
  // Small label above the row. Rows are shown top to bottom in this order.
  label: string;
  members: TeamMember[];
}

// Listed by hierarchy: the first tier sits at the top of the section, the last at the bottom.
// Add each person's photo path in `image`.
export const TEAM_TIERS: TeamTier[] = [
  {
    label: 'Leadership',
    members: [
      {
        name: 'Abdul Hadi',
        role: 'Founder & CEO',
        image: '/images/team/abdul-hadi-office.png',
        linkedin: 'https://www.linkedin.com/in/abdul-haadi-ai-specialist/',
      },
      {
        name: 'Tabish Almas',
        role: 'Cofounder & CTO',
        image: '/images/team/tabish-almas-upscaled.png',
        linkedin: 'https://www.linkedin.com/in/tabish-ai-specialist/',
      },
    ],
  },
  {
    label: 'Team',
    members: [
      {
        name: 'Rehan Shoukat',
        role: 'Head of Client Acquisition',
        image: '/images/team/rehan-shoukat-upscaled.png',
        linkedin: 'https://www.linkedin.com/in/malik-rehan-3a16973a6/',
      },
      {
        name: 'Dawood Shahid',
        role: 'AI Automation Engineer',
        image: '/images/team/dawood-shahid-portrait.jpg',
      },
      {
        name: 'Abdul Waheed',
        role: 'Website Developer',
        image: '/images/team/abdul-waheed-portrait.png',
        linkedin: 'https://www.linkedin.com/in/abdulwaheed16/',
      },
      {
        name: 'Qaiser Nawaz',
        role: 'Meta Ads Expert',
        image: '/images/team/qaiser-nawaz-office.png',
        linkedin: 'https://www.linkedin.com/in/qaiser-nawaz-seo/',
      },
    ],
  },
];
