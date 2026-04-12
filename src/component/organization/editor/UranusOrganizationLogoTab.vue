<!--
  src/component/event/editor/UranusOrganizationLogoTab.vue

  2026-02-08, Roald
-->

<template>
  <section class="uranus-admin-edit-section organization-images-tab">
    <UranusImageSlot
        context="organization"
        :contextUuid="org.uuid"
        identifier="main_logo"
        bgClass="padded"
    />
    <UranusImageSlot
        context="organization"
        :contextUuid="org.uuid"
        identifier="dark_theme_logo"
        bgClass="padded dark"
    />
    <UranusImageSlot
        context="organization"
        :contextUuid="org.uuid"
        identifier="light_theme_logo"
        bgClass="padded light"
    />
    <UranusImageSlot
        context="organization"
        :contextUuid="org.uuid"
        identifier="avatar"
        bgClass="padded"
    />
  </section>
</template>

<script setup lang="ts">
  import UranusImageSlot from '@/component/image/UranusImageSlot.vue'
  import { useUranusOrganizationStore } from "@/store/organizationStore.ts";
  import { computed } from "vue";

  const store = useUranusOrganizationStore()
  const org = computed(() => store.draft!)

</script>

<style lang="scss" scoped>
</style>