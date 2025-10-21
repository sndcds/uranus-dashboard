<template>
  <select class="uranus-select" v-model="organizerId"  @change="onChange">
    <option :value="null" disabled>Select organizer...</option>
    <option v-for="org in organizers" :key="org.organizer_id" :value="org.organizer_id">
      {{ org.organizer_name }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/store/appStore'
import { apiFetch } from '@/api'

interface Organizer {
  organizer_id: number
  organizer_name: string
}

const organizers = ref<Organizer[]>([])
const selectedId = ref<number | null>(null)

const appStore = useAppStore()

// Make a reactive reference to organizerId
const organizerId = computed({
  get: () => appStore.organizerId,
  set: (val: number | null) => appStore.setOrganizerId(val),
})

async function fetchOrganizers() {
  try {
    const { data } = await apiFetch<Organizer[]>('/api/admin/choosable-organizers')
    organizers.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Failed to fetch organizers', err)
  }
}

function onChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value ? Number(target.value) : null
  appStore.setOrganizerId(value)
}

onMounted(fetchOrganizers)
</script>

<style lang="scss">
.uranus-select {}
.uranus-select option {}
</style>