import { expect, test } from '../support/test'
import { installAuthenticatedState } from '../support/mockApi'

test.describe('Admin todo management', () => {
  test.beforeEach(async ({ page }) => {
    await installAuthenticatedState(page)
  })

  test('creates, edits, completes and deletes a todo', async ({ page }) => {
    await page.goto('/admin/todo-list')

    await expect(page.getByTestId('admin-todo-view')).toBeVisible()
    await expect(page.getByTestId('todo-item-1')).toBeVisible()

    await page.getByTestId('admin-todo-create-button').click()
    await page.getByTestId('todo-title-input').fill('Write regression notes')
    await page.getByTestId('todo-description-input').fill('Document the new Playwright coverage.')
    await page.getByTestId('todo-due-date-input').fill('2026-04-02')
    await page.getByTestId('todo-save-button').click()

    await expect(page.getByTestId('todo-item-3')).toBeVisible()
    await expect(page.getByTestId('todo-title-3')).toContainText('Write regression notes')

    await page.getByTestId('todo-edit-3').click()
    await page.getByTestId('todo-title-input').fill('Write regression notes v2')
    await page.getByTestId('todo-completed-input').click()
    await page.getByTestId('todo-save-button').click()

    await expect(page.getByTestId('todo-title-3')).toContainText('Write regression notes v2')
    await expect(page.getByTestId('todo-item-3')).toHaveClass(/completed/)

    await page.getByTestId('todo-delete-3').click()
    await page.locator('#password').fill('Password123!')
    await page.getByTestId('password-confirm-submit').click()

    await expect(page.getByTestId('todo-item-3')).toHaveCount(0)
  })
})
