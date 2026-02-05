export class UranusVenueSpaceSelection {
    constructor(
        public dateVenueId: number | null = null,
        public venueId: number | null = null,
        public spaceId: number | null = null,
        public venueName: string | null = null,
        public spaceName: string | null = null,
    ) {}

    isComplete(): boolean {
        return this.venueId != null && this.spaceId != null
    }

    displayName(): string {
        return this.spaceName ?? this.venueName ?? 'Unknown'
    }
}