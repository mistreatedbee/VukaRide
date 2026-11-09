import { expect, test } from '@playwright/test'

const PAGES = ['/', '/drive', '/safety', '/about', '/contact', '/privacy', '/terms', '/delete-account', '/download']

for (const path of PAGES) {
  test(`${path} loads with one h1 and no horizontal scroll`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(String(e)))
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('main')).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
    expect(errors).toEqual([])
  })
}

test('unknown routes show the 404 page with a 404 status', async ({ page }) => {
  const res = await page.goto('/no-such-page')
  expect(res?.status()).toBe(404)
  await expect(page.locator('h1')).toHaveText(/does not lead anywhere/)
})

test('store buttons fall back to /download while no store URL is set', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Coming soon on Google Play' }).first()).toHaveAttribute('href', '/download')
  await page.getByRole('link', { name: 'Get the app' }).first().click()
  await expect(page).toHaveURL(/\/download$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/coming soon/i)
})

test('contact form validates, shows an error summary, then succeeds in demo mode', async ({ page }) => {
  await page.goto('/contact')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('alert').first()).toContainText('problems with your form')
  await page.getByLabel('Name').fill('Sam Tester')
  await page.getByLabel('Email').fill('sam@example.com')
  await page.getByLabel('Topic').selectOption('Other')
  await page.getByLabel('Message').fill('Hello, this is a test message.')
  await page.waitForTimeout(2600) // the time-based spam check needs a human-paced fill
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('status')).toContainText('Thanks, your message is on its way.')
  await expect(page.getByRole('status')).toContainText('Demo mode')
})

test('FAQ accordion works with the keyboard', async ({ page }) => {
  await page.goto('/')
  const second = page.getByRole('button', { name: 'How do I pay for a ride?' })
  await second.focus()
  await page.keyboard.press('Enter')
  await expect(second).toHaveAttribute('aria-expanded', 'true')
})
