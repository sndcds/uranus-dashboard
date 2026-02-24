<template>
  <UranusModal
      :show="show"
      title="Event Release Settings"
      @close="$emit('close')"
      :maxWidth="'500px'"
  >
    <div class="modal-content">
      <label>
        Release Status
        <UranusEventReleaseStatusSelect
            v-model="localReleaseStatus" />
      </label>

      <label>
        Release Date
        <input type="date" v-model="localReleaseDate" />
      </label>
    </div>

    <div class="modal-actions">
      <button @click="save">Save</button>
      <button @click="$emit('close')">Cancel</button>
    </div>
  </UranusModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import UranusModal from '@/component/uranus/UranusModal.vue'
import UranusEventReleaseStatusSelect from '@/component/event/ui/UranusEventReleaseStatusSelect.vue'

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

function save() {
  emit('update:releaseStatus', localReleaseStatus.value)
  emit('update:releaseDate', localReleaseDate.value)
  emit('close')
}
</script>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;

  button {
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid #aaa;
    background: #fff;

    &:hover { background: #e0e0e0; }
  }
}
</style>