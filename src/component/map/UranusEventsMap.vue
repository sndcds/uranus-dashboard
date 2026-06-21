<!--
  src/component/map/UranusEventsMap.vue
-->

<template>
  <div ref="mapContainer" class="events-map"></div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import maplibregl, {
  type GeoJSONSource,
  type MapGeoJSONFeature,
  type MapLayerMouseEvent,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { apiFetch } from '@/api.ts'
import { useThemeStore } from '@/store/themeStore.ts'
import { useEventListStore } from '@/store/eventListStore.ts'
import { type UranusEventsFilterScope, useEventsFilterStore } from '@/store/eventsFilterStore.ts'
import { useMapViewStore } from '@/store/mapViewStore.ts'
import venueMarkerIcon from '@/assets/map/marker-event.png'

const { t } = useI18n()

type EventVenueProperties = {
  uuid: string
  name: string
  city: string
  country: string
  eventCount: number
  events?: unknown[]
}

type EventVenueFeature = {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: EventVenueProperties
}

type EventVenueFeatureCollection = {
  type: 'FeatureCollection'
  features: EventVenueFeature[]
}

const EVENTS_SOURCE_ID = 'event-venues'
const CLUSTERS_LAYER_ID = 'event-venues-clusters'
const CLUSTER_COUNT_LAYER_ID = 'event-venues-cluster-count'
const MARKERS_LAYER_ID = 'event-venues-markers'
const MARKER_COUNT_LAYER_ID = 'event-venues-marker-count'
const MARKER_LABEL_LAYER_ID = 'event-venues-marker-label'
const MARKER_IMAGE_ID = 'event-venue-marker'
const DEFAULT_CENTER: [number, number] = [9.5, 54.3]
const DEFAULT_ZOOM = 8

const props = withDefaults(defineProps<{
  filterScope?: UranusEventsFilterScope
}>(), {
  filterScope: 'default'
})

const themeStore = useThemeStore()
const router = useRouter()
const eventListStore = useEventListStore()
const filterStore = useEventsFilterStore()
const mapViewStore = useMapViewStore()
const activeFilter = computed(() => filterStore.getFilter(props.filterScope))

const mapContainer = ref<HTMLElement | null>(null)
const map = shallowRef<maplibregl.Map | null>(null)
let popup: maplibregl.Popup | null = null
let loadRequestId = 0
let filterTimeout: number | null = null

const eventVenues = ref<EventVenueFeatureCollection>({
  type: 'FeatureCollection',
  features: [],
})

const mapStyle = computed(() =>
    themeStore.theme === 'dark'
        ? '/versatiles/versatiles-dark-style.json'
        : '/versatiles/versatiles-style.json'
)

async function loadEventVenues() {
  const currentRequestId = ++loadRequestId
  const params = eventListStore.buildFilterParams(false, true, activeFilter.value)
  const queryString = params.toString()
  const apiPath = queryString
      ? `/api/events/geojson?${queryString}`
      : '/api/events/geojson'

  try {
    const response = await apiFetch<any>(apiPath)
    if (currentRequestId !== loadRequestId) return

    eventVenues.value = normalizeEventVenueFeatureCollection(response?.data)
    updateEventVenueSource()
    fitMapToEventVenues()
  } catch (error) {
    console.error('[UranusEventsMap] Failed to load event venues:', error)
  }
}

function normalizeEventVenueFeatureCollection(data: any): EventVenueFeatureCollection {
  const rawFeatures = Array.isArray(data?.features)
      ? data.features
      : Array.isArray(data?.venues)
          ? data.venues
          : data?.venues && typeof data.venues === 'object'
              ? Object.values(data.venues)
              : []

  return {
    type: 'FeatureCollection',
    features: rawFeatures
        .map(normalizeEventVenueFeature)
        .filter((feature: EventVenueFeature | null): feature is EventVenueFeature => feature !== null),
  }
}

function normalizeEventVenueFeature(raw: any): EventVenueFeature | null {
  const coordinates = raw?.geometry?.coordinates
      ?? (isFiniteNumber(raw?.lon) && isFiniteNumber(raw?.lat)
          ? [raw.lon, raw.lat]
          : null)
      ?? (isFiniteNumber(raw?.venue_lon) && isFiniteNumber(raw?.venue_lat)
          ? [raw.venue_lon, raw.venue_lat]
          : null)

  if (!Array.isArray(coordinates) || coordinates.length < 2) return null

  const lng = Number(coordinates[0])
  const lat = Number(coordinates[1])
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null

  const properties = raw?.properties ?? raw
  const eventCount = Number(
      properties.eventCount
      ?? properties.event_count
      ?? properties.total_upcoming_events
      ?? properties.count
      ?? (Array.isArray(properties.events) ? properties.events.length : 0)
  )

  if (!Number.isFinite(eventCount) || eventCount < 1) return null

  const uuid = String(
      properties.uuid
      ?? properties.venue_uuid
      ?? ''
  )

  if (!uuid) return null

  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [lng, lat],
    },
    properties: {
      uuid,
      name: normalizeText(properties.name ?? properties.venue_name),
      city: normalizeText(properties.city ?? properties.venue_city),
      country: normalizeText(properties.country ?? properties.venue_country),
      eventCount,
    },
  }
}

