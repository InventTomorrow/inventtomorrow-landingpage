// Approved copy from the supplied card and detail implementation briefs.
// Setup facts and historical figures are separate from documented campaign outcomes.

export interface CaseStudyMetric {
  value: string;
  label: string;
}

export interface CaseStudyBlurb {
  title: string;
  description: string;
}

export interface CaseStudyDetails {
  seoTitle: string;
  seoDescription: string;
  title: string;
  intro: string;
  facts: CaseStudyMetric[];
  comparisons?: { before: string; after: string }[];
  challenge: {
    title: string;
    paragraphs: string[];
    context?: { label: string; description: string; note: string };
  };
  diagnosis?: { title: string; findings: CaseStudyBlurb[]; transition: string };
  solution: { title: string; groups: { title: string; paragraphs: string[] }[] };
  workflow?: {
    title: string;
    enquiries: { title: string; steps: string[]; note: string };
    quotes: { title: string; steps: string[]; accepted: string; pending: string[] };
  };
  outcomes: { title: string; intro: string; items: CaseStudyBlurb[] };
  tools: { title: string; items: CaseStudyBlurb[]; sources: string };
  cta: { title: string; body: string; primaryLabel: string };
}

export interface CaseStudy {
  slug: string;
  title: string;
  summary: string;
  category: string;
  client: { name: string; type: string; location?: string; team?: string };
  // Documented campaign outcomes and labelled baselines only; never setup counts.
  metrics: CaseStudyMetric[];
  challenge: string[];
  solution: string[];
  results: string[];
  quote?: { text: string; name: string; role: string };
  tools: string[];
  image?: { src: string; coverSrc?: string; alt: string; caption?: string };
  // Optional additions keep existing case study data and templates compatible.
  preview?: { eyebrow: string; scope: string[]; ctaLabel: string };
  details?: CaseStudyDetails;
  isPublished?: boolean;
  isReal?: boolean;
}

