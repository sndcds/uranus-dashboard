import { UranusEventDate } from '@/domain/event/UranusEventDate.ts'
import { UranusEventLocation } from '@/domain/event/UranusEventLocation.ts'


interface UranusEventDateDTO {
    id?: number
    event_id?: number
    release_status?: string
    start_date?: string
    start_time?: string
    end_date?: string
    end_time?: string
    entry_time?: string
    duration?: number
    all_day?: boolean
    accessibility_flags?: string
    accessibility_summary?: string
    accessibility_info?: string
    visitor_flags?: string
    street?: string
    house_number?: string
    postal_code?: string
    city?: string
    country?: string
    state?: string
    lon?: number
    lat?: number
    total_capacity?: number
    seating_capacity?: number
    building_level?: number
    venue_id?: number
    venue_name?: string
    venue_website?: string
    venue_logo_id?: number
    venue_logo_url?: string
    space_id?: number
    space_name?: string
    space_website?: string
}

function mapEventDateFromApi(dto: UranusEventDateDTO): UranusEventDate {
    return new UranusEventDate(
        dto.id ?? null,
        dto.event_id ?? null,
        dto.release_status ?? null,
        dto.start_date ?? null,
        dto.start_time ?? null,
        dto.end_date ?? null,
        dto.end_time ?? null,
        dto.entry_time ?? null,
        dto.duration ?? null,
        dto.all_day ?? false,
        dto.accessibility_flags ?? null,
        dto.accessibility_summary ?? null,
        dto.accessibility_info ?? null,
        dto.visitor_flags ?? null,
        new UranusEventLocation({
            street: dto.street ?? null,
            houseNumber: dto.house_number ?? null,
            postalCode: dto.postal_code ?? null,
            city: dto.city ?? null,
            country: dto.country ?? null,
            state: dto.state ?? null,
            lon: dto.lon ?? null,
            lat: dto.lat ?? null,
        }),
        dto.total_capacity ?? null,
        dto.seating_capacity ?? null,
        dto.building_level ?? null,
        dto.venue_id ?? null,
        dto.venue_name ?? null,
        dto.venue_website ?? null,
        dto.venue_logo_id ?? null,
        dto.venue_logo_url ?? null,
        dto.space_id ?? null,
        dto.space_name ?? null,
        dto.space_website ?? null,
    )
}