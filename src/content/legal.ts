/**
 * Structure for the legal pages, taken from vuka-ride-website-kit/content/legal-templates.md.
 * These are OUTLINES, not legal text. Every [bracket] must be filled in, and the pages must be reviewed
 * by a South African attorney (POPIA, Consumer Protection Act, Google Play and App Store rules) before launch.
 */

/** Set to false once the legal text has been reviewed. This hides the "Draft" notice on /privacy and /terms. */
export const LEGAL_DRAFT = true

export type LegalSection = { id: string; title: string; paragraphs?: string[]; list?: string[]; more?: string[] }

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    paragraphs: ['[Registered company name], [registration number], [address]. Information Officer: [name, email]. Contact: [email].'],
  },
  {
    id: 'information-we-collect',
    title: 'What information we collect',
    paragraphs: ['[Keep only what the app really collects.]'],
    list: [
      'Account details: name, mobile number, email, [profile photo]',
      'Driver details: [ID number, licence, PrDP, vehicle details, proof of address, photo]',
      'Location data: [pickup and drop-off, live location during a trip, whether in the background]',
      'Trip information: routes, times, fares, ratings',
      'Payment information: [processed by payment provider name; we do not store full card details]',
      'Device and usage data: [device model, app version, crash logs, analytics]',
      'Communications with support',
    ],
  },
  {
    id: 'why-we-use-it',
    title: 'Why we use it',
    paragraphs: [
      'To provide rides, match riders and drivers, process payments, keep people safe, verify drivers, provide support, prevent fraud, improve the app, and meet legal duties. [Marketing, only with consent.]',
    ],
  },
  {
    id: 'who-we-share-it-with',
    title: 'Who we share it with',
    paragraphs: [
      'Drivers and riders see what is needed for a trip. Service providers: [payment provider, maps provider, SMS/email provider, cloud hosting, analytics]. Authorities where the law requires it. We do not sell personal information. [Confirm.]',
    ],
  },
  {
    id: 'where-it-is-stored',
    title: 'Where it is stored',
    paragraphs: ['[Country or region of servers; cross-border transfer safeguards.]'],
  },
  { id: 'how-long-we-keep-it', title: 'How long we keep it', paragraphs: ['[Retention periods by data type and legal reasons.]'] },
  { id: 'security', title: 'Security', paragraphs: ['[Describe reasonable measures: encryption in transit, access controls.]'] },
  {
    id: 'your-rights',
    title: 'Your rights',
    paragraphs: [
      'Access, correction, deletion, objection, withdrawal of consent, and the right to complain to the Information Regulator (South Africa). How to exercise them: [email or in-app steps]. Account deletion: see /delete-account.',
    ],
  },
  { id: 'children', title: 'Children', paragraphs: ['[The service is not for people under 18. Confirm.]'] },
  { id: 'changes', title: 'Changes to this policy', paragraphs: ['[How you will notify users.]'] },
  { id: 'contact', title: 'Contact', paragraphs: ['[Information Officer and support contact.]'] },
]

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: 'about-these-terms',
    title: 'About these terms',
    paragraphs: ['Who the agreement is with ([company]), and that using the app means accepting the terms.'],
  },
  { id: 'accounts', title: 'Accounts', paragraphs: ['Eligibility ([age, licence for drivers]), accurate details, keeping login secure.'] },
  { id: 'riders', title: 'Riders', paragraphs: ['Requesting rides, cancellations [policy], conduct, damage to vehicles, [fees].'] },
  {
    id: 'drivers',
    title: 'Drivers',
    paragraphs: [
      'Independent status [confirm with attorney], documents and verification, vehicle standards, conduct, [commission and payouts].',
    ],
  },
  {
    id: 'fares-and-payments',
    title: 'Fares and payments',
    paragraphs: ['How fares are calculated [describe], payment methods, taxes, refunds and disputes [process].'],
  },
  { id: 'safety-and-conduct', title: 'Safety and conduct', paragraphs: ['Prohibited behaviour, suspension and removal, reporting.'] },
  { id: 'ratings-and-content', title: 'Ratings and content', paragraphs: ['Rules for ratings, user content, licence to use it.'] },
  { id: 'intellectual-property', title: 'Intellectual property', paragraphs: ['The Vuka Ride name, logo and app belong to [company].'] },
  {
    id: 'disclaimers-and-liability',
    title: 'Disclaimers and liability',
    paragraphs: ['[Attorney to draft within the Consumer Protection Act limits.]'],
  },
  { id: 'suspension-and-termination', title: 'Suspension and termination', paragraphs: ['By you, by us.'] },
  { id: 'privacy', title: 'Privacy', paragraphs: ['Refer to the Privacy Policy.'] },
  { id: 'changes', title: 'Changes to the terms', paragraphs: ['[Notice approach.]'] },
  { id: 'governing-law', title: 'Governing law and disputes', paragraphs: ['[South African law; jurisdiction; dispute process.]'] },
  { id: 'contact', title: 'Contact', paragraphs: ['[Support contact.]'] },
]
