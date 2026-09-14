// Local development uses Vite's /api proxy so HttpOnly SameSite cookies stay
// on localhost. VITE_API_URL remains the upstream proxy target.
export const apiBaseUrl = (): string => import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export const apiUrl = (path: string): string => `${apiBaseUrl()}${path}`
