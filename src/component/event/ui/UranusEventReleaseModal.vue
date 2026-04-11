<template>
  <UranusModal
      :show="show"
      :title="t('event_release_settings')"
      @close="$emit('close')"
      :maxWidth="'500px'"
  >

    <UranusForm>
      <UranusFormRow>
        <UranusLabel id="release-status" :label="t('event_release_status')">
          <UranusEventReleaseStatusSelect v-model="localReleaseStatus" />
        </UranusLabel>
      </UranusFormRow>

      <UranusFormRow>
        <UranusDateInput
            id="release-date"
            :label="t('event_release_date')"
            v-model="localReleaseDate">
        </UranusDateInput>
      </UranusFormRow>
    </UranusForm>

    <UranusFormRow>
      <div class="release-notice">
        <AlertTriangle /><br>
        {{ t('event_release_notice') }}
      </div>
    </UranusFormRow>

    <UranusFormActions>
      <UranusButton @click="$emit('close')">{{ t('cancel') }}</UranusButton>
      <UranusButton @click="onSave">{{ t('save') }}</UranusButton>
    </UranusFormActions>
  </UranusModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusModal from '@/component/uranus/UranusModal.vue'
import UranusEventReleaseStatusSelect from '@/component/event/ui/UranusEventReleaseStatusSelect.vue'
import UranusLabel from '@/component/ui/UranusLabel.vue'
import UranusForm from "@/component/ui/UranusForm.vue";
import UranusFormRow from "@/component/ui/UranusFormRow.vue";
import UranusDateInput from "@/component/ui/UranusDateInput.vue";
import UranusFormActions from "@/component/ui/UranusFormActions.vue";
import UranusButton from "@/component/ui/UranusButton.vue";
import { AlertTriangle } from 'lucide-vue-next'

const { t } = useI18n()

interface Props {
  show: boolean
  releaseStatus: string | null
  releaseDate: string | null
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:releaseStatus', val: string | null): void
  (e: 'update:releaseDate', val: string | null): void
  (e: 'close'): void
}>()

// Local copy to avoid updating store before save
const localReleaseStatus = ref(props.releaseStatus)
const localReleaseDate = ref(props.releaseDate)

// Keep local copy synced with props
watch(() => props.releaseStatus, val => localReleaseStatus.value = val)
watch(() => props.releaseDate, val => localReleaseDate.value = val)

function onSave() {
  emit('update:releaseStatus', localReleaseStatus.value)
  emit('update:releaseDate', localReleaseDate.value)
  emit('close')
}
</script>

<style scoped>
.release-notice {
  margin: 2rem 0.5rem;
}
</style>