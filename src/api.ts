import { accessToken } from './store/token'

let refreshPromise: Promise<boolean> | null = null;

export interface LoginResponse {
    message: string;
    access_token?: string;
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
): Promise<T> {
    const url = `${import.meta.env.VITE_API_URL}${path}`;
    console.log("apiFetch(): " + url);

    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (accessToken.value) {
        headers.set('Authorization', `Bearer ${accessToken.value}`);
    }

    const fetchOptions: RequestInit = {
        ...options,
        headers,
    };

    const doFetch = async (): Promise<T> => {
        const res = await fetch(url, fetchOptions);

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

        return data as T;
    };

    try {
        return await doFetch();
    } catch (err) {
        if (
            err instanceof ApiError &&
            err.status === 401 &&
            !url.includes('/refresh')
        ) {
            console.log('Access token expired — refreshing...');

            if (!refreshPromise) {
                refreshPromise = (async () => {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/refresh`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${refreshToken.value}`,
                        },
                    });

                    if (!res.ok) {
                        window.location.href = '/login';
                        throw new Error('Refresh failed');
                    }

                    const data = await res.json();
                    accessToken.value = data.access_token;

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