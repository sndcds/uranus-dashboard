<!--
  src/component/event/editor/UranusVenueImagesTab.vue

  2026-02-08, Roald
-->

<template>
  {{ venue.id }}
  <section class="uranus-admin-edit-section venue-images-tab">
    <UranusImageSlot
        context="venue"
        :contextId="venue.id"
        identifier="main_logo"
    />
    <UranusImageSlot
        context="venue"
        :contextId="venue.id"
        identifier="dark_theme_logo"
    />
    <UranusImageSlot
        context="venue"
        :contextId="venue.id"
        identifier="light_theme_logo"
    />
    <UranusImageSlot
        context="venue"
        :contextId="venue.id"
        identifier="avatar"
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