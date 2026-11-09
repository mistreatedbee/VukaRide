import { afterEach, describe, expect, it, vi } from 'vitest'

import { submitForm } from './submit-form'

afterEach(() => vi.restoreAllMocks())

describe('submitForm (mock mode, the default in tests)', () => {
  it('succeeds without a network call', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    vi.spyOn(console, 'info').mockImplementation(() => {})
    const r = await submitForm('contact', { name: 'A', email: 'a@b.co', topic: 'Other', message: '1234567890' }, { elapsedMs: 5000 })
    expect(r).toEqual({ ok: true, mock: true })
    expect(fetchSpy).not.toHaveBeenCalled()
  })
  it('silently drops honeypot submissions', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})
    const r = await submitForm(
      'contact',
      { name: 'A', email: 'a@b.co', topic: 'Other', message: '1234567890', website: 'http://spam' },
      { elapsedMs: 5000 }
    )
    expect(r).toEqual({ ok: true, mock: false })
    expect(info).not.toHaveBeenCalled()
  })
})
