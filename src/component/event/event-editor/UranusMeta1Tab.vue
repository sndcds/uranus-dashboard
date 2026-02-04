<script setup lang="ts">
import UranusAdminEventTypeGenreEditor from "@/component/event/event-editor/UranusAdminEventTypeGenreEditor.vue";
import AdminEventTagsEditor from "@/component/event/event-editor/AdminEventTagsEditor.vue";
import UranusEventLanguageEditor from "@/component/event/event-editor/UranusEventLanguageEditor.vue";
import UranusEventLinksEditor from "@/component/event/event-editor/UranusEventLinksEditor.vue";
</script><!--
  src/component/event/event-editor/AdminEventSettingsTab.vue
-->

<template>
  <section class="release-tab">
    <UranusAdminEventTypeGenreEditor />
    <AdminEventTagsEditor />
    <UranusEventLanguageEditor />
    <UranusEventLinksEditor />
  </section>
</template>
