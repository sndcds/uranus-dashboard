<!--
  src/view/public/UranusMapView.vue

-->

<template>
    <UranusMap
        :showStations="false"
        :showVenues="true"
        :showEvents="false"
    />
</template>

<script setup lang="ts">
import UranusMap from "@/component/map/UranusMap.vue";
</script>
