<template>
  <div class="image-grid">
    <UranusImageSlot
        v-for="slot in IMAGE_SLOTS"
        :key="slot.id + '-' + refreshCount"
        :identifier="slot.id"
        :label="slot.label"
        :image="event?.images?.[slot.id] ?? null"
        @edit="onEditImage"
        @remove="onRemoveImage"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, computed, inject } from 'vue'
import { type Ref } from 'vue'
import UranusImageSlot from '@/component/image/UranusImageSlot.vue'
import { UranusImage } from "@/model/uranusEventModel.ts";
import { UranusEventDetail } from "@/model/uranusAdminEventModel.ts";

const props = defineProps<{
  images: Record<string, UranusImage | null>
}>()



const refreshCount = ref(0)

const event = inject('event') as Ref<UranusEventDetail | null> | undefined

const localImages = computed(() => {
  if (!event?.value?.images) return {
    main: null,
    gallery1: null,
    gallery2: null,
    gallery3: null
  }

  return {
    main: event.value.images.main,
    gallery1: event.value.images.gallery1,
    gallery2: event.value.images.gallery2,
    gallery3: event.value.images.gallery3,
  }
})

const emit = defineEmits<{
  (e: 'update', updatedIds: [number | null, number | null, number | null, number | null]): void
  (e: 'edit', identifier: string): void
  (e: 'remove', identifier: string): void
}>()

// --- Image slots ---
const IMAGE_SLOTS = [
  { id: 'main', label: 'Main Image' },
  { id: 'gallery1', label: 'Gallery 1' },
  { id: 'gallery2', label: 'Gallery 2' },
  { id: 'gallery3', label: 'Gallery 3' },
]

// --- Emit events to parent ---
function onEditImage(identifier: string) {
  emit('edit', identifier)
}

function onRemoveImage(identifier: string) {
  emit('remove', identifier)
}

function reload() {
  refreshCount.value++
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