<!--
  src/component/portal/editor/UranusAdminPortalImageTab.vue

  2026-02-08, Roald
-->

<template>
  <section class="uranus-vertical-flex">
    <UranusImageSlot
        context="portal"
        :contextUuid="portal.uuid"
        identifier="web_logo"
        :width="220"
    />
    <UranusImageSlot
        context="portal"
        :contextUuid="portal.uuid"
        identifier="background_image"
        :width="220"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import UranusImageSlot from '@/component/image/UranusImageSlot.vue'
import { useUranusPortalStore } from '@/store/portalStore.ts'

const store = useUranusPortalStore()
const portal = computed(() => store.draft!)
const emit = defineEmits<{
  (event: 'dirty-change', value: boolean): void
}>()
const isDirty = computed(() => false)

watch(isDirty, (value) => {
  emit('dirty-change', value)
}, { immediate: true })
</script>
