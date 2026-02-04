// src/model/uranusImageSlotContext.ts

export interface UranusImageSlotContext {
    identifier: string          // "main", "gallery1"
    context: 'event' | 'venue' | string
    contextId: number
    label?: string
    fitMode?: 'cover' | 'contain'
}