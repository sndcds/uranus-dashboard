<!--
  src/component/event/editor/UranusMeta1Tab.vue

  2026-02-05, Roald
-->

<script setup lang="ts">
import UranusAdminEventTypeGenreEditor from "@/component/event/editor/UranusAdminEventTypeGenreEditor.vue";
import AdminEventTagsEditor from "@/component/event/editor/AdminEventTagsEditor.vue";
import UranusEventLanguageEditor from "@/component/event/editor/UranusEventLanguageEditor.vue";
import UranusEventLinksEditor from "@/component/event/editor/UranusEventLinksEditor.vue";
</script>


<template>
  <section class="release-tab">
    <UranusAdminEventTypeGenreEditor />
    <AdminEventTagsEditor />
    <UranusEventLanguageEditor />
    <UranusEventLinksEditor />
  </section>
</template>
