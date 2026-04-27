<!--
  src/component/event/editor/UranusAdminOrganizationLogoTab.vue

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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusImageSlot from '@/component/image/UranusImageSlot.vue'
import { useUranusOrganizationStore } from '@/store/organizationStore.ts'

const { t } = useI18n()
const store = useUranusOrganizationStore()
const org = computed(() => store.draft!)

</script>

<style lang="scss" scoped>
</style>