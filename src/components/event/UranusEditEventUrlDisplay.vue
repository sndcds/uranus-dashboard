<template>
  <div class="uranus-event-url-display">
    <span v-if="url.title"><strong> {{ url.title  }}: </strong></span>
    <a :href="getUranusEventUrl" target="_blank">{{ url.url }}</a>
    <span v-if="getUrlTypeLabel(url.urlType)"> ({{ getUrlTypeLabel(url.urlType) }})</span>
    <UranusInlineIcon
        v-if="canEdit"
        mode="edit"
        @click="$emit('edit')"
        class="icon"
    />
    <UranusInlineIcon
        v-if="canEdit"
        mode="delete"
        @click="$emit('remove')"
        class="icon"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from 'vue-i18n'
import UranusInlineIcon from '@/components/ui/UranusInlineIcon.vue'
import type { UranusEventUrl } from '@/models/UranusEventModel.ts'
import { useUrlTypeLookupStore } from '@/store/urlTypesLookup.ts'

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
  url: UranusEventUrl
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