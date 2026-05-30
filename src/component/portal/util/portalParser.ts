/*
    src/component/portal/util/portalParser.ts
 */

export function normalizeJsonObject<T extends object>(
    value: T | string | null | undefined
): T | null {
    if (!value) return null

    if (typeof value === 'object' && !Array.isArray(value)) {
        return value
    }

    if (typeof value !== 'string') return null

    try {
        const parsed = JSON.parse(value)

        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? (parsed as T)
            : null
    } catch {
        return null
    }
}

export function normalizePortalPrefilter(
    prefilter: Record<string, unknown> | string | null | undefined
): Record<string, unknown> | null {
    if (!prefilter) return null
    if (typeof prefilter === 'object' && !Array.isArray(prefilter)) return prefilter

    if (typeof prefilter === 'string') {
        try {
            const parsed = JSON.parse(prefilter)
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                ? parsed
                : null
        } catch {
            return null
        }
    }

    return null
}

export function isPrefilterValue(value: unknown): value is string | number {
    return (
        (typeof value === 'string' && value.trim().length > 0) ||
        (typeof value === 'number' && Number.isFinite(value))
    )
}

export function isPrefilterStringList(value: unknown): value is string[] {
    return (
        Array.isArray(value) &&
        value.some(item => typeof item === 'string' && item.trim().length > 0)
    )
}