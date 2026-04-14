<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import {ref, shallowRef, onMounted, onBeforeUnmount, watch, unref} from 'vue'
import type { FeatureCollection } from 'geojson'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { LayerSpecification, LngLatLike } from 'maplibre-gl'

type MapLibreMap = maplibregl.Map
const DEBUG_PREFIX = '[UranusMapRenderer]'

/**
 * TYPES
 */
export type MapLayer = {
  id: string
  sourceId: string
  data?: FeatureCollection

  type: 'circle' | 'symbol' | 'line' | 'fill' | 'heatmap'

  paint?: Record<string, any>
  layout?: Record<string, any>
  filter?: any[]

  minzoom?: number
  maxzoom?: number

  popup?: (feature: GeoJSON.Feature) => {
    title?: string
    html?: string
  }
}

/**
 * PROPS
 */
const props = defineProps<{
  layers: MapLayer[]
  center?: LngLatLike
  zoom?: number
  mapStyle?: string | Record<string, any>
  defaultTextFont?: string[]
}>()

const emit = defineEmits<{
  (e: 'loaded', map: MapLibreMap): void
}>()

/**
 * STATE
 */
const mapContainer = ref<HTMLElement | null>(null)
const map = shallowRef<MapLibreMap | null>(null)

const layerIds = new Set<string>()

const DEFAULT_TEXT_FONT = ['noto_sans_regular']

/**
 * INIT MAP
 */
onMounted(() => {
  if (!mapContainer.value) return

  const instance = new maplibregl.Map({
    container: mapContainer.value,
    style: unref(props.mapStyle),
    center: props.center ?? [9.5, 54.3],
    zoom: props.zoom ?? 8
  })

  instance.addControl(new maplibregl.NavigationControl())
  map.value = instance

  console.debug(DEBUG_PREFIX, 'map:init', {
    center: props.center ?? [9.5, 54.3],
    zoom: props.zoom ?? 8,
    style: props.mapStyle,
  })

  instance.on('error', (event) => {
    console.error(DEBUG_PREFIX, 'map:error', event?.error ?? event)
  })

  instance.once('load', () => {
    console.debug(DEBUG_PREFIX, 'style:ready:init')
    syncLayers(instance, props.layers)
    emit('loaded', instance)
  })
})

/**
 * STYLE SWITCH (FULL RESET)
 */
watch(
    () => props.mapStyle,
    (newStyle) => {
      const currentMap = map.value
      if (!currentMap || !newStyle) return

      layerIds.clear()

      console.debug(DEBUG_PREFIX, 'style:switch', newStyle)

      currentMap.setStyle(unref(newStyle))

      waitForStyleData(currentMap, () => {
        console.debug(DEBUG_PREFIX, 'style:ready:switch')
        syncLayers(currentMap, props.layers)
      })
    }
)

/**
 * DATA UPDATE ONLY (NO RE-RENDER)
 */
watch(
    () => props.layers,
    (layers) => {
      const m = map.value
      if (!m || !m.isStyleLoaded()) return

      console.debug(DEBUG_PREFIX, 'layers:update-data', summarizeLayers(layers))
      updateLayerData(m, layers)
    },
    { deep: true }
)

/**
 * CORE RENDER ENGINE
 */
function syncLayers(map: MapLibreMap, layers: MapLayer[]) {
  console.debug(DEBUG_PREFIX, 'layers:sync', summarizeLayers(layers))
  renderLayers(map, layers)
  updateLayerData(map, layers)
}

function waitForStyleData(map: MapLibreMap, callback: () => void) {
  const onStyleData = () => {
    map.off('styledata', onStyleData)
    callback()
  }

  map.on('styledata', onStyleData)
}

function renderLayers(map: MapLibreMap, layers: MapLayer[]) {
  for (const layer of layers) {
    addSourceIfNeeded(map, layer)
    addLayer(map, layer)
  }
}

function updateLayerData(map: MapLibreMap, layers: MapLayer[]) {
  for (const layer of layers) {
    if (!layer.data) continue

    const source = map.getSource(layer.sourceId) as maplibregl.GeoJSONSource | undefined

    if (source) {
      source.setData(layer.data)
    }
  }
}

/**
 * SOURCE CREATION
 */
function addSourceIfNeeded(map: MapLibreMap, layer: MapLayer) {
  const sourceId = layer.sourceId

  if (map.getSource(sourceId)) return

  console.debug(DEBUG_PREFIX, 'source:add', sourceId, {
    featureCount: layer.data?.features?.length ?? 0,
  })

  map.addSource(sourceId, {
    type: 'geojson',
    data: layer.data ?? {
      type: 'FeatureCollection',
      features: [],
    },
  })
}

/**
 * LAYER CREATION
 */
function addLayer(map: MapLibreMap, layer: MapLayer) {
  if (layerIds.has(layer.id)) return

  const resolvedLayout = resolveLayerLayout(layer)

  const baseLayer: LayerSpecification = {
    id: layer.id,
    source: layer.sourceId,
    type: layer.type,
  } as LayerSpecification

  if (layer.paint && Object.keys(layer.paint).length > 0) {
    baseLayer.paint = layer.paint
  }

  if (resolvedLayout && Object.keys(resolvedLayout).length > 0) {
    baseLayer.layout = resolvedLayout
  }

  if (Array.isArray(layer.filter)) {
    // baseLayer.filter = layer.filter // TODO: !!!!
  }

  if (typeof layer.minzoom === 'number') {
    baseLayer.minzoom = layer.minzoom
  }

  if (typeof layer.maxzoom === 'number') {
    baseLayer.maxzoom = layer.maxzoom
  }

  console.debug(DEBUG_PREFIX, 'layer:add', {
    id: layer.id,
    type: layer.type,
    sourceId: layer.sourceId,
    hasData: Boolean(layer.data),
    featureCount: layer.data?.features?.length ?? 0,
  })

  map.addLayer(baseLayer)
  layerIds.add(layer.id)

  if (layer.popup) {
    attachPopup(map, layer)
  }
}

function resolveLayerLayout(layer: MapLayer) {
  const layout = layer.layout ? { ...layer.layout } : {}

  if (layer.type === 'symbol' && !layout['text-font']) {
    layout['text-font'] = props.defaultTextFont?.length
        ? props.defaultTextFont
        : DEFAULT_TEXT_FONT
  }

  return layout
}

function summarizeLayers(layers: MapLayer[]) {
  return layers.map((layer) => ({
    id: layer.id,
    type: layer.type,
    sourceId: layer.sourceId,
    featureCount: layer.data?.features?.length ?? 0,
  }))
}

/**
 * POPUPS
 */
function attachPopup(map: MapLibreMap, layer: MapLayer) {
  map.on('click', layer.id, (e) => {
    const feature = e.features?.[0]
    if (!feature) return

    const popupData = layer.popup?.(feature)
    if (!popupData) return

    new maplibregl.Popup({ closeButton: true })
        .setLngLat(e.lngLat)
        .setHTML(`
        <div>
          ${popupData.title ? `<h3>${popupData.title}</h3>` : ''}
          ${popupData.html ?? ''}
        </div>
      `)
        .addTo(map)
  })
}

/**
 * CLEANUP
 */
onBeforeUnmount(() => {
  map.value?.remove()
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
