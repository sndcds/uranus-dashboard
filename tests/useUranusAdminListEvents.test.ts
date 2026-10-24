import { describe, expect, it, vi } from 'vitest'
import { apiFetch } from '@/api'
import { useUranusAdminListEvents } from '@/composable/useUranusAdminListEvents'
vi.mock('@/api', () => ({ apiFetch: vi.fn() }))

describe('admin list API', () => {
    it('loads all metadata in one existing list request and preserves zero, false and null', async () => {
        vi.mocked(apiFetch).mockResolvedValueOnce({ data: [{ uuid: 'event-1', date_uuid: null, start_date: null, image_count: 0, description_length: 0, has_registration: false, event_types: [{ type_id: 1, genre_id: null }] }], metadata: { can_add_event: true } } as any)
        const list = useUranusAdminListEvents()
        await list.fetchAdminListEvents('org-1')
        expect(apiFetch).toHaveBeenCalledExactlyOnceWith('/api/admin/org/org-1/events')
        expect(list.adminListEvents.value[0]).toMatchObject({ dateUuid: null, startDate: null, imageCount: 0, descriptionLength: 0, hasRegistration: false, eventTypes: [{ typeId: 1, genreId: null }] })
        expect(list.metadata.value.can_add_event).toBe(true)
    })
    it('ignores stale responses when the organization changes', async () => {
        let resolveFirst!: (value: any) => void
        vi.mocked(apiFetch).mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve }))
        vi.mocked(apiFetch).mockResolvedValueOnce({ data: [{ uuid: 'new-org-event' }] } as any)
        const list = useUranusAdminListEvents()
        const first = list.fetchAdminListEvents('old-org')
        await list.fetchAdminListEvents('new-org')
        resolveFirst({ data: [{ uuid: 'old-org-event' }] })
        await first
        expect(list.adminListEvents.value.map(event => event.uuid)).toEqual(['new-org-event'])
        expect(list.loading.value).toBe(false)
    })
    it('does not query without an organization and exposes loading errors', async () => {
        const list = useUranusAdminListEvents()
        await list.fetchAdminListEvents(null)
        expect(apiFetch).not.toHaveBeenCalled()
        vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Failed request'))
        await list.fetchAdminListEvents('org-1')
        expect(list.error.value).toBe('Failed request')
        expect(list.adminListEvents.value).toEqual([])
        expect(list.loading.value).toBe(false)
    })
})
