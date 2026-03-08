<template>
  <UranusForm @submit="onSaveFilter" class="sss">

    <UranusFormRow :cols="1">
      <UranusTextfield
          id="search-input"
          v-model="localFilter.search!"
          :label="t('calendar_filter_search_label')"
          :placeholder="t('calendar_filter_search_placeholder')"
          @keydown.enter.prevent="onSaveFilter"
          @input="emitChange"
      />

      <UranusTextfield
          id="city-input"
          v-model="localFilter.city!"
          :label="t('calendar_filter_city_label')"
          @keydown.enter.prevent="onSaveFilter"
          @input="emitChange"
      />
    </UranusFormRow>

    <UranusFormRow :cols="2">
      <UranusDateInput
          id="start-date"
          v-model="localFilter.startDate"
          :label="t('calendar_filter_start_date')"
          @input="emitChange"
          style="width: 100%;"
      />
      <UranusDateInput
          id="end-date"
          v-model="localFilter.endDate"
          :label="t('calendar_filter_end_date')"
          @input="emitChange"
          style="width: 100%;"
      />
    </UranusFormRow>

    <UranusFormRow :cols="1">
      <UranusVenueTypeahead
          v-model:selectedVenue="localFilter.venue"
      />
    </UranusFormRow>

    <UranusFormRow :cols="1">
      <UranusGeoLocation></UranusGeoLocation>
    </UranusFormRow>


    <!-- Actions -->
      <!--UranusInlineEditActions
          :isSaving="isSavingFilter"
          :canSave="canSaveFilter"
          @save="onSaveFilter"
          @cancel="onCancelFilter"
      /-->


  </UranusForm>

</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusDateInput from "@/component/ui/UranusDateInput.vue"
import UranusVenueTypeahead from "@/component/venue/UranusVenueTypeahead.vue"
import type { UranusVenueSelectItemInfo } from '@/domain/venue/UranusVenue.ts'
import UranusTextfield from "@/component/ui/UranusTextfield.vue";
import UranusFormRow from "@/component/ui/UranusFormRow.vue";
import UranusForm from "@/component/ui/UranusForm.vue";
import UranusGeoLocation from "@/component/ui/UranusGeoLocation.vue";

const props = defineProps<{
  initialFilter: {
    search: string | null
    city: string | null
    startDate?: string | null
    endDate?: string | null
    venue: UranusVenueSelectItemInfo | null
  },
  isSavingFilter?: boolean,
  canSaveFilter?: boolean
}>()

const emit = defineEmits<{
  (e: 'filter-changed', filter: typeof props.initialFilter): void
  (e: 'save'): void
  (e: 'cancel'): void
}>()

const { t } = useI18n({ useScope: 'global' })

// Local reactive copy
const localFilter = reactive({ ...props.initialFilter })

// Emit changes on any input
const emitChange = () => {
  emit('filter-changed', { ...localFilter })
}

// Save & cancel
const onSaveFilter = () => emit('save')
const onCancelFilter = () => emit('cancel')

// Optional: watch prop changes and update local copy
watch(() => props.initialFilter, (newVal) => {
  Object.assign(localFilter, newVal)
}, { deep: true })
</script>


<style scoped lang="scss">
.sss {
  width: 300px;
  padding: 12px;
  background: var(--uranus-bg);
}

</style>