export const eventReleaseStatuses = ['draft', 'review', 'released', 'cancelled', 'deferred', 'rescheduled'] as const
export type EventReleaseStatus = typeof eventReleaseStatuses[number]

export function isEventReleaseStatus(value: string | null | undefined): value is EventReleaseStatus {
    return eventReleaseStatuses.some(status => status === value)
}

export function eventReleaseColor(value: string | null | undefined): string {
    return isEventReleaseStatus(value)
        ? `var(--uranus-event-release-background-${value})`
        : 'var(--uranus-color-4)'
}
