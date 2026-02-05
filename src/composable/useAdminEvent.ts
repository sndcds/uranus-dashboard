import { ref, computed } from 'vue'

/* TODO: Remove!
export function mapAdminEventDate(json: UranusAdminEventDateDTO): UranusAdminEventDate {
    return {
        id: json.id,
        eventId: json.event_id,
        startDate: json.start_date ?? undefined,
        startTime: json.start_time ?? undefined,
        endDate: json.end_date ?? undefined,
        endTime: json.end_time ?? undefined,
        entryTime: json.entry_time ?? undefined,
        duration: json.duration ?? undefined,
        accessibilityInfo: json.accessibility_info ?? undefined,
        venueId: json.venue_id ?? undefined,
        spaceId: json.space_id ?? undefined,
    }
}

export function useAdminEventMapper(json: UranusAdminEventDTO): UranusAdminEvent {
    // Map event_types
    const event_types: UranusEventType[] = (json.event_types ?? []).map(et => ({
        type: et.type_id,
        typeName: et.type_name ?? undefined,
        genre: et.genre_id,
        genreName: et.genre_name ?? undefined
    }))

    // Map event_links
    const event_links: UranusWebLink[] = (json.event_links ?? []).map(link => ({
        id: link.id,
        title: link.title ?? undefined,
        type: link.type ?? undefined,
        url: link.url
    }))

    // Map images
    const images: UranusImage[] = (json.images ?? []).map(img => ({
        id: img.id,
        identifier: img.identifier,
        url: img.url,
        alt: img.alt ?? undefined,
        creator: img.creator ?? undefined,
        copyright: img.copyright ?? undefined,
        description: img.description ?? undefined,
        license: img.license ?? undefined,
        focusX: img.focus_x ?? undefined,
        focusY: img.focus_y ?? undefined
    }))

    const dates: UranusAdminEventDate[] = (json.dates ?? []).map(mapAdminEventDate)

    // Map top-level properties
    const id = json.id
    const external_id = json.external_id ?? undefined
    const source_url = json.source_url ?? undefined
    const release_status = json.release_status
    const release_date = json.release_date ?? undefined
    const content_language = json.content_language ?? undefined
    const organization_id = json.organization_id
    const organization_name = json.organization_name
    const title = json.title
    const subtitle = json.subtitle ?? undefined
    const description = json.description ?? undefined
    const summary = json.summary ?? undefined
    const tags = json.tags ?? []
    const occasion_type = json.occasion_type ?? undefined
    const venue_id = json.venue_id ?? undefined
    const venue_name = json.venue_name ?? undefined
    const venue_street = json.venue_street ?? undefined
    const venue_house_number = json.venue_house_number ?? undefined
    const venue_postal_code = json.venue_postal_code ?? undefined
    const venue_city = json.venue_city ?? undefined
    const venue_country = json.venue_country ?? undefined
    const venue_state = json.venue_state ?? undefined
    const venue_lon = json.venue_lon ?? undefined
    const venue_lat = json.venue_lat ?? undefined
    const space_id = json.space_id ?? undefined
    const space_name = json.space_name ?? undefined
    const space_total_capacity = json.space_total_capacity ?? undefined
    const space_seating_capacity = json.space_seating_capacity ?? undefined
    const space_building_level = json.space_building_level ?? undefined
    const online_link = json.online_link ?? undefined
    const meeting_point = json.meeting_point ?? undefined
    const languages = json.languages ?? []
    const participation_info = json.participation_info ?? undefined
    const min_age = json.min_age ?? undefined
    const max_age = json.max_age ?? undefined
    const max_attendees = json.max_attendees ?? undefined
    const price_type = json.price_type ?? undefined
    const min_price = json.min_price ?? undefined
    const max_price = json.max_price ?? undefined
    const ticket_advance = json.ticket_advance ?? undefined
    const ticket_required = json.ticket_required ?? undefined
    const registration_required = json.registration_required ?? undefined
    const currency = json.currency ?? undefined
    const currency_name = json.currency_name ?? undefined
    const custom = json.custom ?? undefined
    const style = json.style ?? undefined

    // Computed helpers
    const hasImages = computed(() => images.length > 0)
    const hasLinks = computed(() => event_links.length > 0)
    const hasDates = computed(() => dates.length > 0)

    return {
        id,
        externalId: external_id,
        sourceUrl: source_url,
        releaseStatus: release_status,
        releaseDate: release_date,
        contentLanguage: content_language,
        organizationId: organization_id,
        organizationName: organization_name,
        title,
        subtitle,
        description,
        summary,
        eventTypes: event_types,
        eventLinks: event_links,
        tags,
        occasionType: occasion_type,
        venueId: venue_id,
        venueName: venue_name,
        venueStreet: venue_street,
        venueHouseNumber: venue_house_number,
        venuePostalCode: venue_postal_code,
        venueCity: venue_city,
        venueCountry: venue_country,
        venueState: venue_state,
        venueLon: venue_lon,
        venueLat: venue_lat,
        spaceId: space_id,
        spaceName: space_name,
        spaceTotalCapacity: space_total_capacity,
        spaceSeatingCapacity: space_seating_capacity,
        spaceBuildingLevel: space_building_level,
        onlineLink: online_link,
        meetingPoint: meeting_point,
        languages,
        participationInfo: participation_info,
        minAge: min_age,
        maxAge: max_age,
        maxAttendees: max_attendees,
        priceType: price_type,
        minPrice: min_price,
        maxPrice: max_price,
        ticketAdvance: ticket_advance,
        ticketRequired: ticket_required,
        registrationRequired: registration_required,
        currency,
        currencyName: currency_name,
        images,
        custom,
        style,
        dates,
    }
}
*/
