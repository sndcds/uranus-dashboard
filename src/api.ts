import { useTokenStore } from '@/store/token'
import type { ThemeMode } from '@/utils/theme'

let refreshPromise: Promise<boolean> | null = null;

export interface LoginResponse {
    message: string;
    user_id?: string;
    locale?: string;
    theme?: ThemeMode;
    display_name?: string;
    access_token?: string;
    refresh_token?: string;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
}

/**
 * Custom Error type that includes HTTP status and response data
 */
class ApiError extends Error {
    status: number;
    data: unknown;

    constructor(message: string, status: number, data: unknown) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

/**
 * Fetch wrapper that automatically refreshes JWT access token on 401
 * and retries the original request. Safe for parallel requests.
 */
export async function apiFetch<T = unknown>(
    path: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${import.meta.env.VITE_API_URL}${path}`;
    const tokenStore = useTokenStore();

    const doFetch = async (): Promise<ApiResponse<T>> => {
        const headers = new Headers(options.headers ?? undefined);

        // Only set JSON Content-Type if body is NOT FormData
        if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        if (tokenStore.accessToken) {
            headers.set('Authorization', `Bearer ${tokenStore.accessToken}`);
        } else {
            headers.delete('Authorization');
        }

        const res = await fetch(url, { ...options, headers });

        const contentType = res.headers.get('content-type') ?? '';
        let data: unknown = null;

        if (contentType.includes('application/json')) {
            try {
                data = await res.json();
            } catch {
                data = null;
            }
        } else {
            try {
                data = await res.text();
            } catch {
                data = null;
            }
        }

        if (!res.ok) {
            const message =
                (data && typeof data === 'object' && 'error' in data
                    ? (data as { error?: string }).error
                    : null) || res.statusText;

            throw new ApiError(message, res.status, data);
        }

        return {
            data: data as T,
            status: res.status,
        };
    };

    try {
        return await doFetch();
    } catch (err) {
        if (
            err instanceof ApiError &&
            err.status === 401 &&
            !url.includes('/refresh')
        ) {
            if (!refreshPromise) {
                refreshPromise = (async () => {
                    if (!tokenStore.refreshToken) {
                        tokenStore.clearTokens();
                        window.location.href = '/login';
                        throw new Error('Missing refresh token');
                    }

                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/refresh`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${tokenStore.refreshToken}`,
                        },
                    });

                    if (!res.ok) {
                        tokenStore.clearTokens();
                        window.location.href = '/login';
                        throw new Error('Refresh failed');
                    }

                    const data = (await res.json()) as LoginResponse;

                    if (!data.access_token) {
                        tokenStore.clearTokens();
                        window.location.href = '/login';
                        throw new Error('Refresh response missing access token');
                    }

                    tokenStore.setAccessToken(data.access_token);

                    if (data.refresh_token) {
                        tokenStore.setRefreshToken(data.refresh_token);
                    }

                    return true;
                })();
            }

            try {
                await refreshPromise;
            } finally {
                refreshPromise = null;
            }

            // Retry the original request with the new access token
            return await doFetch();
        }

        throw err;
    }
}
