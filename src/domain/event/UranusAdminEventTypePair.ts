export class UranusAdminEventTypePair {
    constructor(
        public typeId: number | null = null,
        public genreId: number | null = null
    ) {}

    isComplete(): boolean {
        return this.typeId != null && this.genreId != null
    }
}
