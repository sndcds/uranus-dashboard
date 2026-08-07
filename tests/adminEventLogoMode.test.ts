import { describe, expect, it } from 'vitest'
import { mapAdminEventFromDTO, mapAdminEventToDTO } from '@/api/mapper/adminEvent.mapper.ts'
import { createAdminEvent } from '@/domain/event/adminEvent.model.ts'
import type { AdminEventDTO } from '@/api/dto/adminEvent.dto.ts'

describe('admin event logo mode mapping', () => {
  it('maps logo_mode from DTO to admin event', () => {
    const dto = {
      uuid: 'event-1',
      title: 'Test event',
      org_uuid: 'org-1',
      event_types: [],
      event_links: [],
      dates: [],
      logo_mode: 2,
    } as AdminEventDTO

    const event = mapAdminEventFromDTO(dto)

    expect(event?.logoMode).toBe(2)
  })

  it('maps logoMode to DTO for saving', () => {
    const event = createAdminEvent({ logoMode: 1 })

    const dto = mapAdminEventToDTO(event)

    expect(dto.logo_mode).toBe(1)
  })
})
