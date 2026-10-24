import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'
import { uranusI18nMessages } from '@/i18n/uranus-i18n-index'
import UranusAdminEventTable from '@/component/event/table/UranusAdminEventTable.vue'
import { makeAdminListEvent } from './fixtures/adminEventList'

describe('admin event table', () => {
    let wrapper: VueWrapper | undefined
    beforeEach(() => { setActivePinia(createPinia()) })
    afterEach(() => { wrapper?.unmount(); document.body.innerHTML = '' })
    async function render(events = [makeAdminListEvent()], pageSize = 50) {
        const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }] })
        await router.push('/')
        const i18n = createI18n({ legacy: false, locale: 'de', messages: uranusI18nMessages })
        wrapper = mount(UranusAdminEventTable, { attachTo: document.body, props: { events, grouped: false, pageSize }, global: { plugins: [router, i18n], stubs: { RouterLink: false } } })
        return { wrapper, router }
    }
    it('renders all fields, series, venue, category colors and release independently', async () => {
        const { wrapper } = await render()
        expect(wrapper.findAll('.event-metadata')).toHaveLength(17)
        expect(wrapper.text()).toContain('Christkirche / Rendsburg')
        expect(wrapper.get('.event-metadata--dates').text()).toContain('2/3')
        expect(wrapper.findAll('.event-category-dot')).toHaveLength(3)
        expect(wrapper.get('.event-category-indicators').text()).toContain('+1')
        expect(wrapper.get('.event-category-dot').attributes('style')).toContain('--uranus-event-category-culture-color')
        expect(wrapper.get('.admin-event-row .event-release-bar').attributes('aria-label')).toContain('Veröffentlicht')
        await wrapper.setProps({ events: [makeAdminListEvent({ releaseStatus: 'cancelled', descriptionLength: 0 })] })
        expect(wrapper.get('.admin-event-row .event-release-bar').attributes('style')).toContain('--uranus-event-release-background-cancelled')
        expect(wrapper.get('.event-metadata--text').classes()).toContain('event-metadata--missing')
    })
    it('shows missing title/date and handles failed images with stable dimensions', async () => {
        const { wrapper } = await render([makeAdminListEvent({ title: '', startDate: null })])
        expect(wrapper.get('.admin-event-title-missing').text()).toBe('Kein Titel')
        expect(wrapper.get('.event-metadata--date').text()).toContain('Kein Datum')
        expect(wrapper.get('.event-metadata--date').classes()).toContain('event-metadata--missing')
        expect(wrapper.get('img').attributes()).toMatchObject({ width: '112', height: '72', loading: 'lazy' })
        await wrapper.get('img').trigger('error')
        expect(wrapper.find('img').exists()).toBe(false)
        expect(wrapper.get('.admin-event-image-placeholder').attributes('aria-label')).toBe('Kein Vorschaubild')
    })
    it('opens focus tooltips and navigates to the existing editor and field', async () => {
        const { wrapper, router } = await render()
        const summary = wrapper.get('.event-metadata--summary a')
        expect(summary.attributes('href')).toBe('/admin/event/event-1?tab=base&field=event-summary')
        ;(summary.element as HTMLElement).focus()
        await flushPromises()
        expect(document.querySelector('[role=tooltip]')?.textContent).toContain('Zusammenfassung')
        await summary.trigger('keydown', { key: 'Escape' })
        expect(document.querySelector('[role=tooltip]')).toBeNull()
        await summary.trigger('click')
        await flushPromises()
        expect(router.currentRoute.value.query).toEqual({ tab: 'base', field: 'event-summary' })
    })
    it('uses native keyboard-operable legend and expands mobile metadata', async () => {
        const { wrapper } = await render()
        const legend = wrapper.get('details.event-column-legend')
        ;(legend.element as HTMLDetailsElement).open = true
        await legend.trigger('toggle')
        expect((legend.element as HTMLDetailsElement).open).toBe(true)
        expect(legend.findAll('li')).toHaveLength(17)
        expect(legend.text()).toContain('keine Gesamtbewertung')
        const toggle = wrapper.get('.admin-event-mobile-toggle')
        expect(toggle.attributes('aria-expanded')).toBe('false')
        await toggle.trigger('click')
        expect(toggle.attributes('aria-expanded')).toBe('true')
    })
    it('opens the action dialog, moves focus and closes with Escape', async () => {
        const { wrapper } = await render()
        const info = wrapper.get('.event-metadata--info button')
        ;(info.element as HTMLElement).focus()
        await info.trigger('click')
        await flushPromises()
        const dialog = document.querySelector('[role=dialog]')
        expect(dialog).not.toBeNull()
        expect(dialog?.contains(document.activeElement)).toBe(true)
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        await flushPromises()
        expect(document.querySelector('[role=dialog]')).toBeNull()
        expect(document.activeElement).toBe(info.element)
    })
    it('keeps search, status filters, ordering and pagination working together', async () => {
        const { wrapper } = await render([makeAdminListEvent({ uuid: 'a', title: 'Alpha', releaseStatus: 'draft' }), makeAdminListEvent({ uuid: 'b', title: 'Beta' }), makeAdminListEvent({ uuid: 'c', title: 'Gamma', descriptionLength: 0 })], 2)
        expect(wrapper.findAll('.admin-event-row')).toHaveLength(2)
        await wrapper.get('[aria-label="Nächste Seite"]').trigger('click')
        expect(wrapper.findAll('.admin-event-row')).toHaveLength(1)
        expect(wrapper.get('.admin-event-row h2').text()).toBe('Gamma')
        await wrapper.get('select[aria-label="Release-Status filtern"]').setValue('released')
        expect(wrapper.text()).toContain('Seite 1 von 1')
        await wrapper.get('input[type=search]').setValue('Beta')
        expect(wrapper.findAll('.admin-event-row')).toHaveLength(1)
        await wrapper.get('input[type=search]').setValue('')
        await wrapper.get('select[aria-label="Sortierung"]').setValue('descending')
        expect(wrapper.get('.admin-event-row h2').text()).toBe('Gamma')
        await wrapper.get('input[type=checkbox][value=text]').setValue(true)
        expect(wrapper.findAll('.admin-event-row')).toHaveLength(1)
    })
    it('does not offer edit links without edit permission', async () => {
        const { wrapper } = await render([makeAdminListEvent({ canEditEvent: false })])
        expect(wrapper.findAll('a')).toHaveLength(0)
        expect(wrapper.get('.event-metadata--summary span.event-metadata-control').attributes('tabindex')).toBe('0')
    })
    it('does not count the backend zero sentinel as a genre', async () => {
        const { wrapper } = await render([makeAdminListEvent({ eventTypes: [{ typeId: 1, genreId: 0 }] })])
        expect(wrapper.get('.event-metadata--genres .event-metadata-value').text()).toBe('0')
        expect(wrapper.get('.event-metadata--types .event-metadata-value').text()).toBe('1')
    })
    it('retains the search while the list reloads', async () => {
        const { wrapper } = await render()
        await wrapper.get('input[type=search]').setValue('Gospel')
        await wrapper.setProps({ loading: true, events: [] })
        expect(wrapper.find('.admin-event-table-empty').exists()).toBe(false)
        await wrapper.setProps({ loading: false, events: [makeAdminListEvent()] })
        expect((wrapper.get('input[type=search]').element as HTMLInputElement).value).toBe('Gospel')
        expect(wrapper.findAll('.admin-event-row')).toHaveLength(1)
    })
    it('uses a neutral, accessible fallback for unknown release statuses', async () => {
        const { wrapper } = await render([makeAdminListEvent({ releaseStatus: 'future-server-status' })])
        const status = wrapper.get('.admin-event-row .event-release-bar')
        expect(status.attributes('aria-label')).toContain('future-server-status')
        expect(status.attributes('style')).toContain('--uranus-color-4')
    })
    it('identifies online events using the existing API online_link', async () => {
        const { wrapper } = await render([makeAdminListEvent({ venueName: null, venueCity: null, isOnlineEvent: false, onlineLink: 'https://example.test/stream' })])
        expect(wrapper.get('.admin-event-venue').text()).toBe(uranusI18nMessages.de.online_event)
    })
})
