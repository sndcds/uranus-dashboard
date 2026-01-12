declare module 'culori' {
    export function parse(color: string): any
    export function formatRgb(color: any): string
    export function formatHex(color: any): string
    // you can add more functions if needed
    export function formatOklch(color: any): string
}