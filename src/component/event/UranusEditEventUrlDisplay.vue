<template>
  <div class="uranus-event-url-display">
    <span v-if="url.title"><strong> {{ url.title  }}: </strong></span>
    <a :href="getUranusEventUrl" target="_blank">{{ url.url }}</a>
    <span v-if="getUrlTypeLabel(url.type)"> ({{ getUrlTypeLabel(url.type) }})</span>
    {{ url.id }}
    <UranusInlineIcon
        v-if="canEdit"
        mode="edit"
        @click="$emit('edit')"
        class="icon"
    />
    <UranusInlineIcon
        v-if="canEdit"
        mode="delete"
        @click="$emit('delete')"
        class="icon"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from 'vue-i18n'
import UranusInlineIcon from '@/component/ui/UranusInlineIcon.vue'
import type { UranusEventLink } from '@/model/uranusEventModel.ts'
import { useUrlTypeLookupStore } from '@/store/uranusUrlTypesLookup.ts'

const { locale } = useI18n()
const urlTypeLookup = useUrlTypeLookupStore()

const getUranusEventUrl = computed(() => {
  if (!props.url.url) return undefined;
  return props.url.url;
})

const getUrlTypeLabel = (urlType: number | null) => {
  if (urlType == null) return null
  return urlTypeLookup.getLabel('event', locale.value, urlType)
}

const props = defineProps<{
  url: UranusEventLink
  canEdit: boolean
}>()
</script>

<style scoped>
.uranus-event-url-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  cursor: pointer;
}
</style>