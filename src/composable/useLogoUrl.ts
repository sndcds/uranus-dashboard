import { computed, unref, type MaybeRef } from 'vue'

interface UseLogoUrlOptions {
    logoURL: MaybeRef<string | null>
    lightThemeLogoURL: MaybeRef<string | null>
    darkThemeLogoURL: MaybeRef<string | null>

    theme: MaybeRef<'light' | 'dark' | string>

    plutoWidth: number
    maxWidth: number
    maxHeight: number

    type?: MaybeRef<string | null>
    quality?: MaybeRef<number | null>
}

function buildParams(
    plutoWidth: number,
    type: string,
    quality: number = 80
) {
    const params = new URLSearchParams()

    params.set('width', String(plutoWidth))
    params.set('type', type)
    params.set('quality', String(quality))

    return params.toString()
}

export function useLogoUrl(options: UseLogoUrlOptions) {
    const logoUrl = computed(() => {
        const theme = unref(options.theme)

        const logoURL = unref(options.logoURL)
        const light = unref(options.lightThemeLogoURL)
        const dark = unref(options.darkThemeLogoURL)

        const type = unref(options.type) ?? 'webp'
        const quality = unref(options.quality) ?? 80

        const base =
            theme === 'dark'
                ? dark || logoURL
                : light || logoURL

        if (!base) return null

        const params = buildParams(options.plutoWidth, type, quality)
        const separator = base.includes('?') ? '&' : '?'

        return `${base}${separator}${params}`
    })

    return {
        logoUrl,
    }
}