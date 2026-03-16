// scripts/generate-i18n-json.ts
import fs from 'fs'
import path from 'path'
import { uranusI18nStandardTranslations } from './standard.ts'
import { uranusI18nMessages } from './messages.ts'
import { uranusI18nDashboardTranslations } from './dashboard.ts'
import { uranusI18nNavigationTranslations } from './navigation.ts'
import { uranusI18nFormTranslations } from './form.ts'
import { uranusI18nImageTranslations } from './image.ts'
import { uranusI18nUserTranslations } from './user.ts'
import { uranusI18nOrganizationTranslations } from './organization.ts'
import { uranusI18nVenueTranslations } from './venue.ts'
import { uranusI18nSpaceTranslations } from './space.ts'
import { uranusI18nEventTranslations } from './event.ts'
import { uranusI18nAccessibilityTranslations } from './accessibility.ts'
import { uranusI18nVisitorInfoTranslations } from './visitor-info.ts'
import { uranusI18nCalendarViewTranslations } from './calendar-view.ts'

const locales = ['de', 'en', 'da'] as const

const outputDir = path.resolve('./src/i18n/json/')
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

locales.forEach((locale) => {
    const merged = {
        ...Object.fromEntries(Object.entries(uranusI18nStandardTranslations).map(([k, v]) => [k, v[locale]])),
        ...Object.fromEntries(Object.entries(uranusI18nMessages).map(([k, v]) => [k, v[locale]])),
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