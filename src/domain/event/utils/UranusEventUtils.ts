// src/domain/event/utils/eventUtils.ts
import { UranusEventTypePair } from '@/domain/event/UranusEventTypePair.ts'

/**
 * Sorts an array of UranusEventTypePair by typeId first, then genreId
 */
export function uranusSortEventTypes(types: UranusEventTypePair[]): UranusEventTypePair[] {
    return [...types].sort((a, b) => {
        const ta = a.typeId ?? -1
        const tb = b.typeId ?? -1
        const ga = a.genreId ?? -1
        const gb = b.genreId ?? -1

        // Sort by typeId first, then genreId
        return (ta - tb) || (ga - gb)
    })
}