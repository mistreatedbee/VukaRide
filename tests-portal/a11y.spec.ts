import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

async function signIn(page: Page, email: string) {
  await page.goto('/login')
  await page.getByLabel('Email address').fill(email)
  await page.getByRole('button', { name: 'Email me a code' }).click()
  await page.getByLabel('6 digit code').fill('123456')
  await page.getByRole('button', { name: 'Sign in' }).click()
}

/** In-app navigation, because the demo data lives in memory and a full reload would sign out. */
const go = (page: Page, path: string) =>
  page.evaluate((p) => {
    window.history.pushState({}, '', p)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, path)

async function scan(page: Page, label: string) {
  await expect(page.getByText('Loading…')).toHaveCount(0)
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  const summary = violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length}× ${v.nodes[0]?.target.join(' ')}`)
  expect(summary, `${label}\n${summary.join('\n')}`).toEqual([])
}

test('login screens have no WCAG 2.1 AA violations', async ({ page }) => {
  await page.goto('/login')
  await scan(page, 'login (email step)')
  await page.getByLabel('Email address').fill('driver@demo.test')
  await page.getByRole('button', { name: 'Email me a code' }).click()
  await page.getByLabel('6 digit code').waitFor()
  await scan(page, 'login (code step)')
})

test('driver screens have no WCAG 2.1 AA violations', async ({ page }) => {
  await signIn(page, 'driver@demo.test')
  await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible()
  await scan(page, 'driver overview')
  for (const [path, label] of [
    ['/driver/application', 'application'],
    ['/driver/documents', 'documents'],
    ['/driver/profile', 'profile'],
    ['/driver/earnings', 'earnings'],
    ['/driver/help', 'help'],
  ] as const) {
    await go(page, path)
    await expect(page.locator('main h1')).toBeVisible()
    await scan(page, `driver ${label}`)
  }
  // With validation errors showing
  await go(page, '/driver/application')
  await page.getByRole('button', { name: 'Send for review' }).click()
  await expect(page.getByText('Enter your full name.')).toBeVisible()
  await scan(page, 'driver application with errors')
  await go(page, '/driver/profile')
  await page.getByRole('button', { name: 'Save bank details' }).click()
  await expect(page.getByText('Choose your bank.')).toBeVisible()
  await scan(page, 'driver bank form with errors')
})

test('admin screens have no WCAG 2.1 AA violations', async ({ page }) => {
  await signIn(page, 'admin@demo.test')
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()
  await scan(page, 'admin overview')
  for (const [path, label] of [
    ['/admin/applications', 'applications'],
    ['/admin/drivers', 'drivers'],
    ['/admin/inbox', 'inbox'],
    ['/admin/audit', 'audit log'],
  ] as const) {
    await go(page, path)
    await expect(page.locator('main h1')).toBeVisible()
    await scan(page, `admin ${label}`)
  }
  await go(page, '/admin/applications')
  await page.getByRole('link', { name: 'Demo Driver Two' }).click()
  await expect(page.getByRole('heading', { name: 'Decision' })).toBeVisible()
  await scan(page, 'admin application detail')
  // Demo Driver Two has every required document accepted, so approving makes the bank panel appear.
  await page.getByRole('button', { name: 'Approve', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Bank details' })).toBeVisible()
  await page.getByRole('button', { name: 'Show bank details' }).click()
  await expect(page.getByText('1234567890')).toBeVisible()
  await scan(page, 'admin application detail with bank details')
  await page.getByRole('button', { name: 'Erase data…' }).click()
  await scan(page, 'admin erase confirmation')
})

for (const [name, viewport] of [['phone', { width: 390, height: 844 }]] as const) {
  test.describe(`${name} width`, () => {
    test.use({ viewport })
    test('driver and admin screens have no WCAG 2.1 AA violations', async ({ page }) => {
      await signIn(page, 'driver@demo.test')
      for (const path of ['/driver', '/driver/application', '/driver/documents', '/driver/profile', '/driver/help']) {
        await go(page, path)
        await expect(page.locator('main h1')).toBeVisible()
        await scan(page, `${name} driver ${path}`)
      }
      await page.getByRole('button', { name: 'Sign out' }).click()
      await signIn(page, 'admin@demo.test')
      for (const path of ['/admin', '/admin/applications', '/admin/drivers', '/admin/inbox', '/admin/audit']) {
        await go(page, path)
        await expect(page.locator('main h1')).toBeVisible()
        await scan(page, `${name} admin ${path}`)
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${path} scrolls sideways`).toBe(true)
      }
    })
  })
}

test('keyboard: skip link, focus after navigation, and page titles', async ({ page }) => {
  await signIn(page, 'driver@demo.test')
  await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible()
  await expect(page).toHaveTitle(/Welcome.* \| Vuka Ride portal/)

  // The first Tab stop is the skip link, and it moves focus to the main content.
  // Start from the top of the document, as when a page has just loaded.
  await page.evaluate(() => {
    ;(document.activeElement as HTMLElement | null)?.blur()
    document.body.setAttribute('tabindex', '-1')
    document.body.focus()
    document.body.removeAttribute('tabindex')
  })
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#portal-main')).toBeFocused()

  // Using the menu with the keyboard: the page title changes and focus lands in the new content.
  await page.getByRole('link', { name: 'Profile' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Your profile' })).toBeVisible()
  await expect(page).toHaveTitle('Your profile | Vuka Ride portal')
  await expect(page.locator('#portal-main')).toBeFocused()

  await expect(page.getByRole('button', { name: 'Save bank details' })).toBeVisible() // the forms load after the heading
  // Every control is reachable by Tab and shows a focus ring (the outline is the brand yellow).
  const stops: string[] = []
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement
      const cs = getComputedStyle(el)
      const name = el.getAttribute('aria-label') || (el.id ? `#${el.id}` : '') || el.textContent || el.tagName
      return { name: name.trim().slice(0, 30), outline: cs.outlineStyle, shadow: cs.boxShadow }
    })
    stops.push(info.name)
    // A visible focus indicator is either the yellow outline or the green ring (box shadow) used on form fields.
    expect(info.outline !== 'none' || info.shadow !== 'none', `focus indicator on "${info.name}"`).toBe(true)
  }
  expect(stops.join('|')).toMatch(/Save profile/)
  expect(stops.join('|')).toMatch(/Save bank details/)
})

test('keyboard: a driver can fill in the application and the error summary is announced', async ({ page }) => {
  await signIn(page, 'driver@demo.test')
  await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible()
  await go(page, '/driver/application')
  await expect(page.getByRole('heading', { name: 'Your application' })).toBeVisible()
  await page.getByLabel('Full name').focus()
  await page.keyboard.type('Thandi Nkosi')
  await page.keyboard.press('Tab')
  await page.keyboard.type('082 123 4567')
  await page.getByRole('button', { name: 'Send for review' }).focus()
  await page.keyboard.press('Enter')
  // Invalid fields are marked for assistive technology and point at their message.
  const vehicle = page.getByLabel('Make and model')
  await expect(vehicle).toHaveAttribute('aria-invalid', 'true')
  const describedBy = (await vehicle.getAttribute('aria-describedby')) ?? ''
  expect(describedBy).toContain('-err')
  await expect(page.locator(`#${describedBy.split(' ').find((d) => d.endsWith('-err'))}`)).toContainText('vehicle make and model')
})