function normalizeText(value: unknown) {
  if (value === null || value === undefined) return ''
  return String(value)
}

function isFiniteNumber(value: unknown) {
  return Number.isFinite(Number(value))
}

function createMap() {
  if (!mapContainer.value) return
  const savedView = mapViewStore.getView('events')

  const instance = new maplibregl.Map({
    container: mapContainer.value,
    style: mapStyle.value,
    center: savedView?.center ?? DEFAULT_CENTER,
    zoom: savedView?.zoom ?? DEFAULT_ZOOM,
    bearing: savedView?.bearing ?? 0,
    pitch: savedView?.pitch ?? 0,
  })

  instance.addControl(new maplibregl.NavigationControl())
  instance.once('load', () => {
    addEventVenueSourceAndLayers(instance)
    updateEventVenueSource()
    void loadEventVenues()
  })
  bindViewStatePersistence(instance)

  map.value = instance
}

function addEventVenueSourceAndLayers(instance: maplibregl.Map) {
  void addMarkerImage(instance)

  if (!instance.getSource(EVENTS_SOURCE_ID)) {
    instance.addSource(EVENTS_SOURCE_ID, {
      type: 'geojson',
      data: eventVenues.value as any,
      cluster: true,
      clusterRadius: 48,
      clusterMaxZoom: 14,
    })
  }

  if (!instance.getLayer(CLUSTERS_LAYER_ID)) {
    instance.addLayer({
      id: CLUSTERS_LAYER_ID,
      type: 'circle',
      source: EVENTS_SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#8b5cf6',
          25,
          '#7c3aed',
          100,
          '#6d28d9',
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          18,
          25,
          24,
          100,
          30,
        ],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
      },
    })
  }

  if (!instance.getLayer(CLUSTER_COUNT_LAYER_ID)) {
    instance.addLayer({
      id: CLUSTER_COUNT_LAYER_ID,
      type: 'symbol',
      source: EVENTS_SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['noto_sans_bold'],
        'text-size': 13,
      },
      paint: {
        'text-color': '#ffffff',
      },
    })
  }

  if (!instance.getLayer(MARKERS_LAYER_ID)) {
    instance.addLayer({
      id: MARKERS_LAYER_ID,
      type: 'symbol',
      source: EVENTS_SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': MARKER_IMAGE_ID,
        'icon-size': 0.8,
        'icon-anchor': 'bottom',
        'icon-allow-overlap': true,
      },
    })
  }

  if (!instance.getLayer(MARKER_COUNT_LAYER_ID)) {
    instance.addLayer({
      id: MARKER_COUNT_LAYER_ID,
      type: 'symbol',
      source: EVENTS_SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'text-field': ['to-string', ['get', 'eventCount']],
        'text-font': ['noto_sans_bold'],
        'text-size': 11,
        'text-offset': [-0.04, -2.04],
        'text-anchor': 'center',
        'text-allow-overlap': true,
      },
      paint: {
        'text-color': '#ffffff',
      },
    })
  }

  if (!instance.getLayer(MARKER_LABEL_LAYER_ID)) {
    instance.addLayer({
      id: MARKER_LABEL_LAYER_ID,
      type: 'symbol',
      source: EVENTS_SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['noto_sans_regular'],
        'text-size': 11,
        'text-offset': [0, 1.4],
        'text-anchor': 'top',
      },
      paint: {
        'text-color': themeStore.theme === 'dark' ? '#f8fafc' : '#111827',
        'text-halo-color': themeStore.theme === 'dark' ? '#111827' : '#ffffff',
        'text-halo-width': 1,
      },
    })
  }

  bindMapEvents(instance)
}

