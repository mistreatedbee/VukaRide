import { z } from 'zod'

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
