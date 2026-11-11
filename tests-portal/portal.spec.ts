import { expect, test, type Page } from '@playwright/test'

async function signIn(page: Page, email: string) {
  await page.goto('/login')
  await page.getByLabel('Email address').fill(email)
  await page.getByRole('button', { name: 'Email me a code' }).click()
  await page.getByLabel('6 digit code').fill('123456')
  await page.getByRole('button', { name: 'Sign in' }).click()
}

test('visitors are sent to the login page', async ({ page }) => {
  await page.goto('/driver/documents')
  await expect(page).toHaveURL(/\/login$/)
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/login$/)
})

test('login validates the code and shows the demo notice', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByText('Demo data')).toBeVisible()
  await page.getByLabel('Email address').fill('driver@demo.test')
  await page.getByRole('button', { name: 'Email me a code' }).click()
  await page.getByLabel('6 digit code').fill('12ab56')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('alert')).toContainText('That code did not work')
})

test('driver: fills the application, uploads documents and sends it for review', async ({ page }) => {
  await signIn(page, 'driver@demo.test')
  await expect(page).toHaveURL(/\/driver$/)
  await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Required documents \(0 of 8\)/ })).toBeVisible()

  // Admin area is off limits for a driver.
  // (in-app navigation, because the demo data lives in memory and a full reload would sign out)
  await page.evaluate(() => {
    window.history.pushState({}, '', '/admin')
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
  await expect(page).toHaveURL(/\/driver$/)

  await page.getByRole('link', { name: 'Application' }).first().click()
  await page.getByRole('button', { name: 'Send for review' }).click()
  await expect(page.getByText('Enter your full name.')).toBeVisible()

  await page.getByLabel('Full name').fill('Thandi Nkosi')
  await page.getByLabel('Mobile number').fill('082 123 4567')
  await page.getByLabel('City', { exact: true }).selectOption('[City 1]')
  await page.getByLabel('Make and model').fill('Toyota Corolla')
  await page.getByLabel('Year').fill('2020')
  await page.getByLabel('Licence plate').fill('ABC 123 GP')
  await page.getByLabel('I have a valid South African driver’s licence.').check()
  await page.getByLabel(/I accept the/).check()
  await page.getByRole('button', { name: 'Save draft' }).click()
  await expect(page.getByText('Draft saved.')).toBeVisible()

  // Cannot send until the required documents are in.
  await page.getByRole('button', { name: 'Send for review' }).click()
  await expect(page.getByText(/Upload your required documents first/)).toBeVisible()

  await page.getByRole('link', { name: 'Documents' }).click()
  const file = { name: 'doc.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 demo') }
  const inputs = page.locator('input[type="file"]')
  await expect(inputs).toHaveCount(10)
  const count = await inputs.count()
  for (let i = 0; i < count; i++) {
    const required = await page.locator('li:has(input[type="file"])').nth(i).getByText('(optional for now)').count()
    if (!required) await inputs.nth(i).setInputFiles(file)
  }
  await expect(page.getByText('Waiting for review')).toHaveCount(8)
  await page.locator('#doc-licence-file').setInputFiles({ name: 'bad.exe', mimeType: 'application/x-msdownload', buffer: Buffer.from('x') })
  await expect(page.getByRole('alert')).toContainText('Use a PDF, JPG, PNG or WebP file.')

  await page.getByRole('link', { name: 'Application' }).click()
  await page.getByRole('button', { name: 'Send for review' }).click()
  await expect(page).toHaveURL(/\/driver$/)
  await expect(page.getByText('Submitted', { exact: true })).toBeVisible()

  // Now read only.
  await page.getByRole('link', { name: 'Application' }).first().click()
  await expect(page.getByText(/read only for now/)).toBeVisible()
})

test('driver: profile and bank details are validated and saved', async ({ page }) => {
  await signIn(page, 'profile@demo.test')
  await page.getByRole('link', { name: 'Profile' }).click()
  await expect(page.getByRole('heading', { name: 'Your profile' })).toBeVisible()

  await page.getByLabel('Full name').fill('Thandi Nkosi')
  await page.getByLabel('Mobile number').fill('082 123 4567')
  await page.getByRole('button', { name: 'Save profile' }).click()
  await expect(page.getByText('Profile saved.')).toBeVisible()

  await page.getByRole('button', { name: 'Save bank details' }).click()
  await expect(page.getByText('Enter the name on the account.')).toBeVisible()
  await expect(page.getByText('Choose your bank.')).toBeVisible()
  await page.getByLabel('Name on the account').fill('Thandi Nkosi')
  await page.getByLabel('Bank', { exact: true }).selectOption('Capitec Bank')
  await page.getByLabel('Account type').selectOption('Savings')
  await page.getByLabel('Account number').fill('12345')
  await page.getByLabel('Branch code').fill('470010')
  await page.getByRole('button', { name: 'Save bank details' }).click()
  await expect(page.getByText(/6 to 16 digits/)).toBeVisible()
  await page.getByLabel('Account number').fill('1234567890')
  await page.getByRole('button', { name: 'Save bank details' }).click()
  await expect(page.getByText('Bank details saved.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Update bank details' })).toBeVisible()
})

