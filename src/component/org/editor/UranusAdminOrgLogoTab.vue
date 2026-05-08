<!--
  src/component/event/editor/UranusAdminOrgLogoTab.vue

  2026-02-08, Roald
-->

<template>
  <section class="uranus-vertical-flex">
    <UranusImageSlot
        context="organization"
        :contextUuid="org.uuid"
        identifier="main_logo"
        bgClass="padded"
        :label="t('main_logo')"
    />
    <UranusImageSlot
        context="organization"
        :contextUuid="org.uuid"
        identifier="dark_theme_logo"
        bgClass="padded dark"
        :label="t('dark_theme_logo')"
    />
    <UranusImageSlot
        context="organization"
        :contextUuid="org.uuid"
        identifier="light_theme_logo"
        bgClass="padded light"
        :label="t('light_theme_logo')"
    />
    <UranusImageSlot
        context="organization"
        :contextUuid="org.uuid"
        identifier="avatar"
        bgClass="padded"
        :label="t('avatar')"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusImageSlot from '@/component/image/UranusImageSlot.vue'
import { useOrgStore } from '@/store/orgStore.ts'

const { t } = useI18n()
const store = useOrgStore()
const org = computed(() => store.draft!)
const emit = defineEmits<{
  (event: 'dirty-change', value: boolean): void
}>()
const isDirty = computed(() => false)

watch(isDirty, (value) => {
  emit('dirty-change', value)
}, { immediate: true })

</script>

<style lang="scss" scoped>
</style>
