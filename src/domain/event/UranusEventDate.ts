import { type UranusEventLocation } from '@/domain/event/UranusEventLocation.ts'

export class UranusEventDate {
    constructor(
        public id: number | null = null,
        public eventId: number | null = null,
        public releaseStatus: string | null = null,
        public startDate: string | null = null,
        public startTime: string | null = null,
        public endDate: string | null = null,
        public endTime: string | null = null,
        public entryTime: string | null = null,
        public duration: number | null = null,
        public allDay: boolean = false,
        public accessibilityFlags: string | null = null,
        public accessibilitySummary: string | null = null,
        public accessibilityInfo: string | null = null,
        public visitorFlags: string | null = null,
        public location: UranusEventLocation | null = null,
        public totalCapacity: number | null = null,
        public seatingCapacity: number | null = null,
        public buildingLevel: number | null = null,
        public venueId: number | null = null,
        public venueName: string | null = null,
        public venueWebsite: string | null = null,
        public venueLogoId: number | null = null,
        public venueLogoUrl: string | null = null,
        public spaceId: number | null = null,
        public spaceName: string | null = null,
        public spaceWebsite: string | null = null,
    ) {}
}