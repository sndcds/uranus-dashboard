/*
  src/composable/useGpsLocation.ts
 */

import { ref, watch, Ref, onBeforeUnmount } from 'vue'

export function useGpsLocation(enabled: Ref<boolean>) {
  const latitude = ref<number | null>(null)
  const longitude = ref<number | null>(null)
  const error = ref<string | null>(null)
  let watchId: number | null = null

  const stopWatch = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
  }

  watch(enabled, (val) => {
    stopWatch()
    latitude.value = null
    longitude.value = null
    error.value = null

    if (val) {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
              latitude.value = position.coords.latitude
              longitude.value = position.coords.longitude
              error.value = null
            },
            (err) => {
              error.value = err.message
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            }
        )
      } else {
        error.value = 'Geolocation is not supported by your browser.'
      }
    }
  }, { immediate: true })

  onBeforeUnmount(() => {
    stopWatch()
  })

  return { latitude, longitude, locationError: error }
}