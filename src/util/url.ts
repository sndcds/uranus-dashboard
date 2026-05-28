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

export function uranusEnsureHttpOrHttps(url: string): string {
    const trimmed = url.trim()
    // Already has http:// or https://
    if (/^https?:\/\//i.test(trimmed)) {
        console.log("xxxx", trimmed)
        return trimmed
    }
    // Default to https if no protocol is provided
    console.log("yyyy", `https://${trimmed}`)
    return `https://${trimmed}`
}