// src/domain/event/UranusEventDate.ts

export interface EventDateModel {
    id: number | null
    eventId: number | null
    releaseStatus: string | null

    startDate: string | null
    startTime: string | null
    endDate: string | null
    endTime: string | null
    entryTime: string | null
    duration: number | null
    allDay: boolean

    accessibilityFlags: string | null
    accessibilitySummary: string | null
    accessibilityInfo: string | null
    visitorFlags: string | null

    totalCapacity: number | null
    seatingCapacity: number | null
    buildingLevel: number | null

    venueUuid: string | null
    venueName: string | null
    venueStreet: string | null
    venueHouseNumber: string | null
    venuePostalCode: string | null
    venueCity: string | null
    venueState: string | null
    venueCountry: string | null
    venueLon: string | null
    venueLat: string | null
    venueWebsite: string | null
    venueLogoId: number | null
    venueLightThemeLogoId: number | null
    venueDarkThemeLogoId: number | null
    venueLogoUrl: string | null
    venueLightThemeLogoUrl: string | null
    venueDarkThemeLogoUrl: string | null

    spaceUuid: string | null
    spaceName: string | null
    spaceWebsite: string | null
}

/**
 * Map API → frontend model
 */
export function mapEventDate(dto: any): EventDateModel {
    return {
        id: dto.id ?? null,
        eventId: dto.event_id ?? null,
        releaseStatus: dto.release_status ?? null,

        startDate: dto.start_date ?? null,
        startTime: dto.start_time ?? null,
        endDate: dto.end_date ?? null,
        endTime: dto.end_time ?? null,
        entryTime: dto.entry_time ?? null,
        duration: dto.duration ?? null,
        allDay: Boolean(dto.all_day),

        accessibilityFlags: dto.accessibility_flags ?? null,
        accessibilitySummary: dto.accessibility_summary ?? null,
        accessibilityInfo: dto.accessibility_info ?? null,
        visitorFlags: dto.visitor_flags ?? null,

        totalCapacity: dto.total_capacity ?? null,
        seatingCapacity: dto.seating_capacity ?? null,
        buildingLevel: dto.building_level ?? null,

        venueUuid: dto.venue_uuid ?? null,
        venueName: dto.venue_name ?? null,
        venueStreet: dto.venue_street ?? null,
        venueHouseNumber: dto.venue_house_number ?? null,
        venuePostalCode: dto.venue_postal_code ?? null,
        venueCity: dto.venue_city ?? null,
        venueState: dto.venue_state ?? null,
        venueCountry: dto.venue_country ?? null,
        venueLon: dto.venue_lon ?? null,
        venueLat: dto.venue_lat ?? null,
        venueWebsite: dto.venue_website ?? null,
        venueLogoId: dto.venue_logo_id ?? null,
        venueLightThemeLogoId: dto.venue_light_theme_logo_id ?? null,
        venueDarkThemeLogoId: dto.venue_dark_theme_logo_id ?? null,
        venueLogoUrl: dto.venue_logo_url ?? null,
        venueLightThemeLogoUrl: dto.venue_light_theme_logo_url ?? null,
        venueDarkThemeLogoUrl: dto.venue_dark_theme_logo_url ?? null,

        spaceUuid: dto.space_uuid ?? null,
        spaceName: dto.space_name ?? null,
        spaceWebsite: dto.space_web_url ?? null,
    }
}