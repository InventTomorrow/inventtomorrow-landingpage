// Fictional example for local preview and delivery tests; never submitted to a provider.
export const auditEmailReport = {
  businessName: 'Bright Home Cleaning',
  bigPicture: 'Your next opportunity may already be in the enquiries you receive.',
  business: {
    teamSize: '2 to 4 cleaners', monthlyEnquiries: '21 to 50', leadSources: ['Google or Google Maps', 'Referrals'],
    standardCleanPrice: '$181 to $250',
    overview: 'You run a small cleaning team with enquiries coming from Google and referrals. Your answers suggest that following up existing conversations deserves a closer look.',
  },
  findings: [
    { heading: 'A missed call can wait until later in the day.', body: 'You said missed calls are usually returned later that day. A caller may still be interested when you get back to them, but your answers do not show how often that conversation becomes a booking. Reviewing a few recent missed calls would help establish what actually happens.', evidenceIds: ['A5', 'A6'] },
    { heading: 'Quiet quotes do not have a consistent follow-up.', body: 'You reported that follow-up after a quiet quote depends on when you remember. Some people may already have chosen another cleaner, while others may still be deciding. Your answers suggest an opportunity to understand which conversations remain open, without assuming that each unanswered quote represents a lost booking.', evidenceIds: ['A9'] },
    { heading: 'Older enquiries have not been reviewed recently.', body: 'You have an existing list of older quotes and enquiries that has not been revisited. Their age, quality and contact permissions are not established by this questionnaire. A review of the actual records would show whether any of those conversations are still relevant to your business.', evidenceIds: ['A10', 'A11'] },
  ],
  whyThisMatters: 'Your answers describe conversations that may end before you learn whether someone still needs a cleaner. Looking at those records can make the next discussion more specific. It does not establish how many additional bookings are available.',
  illustrativeOpportunity: 'No reliable revenue estimate is available from these answers alone. We would need to review actual lead and booking records before putting a number on the opportunity.',
  nextConversation: 'Let’s look at a few recent enquiries, missed calls and quiet quotes together. We can discuss what your records show and which questions are worth exploring next.',
};
