export interface EventTypePairModel {
    typeId: number | null
    genreId: number | null
    isComplete(): boolean
}

// Factory function to create the object
export function createEventTypePair(
    typeId: number | null = null,
    genreId: number | null = null
): EventTypePairModel {
    return {
        typeId,
        genreId,
        isComplete() {
            return this.typeId != null && this.genreId != null
        },
    }
}