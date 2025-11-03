// composables/useMapLibre.ts
import { ref, watch, onBeforeUnmount, type Ref } from 'vue';
import maplibregl, { Map, Marker, type LngLatLike } from 'maplibre-gl';
import type { StyleSpecification } from 'maplibre-gl';

interface UseMapLibreOptions {
    container: Ref<HTMLElement | null>;
    style?: string | StyleSpecification;
    center?: LngLatLike;
    zoom?: number;
}

export function useMapLibre(options: UseMapLibreOptions) {
    const { container, style, center, zoom } = options;
    const mapInstance = ref<Map | null>(null);

    const defaultStyle: StyleSpecification = {
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
    };

    const stopWatch = watch(
        container,
        (el) => {
            if (!el || mapInstance.value) return;

            mapInstance.value = new maplibregl.Map({
                container: el,
                style: style ?? defaultStyle,
                center: center ?? [13.405, 52.52],
                zoom: zoom ?? 12,
            });

            mapInstance.value.addControl(new maplibregl.NavigationControl());
        },
        { immediate: true }
    );

    onBeforeUnmount(() => {
        mapInstance.value?.remove();
        stopWatch();
    });

    return { mapInstance };
}