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
        return trimmed
    }
    // Default to https if no protocol is provided
    return `https://${trimmed}`
}

export type HttpUrlValidation = 'valid' | 'missing-protocol' | 'invalid'

function isHttpUrl(value: string): boolean {
    // Reject malformed input that the URL parser would silently repair.
    if (!/^https?:\/\/[^/?#\\]/i.test(value) || /[\s\u0000-\u001f\u007f\\]/u.test(value)) {
        return false
    }
    try {
        const url = new URL(value)
        return (url.protocol === 'http:' || url.protocol === 'https:') && !!url.hostname
    } catch {
        return false
    }
}

/** Empty values are allowed; required-field validation belongs to the form control. */
export function validateHttpUrl(value: string | null | undefined): HttpUrlValidation {
    const trimmed = value?.trim() ?? ''
    if (!trimmed || isHttpUrl(trimmed)) return 'valid'

    // A host with a numeric port is not an explicit URI scheme.
    const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(trimmed)
    const hasHostPort = /^[^/:?#]+:\d+(?:[/?#]|$)/.test(trimmed)
    if (hasScheme && !hasHostPort) return 'invalid'

    const withoutProtocol = trimmed.replace(/^\/\//, '')
    return isHttpUrl(`https://${withoutProtocol}`) ? 'missing-protocol' : 'invalid'
}
