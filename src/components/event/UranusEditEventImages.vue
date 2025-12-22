<!--
  UranusEditEventImages.vue
-->
<template>
  <div class="image-grid">
    <UranusImageSlot
        v-for="index in 4"
        :key="index - 1"
        :slot-index="index"
        :image-id="localImageIds[index - 1] ?? null"
        :get-image-url="getImageUrl"
        @update="id => updateSlot(index - 1, id)"
        @remove="(id: number | null) => emit('remove', id)"
        @edit="(id: number | null) => emit('edit', id)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref, inject } from 'vue'
import UranusImageSlot from '@/components/image/UranusImageSlot.vue'
import { buildPlutoPreviewImageUrl } from '@/utils/UranusUtils'
import type { UranusEventDetail } from "@/models/UranusEventModel.ts";

const event = inject<Ref<UranusEventDetail | null>>('event')

const emit = defineEmits<{
  (e: 'update', updatedIds: [number | null, number | null, number | null, number | null]): void
  (e: 'edit', id: number | null): void
  (e: 'remove', id: number | null): void
}>()

// Local reactive copy (syncs with parent)
const localImageIds = ref<[number | null, number | null, number | null, number | null]>([
  event?.value?.imageIds[0] ?? null,
  event?.value?.imageIds[1] ?? null,
  event?.value?.imageIds[2] ?? null,
  event?.value?.imageIds[3] ?? null
])


// --- Image dialog ---
const editingIndex = ref<number | null>(null)

/*
const editingImageId = computed(() =>
    editingIndex.value !== null ? localImageIds.value[editingIndex.value] : null
)
*/

// --- Helpers ---
function getImageUrl(id: number | null) {
  return id != null ? buildPlutoPreviewImageUrl(id) : ''
}

function updateSlot(slotIndex: number, id: number | null) {
  localImageIds.value[slotIndex] = id
  emit('update', [...localImageIds.value] as [number | null, number | null, number | null, number | null])
}

function clearSlot(slotIndex: number) {
  updateSlot(slotIndex, null)
}

function reload() {
  if (!event?.value) return
  localImageIds.value = [
    event.value.imageIds[0] ?? null,
    event.value.imageIds[1] ?? null,
    event.value.imageIds[2] ?? null,
    event.value.imageIds[3] ?? null,
  ]
}

defineExpose({
  reload
})

</script>

<style scoped>
.image-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>