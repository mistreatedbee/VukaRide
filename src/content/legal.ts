/**
 * Structure and proposed content for the legal pages, from vuka-ride-website-kit/content/legal-templates.md
 * and docs/content-decisions.md. These are DRAFTS, not legal text. Every [bracket] must be filled in, the
 * proposed retention periods and rules must be confirmed, and a South African attorney must review both
 * pages (POPIA, Consumer Protection Act, Google Play and App Store rules) before launch.
 */

/** Set to false once the legal text has been reviewed. This hides the "Draft" notice on /privacy and /terms. */
import { siteConfig } from '../lib/site-config'

const privacy = siteConfig.privacyEmail ?? '[Privacy email]'
const support = siteConfig.supportEmail ?? '[Support email]'

export const LEGAL_DRAFT = true

export type LegalTable = { caption: string; head: string[]; rows: string[][] }
export type LegalSection = { id: string; title: string; paragraphs?: string[]; list?: string[]; tables?: LegalTable[]; after?: string[] }

/** Shared with /delete-account so both pages state the same retention. [Confirm] with an attorney and an accountant. */
export const RETENTION_ROWS: string[][] = [
  [
    'Trip records and receipts (with unnecessary personal detail removed where possible)',
    '5 years [confirm]',
    'Tax and accounting records',
  ],
  ['Payment and refund records', '5 years [confirm]', 'Financial and tax law'],
  ['Safety reports and incident records', 'Up to 5 years [confirm]', 'Legal claims, regulators, safety'],
  ['Fraud and abuse flags', 'Up to 3 years [confirm]', 'Stops banned users coming back'],
  [
    'Driver compliance records (licence, PrDP, criminal record check result)',
    'As long as the regulator requires, plus 5 years [confirm]',
    'Regulatory compliance',
  ],
]

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    paragraphs: [
      '[Registered company name], registration number [registration number], registered address [registered address]. VAT number: [only if registered].',
      `Information Officer: [Name, Title]. Contact: ${privacy}.`,
    ],
  },
  {
    id: 'information-we-collect',
    title: 'What information we collect',
    paragraphs: ['[Confirm this list matches exactly what the app collects.]', 'From riders:'],
    list: [
      'Name, phone number, email',
      'Pick-up and drop-off locations, and live location while using the app',
      'Trip history, ratings and support messages',
      'Payment details (handled by the payment provider)',
      'Device information and app usage, to fix bugs and prevent fraud',
    ],
  },
  {
    id: 'driver-information',
    title: 'Extra information we collect from drivers',
    list: [
      'ID and selfie, driving licence, PrDP, criminal record report outcome, proof of address',
      'Vehicle registration and insurance details',
      'Bank account details for payouts',
      'Location while online, for matching and safety',
    ],
    after: ['Criminal record results and ID photos are sensitive. [Describe how they are protected and who can see them.]'],
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
      'Drivers and riders see what is needed for a trip. Authorities where the law requires it. We do not sell personal information. [Confirm.]',
      'Service providers we use [list only those you really use]:',
    ],
    tables: [
      {
        caption: 'Service providers',
        head: ['Purpose', 'Provider'],
        rows: [
          ['Payments', '[Payment provider]'],
          ['Maps and routing', '[Maps provider]'],
          ['SMS and OTP', '[SMS provider]'],
          ['Push notifications', '[Provider]'],
          ['Hosting and database', '[Provider and region]'],
          ['Analytics and crash reports', '[Provider, or none]'],
          ['Identity and background checks', '[Provider name]'],
        ],
      },
    ],
  },
  {
    id: 'where-it-is-stored',
    title: 'Where it is stored',
    paragraphs: [
      '[Country or region where data is stored.] Where a provider processes data outside South Africa, we make sure the recipient is bound by a law, binding rules or a contract that gives similar protection. [List the countries.]',
    ],
  },
  {
    id: 'how-long-we-keep-it',
    title: 'How long we keep it',
    paragraphs: ['These periods are proposals. [Confirm each one with an attorney and accountant, then apply it in the system.]'],
    tables: [
      {
        caption: 'Retention periods',
        head: ['Data', 'Kept for'],
        rows: [
          ['Active account data', 'While the account is active'],
          ['Deleted account', 'Removed within 30 days of a verified request, except the records on /delete-account'],
          ['Trip and payment records', '5 years [confirm]'],
          ['Location data and trip routes', '12 months in detail, then anonymised or deleted [confirm]'],
          ['Support messages', '2 years [confirm]'],
          ['Driver verification documents', 'While active, plus the period the regulator requires [confirm]'],
          ['Inactive accounts', 'Reviewed after 24 months of no use. We tell the user before closing [confirm]'],
        ],
      },
    ],
  },
  { id: 'security', title: 'Security', paragraphs: ['[Describe reasonable measures: encryption in transit, access controls.]'] },
  {
    id: 'your-rights',
    title: 'Your rights',
    paragraphs: [
      `Access, correction, deletion, objection, withdrawal of consent, and the right to complain to the Information Regulator (South Africa). To use them, email ${privacy}. To delete your account, see /delete-account.`,
    ],
  },
  { id: 'children', title: 'Children', paragraphs: ['Vuka Ride is for people aged 18 or older. [Confirm.]'] },
  { id: 'changes', title: 'Changes to this policy', paragraphs: ['[How you will notify users.]'] },
  {
    id: 'contact',
    title: 'Contact',
    paragraphs: [`Information Officer: [Name, Title], ${privacy}. Support: ${support}. [Link the PAIA manual here.]`],
  },
]

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: 'about-these-terms',
    title: 'About these terms',
    paragraphs: ['Who the agreement is with ([Registered company name]), and that using the app means accepting the terms.'],
  },
  {
    id: 'accounts',
    title: 'Accounts',
    paragraphs: [
      'Riders must be 18 or older [confirm]. Eligibility for drivers: [age, licence, PrDP]. Keep your details accurate and your login secure.',
    ],
  },
  {
    id: 'riders',
    title: 'Riders',
    paragraphs: ['Requesting rides, conduct, damage to vehicles, [fees]. Proposed cancellation rules [confirm with an attorney]:'],
    list: [
      'Free cancellation within 2 minutes of booking.',
      'After that, or if the driver has already arrived, a cancellation fee of R[amount] may apply. It goes to the driver.',
      'If the driver cancels or does not arrive, the rider is never charged.',
    ],
  },
  {
    id: 'drivers',
    title: 'Drivers',
    paragraphs: [
      'Independent status [confirm with attorney], documents and verification, vehicle standards, conduct, [commission and payouts].',
      'Repeated cancellations affect a driver’s rating and may lead to a warning or suspension.',
    ],
  },
  {
    id: 'fares-and-payments',
    title: 'Fares and payments',
    paragraphs: [
      'How fares are calculated [describe], payment methods [confirm], taxes, [surge pricing, if any]. Proposed refund rules [confirm with an attorney]:',
    ],
    list: [
      'Wrong fare, wrong route or unsafe trip: report within 48 hours in the app. We review within 5 working days.',
      'Approved card refunds return to the original card within 7 to 10 working days, depending on the bank.',
      'For cash trips, an approved refund is credited to the rider’s in-app balance.',
    ],
  },
  {
    id: 'safety-and-conduct',
    title: 'Safety and conduct',
    paragraphs: [
      'Prohibited behaviour, suspension and removal, reporting. Both riders and drivers follow the Vuka Ride code of conduct (see /safety).',
    ],
  },
  { id: 'ratings-and-content', title: 'Ratings and content', paragraphs: ['Rules for ratings, user content, licence to use it.'] },
  {
    id: 'intellectual-property',
    title: 'Intellectual property',
    paragraphs: ['The Vuka Ride name, logo and app belong to [Registered company name].'],
  },
  {
    id: 'disclaimers-and-liability',
    title: 'Disclaimers and liability',
    paragraphs: [
      '[Attorney to draft within the Consumer Protection Act limits.] Damage and cleaning fees, lost property, complaints process: [describe].',
    ],
  },
  { id: 'suspension-and-termination', title: 'Suspension and termination', paragraphs: ['By you, by us.'] },
  { id: 'privacy', title: 'Privacy', paragraphs: ['See the Privacy Policy.'] },
  { id: 'changes', title: 'Changes to the terms', paragraphs: ['[Notice approach.]'] },
  {
    id: 'governing-law',
    title: 'Governing law and disputes',
    paragraphs: [
      'The law of the Republic of South Africa applies. [Jurisdiction; dispute process; how to reach the Consumer Goods and Services Ombud or a court.]',
    ],
  },
  { id: 'contact', title: 'Contact', paragraphs: [`${support}. [Registered address.]`] },
]
