import { test as base } from '@playwright/test'
import { mockApi } from './mockApi'

export const test = base.extend({
  page: async ({ page }, use) => {
    await mockApi(page)
    await use(page)
  },
})

export { expect } from '@playwright/test'
