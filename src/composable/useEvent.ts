// composable/useEvent.ts
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { UranusEvent, UranusEventDate } from '@/model/uranusEventModel.ts'
import { uranusI18nAccessibilityFlags } from '@/i18n/uranus-i18n-accessibility.ts'


export function useEvent() {
    const route = useRoute()
    const { t, locale } = useI18n({ useScope: 'global' })

    // --- Reactive State ---
    const event = ref<UranusEvent | null>(null)
    const eventDate = ref<UranusEventDate | null>(null)
    const isLoading = ref(false)
    const loadError = ref<string | null>(null)
    const isDownloadingIcs = ref(false)

    // --- Computed Helpers ---
    const eventStartDate = computed(
        () => eventDate.value?.startDate ?? event.value?.date?.startDate ?? null
    )
    const eventStartTime = computed(
        () => eventDate.value?.startTime ?? event.value?.date?.startTime ?? null
    )
    const eventEndDate = computed(
        () => eventDate.value?.endDate ?? event.value?.date?.endDate ?? null
    )
    const eventEndTime = computed(
        () => eventDate.value?.endTime ?? event.value?.date?.endTime ?? null
    )
    const eventEntryTime = computed(
        () => eventDate.value?.entryTime ?? event.value?.date?.entryTime ?? null
    )

    const selectedAccessibilityLabels = computed(() => {
        if (!event.value?.date?.accessibilityFlags) return []
        const mask = BigInt(event.value.date?.accessibilityFlags)
        const labels: string[] = []

        uranusI18nAccessibilityFlags.forEach(topic => {
            topic.flags.forEach(flag => {
                const flagValue = 1n << BigInt(flag.id)
                if ((mask & flagValue) === flagValue) {
                    labels.push(t(flag.name))
                }
            })
        })
        return labels
    })

    const hasLonLat = computed(() => {
        return ((event.value?.date?.lon && event.value?.date?.lat))
    })

    const buildImageCredit = () => {
        const e = event.value
        if (!e) return null
        let parts = ''
        if (e.image?.creator) {
            parts += t('image_by') + ': ' + e.image.creator
        }
        if (e.image?.copyright) {
            if (e.image.creator) { parts += ' ' }
            parts += `© ${e.image.copyright}`
        }
        return parts.length > 0 ? parts : null
    }

    // --- Helper to resolve route param ---
    const resolveRouteParam = (param: string | string[] | undefined) =>
        Array.isArray(param) ? param[0] : param

    // --- Load Event ---
    async function loadEvent(eventId?: string | number, eventDateId?: string | number) {
        const resolvedEventId = eventId ?? resolveRouteParam(route.params.id)
        const resolvedEventDateId = eventDateId ?? resolveRouteParam(route.params.eventDateId)

        if (!resolvedEventId || !resolvedEventDateId) {
            loadError.value = t('error_missing_event_id_or_date')
            return
        }

        isLoading.value = true
        loadError.value = null

        try {
            const lang = locale.value || 'de'
            const endpoint = `/api/event/${resolvedEventId}/date/${resolvedEventDateId}?lang=${lang}`
            const { data } = await apiFetch<unknown>(endpoint)

            // Use your new static mapper
            const mappedEvent = UranusEvent.fromApi(data, Number(resolvedEventDateId))
            if (!mappedEvent) throw new Error('Incomplete event data')

            // Set the event
            event.value = mappedEvent

            // Set the selected event date
            eventDate.value = mappedEvent.furtherDates.find(fd => fd.id === Number(resolvedEventDateId))
                ?? mappedEvent.date
        } catch (error: unknown) {
            loadError.value = error instanceof Error ? error.message : String(error)
        } finally {
            isLoading.value = false
        }
    }

    // --- Download ICS ---
    async function downloadIcs() {
        if (!event.value?.eventId || !eventDate.value?.id) return
        if (isDownloadingIcs.value) return

        isDownloadingIcs.value = true
        try {
            const endpoint = `/api/event/${event.value.eventId}/date/${eventDate.value.id}/ics?lang=${locale.value}`
            const { data } = await apiFetch<string>(endpoint, {
                headers: { Accept: 'text/calendar,*/*;q=0.8' },
            })

            if (!data || typeof data !== 'string') throw new Error('Empty ICS payload')

            const blob = new Blob([data], { type: 'text/calendar;charset=utf-8' })
            const blobUrl = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = createIcsFileName(event.value.title ?? '', eventDate.value.id)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(blobUrl)
        } catch (err) {
            console.error(err)
        } finally {
            isDownloadingIcs.value = false
        }
    }

    const createIcsFileName = (title: string, eventDateId: number) => {
        const normalized = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-')
        return `${normalized || 'event'}-${eventDateId}.ics`
    }

    return {
        event,
        eventDate,
        isLoading,
        loadError,
        hasLonLat,
        selectedAccessibilityLabels,
        eventStartDate,
        eventStartTime,
        eventEndDate,
        eventEndTime,
        eventEntryTime,
        buildImageCredit,
        loadEvent,
        downloadIcs,
    }
}