test('admin: reviews an application, asks for more, approves, and works the inbox', async ({ page }) => {
  await signIn(page, 'admin@demo.test')
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()

  await page.getByRole('link', { name: 'Applications' }).click()
  await page.getByRole('link', { name: 'Demo Driver One' }).click()
  await expect(page.getByRole('heading', { name: 'Decision' })).toBeVisible()

  await page.getByRole('button', { name: 'Ask for more' }).click()
  await expect(page.getByRole('alert')).toContainText('A note is required')
  await page.getByLabel('Note to the driver').fill('Please upload your PrDP.')
  await page.getByRole('button', { name: 'Ask for more' }).click()
  await expect(page.locator('main').getByText('More information needed').first()).toBeVisible()

  // Cannot approve while required documents are missing.
  await page.getByRole('button', { name: 'Approve', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Accept all required documents first')

  // Demo Driver Two has every required document accepted, so approving works.
  await page.getByRole('link', { name: 'All applications' }).click()
  await page.getByRole('link', { name: 'Demo Driver Two' }).click()
  await expect(page.getByRole('heading', { name: 'Decision' })).toBeVisible()
  await page.getByRole('button', { name: 'Approve', exact: true }).click()
  await expect(page.locator('main').getByText('Approved').first()).toBeVisible()
  // An approved application must be reopened before the decision changes.
  await page.getByLabel('Note to the driver').fill('Changed my mind')
  await page.getByRole('region', { name: 'Decision' }).getByRole('button', { name: 'Reject' }).click()
  await expect(page.getByRole('alert')).toContainText('Reopen the application')

  await page.getByRole('link', { name: 'Inbox' }).click()
  const items = page.getByRole('listitem').filter({ hasText: /Contact message|Account deletion request|Launch sign-up/ })
  await expect(items.filter({ hasText: 'Contact message' })).toHaveCount(1)
  await page.getByLabel('Type').selectOption('delete-account')
  await expect(items.filter({ hasText: 'Contact message' })).toHaveCount(0)
  await expect(items.filter({ hasText: 'Account deletion request' })).toHaveCount(1)

  // Bank details stay hidden until an admin asks, and the look is logged.
  await page.getByRole('link', { name: 'Applications' }).click()
  await page.getByRole('link', { name: 'Demo Driver Two' }).click()
  await expect(page.getByText('1234567890')).toHaveCount(0)
  await page.getByRole('button', { name: 'Show bank details' }).click()
  await expect(page.getByText('1234567890')).toBeVisible()

  // Drivers list: suspend and reinstate, then see it in the audit log.
  await page.getByRole('link', { name: 'Drivers', exact: true }).click()
  await expect(page.getByRole('row', { name: /Demo Driver Two.*Active/ })).toBeVisible()
  await page.getByRole('link', { name: 'Demo Driver Two' }).click()
  await expect(page.getByRole('heading', { name: 'Account status' })).toBeVisible()
  await page.getByRole('button', { name: 'Suspend driver' }).click()
  await expect(page.getByRole('alert')).toContainText('A reason is required')
  await page.getByLabel(/Reason/).fill('Safety complaint under review')
  await page.getByRole('button', { name: 'Suspend driver' }).click()
  await expect(page.getByRole('button', { name: 'Reinstate driver' })).toBeVisible()
  await page.getByRole('link', { name: 'Drivers', exact: true }).click()
  await expect(page.getByRole('row', { name: /Demo Driver Two.*Suspended/ })).toBeVisible()
  await page.getByRole('link', { name: 'Demo Driver Two' }).click()
  await page.getByRole('button', { name: 'Reinstate driver' }).click()
  await expect(page.getByRole('button', { name: 'Suspend driver' })).toBeVisible()

  await page.getByRole('link', { name: 'Audit log' }).click()
  await expect(page.getByText('Driver: suspended')).toBeVisible()
  await expect(page.getByText('Driver: reinstated')).toBeVisible()
  await expect(page.getByText('“Safety complaint under review”')).toBeVisible()
  await expect(page.getByText('Bank details: viewed')).toBeVisible()

  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login$/)
})
