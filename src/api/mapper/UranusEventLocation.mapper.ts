import { UranusEventLocation } from "@/domain/event/UranusEventLocation.ts";

export const mapEventLocationFromDate = (d: any): UranusEventLocation | null => {
    if (
        !d.street &&
        !d.city &&
        !d.country &&
        d.lon == null &&
        d.lat == null
    ) {
        return null
    }

    return new UranusEventLocation({
        name: d.location ?? null,
        street: d.street ?? null,
        houseNumber: d.house_number ?? null,
        postalCode: d.postal_code ?? null,
        city: d.city ?? null,
        country: d.country ?? null,
        state: d.state ?? null,
        lon: d.lon != null ? Number(d.lon) : null,
        lat: d.lat != null ? Number(d.lat) : null,
        description: null,
    })
}