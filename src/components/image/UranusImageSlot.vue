<template>
  <div class="image-card">
    <div class="image-wrapper" @click="openDialog">
      <!-- Image or placeholder -->
      <img v-if="imageId && imageUrl" :src="imageUrl" :alt="'Image'" />
      <div v-else class="placeholder">+</div>

      <!-- Hover buttons -->
      <div v-if="imageId" class="hover-actions">
        <button @click.stop="openDialog">Edit</button>
        <button @click.stop="removeImage">Remove</button>
      </div>
    </div>

    <!-- Slot index below image -->
    <div class="image-index">Slot {{ slotIndex }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { buildPlutoPreviewImageUrl } from '@/utils/UranusUtils.ts'

const props = defineProps<{
  slotIndex: number
  imageId: number | null
}>()

const emit = defineEmits<{
  (e: 'update', meta: any | null): void
  (e: 'edit', slotIndex: number | null): void
  (e: 'remove', slotIndex: number | null): void
}>()

// Compute image URL using utility
const imageUrl = computed(() =>
    props.imageId != null ? buildPlutoPreviewImageUrl(props.imageId) : ''
)

function openDialog() {
  emit('edit', props.slotIndex)
}

function removeImage() {
  emit('remove', props.slotIndex)
}
</script>

<style scoped>
.image-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 220px;
  border: 1px solid #ccc;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
}

.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
}

.image-wrapper img {
  display: block;
  width: 100%;
  height: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  color: #bbb;
}

.hover-actions {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 0.4rem;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.image-wrapper:hover .hover-actions {
  opacity: 1;
}

.hover-actions button {
  background: var(--uranus-ia-inline-color);
  opacity: 0.8;
  color: #fff;
  border: none;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  backdrop-filter: blur(2px);
  transition: background 0.4s;
}

.hover-actions button:hover {
  background: var(--uranus-ia-inline-color-light1);
}

.image-index {
  margin-top: 0.3rem;
  font-size: 0.85rem;
  color: #555;
}
</style>