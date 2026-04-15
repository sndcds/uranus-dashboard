<!--
  src/component/image/UranusImageSlot.vue

  2026-02-10, Roald
-->

<template>
  <div :class="['image-card', props.bgClass]" :style="cardStyle">

    <!-- Preview -->
    <div class="image-wrapper" @click="openDialog">
      <img
          v-if="imageUuid && imageUrl"
          :key="reloadCounter"
          :src="imageUrl"
          :alt="image?.altText ?? ''"
          :class="fitMode"
      />

      <div v-else class="placeholder">+</div>

      <!-- Hover buttons -->
      <div v-if="imageUuid" class="hover-actions">
        <button @click.stop="openDialog">Edit</button>
        <button @click.stop="removeImage">Remove</button>
      </div>

    </div>

    <div class="image-index">
      {{ label ?? identifier }}
    </div>

    <!-- Modal -->
    <UranusImageEditDialog
        v-if="dialogOpen && contextUuid && identifier"
        :context="context"
        :contextUuid="contextUuid"
        :identifier="identifier"
        :fitMode="fitMode"
        @close="dialogOpen = false"
        @save="onSave"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusImageEditDialog from './UranusImageEditDialog.vue'
import { apiFetch } from '@/api'
import { buildPlutoSlotImageUrl } from '@/util/UranusUtils'
import { type PlutoImage, loadPlutoImage } from '@/domain/image/plutoImage.model.ts'

const { t } = useI18n()

// Props
const props = defineProps<{
  context: string
  contextUuid: string | null
  identifier: string | null
  label?: string | null
  width?: number | null
  fitMode?: 'cover' | 'contain'
  bgClass?: string | null
}>()

// State
const dialogOpen = ref(false)
const reloadCounter = ref(0)
const image = ref<PlutoImage | null>(null)

const imageUuid = computed(() =>
    image.value ? image.value.uuid : null
)

const fitMode = computed(() =>
    props.fitMode === 'contain' ? 'contain' : 'cover'
)

const cardStyle = computed(() => {
  const style: Record<string, string> = {}
  style.width = props.width ? `${props.width}px` : '220px'
  return style
})

const imageUrl = computed(() => {
  if (!imageUuid.value) return ''

  const width = props.width ?? 220
  const baseUrl = buildPlutoSlotImageUrl(
      imageUuid.value,
      width,
      null,
      props.fitMode ?? 'contain'
  )

  const url = new URL(baseUrl, window.location.origin)
  url.searchParams.set('v', reloadCounter.value.toString())
  return url.toString()
})


async function loadImage() {
  const apiPath = `/api/image/meta/${props.context}/${props.contextUuid}/${props.identifier}`
  image.value = await loadPlutoImage(apiPath)
}


function openDialog() {
  dialogOpen.value = true
}


async function onSave(
    payload: any,
    file: File | null,
) {
  const form = new FormData()

  if (file) form.append('file', file)

  form.append('payload', JSON.stringify(payload))

  const apiPath = `/api/admin/image/${props.context}/${props.contextUuid}/${props.identifier}`
  await apiFetch(apiPath,{ method: 'POST', body: form })

  dialogOpen.value = false

  await loadImage()
  incReloadCounter()
}


async function removeImage() {
  if (!imageUuid.value) return

  // Ask the user for confirmation
  const ok = confirm(t('delete_image_alert'))
  if (!ok) return  // user canceled

  try {
    const apiPath = `/api/admin/image/${props.context}/${props.contextUuid}/${props.identifier}`
    await apiFetch(apiPath, { method: 'DELETE'})
    image.value = null
  } catch (err) {
    console.error('Failed to delete image', err)
    alert('Failed to delete image')
  }
}


function incReloadCounter() {
  reloadCounter.value++
}


// defineExpose({ incReloadCounter })

onMounted(loadImage)
</script>

<style lang="scss">
.image-card {
  &.light { background: var(--uranus-bg-light); }
  &.dark { background: var(--uranus-bg-dark); }
  &.padded { padding: 12px; }
}

</style>

<style scoped lang="scss">
.image-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 320px;
  border: 1px solid var(--uranus-input-border-color);
  border-radius: var(--uranus-input-border-radius);
  overflow: hidden;
  cursor: pointer;
}

.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-wrapper img {
  max-width: 100%;
  max-height: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  color: var(--uranus-color);
}

.hover-actions {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 0.4rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-wrapper:hover .hover-actions {
  opacity: 1;
}

.hover-actions button {
  border: none;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.image-index {
  margin-top: 0.3rem;
  font-size: 0.85rem;
  color: #555;
}
</style>