/**
 * South African mobile numbers. Accepts "+27 82 123 4567", "0821234567", "27821234567",
 * "(082) 123-4567" and normalises to "+27821234567". Mobile prefixes are 6, 7 or 8 after the 0.
 */
const SA_MOBILE = /^\+27[678]\d{8}$/

export function normaliseSaMobile(input: string): string | null {
  const stripped = input.replace(/[\s()-]/g, '')
  let national: string
  if (stripped.startsWith('+27')) national = stripped.slice(3)
  else if (stripped.startsWith('0027')) national = stripped.slice(4)
  else if (stripped.startsWith('27')) national = stripped.slice(2)
  else if (stripped.startsWith('0')) national = stripped.slice(1)
  else return null
  const e164 = `+27${national}`
  return SA_MOBILE.test(e164) ? e164 : null
}

export const isSaMobile = (input: string) => normaliseSaMobile(input) !== null
