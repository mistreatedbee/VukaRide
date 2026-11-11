import { z } from 'zod'

import { normaliseSaMobile } from '../lib/phone'
import { driverApplicationSchema } from '../lib/schemas'

const s = driverApplicationSchema.shape

/** The full application, as the driver submits it. Same rules as the website form, with the portal's field names. */
export const portalApplicationSchema = z
  .object({
    fullName: s.fullName,
    mobile: s.mobile,
    email: s.email,
    city: s.city,
    otherCity: s.otherCity,
    vehicle: s.vehicle,
    vehicleYear: s.year,
    plate: s.plate,
    licenceConfirmed: s.licence,
    termsAccepted: s.terms,
  })
  .superRefine((v, ctx) => {
    if (v.city === 'Other (tell us where)' && !v.otherCity?.trim())
      ctx.addIssue({ code: 'custom', path: ['otherCity'], message: 'Tell us which city or town you are in.' })
  })

export type PortalApplicationInput = z.input<typeof portalApplicationSchema>
export type PortalApplicationData = z.output<typeof portalApplicationSchema>

const text = (min: number, max: number, message: string) => z.string().trim().min(min, message).max(max, 'That is too long.')

export const profileSchema = z.object({
  fullName: text(2, 120, 'Enter your full name.'),
  phone: z
    .string()
    .trim()
    .max(40, 'That is too long.')
    .transform((v, ctx) => {
      if (!v) return ''
      const n = normaliseSaMobile(v)
      if (!n) ctx.addIssue({ code: 'custom', message: 'Please enter a valid mobile number.' })
      return n ?? v
    }),
})
export type ProfileFormInput = z.input<typeof profileSchema>
export type ProfileFormData = z.output<typeof profileSchema>

/** South African bank account details. Account numbers are 6 to 16 digits and branch codes are 6 digits. */
export const bankSchema = z
  .object({
    accountHolder: text(2, 120, 'Enter the name on the account.'),
    bank: z.string().min(1, 'Choose your bank.'),
    otherBank: z.string().trim().max(80, 'That is too long.').optional(),
    accountType: z.enum(['cheque', 'savings', 'transmission'], { error: 'Choose the account type.' }),
    accountNumber: z
      .string()
      .trim()
      .transform((v) => v.replace(/[\s-]/g, ''))
      .pipe(z.string().regex(/^[0-9]{6,16}$/, 'Enter the account number using digits only (6 to 16 digits).')),
    branchCode: z
      .string()
      .trim()
      .transform((v) => v.replace(/[\s-]/g, ''))
      .pipe(z.string().regex(/^[0-9]{6}$/, 'Enter the 6 digit branch code.')),
  })
  .superRefine((v, ctx) => {
    if (v.bank.startsWith('Other') && !v.otherBank?.trim())
      ctx.addIssue({ code: 'custom', path: ['otherBank'], message: 'Type the name of your bank.' })
  })
export type BankFormInput = z.input<typeof bankSchema>
export type BankFormData = z.output<typeof bankSchema>
