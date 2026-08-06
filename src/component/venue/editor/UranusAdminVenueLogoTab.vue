<!--
  src/component/event/editor/UranusAdminVenueLogoTab.vue

  2026-02-08, Roald
-->

<template>
  <section class="uranus-vertical-flex">
    <UranusImageSlot
        context="venue"
        :contextUuid="venue.uuid"
        identifier="main_logo"
        bgClass="padded"
        :width="220"
        :label="t('main_logo')"
    />
    <UranusImageSlot
        context="venue"
        :contextUuid="venue.uuid"
        identifier="dark_theme_logo"
        bgClass="dark padded"
        :width="220"
        :label="t('dark_theme_logo')"
    />
    <UranusImageSlot
        context="venue"
        :contextUuid="venue.uuid"
        identifier="light_theme_logo"
        bgClass="light padded"
        :width="220"
        :label="t('light_theme_logo')"
    />
    <UranusImageSlot
        context="venue"
        :contextUuid="venue.uuid"
        identifier="avatar"
        bgClass="padded"
        :width="220"
        :label="t('avatar')"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import {useI18n} from 'vue-i18n'
import UranusImageSlot from '@/component/image/UranusImageSlot.vue'
import { useUranusVenueStore } from '@/store/venueStore.ts'

const { t } = useI18n({ useScope: 'global' })

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
