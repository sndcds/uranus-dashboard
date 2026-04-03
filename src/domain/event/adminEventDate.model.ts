export type AdminEventDateModel = {
    uuid: string
    eventUuid: string
    startDate: string | null
    startTime: string | null
    endDate: string | null
    endTime: string | null
    entryTime: string | null
    duration: number | null
    accessibilityInfo: string | null
    venueUuid: string | null
    spaceUuid: string | null
    allDay: boolean | null
}

export function createUranusAdminEventDate(
    props: Partial<AdminEventDateModel> = {}
): AdminEventDateModel {
    return {
        uuid: props.uuid ?? '',
        eventUuid: props.eventUuid ?? '',
        startDate: props.startDate ?? null,
        startTime: props.startTime ?? null,
        endDate: props.endDate ?? null,
        endTime: props.endTime ?? null,
        entryTime: props.entryTime ?? null,
        duration: props.duration ?? null,
        accessibilityInfo: props.accessibilityInfo ?? null,
        venueUuid: props.venueUuid ?? null,
        spaceUuid: props.spaceUuid ?? null,
        allDay: props.allDay ?? null,
    }
}