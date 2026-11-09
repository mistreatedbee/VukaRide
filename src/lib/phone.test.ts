import { describe, expect, it } from 'vitest'

import { normaliseSaMobile } from './phone'

describe('normaliseSaMobile', () => {
  it.each([
    ['0821234567', '+27821234567'],
    ['082 123 4567', '+27821234567'],
    ['+27 82 123 4567', '+27821234567'],
    ['27821234567', '+27821234567'],
    ['(072) 123-4567', '+27721234567'],
    ['0027611234567', '+27611234567'],
  ])('accepts %s', (input, expected) => expect(normaliseSaMobile(input)).toBe(expected))

  it.each(['', '12345', '0111234567', '082123456', '08212345678', '+1 202 555 0100', 'abc'])('rejects %s', (input) =>
    expect(normaliseSaMobile(input)).toBeNull()
  )
})
