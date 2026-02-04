<!--
  src/component/image/UranusImageSlot.vue
-->

<template>
  <div class="image-card">
    <div class="image-wrapper" @click="openDialog">
      <!-- Image or placeholder -->
      <img
          v-if="image && imageUrl"
          :key="reloadCounter"
          :src="imageUrl"
          :alt="image.alt ?? 'Image'"
          :class="fitMode"
      />

      <div v-else class="placeholder">+</div>

      <!-- Hover buttons -->
      <div v-if="image?.id" class="hover-actions">
        <button @click.stop="openDialog">Edit</button>
        <button @click.stop="removeImage">Remove</button>
      </div>
    </div>

    <div class="image-index">
      {{ label ?? identifier }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { buildPlutoPreviewImageUrl, buildPlutoSlotImageUrl } from '@/util/UranusUtils.ts'
import type { UranusImage } from '@/model/uranusEventModel.ts'

const props = defineProps<{
  identifier: string            // "main", "gallery1", ...
  image: UranusImage | null
  label?: string | null
  fitMode?: 'cover' | 'contain'
}>()

const fitMode = computed(() => props.fitMode === 'contain' ? 'contain' : 'cover')

const reloadCounter = ref(0)

const emit = defineEmits<{
  (e: 'edit', identifier: string): void
  (e: 'remove', identifier: string): void
}>()


const imageUrl = computed(() => {
  if (!props.image?.id) return ''

  const baseUrl = buildPlutoSlotImageUrl(
      props.image.id,
      320,
      null,
      props.fitMode ?? 'contain'
  )

  // const baseUrl = buildPlutoPreviewImageUrl(props.image.id)
  const url = new URL(baseUrl, window.location.origin)

  // Append client-side cache buster
  url.searchParams.set('v', reloadCounter.value.toString())

  return url.toString()
})

function openDialog() {
  emit('edit', props.identifier)
}

function removeImage() {
  emit('remove', props.identifier)
}

function incReloadCounter() {
  reloadCounter.value++
  console.log('reloadCounter', reloadCounter.value)
}

defineExpose({
  incReloadCounter
})
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

  /* Flex centering */
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-wrapper img {
  max-width: 100%;
  max-height: 100%;
  height: auto;
  width: auto;
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
  color: var(--uranus-ia-inline-bg);
  background: var(--uranus-ia-inline-color);
  opacity: 1;
  border: none;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  backdrop-filter: blur(2px);
  transition: background 0.4s;
  cursor: pointer;
}

.hover-actions button:hover {
  color: var(--uranus-ia-inline-color);
  background: var(--uranus-ia-inline-bg);
  opacity: 1;
}

.image-index {
  margin-top: 0.3rem;
  font-size: 0.85rem;
  color: #555;
}
</style>