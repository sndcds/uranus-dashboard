import { useTokenStore } from '@/store/uranusTokenStore.ts'
import { apiUrl } from '@/api/baseUrl.ts'
import { authSession, SessionError, type SessionProfile } from '@/api/authSession.ts'
import { ApiError } from '@/api/apiError.ts'

export { ApiError } from '@/api/apiError.ts'
export type LoginResponse = SessionProfile

export interface ApiResponse<T> {
    service: string
    api_version: string
    response_type: string
    status: number
    message?: string
    timestamp: string
    metadata?: Record<string, any>
    data?: T
}

export interface NominatimResult {
    lat: string
    lon: string
}

const NOMINATIM_BASE_URL = 'https://nominatim.oklabflensburg.de'

export const fetchCoordinatesForAddress = async (query: string, limit = 1): Promise<NominatimResult | null> => {
    const params = new URLSearchParams({ q: query, limit: String(limit), format: 'jsonv2' })
    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params.toString()}`)
    if (!response.ok) {
        throw new Error(`Nominatim request failed with status ${response.status}`)
    }

    const results = (await response.json()) as NominatimResult[]
    if (!Array.isArray(results) || results.length === 0) {
        return null
    }

    const [first] = results
    return first ?? null
}

/**
 * Fetch wrapper that automatically refreshes JWT access token on 401
 * and retries the original request. Safe for parallel requests.
 */
export async function apiFetch<T = unknown>(
    path: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    if (['/api/login', '/api/admin/refresh', '/api/admin/logout'].includes(path)) {
        throw new Error('Use the session store for authentication requests')
    }
    const authenticatedRequest = path.startsWith('/api/admin/')
    const url = apiUrl(path)
    const tokenStore = useTokenStore()
    const requestSessionVersion = authSession.version

    const doFetch = async (): Promise<ApiResponse<T>> => {
        const headers = new Headers(options.headers ?? undefined)

        if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json')
        }

        // Protected requests use HttpOnly cookies. Public endpoints retain their
        // wildcard CORS policy and must not receive credentialed requests.
        headers.delete('Authorization')
        const version = authSession.version
        const raw = await fetch(url, { ...options, headers, credentials: authenticatedRequest ? 'include' : 'omit' })
        if (authenticatedRequest && version !== authSession.version) throw new SessionError('changed')

        const contentType = raw.headers.get('content-type') ?? ''
        let apiResonse: ApiResponse<T> | null = null

        if (contentType.includes('application/json')) {
            try {
                apiResonse = await raw.json() as ApiResponse<T>
            } catch {
                apiResonse = null
            }
        } else {
            // If server returns plain text (rare)
            const text = await raw.text().catch(() => '')
            apiResonse = {
                service: 'unknown',
                api_version: 'unknown',
                response_type: 'unknown',
                status: raw.status,
                timestamp: new Date().toISOString(),
                data: text as any,
            }
        }

        if (authenticatedRequest && version !== authSession.version) throw new SessionError('changed')

        if (!raw.ok) {
            throw new ApiError(apiResonse?.message || raw.statusText, raw.status)
        }

        return apiResonse!
    }

    try {
        return await doFetch()
    } catch (err) {
        if (
            err instanceof ApiError &&
            err.status === 401 &&
            authenticatedRequest
        ) {
            const authenticated = await tokenStore.restoreSession()
            if (!authenticated) throw err

            if (requestSessionVersion && requestSessionVersion !== authSession.version) throw new SessionError('changed')
            // Retry once with the renewed cookies; a second 401 is not retried.
            return await doFetch()
        }

        throw err
    }
}

/**
 * Recursively removes all null and undefined fields from an object or array.
 */
export function deepClean<T>(obj: T): T {
    if (Array.isArray(obj)) {
        return obj
            .map((item) => deepClean(item))
            .filter((item) => item !== null && item !== undefined) as T
    } else if (obj !== null && typeof obj === 'object') {
        const cleaned: any = {}
        Object.entries(obj).forEach(([key, value]) => {
            const cleanedValue = deepClean(value)
            if (cleanedValue !== null && cleanedValue !== undefined) {
                cleaned[key] = cleanedValue
            }
        })
        return cleaned
    }
    return obj
}
