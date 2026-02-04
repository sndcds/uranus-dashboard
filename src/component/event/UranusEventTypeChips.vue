<template>
  <span class="uranus-dashboard-chip-wrapper">
    <span
        class="uranus-dashboard-chip"
        v-for="item in items"
        :key="item.typeId + '-' + item.genreId"
    >
      {{ formatTypeGenreItem(item) }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { UranusEventType } from '@/model/uranusEventModel.ts'
import { useEventTypeLookupStore } from '@/store/uranusEventTypeGenreLookup.ts'

const { t, locale } = useI18n({ useScope: 'global' })
const typeLookupStore = useEventTypeLookupStore()

const props = defineProps<{
  items: UranusEventType[] | null
}>()

function formatTypeGenreItem(item: UranusEventType): string {
  return  typeLookupStore.getTypeGenreName(item.type, item.genre ?? null, locale.value)
}

</script>
