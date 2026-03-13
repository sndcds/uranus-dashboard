<template>
  <div class="typeahead" ref="inputWrapper">
    <input
        ref="inputRef"
        type="text"
        class="uranus-input"
        v-model="query"
        @keydown="onKeydown"
        placeholder="Name der Spielstätte ..."
        autocomplete="off"
    />

    <!-- Teleport the popover outside clipped containers -->
    <teleport to="body">
      <ul v-if="isOpen" class="popover" :style="popoverStyle">
        <li
            v-for="(venue, index) in results"
            :key="venue.id"
            :class="{ selected: index === selectedIndex }"
            @click="selectVenue(venue)"
            @mouseenter="selectedIndex = index"
        >
          {{ venue.name }}<span v-if="venue.city"> ({{ venue.city }})</span>
        </li>
      </ul>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { apiBaseUrl } from '@/util/UranusUtils.ts'
import type { UranusVenueSelectItemInfo } from '@/domain/venue/UranusVenue.ts'

const props = defineProps<{
  selectedVenue: UranusVenueSelectItemInfo | null
}>()

const emit = defineEmits<{
  (e: 'update:selectedVenue', value: UranusVenueSelectItemInfo | null): void
}>()

const query = ref('')
const results = ref<UranusVenueSelectItemInfo[]>([])
const selectedIndex = ref(-1)
const isOpen = ref(false)
const ignoreQueryWatch = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const popoverStyle = computed(() => {
  if (!inputRef.value) {
    return {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '0px',
      zIndex: 1000
    }
  }
  const rect = inputRef.value.getBoundingClientRect()
  return {
    position: 'absolute',
    top: `${rect.bottom + window.scrollY}px`,
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`,
    zIndex: 1000
  }
})

watch(query, (val) => {
  if (ignoreQueryWatch.value) return
  fetchVenuesDebounced(val)
})

// Debounce helper
function debounce<T extends (...args: any[]) => void>(func: T, wait = 300) {
  let timeout: ReturnType<typeof setTimeout> | null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Fetch venues from API
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
    results.value = json.data ?? []
    isOpen.value = results.value.length > 0
    selectedIndex.value = -1
  } catch (err) {
    console.error(err)
    results.value = []
    isOpen.value = false
  }
}

const fetchVenuesDebounced = debounce(fetchVenues, 250)

// Keyboard navigation
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
  ignoreQueryWatch.value = true
  query.value = venue.name
  isOpen.value = false
  setTimeout(() => {
    ignoreQueryWatch.value = false
  }, 0) // or nextTick
}
</script>

<style scoped>
.typeahead {
  position: relative;
  width: 100%;

  input {
    width: 100%;
    font-size: 1rem;
    padding: 6px;
  }
}

.popover {
  min-height: 100px;
  max-height: 400px;
  overflow-y: auto;
  border: 0px solid #ccc;
  background: white;
  z-index: 1000;
  padding: 0;
  margin: 0;
  list-style: none;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.popover li {
  padding: 0.5rem;
  cursor: pointer;
  white-space: nowrap;
}

.popover li.selected {
  color: #fff;
  background-color: #333;
}
</style>