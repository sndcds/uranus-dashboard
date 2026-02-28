<!--
  src/view/public/UranusMapView.vue

  2026-02-28, Roald
-->

<template>
    <UranusMap
        :showStations="true"
        :showVenues="true"
        :showEvents="true"
    />
</template>

<script setup lang="ts">
import UranusMap from "@/component/map/UranusMap.vue";
</script>
