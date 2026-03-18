import { expect, test } from '../support/test'
import { installAuthenticatedState } from '../support/mockApi'

test.describe('Server error paths', () => {
  test.beforeEach(async ({ page }) => {
    await installAuthenticatedState(page)
  })

  test('shows an API error when profile save fails', async ({ page }) => {
    await page.goto('/admin/user/profile')

    await expect(page.getByTestId('user-profile-view')).toBeVisible()
    await page.getByTestId('profile-email').fill('profile-error@example.com')
    await page.getByTestId('profile-save-button').click()

    await expect(page.locator('.feedback--error')).toContainText('Profile update failed')
    await expect(page.getByTestId('profile-email')).toHaveValue('profile-error@example.com')
  })

  test('shows an API error when message sending fails', async ({ page }) => {
    await page.goto('/admin/user/messages/send')

    await page.getByTestId('organization-search-input').fill('Kultur')
    await page.getByTestId('organization-search-submit').click()
    await page.getByTestId('organization-result-77').click()

    await expect(page.getByTestId('message-composer-form')).toBeVisible()
    await page.getByTestId('message-subject').fill('Trigger message error')
    await page.getByTestId('message-body').fill('This request should fail in the mock layer.')
    await page.getByTestId('message-send-button').click()

    await expect(page.locator('.inbox-feedback--error')).toContainText('Message delivery failed')
    await expect(page.getByTestId('message-subject')).toHaveValue('Trigger message error')
  })

  test('shows an API error when a team invite fails', async ({ page }) => {
    await page.goto('/admin/organization/77/team')

    await expect(page.getByTestId('organization-team-view')).toBeVisible()
    await page.getByTestId('organization-team-invite-email').fill('invite-error@example.com')
    await page.getByTestId('organization-team-invite-role').selectOption('2')
    await page.getByTestId('organization-team-invite-submit').click()

    await expect(page.locator('.feedback--error')).toContainText('Invitation could not be sent')
    await expect(page.getByTestId('organization-team-invite-email')).toHaveValue('invite-error@example.com')
  })
})
