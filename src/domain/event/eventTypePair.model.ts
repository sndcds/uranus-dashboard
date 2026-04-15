export interface EventTypePairModel {
    typeId: number | null
    genreId: number | null
}

// Factory function to create the object
export function createEventTypePair(
    typeId: number | null = null,
    genreId: number | null = null
): EventTypePairModel {
    return {
        typeId,
        genreId
    }
}

export function isEventTypePairComplete(pair: EventTypePairModel): boolean {
    return pair.typeId != null && pair.genreId != null
}