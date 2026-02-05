// src/domain/event/UranusEventLocation.ts
export class UranusEventLocation {
    id: number | null
    name: string | null
    street: string | null
    houseNumber: string | null
    postalCode: string | null
    city: string | null
    country: string | null
    state: string | null
    lon: number | null
    lat: number | null
    description: string | null

    constructor(props: Partial<UranusEventLocation> = {}) {
        this.id = props.id ?? null
        this.name = props.name ?? null
        this.street = props.street ?? null
        this.houseNumber = props.houseNumber ?? null
        this.postalCode = props.postalCode ?? null
        this.city = props.city ?? null
        this.country = props.country ?? null
        this.state = props.state ?? null
        this.lon = props.lon ?? null
        this.lat = props.lat ?? null
        this.description = props.description ?? null
    }

    /** Returns a full address string like "123 Main St, 12345 City" */
    get fullAddress(): string {
        const parts = [
            [this.street, this.houseNumber].filter(Boolean).join(' '),
            this.postalCode,
            this.city
        ].filter(Boolean)
        return parts.join(', ')
    }

    /** Checks if the location has valid coordinates */
    hasCoordinates(): boolean {
        return this.lon != null && this.lat != null
    }

    /** Returns a display name fallback if name is missing */
    displayName(): string {
        return this.name ?? this.fullAddress ?? 'Unknown location'
    }
}