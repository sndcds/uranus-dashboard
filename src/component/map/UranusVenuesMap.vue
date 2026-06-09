<!--
  src/component/map/UranusVenuesMap.vue
-->

<template>
  <div ref="mapContainer" class="venues-map"></div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import maplibregl, {
  type GeoJSONSource,
  type MapLayerMouseEvent,
  type MapGeoJSONFeature,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { apiFetch } from '@/api.ts'
import { useThemeStore } from '@/store/themeStore.ts'
import { useMapViewStore } from '@/store/mapViewStore.ts'
import venueMarkerIcon from '@/assets/map/marker.png'

const { t } = useI18n()

type UranusVenuesMapLoadMode = 'bounds' | 'all'

const props = withDefaults(defineProps<{
  loadMode?: UranusVenuesMapLoadMode
  showDetailsAction?: boolean
  persistViewState?: boolean
  portalUuid?: string | null
}>(), {
  loadMode: 'bounds',
  showDetailsAction: true,
  persistViewState: true,
  portalUuid: null,
})

type BBox4326 = [number, number, number, number]

type VenueProperties = {
  uuid: string
  name: string
  city: string
  upcomingEvents: number
}

type VenueFeature = {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: VenueProperties
}

type VenueFeatureCollection = {
  type: 'FeatureCollection'
  features: VenueFeature[]
}

const VENUES_SOURCE_ID = 'venues'
const CLUSTERS_LAYER_ID = 'venues-clusters'
const CLUSTER_COUNT_LAYER_ID = 'venues-cluster-count'
const MARKERS_LAYER_ID = 'venues-markers'
const MARKER_LABEL_LAYER_ID = 'venues-marker-label'
const MARKER_IMAGE_ID = 'venue-marker'
const DEFAULT_CENTER: [number, number] = [9.5, 54.3]
const DEFAULT_ZOOM = 8
const WORLD_BBOX_4326: BBox4326 = [-180, -90, 180, 90]

const themeStore = useThemeStore()
const router = useRouter()
const mapViewStore = useMapViewStore()

const mapContainer = ref<HTMLElement | null>(null)
const map = shallowRef<maplibregl.Map | null>(null)
let popup: maplibregl.Popup | null = null
let loadRequestId = 0
let lastLoadedRequestKey: string | null = null

const venues = ref<VenueFeatureCollection>({
  type: 'FeatureCollection',
  features: [],
})

const mapStyle = computed(() =>
    themeStore.theme === 'dark'
        ? '/versatiles/versatiles-dark-style.json'
        : '/versatiles/versatiles-style.json'
)

function getMapBBox4326(instance: maplibregl.Map): BBox4326 {
  const bounds = instance.getBounds()
  return [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth(),
  ]
}

async function loadVenuesForCurrentBounds() {
  const currentMap = map.value
  if (!currentMap) return

  const bbox = getMapBBox4326(currentMap)
  const bboxKey = createBBoxKey(bbox)
  const params = new URLSearchParams({ bbox: bbox.join(',') })
  if (props.portalUuid) {
    params.append('portal-uuid', props.portalUuid)
  }
  await loadVenues(`/api/venues/geojson?${params.toString()}`, bboxKey)
}

async function loadAllVenues() {
  const params = new URLSearchParams({ bbox: WORLD_BBOX_4326.join(',') })
  if (props.portalUuid) {
    params.append('portal-uuid', props.portalUuid)
  }
  await loadVenues(`/api/venues/geojson?${params.toString()}`, 'all')
}

async function loadVenues(apiPath: string, requestKey: string) {
  if (requestKey === lastLoadedRequestKey) return

  const currentRequestId = ++loadRequestId

  try {
    const response = await apiFetch<any>(apiPath)
    if (currentRequestId !== loadRequestId) return

    lastLoadedRequestKey = requestKey
    venues.value = normalizeVenueFeatureCollection(response?.data)
    updateVenueSource()

    if (props.loadMode === 'all') {
      fitMapToVenues()
    }
  } catch (error) {
    console.error('[UranusVenuesMap] Failed to load venues:', error)
  }
}

function createBBoxKey(bbox: BBox4326) {
  const portalKey = props.portalUuid ?? ''
  return `${bbox.map(value => value.toFixed(5)).join(',')}|${portalKey}`
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
  const uuid = String(
      properties.uuid
      ?? properties.venue_uuid
      ?? ''
  )

  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [lng, lat],
    },
    properties: {
      uuid,
      name: String(properties.name ?? properties.venue_name ?? ''),
      city: String(properties.city ?? properties.venue_city ?? ''),
      upcomingEvents: Number(
          properties.upcomingEvents
          ?? properties.upcoming_events
          ?? properties.total_upcoming_events
          ?? properties.event_count
          ?? properties.count
          ?? 0
      ),
    },
  }
}