function bindMapEvents(instance: maplibregl.Map) {
  instance.off('click', CLUSTERS_LAYER_ID, onClusterClick)
  instance.off('click', MARKERS_LAYER_ID, onMarkerClick)
  instance.off('mouseenter', CLUSTERS_LAYER_ID, setPointerCursor)
  instance.off('mouseleave', CLUSTERS_LAYER_ID, resetCursor)
  instance.off('mouseenter', MARKERS_LAYER_ID, setPointerCursor)
  instance.off('mouseleave', MARKERS_LAYER_ID, resetCursor)

  instance.on('click', CLUSTERS_LAYER_ID, onClusterClick)
  instance.on('click', MARKERS_LAYER_ID, onMarkerClick)
  instance.on('mouseenter', CLUSTERS_LAYER_ID, setPointerCursor)
  instance.on('mouseleave', CLUSTERS_LAYER_ID, resetCursor)
  instance.on('mouseenter', MARKERS_LAYER_ID, setPointerCursor)
  instance.on('mouseleave', MARKERS_LAYER_ID, resetCursor)
}

async function addMarkerImage(instance: maplibregl.Map) {
  if (instance.hasImage(MARKER_IMAGE_ID)) return

  try {
    const image = await instance.loadImage(venueMarkerIcon)
    if (!instance.hasImage(MARKER_IMAGE_ID)) {
      instance.addImage(MARKER_IMAGE_ID, image.data)
    }
  } catch (error) {
    console.error('[UranusEventsMap] Failed to load marker image:', error)
  }
}

function updateEventVenueSource() {
  const source = map.value?.getSource(EVENTS_SOURCE_ID) as GeoJSONSource | undefined
  source?.setData(eventVenues.value as any)
}

function fitMapToEventVenues() {
  const currentMap = map.value
  const features = eventVenues.value.features
  if (!currentMap || features.length === 0) return

  if (features.length === 1) {
    const feature = features[0]
    if (!feature) return

    currentMap.easeTo({
      center: feature.geometry.coordinates,
      zoom: Math.max(currentMap.getZoom(), 14),
      duration: 500,
    })
    return
  }

  const bounds = new maplibregl.LngLatBounds()
  features.forEach((feature) => {
    bounds.extend(feature.geometry.coordinates)
  })

  if (bounds.isEmpty()) return

  currentMap.fitBounds(bounds, {
    padding: 56,
    maxZoom: 14,
    duration: 500,
  })
}

function bindViewStatePersistence(instance: maplibregl.Map) {
  const persist = () => {
    const center = instance.getCenter()
    const bounds = instance.getBounds()

    mapViewStore.setView('events', {
      center: [center.lng, center.lat],
      zoom: instance.getZoom(),
      bearing: instance.getBearing(),
      pitch: instance.getPitch(),
      bbox: [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ],
    })
  }

  instance.on('moveend', persist)
  instance.on('rotateend', persist)
  instance.on('pitchend', persist)
}

function onClusterClick(event: MapLayerMouseEvent) {
  const currentMap = map.value
  const feature = event.features?.[0]
  const source = currentMap?.getSource(EVENTS_SOURCE_ID) as GeoJSONSource | undefined
  const clusterId = feature?.properties?.cluster_id
  const coordinates = feature ? getPointCoordinates(feature) : null

  if (!currentMap || !feature || !source || typeof clusterId !== 'number' || !coordinates) return

  source.getClusterExpansionZoom(clusterId)
      .then((zoom) => {
        currentMap.easeTo({
          center: coordinates,
          zoom,
        })
      })
      .catch((error: unknown) => {
        console.error('[UranusEventsMap] Failed to expand cluster:', error)
      })
}

function onMarkerClick(event: MapLayerMouseEvent) {
  const currentMap = map.value
  const feature = event.features?.[0]
  const coordinates = feature ? getPointCoordinates(feature) : null
  if (!currentMap || !feature || !coordinates) return

  popup?.remove()
  popup = new maplibregl.Popup({ closeButton: true, offset: 14 })
      .setLngLat(coordinates)
      .setHTML(createVenuePopupHtml(feature))
      .addTo(currentMap)
}

function getPointCoordinates(feature: MapGeoJSONFeature): [number, number] | null {
  if (feature.geometry.type !== 'Point') return null

  const coordinates = (feature.geometry as { coordinates?: unknown }).coordinates
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null

  const lng = Number(coordinates[0])
  const lat = Number(coordinates[1])
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null

  return [lng, lat]
}

