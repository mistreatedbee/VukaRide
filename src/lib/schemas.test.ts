import { describe, expect, it } from 'vitest'

import { contactSchema, currentYearMax, deleteAccountSchema, driverApplicationSchema, notifySchema } from './schemas'

const validDriver = {
  fullName: 'Thandi Nkosi',
  mobile: '082 123 4567',
  email: 'thandi@example.com',
  city: 'Other (tell us where)',
  vehicle: 'Toyota Corolla',
  year: '2019',
  plate: 'CA 123-456',
  licence: true,
  terms: true,
}

describe('driverApplicationSchema', () => {
  it('accepts a valid application and normalises the mobile number', () => {
    const r = driverApplicationSchema.safeParse(validDriver)
    expect(r.success && r.data.mobile).toBe('+27821234567')
  })
  it('reports readable errors per field', () => {
    const r = driverApplicationSchema.safeParse({
      ...validDriver,
      fullName: '',
      mobile: '123',
      email: 'nope',
      year: '1980',
      licence: false,
      terms: false,
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      const msgs = Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]))
      expect(msgs.fullName).toBeTruthy()
      expect(msgs.mobile).toBe('Please enter a valid mobile number.')
      expect(msgs.email).toBe('Please enter a valid email address.')
      expect(msgs.year).toContain('between 1990')
      expect(msgs.licence).toBeTruthy()
      expect(msgs.terms).toBeTruthy()
    }
  })
  it('rejects a year beyond next year and a city that is not in the list', () => {
    expect(driverApplicationSchema.safeParse({ ...validDriver, year: String(currentYearMax() + 1) }).success).toBe(false)
    expect(driverApplicationSchema.safeParse({ ...validDriver, city: 'Atlantis' }).success).toBe(false)
  })
})

describe('contactSchema', () => {
  const ok = { name: 'Sam', email: 'sam@example.com', topic: 'Partnerships', message: 'Hello, I would like to talk.' }
  it('accepts valid input', () => expect(contactSchema.safeParse(ok).success).toBe(true))
  it('requires a topic and a message of at least 10 characters', () => {
    expect(contactSchema.safeParse({ ...ok, topic: undefined }).success).toBe(false)
    expect(contactSchema.safeParse({ ...ok, message: 'short' }).success).toBe(false)
  })
})

describe('deleteAccountSchema', () => {
  it('accepts an email or a mobile number, and needs confirmation', () => {
    expect(deleteAccountSchema.safeParse({ contact: 'a@b.co', confirm: true }).success).toBe(true)
    expect(deleteAccountSchema.safeParse({ contact: '0821234567', confirm: true }).success).toBe(true)
    expect(deleteAccountSchema.safeParse({ contact: 'not contact', confirm: true }).success).toBe(false)
    expect(deleteAccountSchema.safeParse({ contact: 'a@b.co', confirm: false }).success).toBe(false)
  })
})

describe('notifySchema', () => {
  it('needs an email or a number, plus consent', () => {
    expect(notifySchema.safeParse({ consent: true }).success).toBe(false)
    expect(notifySchema.safeParse({ email: 'a@b.co', consent: true }).success).toBe(true)
    expect(notifySchema.safeParse({ mobile: '0821234567', consent: true }).success).toBe(true)
    expect(notifySchema.safeParse({ email: 'a@b.co', consent: false }).success).toBe(false)
    expect(notifySchema.safeParse({ mobile: '999', consent: true }).success).toBe(false)
  })
})