function isFiniteNumber(value: unknown) {
  return Number.isFinite(Number(value))
}

function createMap() {
  if (!mapContainer.value) return
  const savedView = mapViewStore.getView('venues')

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
    addVenueSourceAndLayers(instance)
    updateVenueSource()
    if (props.loadMode === 'all') {
      void loadAllVenues()
      return
    }

    void loadVenuesForCurrentBounds()
  })

  if (props.loadMode === 'bounds') {
    instance.on('moveend', () => void loadVenuesForCurrentBounds())
    instance.on('resize', () => void loadVenuesForCurrentBounds())
  }

  if (props.persistViewState) {
    bindViewStatePersistence(instance)
  }

  map.value = instance
}

function addVenueSourceAndLayers(instance: maplibregl.Map) {
  void addMarkerImage(instance)

  if (!instance.getSource(VENUES_SOURCE_ID)) {
    instance.addSource(VENUES_SOURCE_ID, {
      type: 'geojson',
      data: venues.value as any,
      cluster: true,
      clusterRadius: 48,
      clusterMaxZoom: 14,
    })
  }

  if (!instance.getLayer(CLUSTERS_LAYER_ID)) {
    instance.addLayer({
      id: CLUSTERS_LAYER_ID,
      type: 'circle',
      source: VENUES_SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#3b82f6',
          25,
          '#2563eb',
          100,
          '#1d4ed8',
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
      source: VENUES_SOURCE_ID,
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
      source: VENUES_SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
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
    console.error('[UranusVenuesMap] Failed to load marker image:', error)
  }
}

function updateVenueSource() {
  const source = map.value?.getSource(VENUES_SOURCE_ID) as GeoJSONSource | undefined
  source?.setData(venues.value as any)
}

function fitMapToVenues() {
  const currentMap = map.value
  const features = venues.value.features
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

    mapViewStore.setView('venues', {
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
  const source = currentMap?.getSource(VENUES_SOURCE_ID) as GeoJSONSource | undefined
  const clusterId = feature?.properties?.cluster_id
  const coordinates = feature ? getPointCoordinates(feature) : null

  if (!currentMap || !feature || !source || typeof clusterId !== 'number') return
  if (!coordinates) return

  source.getClusterExpansionZoom(clusterId)
      .then((zoom) => {
        currentMap.easeTo({
          center: coordinates,
          zoom,
        })
      })
      .catch((error: unknown) => {
        console.error('[UranusVenuesMap] Failed to expand cluster:', error)
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

  if (!props.showDetailsAction) {
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
        </div>
      </div>
    `
  }

  const uuid = String(properties.uuid ?? '')
  const infoUrl = uuid
      ? router.resolve({
        name: 'venue-details',
        params: { uuid },
      }).href
      : '#'

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
    addVenueSourceAndLayers(currentMap)
    updateVenueSource()

    if (props.loadMode === 'all') {
      void loadAllVenues()
      return
    }

    void loadVenuesForCurrentBounds()
  })
})

watch(() => props.portalUuid, () => {
  if (!map.value) return

  lastLoadedRequestKey = null
  if (props.loadMode === 'all') {
    void loadAllVenues()
    return
  }

  void loadVenuesForCurrentBounds()
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
.venues-map {
  width: 100%;
  height: 100%;
  min-height: 360px;
}
</style>
