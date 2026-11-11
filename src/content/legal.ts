export interface LegalDoc {
  path: string;
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  sections: { heading: string; text: string }[];
}

export const LAST_UPDATED = 'October 21, 2026';

export const LEGAL_DOCS: LegalDoc[] = [
  {
    path: '/privacy',
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy | Invent Tomorrow',
    description: 'How Invent Tomorrow collects, uses and protects information submitted through this website.',
    intro: 'This policy explains what information we collect through this website and how we use it.',
    sections: [
      {
        heading: 'Information we collect',
        text: 'When you request an audit, book a call or contact us, we may collect your name, business name, email address, phone number, website and the information you include in your message. Our hosting and scheduling providers may also process basic technical information needed to operate their services.',
      },
      {
        heading: 'How we use information',
        text: 'We use submitted information to respond to requests, arrange audits and calls, provide services, maintain business records, improve our website and protect against misuse. We collect only the information we reasonably need for those purposes.',
      },
      {
        heading: 'How information is shared',
        text: 'We may share information with service providers that help us host the site, schedule calls, communicate with you or operate our business. We do not sell personal information. We may disclose information when required by law or needed to protect rights, safety and security.',
      },
      {
        heading: 'Retention and security',
        text: 'We retain information only as long as reasonably necessary for the purpose it was collected, our business records and applicable legal obligations. We use reasonable safeguards, but no online system can guarantee absolute security.',
      },
      {
        heading: 'Your choices',
        text: 'You may ask us to correct or delete information you submitted, subject to legal and operational requirements. You may opt out of marketing email using its unsubscribe method and opt out of text messages as described in our SMS Consent Policy.',
      },
      {
        heading: 'Children',
        text: 'This website is intended for business users and is not directed to children under 13. We do not knowingly collect personal information from children under 13.',
      },
      {
        heading: 'Changes',
        text: 'We may update this policy as our services or practices change. The date above shows the latest revision.',
      },
    ],
  },
  {
    path: '/terms',
    title: 'Website Terms',
    metaTitle: 'Terms | Invent Tomorrow',
    description: 'Terms governing use of the Invent Tomorrow website.',
    intro: 'These terms govern your use of the Invent Tomorrow website.',
    sections: [
      {
        heading: 'Website use',
        text: 'You may use this website for lawful business purposes. You may not interfere with its operation, attempt unauthorized access or use its content to mislead others.',
      },
      {
        heading: 'Information on this site',
        text: 'Website content is general information, not legal, financial or professional advice. Examples, timelines and outcomes are illustrative unless a written client agreement states otherwise.',
      },
      {
        heading: 'Service agreements',
        text: 'Submitting a form or booking a call does not create a client relationship. Scope, price, guarantees, responsibilities and service terms are established only in a separate written agreement accepted by both parties.',
      },
      {
        heading: 'Intellectual property',
        text: 'The website, branding and original content are owned by Invent Tomorrow or used with permission. You may not reproduce or distribute them for commercial use without written permission.',
      },
      {
        heading: 'Third party services',
        text: 'The site may link to or embed third party services. Their availability and practices are governed by their own terms and policies.',
      },
      {
        heading: 'Disclaimer and limitation',
        text: 'The website is provided on an “as available” basis. To the extent permitted by law, Invent Tomorrow disclaims implied warranties and is not liable for indirect or consequential loss resulting solely from use of this website.',
      },
      {
        heading: 'Changes',
        text: 'We may update these terms from time to time. Continued use after an update means the revised terms apply to future website use.',
      },
    ],
  },
  {
    path: '/sms-consent',
    title: 'SMS Consent Policy',
    metaTitle: 'SMS Consent Policy | Invent Tomorrow',
    description: 'Consent, frequency, opt out and privacy terms for Invent Tomorrow text messages.',
    intro: 'This policy explains how consent works when you ask Invent Tomorrow to contact you by text message.',
    sections: [
      {
        heading: 'Consent',
        text: 'When you enter your mobile number and affirmatively select the SMS consent checkbox, you agree to receive text messages from Invent Tomorrow about your audit request, appointments, service questions and related follow up. Consent is not a condition of purchasing any service.',
      },
      {
        heading: 'Message frequency and charges',
        text: 'Message frequency varies based on your request and conversation. Message and data rates may apply according to your mobile plan.',
      },
      {
        heading: 'Opting out',
        text: 'You can opt out at any time by replying STOP, QUIT, END, REVOKE, OPT OUT, CANCEL or UNSUBSCRIBE, or by contacting us through the website. We will honor reasonable opt out requests. You may receive one nonpromotional confirmation that your opt out was processed.',
      },
      {
        heading: 'Help',
        text: 'Reply HELP for assistance or contact us through the website. If a messaging channel does not support replies, use the contact page to request help or revoke consent.',
      },
      {
        heading: 'Privacy',
        text: 'Mobile information is used to communicate with you and operate the requested service. We do not sell mobile information or share it with third parties for their own marketing. Service providers may process it only to support our communications and operations.',
      },
      {
        heading: 'Your responsibility',
        text: 'You confirm that you are authorized to provide the mobile number and will notify us if it changes or is reassigned.',
      },
    ],
  },
];
