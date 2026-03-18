import { expect, test } from '../support/test'
import { installAuthenticatedState } from '../support/mockApi'

test.describe('Negative paths', () => {
  test('shows errors for invalid login and signup mismatch', async ({ page }) => {
    await page.goto('/app/login')

    await page.locator('#login-email').fill('admin@example.com')
    await page.locator('#login-password').fill('wrong-password')
    await page.locator('form button[type="submit"]').click()
    await expect(page.locator('.feedback--error')).toContainText(/invalid credentials|login_failed/i)
    await expect(page).toHaveURL(/\/app\/login$/)

    await page.goto('/app/signup')
    await page.locator('#signup-email').fill('new-user@example.com')
    await page.locator('#signup-repeat-email').fill('other-user@example.com')
    await page.locator('#signup-password').fill('Password123!')
    await page.locator('form button[type="submit"]').click()
    await expect(page.locator('#signup-repeat-email')).toHaveAttribute('aria-invalid', 'true')
  })

  test('shows validation errors for forgot and reset password edge cases', async ({ page }) => {
    await page.goto('/app/forgot-password')
    await page.locator('#forgot-email').fill('invalid-email')
    await page.locator('form button[type="submit"]').click()
    await expect(page.locator('#forgot-email')).toHaveAttribute('aria-invalid', 'true')

    await page.goto('/app/reset-password')
    await page.locator('#new-password').fill('Password123!')
    await page.locator('#confirm-password').fill('Password456!')
    await page.locator('form button[type="submit"]').click()
    await expect(page.locator('#confirm-password')).toHaveAttribute('aria-invalid', 'true')

    await page.locator('#confirm-password').fill('Password123!')
    await page.locator('form button[type="submit"]').click()
    await expect(page.locator('.feedback--error')).toBeVisible()
  })

  test('shows an error when invite activation has no token', async ({ page }) => {
    await installAuthenticatedState(page)
    await page.goto('/admin/invite/accept')

    await expect(page.getByTestId('invite-activate-error')).toBeVisible()
  })
})
