<template>
  <span class="event-category-indicators">
    <UranusEventTableHint v-for="id in visibleIds" :key="id" :text="label(id)">
      <span tabindex="0" class="event-category-dot" role="img" :aria-label="label(id)" :style="{ backgroundColor: eventCategoryColor(id) }" />
    </UranusEventTableHint>
    <span v-if="uniqueIds.length > 3" :aria-label="allLabels">+{{ uniqueIds.length - 3 }}</span>
    <span v-if="!uniqueIds.length">–</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { eventCategoryColor, eventCategoryLabelKey } from '@/domain/event/eventCategory'
import UranusEventTableHint from './UranusEventTableHint.vue'
const props = defineProps<{ categories: number[] | null }>()
const { t } = useI18n({ useScope: 'global' })
const uniqueIds = computed(() => [...new Set(props.categories ?? [])])
const visibleIds = computed(() => uniqueIds.value.slice(0, 3))
const allLabels = computed(() => uniqueIds.value.map(label).join(', '))
function label(id: number) { const key = eventCategoryLabelKey(id); return key ? t(key) : t('event_table_category_unknown', { id }) }
</script>

<style scoped>
.event-category-indicators { display: inline-flex; align-items: center; gap: 4px; font-size: 0.7rem; }
.event-category-dot { display: block; width: 10px; height: 10px; border-radius: 50%; box-shadow: inset 0 0 0 1px #0002; }
.event-category-dot:focus-visible { outline: 2px solid var(--uranus-focus-color); outline-offset: 2px; }
</style>
