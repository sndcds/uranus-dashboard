import { expect, test } from '../support/test'
import { installAuthenticatedState } from '../support/mockApi'

test.describe('Organization team and permissions', () => {
  test.beforeEach(async ({ page }) => {
    await installAuthenticatedState(page)
  })

  test('manages team members and invitations', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept())

    await page.goto('/admin/organization/77/team')

    await expect(page.getByTestId('organization-team-view')).toBeVisible()
    await expect(page.getByTestId('organization-team-member-501')).toBeVisible()
    await expect(page.getByTestId('organization-team-member-502')).toBeVisible()
    await expect(page.getByTestId('organization-team-invite-8801')).toBeVisible()

    await page.getByTestId('organization-team-search').fill('Nina')
    await expect(page.getByTestId('organization-team-member-502')).toBeVisible()
    await expect(page.getByTestId('organization-team-member-501')).toHaveCount(0)

    await page.getByTestId('organization-team-role-filter').selectOption('1')
    await expect(page.getByTestId('organization-team-member-502')).toHaveCount(0)

    await page.getByTestId('organization-team-search').fill('')
    await page.getByTestId('organization-team-role-filter').selectOption('all')
    await expect(page.getByTestId('organization-team-member-501')).toBeVisible()
    await expect(page.getByTestId('organization-team-member-502')).toBeVisible()

    await page.getByTestId('organization-team-invite-email').fill('new.member@example.com')
    await page.getByTestId('organization-team-invite-role').selectOption('3')
    await page.getByTestId('organization-team-invite-submit').click()

    await expect(page.getByTestId('organization-team-pending-list')).toContainText('new.member@example.com')

    await page.getByTestId('organization-team-remove-502').click()
    await expect(page.getByTestId('organization-team-member-502')).toHaveCount(0)

    await page.getByTestId('organization-team-cancel-invite-8801').click()
    await expect(page.getByTestId('organization-team-invite-8801')).toHaveCount(0)
  })

  test('updates member permissions', async ({ page }) => {
    await page.goto('/admin/organization/77/member/702/permissions')

    await expect(page.getByTestId('member-permission-view')).toBeVisible()
    await expect(page.getByTestId('permission-group-organization')).toBeVisible()

    const manageTeamToggle = page.getByTestId('permission-toggle-1')
    await expect(manageTeamToggle).not.toBeChecked()

    await manageTeamToggle.check()
    await expect(manageTeamToggle).toBeChecked()

    await page.reload()

    await expect(page.getByTestId('permission-toggle-1')).toBeChecked()
  })
})
