export function equalStringArrays(a?: string[] | null, b?: string[] | null): boolean {
    if (!a && !b) return true
    if (!a || !b) return false
    if (a.length !== b.length) return false
    return a.every(v => b.includes(v))
}
