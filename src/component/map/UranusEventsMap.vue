<!--
  src/component/map/UranusEventsMap.vue
-->

<template>
  <div ref="mapContainer" class="events-map"></div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
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
import venueMarkerIcon from '@/assets/map/marker-event.png'

type EventVenueProperties = {
  uuid: string
  name: string
  city: string
  country: string
  eventCount: number
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
      ?? properties.id
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

  const instance = new maplibregl.Map({
    container: mapContainer.value,
    style: mapStyle.value,
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
  })

  instance.addControl(new maplibregl.NavigationControl())
  instance.once('load', () => {
    addEventVenueSourceAndLayers(instance)
    updateEventVenueSource()
    void loadEventVenues()
  })

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
        'text-offset': [0, -1.55],
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
  const properties = feature.properties ?? {}
  const uuid = String(properties.uuid ?? '')
  const infoUrl = uuid
      ? router.resolve({ name: 'venue-details', params: { uuid } }).href
      : '#'

  return `
    <div class="event-venue-map-popup">
      <strong class="event-venue-map-popup__title">${escapeHtml(String(properties.name ?? ''))}</strong>
      <div class="event-venue-map-popup__location">${escapeHtml([properties.city, properties.country].filter(Boolean).join(', '))}</div>
      <div class="event-venue-map-popup__events">${Number(properties.eventCount ?? 0)} kommende Events</div>
      <a class="event-venue-map-popup__button" href="${escapeAttribute(infoUrl)}">Infos</a>
    </div>
  `
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

:global(.event-venue-map-popup) {
  display: grid;
  gap: 4px;
  min-width: 180px;
  color: var(--uranus-color);
  background: var(--uranus-bg);
}

:global(.event-venue-map-popup__title) {
  padding: 0.4rem;
  font-size: 1rem;
}

:global(.event-venue-map-popup__location),
:global(.event-venue-map-popup__events) {
  padding: 0 0.4rem;
  color: var(--uranus-color-3);
}

:global(.event-venue-map-popup__button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  margin-top: 6px;
  padding: 5px 10px;
  border-radius: 4px;
  color: #ffffff;
  background: #2563eb;
  text-decoration: none;
  font-weight: 700;
}

:global(.maplibregl-popup-content) {
  color: var(--uranus-color);
  background: var(--uranus-bg);
  border: 1px solid var(--uranus-color-6);
}

:global(.maplibregl-popup-tip) {
  border-top-color: var(--uranus-bg);
  border-bottom-color: var(--uranus-bg);
}

:global(.maplibregl-popup-close-button) {
  color: var(--uranus-color);
}
</style>
