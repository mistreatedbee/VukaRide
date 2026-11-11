import { expect, test } from '@playwright/test'

// The production build has no Supabase configured here, so the portal must be closed, not open with fake data.
for (const path of ['/login', '/driver', '/driver/documents', '/admin', '/admin/applications']) {
  test(`portal path ${path} is closed and not indexable in a build without Supabase`, async ({ page }) => {
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    // A build made with Supabase configured (for example from a local .env.local) opens the login page instead.
    test.skip((await page.getByRole('heading', { name: 'Sign in' }).count()) > 0, 'this build has Supabase configured')
    await expect(page.getByRole('heading', { name: 'The driver portal is not open yet' })).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    await expect(page.getByText('Demo Driver')).toHaveCount(0)
  })
}

test('robots.txt blocks the portal and the sitemap does not list it', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text()
  for (const p of ['/login', '/driver', '/admin']) expect(robots).toContain(`Disallow: ${p}`)
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).not.toMatch(/\/(login|driver|admin)</)
})
