export const uranusUrlParamToInt = (value: unknown): number | null => {
    if (Array.isArray(value)) {
        const [first] = value
        return uranusUrlParamToInt(first)
    }
    if (typeof value !== 'string') {
        return null
    }
    const trimmed = value.trim()
    if (!trimmed.length) {
        return null
    }
    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : null
}
