export enum UranusImageLicense {
    CC_BY = 1,
    CC_BY_SA,
    CC0,
    AllRightsReserved,
    // etc.
}

export class UranusImage {
    constructor(
        public id: number | null = null,
        public url: string | null = null,
        public alt: string | null = null,
        public creator: string | null = null,
        public copyright: string | null = null,
        public description: string | null = null,
        public license: UranusImageLicense | null = null,
    ) {}

    hasLicense(): boolean {
        return this.license != null
    }

    displayName(): string {
        return this.alt ?? 'Untitled image'
    }
}