const JUST_ABOUT_CLEANING_DETAILS: CaseStudyDetails = {
  seoTitle: 'Just About Cleaning CRM Rebuild | Invent Tomorrow',
  seoDescription: 'See how Invent Tomorrow rebuilt Just About Cleaning\'s lead capture, quote tracking, and follow up workflows using GoHighLevel and Xero.',
  title: 'How We Rebuilt Lead and Quote Follow Up for Just About Cleaning',
  intro: 'Leads were getting lost and quotes went unchased. We rebuilt Just About Cleaning\'s CRM to capture contact details, route enquiries, and automate follow ups.',
  facts: [
    {
      label: 'Industry',
      value: 'Residential & commercial cleaning'
    },
    {
      label: 'Focus',
      value: 'Lead capture, CRM pipelines & quote follow up'
    },
    {
      label: 'Platforms',
      value: 'GoHighLevel & Xero'
    }
  ],
  comparisons: [
    {
      before: 'Some Facebook/Instagram leads were asked to complete a form before contact details were captured.',
      after: 'Name, email, and phone are requested first, and the lead is surfaced in the pipeline.'
    },
    {
      before: 'Staff had to choose tags manually to route phone, Bark, and other leads.',
      after: 'A manual entry flow routes clients and contractors, with a way to avoid duplicate welcome messages.'
    },
    {
      before: 'Quoted but undecided residential leads had no dedicated pipeline stage.',
      after: 'A dedicated stage for chasing sent quotes makes these opportunities visible to the team.'
    },
    {
      before: 'Old sent quotes had follow up switched off.',
      after: 'Follow up for the old backlog was reactivated with a delay before chasing.'
    }
  ],
  challenge: {
    title: 'Leads Were Coming In. Follow Ups Were Falling Through.',
    paragraphs: [
      'Just About Cleaning received enquiries through Facebook, Instagram, Bark, and phone calls. But the process for getting those leads into the right pipeline relied heavily on staff choosing tags and remembering the next step. Some leads ended up in the wrong place, and others were not ready to contact.',
      'Quotes had similar gaps. Residential customers who had received an estimate but hadn\'t made a decision had no clear follow up stage. Quote activity from two separate Xero logins wasn\'t consistently covered by the existing workflow, and older quotes were sitting in a backlog with follow ups turned off.'
    ],
    context: {
      label: 'A gap we found:',
      description: 'In one reported month, approximately $1,000 in Facebook advertising generated 10 leads, but zero calls and zero completed forms. The bot directed people to a form before capturing their contact details.',
      note: 'Historical campaign snapshot from the project brief; it does not measure performance after the rebuild.'
    }
  },
  diagnosis: {
    title: 'Where the Existing Process Was Breaking Down',
    findings: [
      {
        title: 'Contact details came too late.',
        description: 'Social enquiries could be redirected to a form before the team had a name, email, or phone number to use for follow up.'
      },
      {
        title: 'Routing relied on memory.',
        description: 'Staff selected tags decided where incoming leads went, creating opportunities for mistakes and missed handoffs.'
      },
      {
        title: 'Quote tracking had blind spots.',
        description: 'There was no dedicated stage for undecided residential quotes, and the Xero related follow up did not cover all relevant activity consistently.'
      },
      {
        title: 'Older opportunities were left idle.',
        description: 'The previous follow up sequence for old quotes had been turned off, leaving an unattended backlog.'
      }
    ],
    transition: 'The fix wasn\'t to give the team another tool to check. It was to make their existing process clearer and more reliable.'
  },
  solution: {
    title: 'A Clearer System for Every Lead and Quote',
    groups: [
      {
        title: 'Capture and route enquiries',
        paragraphs: [
          'We restructured the residential and commercial pipelines in GoHighLevel and added a visible Partially Filled stage for incomplete enquiries.',
          'We also built a manual lead entry form that routes clients and contractors without requiring staff to pick tags. For leads the team had already spoken to, the form can suppress an unnecessary welcome message.',
          'Facebook and Instagram intake now asks for a name, email, and phone number before sending a form, making leads visible and contactable in the pipeline.'
        ]
      },
      {
        title: 'Keep quoted leads moving',
        paragraphs: [
          'We added a dedicated quote chase stage between Qualifying and Ready to Book.',
          'We improved Xero contact matching by business name so follow up activity can find the appropriate contact.',
          'We also connected the three documented quote acceptance routes: the client accepts, a staff member accepts, or a staff member moves the pipeline card.'
        ]
      },
      {
        title: 'Restart and maintain follow up',
        paragraphs: [
          'We reactivated follow up for older sent quotes, with a delay before those reminders begin.',
          'Beyond the initial four week chase, the system continues follow up at roughly two week intervals. If a lead replies, the automated sequence stops so the team can continue the conversation.'
        ]
      }
    ]
  },
  workflow: {
    title: 'How the Follow Up Process Works Now',
    enquiries: {
      title: 'New enquiries',
      steps: [
        'Facebook / Instagram enquiry',
        'Contact details requested first',
        'Lead appears in the CRM pipeline',
        'Team can contact and qualify the enquiry'
      ],
      note: 'Phone and Bark leads use the separate manual entry flow, which handles routing without staff choosing tags.'
    },
    quotes: {
      title: 'Quotes and follow ups',
      steps: [
        'Quote is sent / tracked',
        'Lead and quote state are mapped in the CRM'
      ],
      accepted: 'status is updated through one of three routes',
      pending: [
        'follow up sequence continues',
        'After the initial chase → roughly every two weeks',
        'When the lead replies → automated messages stop'
      ]
    }
  },
  outcomes: {
    title: 'Less Guesswork. Better Visibility. More Consistent Follow Up.',
    intro: 'The rebuild changed how enquiries and quotes move through the business. These are operational improvements delivered, not claims about financial results after launch.',
    items: [
      {
        title: 'More contactable enquiries.',
        description: 'Facebook and Instagram intake captures basic contact details before the remaining form process.'
      },
      {
        title: 'Less manual routing.',
        description: 'New leads can be placed into the right workflow without relying on staff to remember the correct tag.'
      },
      {
        title: 'Clearer quote tracking.',
        description: 'Quoted but undecided leads have a visible place in the pipeline, and acceptance can be handled through the three documented routes.'
      },
      {
        title: 'Old quotes back in follow up.',
        description: 'The previously idle backlog is included in a scheduled sequence, with replies stopping further automated chasing.'
      }
    ]
  },
  tools: {
    title: 'Tools Used in the Rebuild',
    items: [
      {
        title: 'GoHighLevel',
        description: 'CRM pipelines, intake, and follow up workflows'
      },
      {
        title: 'Xero',
        description: 'contacts and quote related mapping'
      },
      {
        title: 'Facebook & Instagram',
        description: 'social lead intake'
      }
    ],
    sources: 'Other enquiry sources included Bark and phone calls.'
  },
  cta: {
    title: 'Where Are Your Leads Getting Stuck?',
    body: 'If you\'re getting enquiries but struggling to keep track of quotes, callbacks, or follow ups, we\'ll look at your current process and show you where the gaps are.',
    primaryLabel: 'Run My Free Audit'
  }
};

