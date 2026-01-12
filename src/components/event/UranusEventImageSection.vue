<!--
  UranusEventImageSection.vue
-->
<template>
  <div class="event-image-section">
    <div class="preview-area" @drop.prevent="onDrop" @dragover.prevent>
      <template v-if="local.image_id || local.image_url || local.file">
        <img :src="previewUrl || undefined" alt="preview" class="preview-img" />
        <div class="controls">
          <input ref="fileInput" type="file" accept="image/*" @change="onFileSelected" />
          <button @click="fileInputClick">Change</button>
          <button @click="onRemove">Remove</button>
        </div>
      </template>

      <template v-else>
        <input ref="fileInput" type="file" accept="image/*" @change="onFileSelected" />
        <button @click="fileInputClick">Choose image</button>
      </template>
    </div>

    <div class="meta">
      <label>Alt text
        <input v-model="local.image_alt_text" />
      </label>

      <label>Created by
        <input v-model="local.image_created_by" />
      </label>

      <label>Copyright
        <input v-model="local.image_copyright" />
      </label>

      <button @click="save" :disabled="saving">Save</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRaw } from 'vue'
import type { UranusEventDate } from '@/models/UranusEventModel.ts'
import { apiFetch } from '@/api.ts'

interface Slice {
  file: File | null
  image_id: number | null
  image_url?: string | null
  image_alt_text: string | null
  image_created_by: string | null
  image_copyright: string | null
  image_license_id: number | null
  image_focus_x: number | null
  image_focus_y: number | null
}

const props = defineProps<{
  modelValue?: Slice | null
  existingImageUrl?: string | null
  uploadUrl?: string
  deleteUrl?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: Slice | null): void
  (e: 'updated'): void
}>()

const local = ref<Slice>({
  file: props.modelValue?.file ?? null,
  image_id: props.modelValue?.image_id ?? null,
  image_url: props.modelValue?.image_url ?? props.existingImageUrl ?? null,
  image_alt_text: props.modelValue?.image_alt_text ?? '',
  image_created_by: props.modelValue?.image_created_by ?? '',
  image_copyright: props.modelValue?.image_copyright ?? '',
  image_license_id: props.modelValue?.image_license_id ?? null,
  image_focus_x: props.modelValue?.image_focus_x ?? null,
  image_focus_y: props.modelValue?.image_focus_y ?? null
})

watch(() => props.modelValue, (nv) => {
  if (nv) local.value = { ...nv }
})

watch(local, (nv) => {
  // emit copy to avoid mutating parent's object reference directly
  emit('update:modelValue', { ...nv })
}, { deep: true })

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)

const saving = ref(false)

const fileInputClick = () => fileInput.value?.click()

function onFileSelected(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] ?? null
  if (!f) return
  local.value.file = f
  local.value.image_url = null
  createPreview(f)
}

function onDrop(e: DragEvent) {
  const f = e.dataTransfer?.files?.[0] ?? null
  if (!f) return
  local.value.file = f
  local.value.image_url = null
  createPreview(f)
}

function createPreview(f: File) {
  const url = URL.createObjectURL(f)
  previewUrl.value = url
}

if (props.existingImageUrl && !previewUrl.value && !local.value.file) {
  previewUrl.value = props.existingImageUrl
}

async function save() {
  if (!props.uploadUrl) return
  saving.value = true
  try {
    const fd = new FormData()
    if (local.value.file) fd.append('image', local.value.file)
    fd.append('alt_text', local.value.image_alt_text ?? '')
    fd.append('created_by', local.value.image_created_by ?? '')
    fd.append('copyright', local.value.image_copyright ?? '')
    if (local.value.image_license_id != null) fd.append('license_id', String(local.value.image_license_id))

    await apiFetch(props.uploadUrl, { method: 'POST', body: fd })

    emit('updated')
  } catch (err) {
    console.error(err)
  } finally {
    saving.value = false
  }
}

async function onRemove() {
  if (!props.deleteUrl) {
    // local only: clear fields
    local.value.file = null
    local.value.image_id = null
    local.value.image_url = null
    previewUrl.value = null
    emit('updated')
    return
  }
  try {
    await apiFetch(props.deleteUrl, { method: 'DELETE' })
    local.value.file = null
    local.value.image_id = null
    local.value.image_url = null
    previewUrl.value = null
    emit('updated')
  } catch (err) {
    console.error(err)
  }
}
</script>

<style scoped>
.preview-area { border: 1px dashed #ccc; padding: 1rem; text-align:center; }
.preview-img { max-width: 100%; max-height: 240px; display:block; margin: 0 auto 0.5rem; }
.meta { margin-top: 1rem; display:flex; gap:1rem; flex-wrap:wrap; }
.meta label { display:block; min-width: 180px; }
</style>