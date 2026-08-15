<!--
  src/component/event/editor/UranusAdminEventImageTab.vue

  2026-08-15, Roald
-->

<template>
  <section class="images_section">
    <UranusImageSlot
        context="event"
        :contextUuid="event.uuid"
        identifier="main"
        :width="220"
        :label="t('event_main_image')"
    />
    <UranusImageSlot
        context="event"
        :contextUuid="event.uuid"
        identifier="gallery_photo_1"
        :width="220"
        :label="t('gallery_photo') + ' 1'"
    />
    <UranusImageSlot
        context="event"
        :contextUuid="event.uuid"
        identifier="gallery_photo_2"
        :width="220"
        :label="t('gallery_photo') + ' 2'"
    />
    <UranusImageSlot
        context="event"
        :contextUuid="event.uuid"
        identifier="gallery_photo_3"
        :width="220"
        :label="t('gallery_photo') + ' 3'"
    />
  </section>

  <h1 class="images_group_title">
    Bilder
  </h1>

  <section class="images_section">
    <UranusImageSlot
        context="event"
        :contextUuid="event.uuid"
        identifier="ad_1x1"
        :width="220"
        :label="t('ad_1x1')"
    />
    <UranusImageSlot
        context="event"
        :contextUuid="event.uuid"
        identifier="ad_9x16"
        :width="220"
        :label="t('ad_9x16')"
    />
    <UranusImageSlot
        context="event"
        :contextUuid="event.uuid"
        identifier="ad_16x9"
        :width="220"
        :label="t('ad_16x9')"
    />
    <UranusImageSlot
        context="event"
        :contextUuid="event.uuid"
        identifier="poster"
        :width="220"
        :label="t('poster')"
    />
    <UranusImageSlot
        context="event"
        :contextUuid="event.uuid"
        identifier="insta_5x4"
        :width="220"
        :label="t('insta_5x4')"
    />
  </section>
</template>


<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusImageSlot from '@/component/image/UranusImageSlot.vue'
import { useAdminEventStore } from '@/store/adminEventStore.ts'

const { t } = useI18n()
const store = useAdminEventStore()

const event = computed(() => store.draft!)

const emit = defineEmits<{
  (event: 'dirty-change', value: boolean): void
}>()
const isDirty = computed(() => false)

watch(isDirty, (value) => {
  emit('dirty-change', value)
}, { immediate: true })
</script>


<style scoped lang="scss">
.images_section {
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  gap: 2rem;
}

.images_group_title {
  margin-top: 2rem;
  margin-bottom: 1rem;
}

</style>