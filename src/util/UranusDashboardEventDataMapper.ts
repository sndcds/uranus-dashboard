import { type UranusEventType, UranusImage, UranusEventTypePair } from '@/model/uranusEventModel.ts'
import { toNumberOrNull, toString, toNullableString } from './UranusUtils.ts'
import UranusEditEventImages from "@/component/event/UranusEditEventImages.vue";



/**
 * Maps raw event type object to UranusEventTypePair
 */
const mapEventType = (raw: unknown): UranusEventTypePair | null => {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>

    const typeId = toNumberOrNull(r.type_id)
    if (typeId === null) return null

    return new UranusEventTypePair(
        typeId,
        toNumberOrNull(r.genre_id),
    )
}