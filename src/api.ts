import { useTokenStore } from '@/store/uranusTokenStore.ts'
import router from '@/router/index.ts'
import type { ThemeMode } from '@/util/theme.ts'

let refreshPromise: Promise<boolean> | null = null

// Use snake case here!
export interface LoginResponse {
    user_uuid: string
    locale?: string
    theme?: ThemeMode
    display_name?: string | null
    first_name?: string | null
    last_name?: string | null
    avatar_url?: string | null
    access_token: string
    refresh_token: string
}

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

/**
 * Custom Error type that includes HTTP status and response data
 */
export class ApiError extends Error {
    status: number
    error: string

    constructor(message: string, status: number) {
        super(message)
        this.status = status
        this.error = message
    }
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
    const url = `${import.meta.env.VITE_API_URL}${path}`
    const tokenStore = useTokenStore()

    const doFetch = async (): Promise<ApiResponse<T>> => {
        const headers = new Headers(options.headers ?? undefined)

        if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json')
        }

        if (tokenStore.accessToken) {
            headers.set('Authorization', `Bearer ${tokenStore.accessToken}`)
        }

        const raw = await fetch(url, { ...options, headers })

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
            !url.includes('/refresh') &&
            !url.includes('/login')
        ) {
            if (!refreshPromise) {
                refreshPromise = (async () => {
                    if (!tokenStore.refreshToken) {
                        tokenStore.clearTokens()
                        router.push('/app/login')
                        throw new Error('Missing refresh token')
                    }

                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/refresh`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${tokenStore.refreshToken}`,
                        },
                    })

                    if (!res.ok) {
                        tokenStore.clearTokens()
                        router.push('/app/login')
                        throw new Error('Refresh failed')
                    }

                    const data = (await res.json()) as LoginResponse

                    if (!data.access_token) {
                        tokenStore.clearTokens()
                        router.push('/app/login')
                        throw new Error('Refresh response missing access token')
                    }

                    tokenStore.setAccessToken(data.access_token)

                    if (data.refresh_token) {
                        tokenStore.setRefreshToken(data.refresh_token)
                    }

                    return true
                })()
            }

            try {
                await refreshPromise
            } finally {
                refreshPromise = null
            }

            // Retry the original request with the new access token
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
