import { expect, test } from '../support/test'

test.describe('Authentication flows', () => {
  test('blocks protected routes, validates login, and redirects after success', async ({ page }) => {
    await page.goto('/admin/dashboard')

    await expect(page).toHaveURL(/\/app\/login/)
    await expect(page.getByRole('heading', { level: 1, name: /login/i })).toBeVisible()

    await page.locator('form button[type="submit"]').click()
    await expect(page.locator('#login-email')).toHaveAttribute('aria-invalid', 'true')

    await page.locator('#login-email').fill('admin@example.com')
    await page.locator('#login-password').fill('Password123!')
    await page.locator('form button[type="submit"]').click()

    await expect(page).toHaveURL(/\/admin\/dashboard$/)
    await expect(page.getByRole('heading', { level: 2, name: /notifications/i })).toBeVisible()
    await expect(page.getByText('Jazz Night Flensburg')).toBeVisible()
  })

  test('supports signup, forgot password and reset password flows', async ({ page }) => {
    await page.goto('/app/signup')

    await page.locator('form button[type="submit"]').click()
    await expect(page.locator('#signup-email')).toHaveAttribute('aria-invalid', 'true')

    await page.locator('#signup-email').fill('new-user@example.com')
    await page.locator('#signup-repeat-email').fill('new-user@example.com')
    await page.locator('#signup-password').fill('Password123!')
    await page.locator('form button[type="submit"]').click()

    await expect(page.locator('.feedback--success')).toBeVisible()

    await page.goto('/app/forgot-password')
    await page.locator('form button[type="submit"]').click()
    await expect(page.locator('#forgot-email')).toHaveAttribute('aria-invalid', 'true')

    await page.locator('#forgot-email').fill('new-user@example.com')
    await page.locator('form button[type="submit"]').click()
    await expect(page.locator('.feedback--success')).toBeVisible()

    await page.goto('/app/reset-password?token=reset-token-123')
    await page.locator('form button[type="submit"]').click()
    await expect(page.locator('#new-password')).toHaveAttribute('aria-invalid', 'true')

    await page.locator('#new-password').fill('Password123!')
    await page.locator('#confirm-password').fill('Password123!')
    await page.locator('form button[type="submit"]').click()
    await expect(page.locator('.feedback--success')).toBeVisible()
  })
})
