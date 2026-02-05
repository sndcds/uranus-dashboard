export class UranusEventType {
    constructor(
        public typeId: number,
        public typeName: string,
        public genreId?: number | null,
        public genreName?: string | null
    ) {}

    hasGenre(): boolean {
        return this.genreId != null
    }
}