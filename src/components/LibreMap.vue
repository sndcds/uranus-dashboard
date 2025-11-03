<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { FeatureCollection, Point } from 'geojson';
import markerIcon from '@/assets/marker.png'

// Correct imports for Vue + TS
import maplibregl from 'maplibre-gl'; // only for runtime
import type { Map, Marker, LngLatLike, Popup } from 'maplibre-gl'; // type-only


interface Venue {
  venue_name: string;
  venue_city: string;
  venue_lat: number;
  venue_lon: number;
  venue_type_list: string | null;
  venue_url: string | null;
}

// Props
const props = defineProps({
  venues: {
    type: Array as () => Venue[],
    default: () => [],
  },
});

const mapContainer = ref<HTMLElement | null>(null);
const mapInstance = ref<maplibregl.Map | null>(null);
let currentPopup: Popup | null = null;

const GEOJSON_SOURCE_ID = 'events';
const CLUSTER_LAYER_ID = 'clusters';
const CLUSTER_COUNT_LAYER_ID = 'cluster-count';
const UNCLUSTERED_LAYER_ID = 'unclustered-point';

onMounted(() => {
  if (!mapContainer.value) return;

  mapInstance.value = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tiles.oklabflensburg.de/sgm/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: 'MapLibre | © OpenStreetMap contributors',
        },
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm',
          paint: { 'raster-brightness-min': 0.6, 'raster-brightness-max': 1.0 },
        },
      ],
    },
    center: [9.5, 54.3] as LngLatLike,
    zoom: 8,
  });

  mapInstance.value.addControl(new maplibregl.NavigationControl());

  mapInstance.value.on('load', () => {
    // Initialize empty GeoJSON source
    mapInstance.value!.addSource(GEOJSON_SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      } as FeatureCollection<Point, Venue>,
      cluster: true,
      clusterRadius: 40,
      clusterMaxZoom: 17,
    });

    // Cluster circle layer
    mapInstance.value!.addLayer({
      id: CLUSTER_LAYER_ID,
      type: 'circle',
      source: GEOJSON_SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#ffffff',
        'circle-radius': ['step', ['get', 'point_count'], 24, 16, 32, 48, 40],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#A0D896',
      },
    });

    // Cluster count labels
    mapInstance.value!.addLayer({
      id: CLUSTER_COUNT_LAYER_ID,
      type: 'symbol',
      source: GEOJSON_SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 14 },
      paint: { 'text-color': '#000' },
    });

    const img = new Image();
    img.src = markerIcon;
    img.onload = () => {
      mapInstance.value!.addImage('custom-marker', img);

      mapInstance.value!.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'events',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': 'custom-marker',
          'icon-size': 0.8,
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });
    };

    // Click popups
    mapInstance.value!.on('click', UNCLUSTERED_LAYER_ID, (e) => {
      const props = e.features![0].properties as Venue;

      if (currentPopup) currentPopup.remove();

      const html = `
        <div class="popup-wrapper">
          <div class="popup-content">
            <strong>${props.venue_url
          ? `<a href="${props.venue_url}" target="_blank">${props.venue_name}</a>`
          : props.venue_name}</strong>
            <p>${props.venue_city}</p>
            ${props.venue_type_list ? `<p>${props.venue_type_list}</p>` : ''}
            ${props.venue_url ? `<button onclick="window.open('${props.venue_url}', '_blank')">Details</button>` : ''}
          </div>
        </div>
      `;

      currentPopup = new maplibregl.Popup({ closeButton: true })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(mapInstance.value!);
    });

    // Close popup on clicking outside
    mapInstance.value!.on('click', (e) => {
      const features = mapInstance.value!.queryRenderedFeatures(e.point, {
        layers: [UNCLUSTERED_LAYER_ID, CLUSTER_LAYER_ID],
      });
      if (!features.length && currentPopup) {
        currentPopup.remove();
        currentPopup = null;
      }
    });

    // Cluster click zoom
    mapInstance.value!.on('click', CLUSTER_LAYER_ID, (e) => {
      const features = mapInstance.value!.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER_ID] });
      const clusterId = (features[0].properties as any).cluster_id;
      (mapInstance.value!.getSource(GEOJSON_SOURCE_ID) as any).getClusterExpansionZoom(
          clusterId,
          (err: any, zoom: number) => {
            if (err) return;
            mapInstance.value!.easeTo({ center: features[0].geometry.coordinates, zoom });
          },
      );
    });

    // Cursor pointer
    [UNCLUSTERED_LAYER_ID, CLUSTER_LAYER_ID].forEach((layer) => {
      mapInstance.value!.on('mouseenter', layer, () => mapInstance.value!.getCanvas().style.cursor = 'pointer');
      mapInstance.value!.on('mouseleave', layer, () => mapInstance.value!.getCanvas().style.cursor = '');
    });
  });
});

// Watch venues and update source
watch(
    () => props.venues,
    (venues) => {
      if (!mapInstance.value?.getSource(GEOJSON_SOURCE_ID)) return;

      const geojson: FeatureCollection<Point, Venue> = {
        type: 'FeatureCollection',
        features: venues
            .filter(v => v.venue_lat && v.venue_lon)
            .map(v => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [v.venue_lon, v.venue_lat] },
              properties: v,
            })),
      };

      (mapInstance.value.getSource(GEOJSON_SOURCE_ID) as maplibregl.GeoJSONSource).setData(geojson);
    },
    { immediate: true },
);
</script>

<style scoped>
.map-container { width: 100%; height: 100%; }
.popup-wrapper { background: rgba(255,255,255,0.2); padding:4px; max-width:260px; font-family:Arial,sans-serif; }
.popup-content strong { font-size:1.4em; line-height:1.1em; color:#333; display:block; margin-bottom:4px; }
.popup-content p { margin:4px 0; }
.popup-content button { margin-top:8px; padding:6px 12px; background-color:#fff; color:#406E37; border:1px solid #A0D896; border-radius:5px; cursor:pointer; transition:0.3s; }
.popup-content button:hover { border-color:#333; color:#333; }
</style>