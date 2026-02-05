export class UranusAdminEventDate {
    id: number
    eventId: number
    startDate: string | null
    startTime: string | null
    endDate: string | null
    endTime: string | null
    entryTime: string | null
    duration: number | null
    accessibilityInfo: string | null
    venueId: number | null
    spaceId: number | null

    constructor(props: Partial<UranusAdminEventDate> = {}) {
        this.id = props.id ?? 0
        this.eventId = props.eventId ?? 0
        this.startDate = props.startDate ?? null
        this.startTime = props.startTime ?? null
        this.endDate = props.endDate ?? null
        this.endTime = props.endTime ?? null
        this.entryTime = props.entryTime ?? null
        this.duration = props.duration ?? null
        this.accessibilityInfo = props.accessibilityInfo ?? null
        this.venueId = props.venueId ?? null
        this.spaceId = props.spaceId ?? null
    }

    // Example helper
    isAllDay(): boolean {
        return !this.startTime && !this.endTime
    }
}