const OLD_LEADS_RECOVERY_DETAILS: CaseStudyDetails = {
  seoTitle: 'Old Leads Recovery: 18 Jobs from 200 Leads | Invent Tomorrow',
  seoDescription: 'How CRM pipelines and automated email follow ups helped a cleaning business close 18 jobs from 200 old leads, a 9% conversion rate.',
  title: 'How 200 Old Leads Became 18 Closed Jobs',
  intro: 'Old enquiries sat untouched. We built a clear CRM pipeline and automated email follow ups to help a cleaning business restart conversations and close 18 jobs.',
  facts: [
    { label: 'Industry', value: 'Cleaning services' },
    { label: 'Focus', value: 'Lead reactivation & revenue recovery' },
    { label: 'System', value: 'CRM pipeline & automated email sequencing' },
  ],
  challenge: {
    title: 'An Old Lead List. No Clear Next Step.',
    paragraphs: [
      'Around 200 old leads sat in the database with little to no active follow up. These were people who had already shown interest, but there was no structured way to restart the conversation.',
      'Follow up relied on manual effort and scattered notes. The team could not easily separate contacted leads, engaged leads, warm opportunities, and closed jobs, or see where each enquiry stood.',
    ],
  },
  solution: {
    title: 'A Repeatable Way to Reconnect With Old Leads',
    groups: [
      {
        title: 'Rebuilt the lead pipeline',
        paragraphs: ['We organized the recovery process into clear stages so the team could see exactly where each old lead stood. This made it easier to work the list in a structured way rather than handling follow up randomly.'],
      },
      {
        title: 'Created a reactivation sequence',
        paragraphs: ['We set up automated email sequencing to reconnect with old leads over time. This gave each lead a fresh opportunity to respond without relying on the team to send every message manually.'],
      },
      {
        title: 'Improved lead tracking',
        paragraphs: ['The system made it easier to identify who had replied, who showed interest, who needed another touchpoint, and who was ready to move forward.'],
      },
      {
        title: 'Reduced manual chasing',
        paragraphs: ['Instead of relying on memory or scattered notes, the team could use the CRM to manage progress and focus their attention on active opportunities.'],
      },
      {
        title: 'Built a repeatable recovery process',
        paragraphs: ['The workflow was designed not just as a one time campaign, but as a reusable system the business could use again for future dormant leads.'],
      },
    ],
  },
  outcomes: {
    title: '18 Closed Jobs from Leads Already in the Database',
    intro: 'The campaign closed 18 jobs from 200 old leads: a 9% conversion rate. The value came from existing opportunities, alongside a clearer process for future follow up.',
    items: [
      {
        title: 'New work from old enquiries.',
        description: 'Past enquiries generated closed jobs instead of remaining untouched in the database.',
      },
      {
        title: 'Clearer lead progress.',
        description: 'The team could track who had replied, who showed interest, and who was ready to move forward.',
      },
      {
        title: 'Less manual chasing.',
        description: 'Automated email follow ups reduced the need to send every message manually.',
      },
      {
        title: 'A reusable recovery process.',
        description: 'The workflow gives future dormant leads a structured path back into an active conversation.',
      },
    ],
  },
  tools: {
    title: 'Tools in This Setup',
    items: [
      { title: 'CRM pipeline', description: 'Lead stages, reply tracking, and opportunity visibility' },
      { title: 'Automated email sequencing', description: 'Scheduled reactivation and follow up messages' },
    ],
    sources: 'The system works with enquiries already in the business database.',
  },
  cta: {
    title: 'What Could Your Old Leads Be Worth?',
    body: 'Old enquiries may still hold opportunity. We can help you organize your database and build a follow up process that gives those leads another chance.',
    primaryLabel: 'Run My Free Audit',
  },
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'just-about-cleaning-crm-automation-rebuild',
    title: 'Just About Cleaning: Fixing Lead and Quote Follow Up',
    summary: 'Leads were coming in, but some never reached the right place and quotes went unchased. We rebuilt the existing system to capture contact details, route enquiries correctly, and keep quote follow ups moving.',
    category: 'CRM & automation',
    client: {
      name: 'Just About Cleaning',
      type: 'Residential & commercial cleaning'
    },
    metrics: [],
    tools: [
      'GoHighLevel',
      'Xero',
      'Facebook',
      'Instagram'
    ],
    image: {
      src: '/images/work/just-about-cleaning-crm-card.webp',
      coverSrc: '/images/work/just-about-cleaning-crm-cover.webp',
      alt: 'Laptop on a desk in a cleaning business workspace.',
    },
    preview: {
      eyebrow: 'CLIENT STORY · CLEANING SERVICES',
      scope: [
        'Lead capture',
        'Quote tracking',
        'Scheduled follow ups'
      ],
      ctaLabel: 'View case study'
    },
    isPublished: true,
    isReal: true,
    challenge: JUST_ABOUT_CLEANING_DETAILS.challenge.paragraphs,
    solution: JUST_ABOUT_CLEANING_DETAILS.solution.groups.map((group) => group.paragraphs.join(' ')),
    results: JUST_ABOUT_CLEANING_DETAILS.outcomes.items.map((item) => `${item.title} ${item.description}`),
    details: JUST_ABOUT_CLEANING_DETAILS,
  },
  {
    slug: 'old-leads-revenue-recovery',
    title: 'Turning 200 Old Leads into 18 Closed Jobs',
    summary: 'Old enquiries sat untouched. A clear pipeline and automated email follow ups helped a cleaning business close 18 jobs from 200 old leads.',
    category: 'Lead reactivation',
    client: { name: 'Cleaning business', type: 'Cleaning services' },
    metrics: [
      { value: '200', label: 'Old leads worked' },
      { value: '18', label: 'Jobs closed' },
      { value: '9%', label: 'Lead to job conversion' },
    ],
    tools: ['CRM pipeline', 'Automated email sequencing'],
    image: {
      src: '/images/work/old-leads-recovery-card.webp',
      coverSrc: '/images/work/old-leads-recovery-cover.webp',
      alt: 'Stock photo of an office worker using a phone and laptop at a desk.',
    },
    preview: {
      eyebrow: 'CLIENT STORY · CLEANING SERVICES',
      scope: ['Lead reactivation', 'CRM pipelines', 'Email follow ups'],
      ctaLabel: 'View case study',
    },
    isPublished: true,
    isReal: true,
    challenge: OLD_LEADS_RECOVERY_DETAILS.challenge.paragraphs,
    solution: OLD_LEADS_RECOVERY_DETAILS.solution.groups.map((group) => group.paragraphs.join(' ')),
    results: OLD_LEADS_RECOVERY_DETAILS.outcomes.items.map((item) => `${item.title} ${item.description}`),
    details: OLD_LEADS_RECOVERY_DETAILS,
  },
];
