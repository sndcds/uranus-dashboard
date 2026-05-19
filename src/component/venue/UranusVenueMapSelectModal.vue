<!--
  src/component/venue/UranusVenueMapSelectModal.vue
-->

<template>
  <UranusModal
      :show="show"
      :title="title ?? t('select_venue')"
      max-width="960px"
      @close="$emit('close')"
  >
    <UranusVenueMapPicker @select="venue => $emit('select', venue)" />

    <template #actions>
      <UranusButton @click="$emit('close')">
        {{ t('done') }}
      </UranusButton>
    </template>
  </UranusModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import UranusModal from '@/component/uranus/UranusModal.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusVenueMapPicker, { type UranusVenueMapSelection } from '@/component/venue/UranusVenueMapPicker.vue'

defineProps<{
  show: boolean
  title?: string
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'select', venue: UranusVenueMapSelection): void
}>()

const { t } = useI18n({ useScope: 'global' })
</script>
