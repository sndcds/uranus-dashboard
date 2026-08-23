/*
    src/api/dto/plutoImage.dto.ts
 */

export interface PlutoImageDTO {
    uuid: string | null
    url?: string | null
    alt_text?: string | null
    description?: string | null
    copyright?: string | null
    creator?: string | null
    license?: string | null
    ai_label?: string | null
    focus_x?: number | null
    focus_y?: number | null
}