function createVenuePopupHtml(feature: MapGeoJSONFeature) {
  const properties = feature.properties as Record<string, unknown> ?? {}
  const uuid = String(properties.uuid ?? '')
  const infoUrl = uuid
      ? router.resolve({ name: 'venue-details', params: { identifier: uuid } }).href
      : '#'
  const eventListHtml = createEventListHtml(properties)

  return `
    <div class="uranus-map-popup">
      <div class="uranus-map-popup__header">
        ${escapeHtml(t('venue'))}
      </div>
      <div class="uranus-map-popup__body">
        <p class="uranus-map-popup__title-text">
          ${escapeHtml(String(properties.name ?? ''))}
        </p>
        <p class="uranus-map-popup__text">
          ${escapeHtml([properties.city, properties.country].filter(Boolean).join(', '))}
        </p>
        <p class="uranus-map-popup__text">
          ${t('events')}: ${Number(properties.eventCount ?? 0)}
        </p>
        ${eventListHtml}
      </div>
      <div class="uranus-map-popup__footer">
        <a
          class="uranus-map-popup__action uranus-map-popup__action--button"
          href="${escapeAttribute(infoUrl)}"
        >
          ${escapeHtml(t('details'))}
        </a>
      </div>
    </div>
  `
}

function createEventListHtml(properties: Record<string, unknown>) {
  const rawEvents = Array.isArray(properties.events) ? properties.events : []
  const events = rawEvents.slice(0, 3).map((event) => {
    if (typeof event !== 'object' || event === null) return null

    const title = escapeHtml(String(
      (event as any).title
      ?? (event as any).name
      ?? (event as any).subtitle
      ?? ''
    ))
    const date = formatEventDate(String(
      (event as any).startDate
      ?? (event as any).start_date
      ?? (event as any).date
      ?? (event as any).eventDate
      ?? ''
    ))
    const eventUuid = String((event as any).uuid ?? (event as any).eventUuid ?? '')
    const eventDateUuid = String((event as any).dateUuid ?? (event as any).event_date_uuid ?? (event as any).eventDateUuid ?? '')
    const eventUrl = eventUuid && eventDateUuid
        ? router.resolve({ name: 'event-details', params: { uuid: eventUuid, eventDateUuid } }).href
        : ''

    if (!title) return null

    const titleHtml = eventUrl
        ? `<a class="uranus-map-popup__event-link" href="${escapeAttribute(eventUrl)}">${title}</a>`
        : `<strong>${title}</strong>`

    return `
      <li class="uranus-map-popup__event-item">
        ${titleHtml}${date ? ` • <span>${escapeHtml(date)}</span>` : ''}
      </li>
    `
  }).filter(Boolean)

  if (events.length === 0) return ''

  const moreCount = Array.isArray(properties.events) && properties.events.length > events.length
      ? properties.events.length - events.length
      : 0

  return `
    <div class="uranus-map-popup__event-list">
      <p class="uranus-map-popup__subtitle">${escapeHtml(t('events'))}</p>
      <ul>${events.join('')}</ul>
      ${moreCount > 0 ? `<p class="uranus-map-popup__more">${escapeHtml(t('more_events_label', { moreCount }))}</p>` : ''}
    </div>
  `
}

function formatEventDate(value: string) {
  if (!value) return ''
  const date = new Date(value)
  if (!Number.isFinite(date.valueOf())) return ''
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function escapeHtml(value: string) {
  return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
}

function escapeAttribute(value: string) {
  return escapeHtml(value)
}

function setPointerCursor() {
  const canvas = map.value?.getCanvas()
  if (canvas) canvas.style.cursor = 'pointer'
}

function resetCursor() {
  const canvas = map.value?.getCanvas()
  if (canvas) canvas.style.cursor = ''
}

watch(mapStyle, (style) => {
  const currentMap = map.value
  if (!currentMap) return

  currentMap.setStyle(style)
  currentMap.once('styledata', () => {
    addEventVenueSourceAndLayers(currentMap)
    updateEventVenueSource()
  })
})

watch(
    () => activeFilter.value,
    () => {
      if (filterTimeout) window.clearTimeout(filterTimeout)
      filterTimeout = window.setTimeout(() => {
        void loadEventVenues()
      }, 200)
    },
    { deep: true }
)

onMounted(() => {
  createMap()
})

onBeforeUnmount(() => {
  if (filterTimeout) window.clearTimeout(filterTimeout)
  popup?.remove()
  map.value?.remove()
})
</script>

<style scoped>
.events-map {
  width: 100%;
  height: 100%;
  min-height: 360px;
}
</style>
