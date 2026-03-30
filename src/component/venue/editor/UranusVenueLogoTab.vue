<!--
  src/component/event/editor/UranusVenueLogoTab.vue

  2026-02-08, Roald
-->

<template>
  <section class="uranus-admin-edit-section venue-images-tab">
    <UranusImageSlot
        context="venue"
        :contextUuid="venue.uuid"
        identifier="main_logo"
        bgClass="padded"
        :width="220"
    />
    <UranusImageSlot
        context="venue"
        :contextUuid="venue.uuid"
        identifier="dark_theme_logo"
        bgClass="dark padded"
        :width="220"
    />
    <UranusImageSlot
        context="venue"
        :contextUuid="venue.uuid"
        identifier="light_theme_logo"
        bgClass="light padded"
        :width="220"
    />
    <UranusImageSlot
        context="venue"
        :contextUuid="venue.uuid"
        identifier="avatar"
        bgClass="padded"
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