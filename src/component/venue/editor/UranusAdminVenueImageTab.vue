<!--
  src/component/event/editor/UranusAdminVenueImageTab.vue

  2026-02-08, Roald
-->

<template>
  <section class="uranus-vertical-flex">
    <UranusImageSlot
        context="venue"
        :contextUuid="venue.uuid"
        identifier="main_photo"
        :width="220"
    />
    <UranusImageSlot
        context="venue"
        :contextUuid="venue.uuid"
        identifier="gallery_photo_1"
        :width="220"
    />
    <UranusImageSlot
        context="venue"
        :contextUuid="venue.uuid"
        identifier="gallery_photo_2"
        :width="220"
    />
    <UranusImageSlot
        context="venue"
        :contextUuid="venue.uuid"
        identifier="gallery_photo_3"
        :width="220"
    />
  </section>
</template>

<script setup lang="ts">
import UranusImageSlot from '@/component/image/UranusImageSlot.vue'
import { useUranusVenueStore } from "@/store/venueStore.ts";
import { computed, watch } from "vue";

const store = useUranusVenueStore()
const venue = computed(() => store.draft!)
const emit = defineEmits<{
  (event: 'dirty-change', value: boolean): void
}>()
const isDirty = computed(() => false)

watch(isDirty, (value) => {
  emit('dirty-change', value)
}, { immediate: true })
</script>
