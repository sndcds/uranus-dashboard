<!--
  src/component/venu/UranusVenueTypeahead.vue

  2026-02-21, Roald
-->

<template>
  <div class="typeahead">
    <input
        type="text"
        v-model="query"
        @keydown="onKeydown"
        placeholder="Type a venue..."
        autocomplete="off"
    />

    <ul v-if="isOpen" class="popover">
      <li
          v-for="(venue, index) in results"
          :key="venue.id"
          :class="{ 'selected': index === selectedIndex }"
          @click="selectVenue(venue)"
          @mouseenter="selectedIndex = index"
      >
        {{ venue.name }}<span v-if="venue.city"> ({{ venue.city }})</span>
      </li>
    </ul>
  </div>

  id: {{ selectedVenue?.id }} / city: {{ selectedVenue?.city }}
</template>


<script setup lang="ts">
import { ref, watch } from 'vue'
import { apiBaseUrl } from '@/util/UranusUtils.ts'
import type { UranusVenueSelectItemInfo } from '@/domain/venue/UranusVenue.ts'


const props = defineProps<{
  selectedVenue: UranusVenueSelectItemInfo | null
}>()

const emit = defineEmits<{
  (e: 'update:selectedVenue', value: UranusVenueSelectItemInfo | null): void
}>()

const query = ref('')

watch(
    () => props.selectedVenue,
    (val) => {
      if (!val || typeof val !== 'object') {
        query.value = ''
        return
      }

      query.value = val.name ?? ''
    },
    { immediate: true }
)

const results = ref<UranusVenueSelectItemInfo[]>([])
const selectedIndex = ref(-1)
const isOpen = ref(false)

// Debounce helper (pure JS)
function debounce<T extends (...args: any[]) => void>(func: T, wait = 300) {
  let timeout: ReturnType<typeof setTimeout> | null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

async function fetchVenues(q: string) {
  if (!q) {
    results.value = []
    isOpen.value = false
    return
  }

  try {
    const apiPath = apiBaseUrl() + `/api/choosable-venues?name=${encodeURIComponent(q)}*`
    const res = await fetch(apiPath)
    const json = await res.json()
    results.value = json.data ?? []  // <-- extract the array
    isOpen.value = results.value.length > 0
    selectedIndex.value = -1
  } catch (err) {
    console.error(err)
    results.value = []
    isOpen.value = false
  }
}

const fetchVenuesDebounced = debounce(fetchVenues, 250)

watch(query, (val) => fetchVenuesDebounced(val))

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return

  if (e.key === 'ArrowDown') {
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
    e.preventDefault()
  } else if (e.key === 'ArrowUp') {
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
    e.preventDefault()
  } else if (e.key === 'Enter') {
    const venue = results.value[selectedIndex.value]
    if (venue) selectVenue(venue)
    e.preventDefault()
  } else if (e.key === 'Escape') {
    isOpen.value = false
  }
}

function selectVenue(venue: UranusVenueSelectItemInfo) {
  emit('update:selectedVenue', venue)
  query.value = venue.name
  isOpen.value = false
}
</script>


<style scoped>
.typeahead {
  position: relative;
  width: 400px;

  input {
    width: 100%;
    font-size: 1rem;
    padding: 6px;
  }
}

.popover {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  background: white;
  z-index: 100;
  padding: 0;
  margin: 0;
  list-style: none;
}

.popover li {
  padding: 0.5rem;
  cursor: pointer;
}

.popover li.selected {
  background-color: #f0f0f0;
}
</style>