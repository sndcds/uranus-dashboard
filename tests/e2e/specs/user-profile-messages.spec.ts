import { expect, test } from '../support/test'
import { installAuthenticatedState } from '../support/mockApi'

test.describe('User profile and messages', () => {
  test.beforeEach(async ({ page }) => {
    await installAuthenticatedState(page)
  })

  test('updates the user profile and persists the saved values', async ({ page }) => {
    await page.goto('/admin/user/profile')

    await expect(page.getByTestId('user-profile-view')).toBeVisible()
    await expect(page.getByTestId('profile-display-name')).toHaveValue('Playwright Admin')

    await page.getByTestId('profile-display-name').fill('Regression Captain')
    await page.getByTestId('profile-first-name').fill('Reggie')
    await page.getByTestId('profile-last-name').fill('Captain')
    await page.getByTestId('profile-username').fill('regression-captain')
    await page.getByTestId('profile-language').selectOption('en')
    await page.getByTestId('profile-theme').selectOption('dark')
    await page.getByTestId('profile-save-button').click()

    await expect(page.getByTestId('profile-display-name')).toHaveValue('Regression Captain')
    await expect(page.getByTestId('profile-first-name')).toHaveValue('Reggie')
    await expect(page.getByTestId('profile-last-name')).toHaveValue('Captain')
    await expect(page.getByTestId('profile-username')).toHaveValue('regression-captain')

    await page.reload()

    await expect(page.getByTestId('profile-display-name')).toHaveValue('Regression Captain')
    await expect(page.getByTestId('profile-language')).toHaveValue('en')
    await expect(page.getByTestId('profile-theme')).toHaveValue('dark')
  })

  test('shows inbox messages and sends a message to an organization', async ({ page }) => {
    await page.goto('/admin/user/messages/inbox')

    await expect(page.getByTestId('messages-panel')).toBeVisible()
    await expect(page.getByTestId('message-card-11')).toBeVisible()
    await expect(page.getByTestId('message-detail')).toContainText('Venue assets status')
    await expect(page.getByTestId('message-detail')).toContainText('Please confirm whether the April venue assets are final.')

    await page.getByTestId('messages-refresh').click()
    await expect(page.getByTestId('message-card-12')).toBeVisible()

    await page.goto('/admin/user/messages/send')

    await expect(page.getByTestId('organization-search-panel')).toBeVisible()
    await expect(page.getByTestId('message-composer-placeholder')).toBeVisible()

    await page.getByTestId('organization-search-input').fill('Kultur')
    await page.getByTestId('organization-search-submit').click()

    await expect(page.getByTestId('organization-result-77')).toBeVisible()
    await page.getByTestId('organization-result-77').click()

    await expect(page.getByTestId('message-composer-form')).toBeVisible()
    await page.getByTestId('message-subject').fill('Testing the organization inbox')
    await page.getByTestId('message-body').fill('This message verifies the Playwright send flow.')
    await page.getByTestId('message-send-button').click()

    await expect(page.getByTestId('message-subject')).toHaveValue('')
    await expect(page.getByTestId('message-body')).toHaveValue('')
  })
})
