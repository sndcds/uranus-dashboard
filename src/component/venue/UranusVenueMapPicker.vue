<!--
  src/component/venue/UranusVenueMapPicker.vue
-->

<template>
  <div ref="mapContainer" class="venue-map-picker"></div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import maplibregl, {
  type GeoJSONSource,
  type MapGeoJSONFeature,
  type MapLayerMouseEvent,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { apiFetch } from '@/api.ts'
import { useThemeStore } from '@/store/themeStore.ts'
import venueMarkerIcon from '@/assets/map/marker.png'

export type UranusVenueMapSelection = {
  uuid: string
  orgUuid: string | null
  name: string
  city: string
  country: string
}

type BBox4326 = [number, number, number, number]
type VenueFeature = {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: UranusVenueMapSelection
}
type VenueFeatureCollection = {
  type: 'FeatureCollection'
  features: VenueFeature[]
}

const VENUES_SOURCE_ID = 'venue-map-picker-venues'
const MARKERS_LAYER_ID = 'venue-map-picker-markers'
const MARKER_LABEL_LAYER_ID = 'venue-map-picker-marker-label'
const MARKER_IMAGE_ID = 'venue-map-picker-marker'
const DEFAULT_CENTER: [number, number] = [9.5, 54.3]
const DEFAULT_ZOOM = 8

const { t } = useI18n({ useScope: 'global' })
const themeStore = useThemeStore()

const emit = defineEmits<{
  (e: 'select', venue: UranusVenueMapSelection): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
const map = shallowRef<maplibregl.Map | null>(null)
const venues = ref<VenueFeatureCollection>({
  type: 'FeatureCollection',
  features: [],
})

let popup: maplibregl.Popup | null = null
let loadRequestId = 0
let lastLoadedBBoxKey: string | null = null

const mapStyle = computed(() =>
    themeStore.theme === 'dark'
        ? '/versatiles/versatiles-dark-style.json'
        : '/versatiles/versatiles-style.json'
)

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
    addVenueSourceAndLayers(instance)
    updateVenueSource()
    void loadVenuesForCurrentBounds()
  })
  instance.on('moveend', () => void loadVenuesForCurrentBounds())
  instance.on('resize', () => void loadVenuesForCurrentBounds())

  map.value = instance
}

function addVenueSourceAndLayers(instance: maplibregl.Map) {
  void addMarkerImage(instance)

  if (!instance.getSource(VENUES_SOURCE_ID)) {
    instance.addSource(VENUES_SOURCE_ID, {
      type: 'geojson',
      data: venues.value as any,
    })
  }

  if (!instance.getLayer(MARKERS_LAYER_ID)) {
    instance.addLayer({
      id: MARKERS_LAYER_ID,
      type: 'symbol',
      source: VENUES_SOURCE_ID,
      layout: {
        'icon-image': MARKER_IMAGE_ID,
        'icon-size': 0.75,
        'icon-anchor': 'bottom',
        'icon-allow-overlap': true,
      },
    })
  }

  if (!instance.getLayer(MARKER_LABEL_LAYER_ID)) {
    instance.addLayer({
      id: MARKER_LABEL_LAYER_ID,
      type: 'symbol',
      source: VENUES_SOURCE_ID,
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
  instance.off('click', MARKERS_LAYER_ID, onMarkerClick)
  instance.off('mouseenter', MARKERS_LAYER_ID, setPointerCursor)
  instance.off('mouseleave', MARKERS_LAYER_ID, resetCursor)

  instance.on('click', MARKERS_LAYER_ID, onMarkerClick)
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
    console.error('[UranusVenueMapPicker] Failed to load marker image:', error)
  }
}

async function loadVenuesForCurrentBounds() {
  const currentMap = map.value
  if (!currentMap) return

  const bbox = getMapBBox4326(currentMap)
  const bboxKey = createBBoxKey(bbox)
  if (bboxKey === lastLoadedBBoxKey) return

  const currentRequestId = ++loadRequestId
  const params = new URLSearchParams({ bbox: bbox.join(',') })

  try {
    const response = await apiFetch<any>(`/api/venues/geojson?${params.toString()}`)
    if (currentRequestId !== loadRequestId) return

    lastLoadedBBoxKey = bboxKey
    venues.value = normalizeVenueFeatureCollection(response?.data)
    updateVenueSource()
  } catch (error) {
    console.error('[UranusVenueMapPicker] Failed to load venues:', error)
  }
}

function getMapBBox4326(instance: maplibregl.Map): BBox4326 {
  const bounds = instance.getBounds()
  return [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth(),
  ]
}

function createBBoxKey(bbox: BBox4326) {
  return bbox.map(value => value.toFixed(5)).join(',')
}

function normalizeVenueFeatureCollection(data: any): VenueFeatureCollection {
  const rawFeatures = Array.isArray(data?.features)
      ? data.features
      : Array.isArray(data?.venues)
          ? data.venues
          : []

  return {
    type: 'FeatureCollection',
    features: rawFeatures
        .map(normalizeVenueFeature)
        .filter((feature: VenueFeature | null): feature is VenueFeature => feature !== null),
  }
}

function normalizeVenueFeature(raw: any): VenueFeature | null {
  const coordinates = raw?.geometry?.coordinates
      ?? (isFiniteNumber(raw?.venue_lon) && isFiniteNumber(raw?.venue_lat)
          ? [raw.venue_lon, raw.venue_lat]
          : null)

  if (!Array.isArray(coordinates) || coordinates.length < 2) return null

  const lng = Number(coordinates[0])
  const lat = Number(coordinates[1])
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null

  const properties = raw?.properties ?? raw
  const uuid = String(properties.uuid ?? properties.venue_uuid ?? '')
  if (!uuid) return null

  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [lng, lat],
    },
    properties: {
      uuid,
      orgUuid: normalizeUuid(
          properties.orgUuid
          ?? properties.org_uuid
          ?? properties.owner_org_uuid
          ?? properties.organization_uuid
          ?? properties.organization?.uuid
      ),
      name: String(properties.name ?? properties.venue_name ?? ''),
      city: String(properties.city ?? properties.venue_city ?? ''),
      country: String(properties.country ?? properties.venue_country ?? ''),
    },
  }
}

