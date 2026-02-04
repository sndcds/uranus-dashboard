<template>
  <div>
    <div v-for="(u, idx) in local" :key="idx" class="url-row">
      <input v-model="u.title" placeholder="Title" />
      <input v-model="u.url" placeholder="https://…" />
      <button @click="remove(idx)">Remove</button>
    </div>

    <button @click="add">Add URL</button>
    <button @click="save">Save</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { UranusEventLink } from '@/model/uranusEventModel.ts'

const props = defineProps<{ modelValue?: UranusEventLink[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: UranusEventLink[]): void; (e: 'updated'): void }>()
const local = ref<UranusEventLink[]>(props.modelValue ? props.modelValue.map(x => ({ ...x })) : [])

watch(() => props.modelValue, (nv) => { local.value = nv ? nv.map(x => ({ ...x })) : [] })
watch(local, (nv) => emit('update:modelValue', nv), { deep: true })

function add() {
  local.value.push({ id: null, title: '', url: '', urlType: 1 }) // 1 = Website
}
function remove(i: number) { local.value.splice(i, 1) }
function save() { emit('updated') }
</script>

<style scoped>
.url-row { display:flex; gap:.5rem; margin-bottom:.5rem; align-items:center; }
</style>