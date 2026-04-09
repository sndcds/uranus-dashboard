// scripts/generate-i18n-json.ts
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// get the directory of this script
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import { uranusI18nStandardTranslations } from '../../src/i18n/standard.ts'
// import { uranusI18nMessages } from '../../src/i18n/messages.ts'
import { uranusI18nRegisterAndLoginTranslations } from '../../src/i18n/register_and_login.ts'
import { uranusI18nTodoTranslations } from '../../src/i18n/todo.ts'
import { uranusI18nDashboardTranslations } from '../../src/i18n/dashboard.ts'
import { uranusI18nNavigationTranslations } from '../../src/i18n/navigation.ts'
import { uranusI18nFormTranslations } from '../../src/i18n/form.ts'
import { uranusI18nImageTranslations } from '../../src/i18n/image.ts'
import { uranusI18nUserTranslations } from '../../src/i18n/user.ts'
import { uranusI18nOrganizationTranslations } from '../../src/i18n/organization.ts'
import { uranusI18nVenueTranslations } from '../../src/i18n/venue.ts'
import { uranusI18nSpaceTranslations } from '../../src/i18n/space.ts'
import { uranusI18nEventTranslations } from '../../src/i18n/event.ts'
import { uranusI18nAccessibilityTranslations } from '../../src/i18n/accessibility.ts'
import { uranusI18nVisitorInfoTranslations } from '../../src/i18n/visitor-info.ts'
import { uranusI18nCalendarViewTranslations } from '../../src/i18n/calendar-view.ts'

const locales = ['de', 'en', 'da'] as const

const outputDir = path.resolve(__dirname, '../../src/i18n/json/')
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

locales.forEach((locale) => {
    const merged = {
        ...Object.fromEntries(Object.entries(uranusI18nStandardTranslations).map(([k, v]) => [k, v[locale]])),
        // ...uranusI18nMessages[locale],
        ...Object.fromEntries(Object.entries(uranusI18nRegisterAndLoginTranslations).map(([k, v]) => [k, v[locale]])),
        ...Object.fromEntries(Object.entries(uranusI18nTodoTranslations).map(([k, v]) => [k, v[locale]])),
        ...Object.fromEntries(Object.entries(uranusI18nDashboardTranslations).map(([k, v]) => [k, v[locale]])),
        ...Object.fromEntries(Object.entries(uranusI18nNavigationTranslations).map(([k, v]) => [k, v[locale]])),
        ...Object.fromEntries(Object.entries(uranusI18nFormTranslations).map(([k, v]) => [k, v[locale]])),
        ...Object.fromEntries(Object.entries(uranusI18nImageTranslations).map(([k, v]) => [k, v[locale]])),
        ...Object.fromEntries(Object.entries(uranusI18nUserTranslations).map(([k, v]) => [k, v[locale]])),
        ...Object.fromEntries(Object.entries(uranusI18nOrganizationTranslations).map(([k, v]) => [k, v[locale]])),
        ...Object.fromEntries(Object.entries(uranusI18nVenueTranslations).map(([k, v]) => [k, v[locale]])),
        ...Object.fromEntries(Object.entries(uranusI18nSpaceTranslations).map(([k, v]) => [k, v[locale]])),
        ...Object.fromEntries(Object.entries(uranusI18nEventTranslations).map(([k, v]) => [k, v[locale]])),
        ...Object.fromEntries(Object.entries(uranusI18nAccessibilityTranslations).map(([k, v]) => [k, v[locale]])),
        ...Object.fromEntries(Object.entries(uranusI18nVisitorInfoTranslations).map(([k, v]) => [k, v[locale]])),
        ...Object.fromEntries(Object.entries(uranusI18nCalendarViewTranslations).map(([k, v]) => [k, v[locale]]))
    }
    fs.writeFileSync(path.join(outputDir, `${locale}.json`), JSON.stringify(merged, null, 2))
})