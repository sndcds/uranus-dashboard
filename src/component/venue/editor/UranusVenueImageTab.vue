<!--
  src/component/event/editor/UranusVenueImageTab.vue

  2026-02-08, Roald
-->

<template>
  {{ venue.id }}
  <section class="uranus-admin-edit-section venue-images-tab">
    <UranusImageSlot
        context="venue"
        :contextId="venue.id"
        identifier="main_photo"
        :width="220"
    />
    <UranusImageSlot
        context="venue"
        :contextId="venue.id"
        identifier="gallery_photo_1"
        :width="220"
    />
    <UranusImageSlot
        context="venue"
        :contextId="venue.id"
        identifier="gallery_photo_2"
        :width="220"
    />
    <UranusImageSlot
        context="venue"
        :contextId="venue.id"
        identifier="gallery_photo_3"
        :width="220"
    />
  </section>
</template>

<script setup lang="ts">
import UranusImageSlot from '@/component/image/UranusImageSlot.vue'
import { useUranusVenueStore } from "@/store/UranusVenueStore.ts";
import { computed } from "vue";

const store = useUranusVenueStore()
const venue = computed(() => store.draft!)


</script>


<style lang="scss" scoped>
</style>