// src/model/plutoImageModel.ts

export class PlutoImageMeta {
    constructor(
        public id: number | null = null,
        public url: string | null = null,
        public alt_text: string | null = null,
        public description: string | null = null,
        public copyright: string | null = null,
        public creator: string | null = null,
        public licenseType: string | null = null,
        public focusX: number | null = null,
        public focusY: number | null = null,
    ) {}
}

export interface PlutoImageDTO {
    id: number | null
    url?: string | null
    alt?: string | null
    description?: string | null
    copyright?: string | null
    creator?: string | null
    license?: string | null
    focus_x?: number | null
    focus_y?: number | null
}