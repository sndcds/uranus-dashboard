import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { uranusI18nMessages } from '@/i18n/uranus-i18n-index'
import UranusDevI18nTestsView from '@/view/dev/UranusDevI18nTestsView.vue'
import { uranusAgeRangeInfo, uranusAgeText, uranusPluralizedText, uranusPriceText } from '@/util/string'

const examples = [
  { locale: 'de', position: '7 von 13', countdown: 'in 6 Tagen', ago: '3 Tage her', protocol: 'https:// voranstellen' },
  { locale: 'en', position: '7 of 13', countdown: 'in 6 days', ago: '3 days ago', protocol: 'Prepend https://' },
  { locale: 'da', position: '7 af 13', countdown: 'om 6 dage', ago: '3 dage siden', protocol: 'Sæt https:// foran' },
] as const

describe.each(examples)('named interpolation ($locale)', ({ locale, position, countdown, ago, protocol }) => {
  function createTestI18n() {
    return createI18n({ legacy: false, locale, fallbackLocale: 'en', messages: uranusI18nMessages })
  }

  it('interpolates numbers and strings from the application catalogues', () => {
    const { t } = createTestI18n().global
    expect(t('one_of_n', { n: 7, m: 13 })).toBe(position)
    expect(t('in_n_days', { n: 6 })).toBe(countdown)
    expect(t('n_days_ago', { n: 3 })).toBe(ago)
    expect(t('input_url_add_protocol', { protocol: 'https://' })).toBe(protocol)
  })

  it('preserves special characters in supplied values', () => {
    const { t } = createTestI18n().global
    const name = 'Hall @ Work {A} | B'
    expect(t('confirm_delete_venue', { name })).toContain(`"${name}"`)
    expect(t('confirm_delete_space', { name })).toContain(`"${name}"`)
    expect(t('confirm_delete_org_description', { name })).toContain(`"${name}"`)
    expect(t('venue_request_partner_message', { venueName: name })).toContain(`"${name}"`)
    expect(t('venue_request_success_followup', { venueName: name })).toContain(name)
    expect(t('invite_accept_joined_org_message', { name })).toContain(name)
  })

  it('renders standard interpolation in a Vue template and reacts to locale changes', async () => {
    const i18n = createTestI18n()
    const wrapper = mount(UranusDevI18nTestsView, { global: { plugins: [i18n] } })
    expect(wrapper.text()).toContain(position)
    expect(wrapper.text()).toContain(countdown)
    expect(wrapper.text()).toContain(ago)
    i18n.global.locale.value = 'en'
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('7 of 13')
    wrapper.unmount()
  })
})

describe('translated string helpers', () => {
  function translator() {
    return createI18n({ legacy: false, locale: 'en', messages: uranusI18nMessages }).global.t
  }

  it('passes the count into singular and plural translations, including zero', () => {
    const t = translator()
    expect(uranusPluralizedText(t, 'count_event_date', 'count_event_dates', 0)).toBe('0 event dates')
    expect(uranusPluralizedText(t, 'count_event_date', 'count_event_dates', 1)).toBe('1 event date')
    expect(uranusPluralizedText(t, 'count_event_date', 'count_event_dates', 5)).toBe('5 event dates')
  })

  it('interpolates both age helpers before placeholders are consumed', () => {
    const t = translator()
    expect(uranusAgeRangeInfo(t, 0, 18)).toBe('From 0 to 18 years')
    expect(uranusAgeRangeInfo(t, 18, null)).toBe('From 18 years')
    expect(uranusAgeRangeInfo(t, undefined, 18)).toBe('Up to 18 years')
    expect(uranusAgeRangeInfo(t, null, undefined)).toBeNull()
    expect(uranusAgeText(t, 0, 18)).toBe('From 0 to 18 years')
    expect(uranusAgeText(t, 18, null)).toBe('From 18 years')
    expect(uranusAgeText(t, undefined, 18)).toBe('Up to 18 years')
    expect(uranusAgeText(t, null, undefined)).toBe('')
  })

  it('preserves price formatting and treats an absent currency as empty text', () => {
    const t = translator()
    const format = (value: number) => new Intl.NumberFormat(navigator.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
    expect(uranusPriceText(t, 0, 10, 'EUR')).toBe(`${format(0)} to ${format(10)} EUR`)
    expect(uranusPriceText(t, 10, 10, 'EUR')).toBe(`${format(10)} EUR`)
    expect(uranusPriceText(t, 0, null, null)).toBe(`${format(0)} `)
    expect(uranusPriceText(t, undefined, 10)).toBe(`${format(10)} `)
    expect(uranusPriceText(t, null, undefined)).toBeNull()
  })
})