function normalizeUuid(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  return String(value)
}

function isFiniteNumber(value: unknown) {
  return Number.isFinite(Number(value))
}

function updateVenueSource() {
  const source = map.value?.getSource(VENUES_SOURCE_ID) as GeoJSONSource | undefined
  source?.setData(venues.value as any)
}

function onMarkerClick(event: MapLayerMouseEvent) {
  const currentMap = map.value
  const feature = event.features?.[0]
  const coordinates = feature ? getPointCoordinates(feature) : null
  if (!currentMap || !feature || !coordinates) return

  const venue = mapVenueSelection(feature)
  if (!venue) return

  emit('select', venue)

  popup?.remove()
  popup = new maplibregl.Popup({ closeButton: true, offset: 14 })
      .setLngLat(coordinates)
      .setHTML(createVenuePopupHtml(venue))
      .addTo(currentMap)
}

function mapVenueSelection(feature: MapGeoJSONFeature): UranusVenueMapSelection | null {
  const properties = feature.properties ?? {}
  const uuid = String(properties.uuid ?? '')
  if (!uuid) return null

  return {
    uuid,
    orgUuid: normalizeUuid(properties.orgUuid ?? properties.org_uuid),
    name: String(properties.name ?? ''),
    city: String(properties.city ?? ''),
    country: String(properties.country ?? ''),
  }
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

function createVenuePopupHtml(venue: UranusVenueMapSelection) {
  return `
    <div class="uranus-map-popup">
      <div class="uranus-map-popup__header">
        ${escapeHtml(t('venue_added_to_selection'))}
      </div>
      <div class="uranus-map-popup__body">
        <p class="uranus-map-popup__title-text">${escapeHtml(venue.name)}</p>
        <p class="uranus-map-popup__text">
          ${escapeHtml([venue.city, venue.country].filter(Boolean).join(', '))}
        </p>
      </div>
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
    addVenueSourceAndLayers(currentMap)
    updateVenueSource()
  })
})

onMounted(() => {
  createMap()
})

onBeforeUnmount(() => {
  popup?.remove()
  map.value?.remove()
})
</script>

<style scoped lang="scss">
.venue-map-picker {
  width: 100%;
  height: min(62vh, 560px);
  min-height: 420px;
  border: 1px solid var(--uranus-card-border-color);
  border-radius: var(--uranus-tiny-border-radius);
  overflow: hidden;
}

@media (max-width: 600px) {
  .venue-map-picker {
    height: 58vh;
    min-height: 320px;
  }
}
</style>
