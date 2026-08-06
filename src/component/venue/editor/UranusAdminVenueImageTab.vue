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
        :label="t('main_photo')"
    />
    <UranusImageSlot
        context="venue"
        :contextUuid="venue.uuid"
        identifier="gallery_photo_1"
        :width="220"
        :label="t('gallery_photo') + ' 1'"
    />
    <UranusImageSlot
        context="venue"
        :contextUuid="venue.uuid"
        identifier="gallery_photo_2"
        :width="220"
        :label="t('gallery_photo') + ' 2'"
    />
    <UranusImageSlot
        context="venue"
        :contextUuid="venue.uuid"
        identifier="gallery_photo_3"
        :width="220"
        :label="t('gallery_photo') + ' 3'"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusImageSlot from '@/component/image/UranusImageSlot.vue'
import { useUranusVenueStore } from '@/store/venueStore.ts'

const { t } = useI18n()
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
