import { z } from 'zod'

import { normaliseSaMobile } from './phone.js'

const required = 'Please fill in this field.'
const invalidEmail = 'Please enter a valid email address.'
const invalidPhone = 'Please enter a valid mobile number.'

const text = (min: number, message = required) => z.string().trim().min(min, message).max(200, 'That is too long.')
const email = z.string().trim().min(1, required).pipe(z.email(invalidEmail))
const mobile = z
  .string()
  .trim()
  .min(1, required)
  .transform((v, ctx) => {
    const n = normaliseSaMobile(v)
    if (!n) ctx.addIssue({ code: 'custom', message: invalidPhone })
    return n ?? v
  })
const checked = (message: string) => z.boolean().refine((v) => v, message)

/** Hidden fields added by every form for spam protection. Real people never fill `website`. */
export const spamFields = { website: z.string().optional() }

/** Launch cities are not decided yet. TODO: replace with real cities. */
export const CITIES = ['[City 1]', '[City 2]', 'Other (tell us where)'] as const
export const CONTACT_TOPICS = ['Rider support', 'Driver support', 'Partnerships', 'Other'] as const

export const currentYearMax = () => new Date().getFullYear() + 1

export const driverApplicationSchema = z.object({
  fullName: text(2, 'Enter your full name.'),
  mobile,
  email,
  city: z.enum(CITIES, { error: 'Choose your city.' }),
  otherCity: z.string().trim().max(100, 'That is too long.').optional(),
  vehicle: text(2, 'Enter your vehicle make and model.'),
  year: z
    .string()
    .trim()
    .regex(/^\d{4}$/, 'Enter a four-digit year.')
    .refine((v) => Number(v) >= 1990 && Number(v) <= currentYearMax(), `Enter a year between 1990 and ${currentYearMax()}.`),
  plate: text(3, 'Enter your licence plate.'),
  licence: checked('You need a valid driver’s licence to apply.'),
  terms: checked('Please accept the Terms and Privacy Policy.'),
  ...spamFields,
})

export const contactSchema = z.object({
  name: text(2, 'Enter your name.'),
  email,
  topic: z.enum(CONTACT_TOPICS, { error: 'Choose a topic.' }),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters).').max(3000, 'That is too long.'),
  ...spamFields,
})

export const deleteAccountSchema = z.object({
  contact: z
    .string()
    .trim()
    .min(1, required)
    .refine((v) => z.email().safeParse(v).success || normaliseSaMobile(v) !== null, 'Enter the email or mobile number on your account.'),
  reason: z.string().trim().max(1000, 'That is too long.').optional(),
  confirm: checked('Please confirm you want your account deleted.'),
  ...spamFields,
})

export const notifySchema = z
  .object({
    email: z.string().trim().optional(),
    mobile: z.string().trim().optional(),
    consent: checked('Please agree so we can contact you about the launch.'),
    ...spamFields,
  })
  .superRefine((v, ctx) => {
    const hasEmail = Boolean(v.email)
    const hasMobile = Boolean(v.mobile)
    if (!hasEmail && !hasMobile) {
      ctx.addIssue({ code: 'custom', path: ['email'], message: 'Enter an email address or a WhatsApp number.' })
      return
    }
    if (hasEmail && !z.email().safeParse(v.email).success) ctx.addIssue({ code: 'custom', path: ['email'], message: invalidEmail })
    if (hasMobile && normaliseSaMobile(v.mobile ?? '') === null) ctx.addIssue({ code: 'custom', path: ['mobile'], message: invalidPhone })
  })

export type DriverApplicationInput = z.input<typeof driverApplicationSchema>
export type DriverApplicationData = z.output<typeof driverApplicationSchema>
export type ContactInput = z.input<typeof contactSchema>
export type ContactData = z.output<typeof contactSchema>
export type DeleteAccountInput = z.input<typeof deleteAccountSchema>
export type DeleteAccountData = z.output<typeof deleteAccountSchema>
export type NotifyInput = z.input<typeof notifySchema>
export type NotifyData = z.output<typeof notifySchema>

export type FormKindMap = {
  'driver-application': DriverApplicationData
  contact: ContactData
  'delete-account': DeleteAccountData
  notify: NotifyData
}
export type FormKind = keyof FormKindMap
