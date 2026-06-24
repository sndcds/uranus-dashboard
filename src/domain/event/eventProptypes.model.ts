import type { PlutoImage } from '@/domain/image/plutoImage.model.ts'

export class EventLink {
    constructor(
        public label: string | null = null,
        public type: string | null = null,
        public url: string | null = null,
    ) {}
}

export type EventImages = Record<string, PlutoImage>