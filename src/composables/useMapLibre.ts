// composables/useMapLibre.ts
import { ref, watch, onBeforeUnmount } from 'vue';
import maplibregl, { Map, Marker, LngLatLike } from 'maplibre-gl';

interface UseMapLibreOptions {
    container: HTMLElement | null | undefined;
    style?: any; // MapLibre style object or URL
    center?: LngLatLike;
    zoom?: number;
    markers?: LngLatLike[];
}

export function useMapLibre(options: { container: Ref<HTMLElement | null>, style?: any, center?: LngLatLike, zoom?: number, markers?: LngLatLike[] }) {
    const mapInstance = ref<Map | null>(null);
    const markersInstance = ref<Marker[]>([]);

    const { container, style, center, zoom, markers } = options;

    const stopWatch = watch(container, (el) => {
        if (!el || mapInstance.value) return;

        mapInstance.value = new maplibregl.Map({
            container: el,
            style: style ?? {
                version: 8,
                sources: {
                    osm: {
                        type: 'raster',
                        tiles: ['https://tiles.oklabflensburg.de/sgm/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: 'Map data © OpenStreetMap contributors',
                    },
                },
                layers: [
                    {
                        id: 'osm-layer',
                        type: 'raster',
                        source: 'osm',
                    },
                ],
            },
            center: center ?? [13.405, 52.52],
            zoom: zoom ?? 12,
        });

        if (markers?.length) {
            markers.forEach(addMarker);
        }
    }, { immediate: true });

    onBeforeUnmount(() => {
        markersInstance.value.forEach((m) => m.remove());
        mapInstance.value?.remove();
        stopWatch(); // stop the watcher
    });

    function addMarker(lngLat: LngLatLike) {
        if (!mapInstance.value) return null;
        const marker = new maplibregl.Marker().setLngLat(lngLat).addTo(mapInstance.value);
        markersInstance.value.push(marker);
        return marker;
    }

    function clearMarkers() {
        markersInstance.value.forEach((m) => m.remove());
        markersInstance.value = [];
    }

    function setCenter(lngLat: LngLatLike) {
        mapInstance.value?.setCenter(lngLat);
    }

    function setZoom(zoomLevel: number) {
        mapInstance.value?.setZoom(zoomLevel);
    }

    return { mapInstance, markersInstance, addMarker, clearMarkers, setCenter, setZoom };
}