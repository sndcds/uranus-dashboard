<template>
  <div class="p-4 max-w-xl mx-auto">
    <h2 class="text-xl font-semibold mb-3">Add Event Type + Genre</h2>

    <!-- Selectors -->
    <div class="flex gap-2 items-end mb-4">
      <!-- Event Type -->
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
        <select
            v-model="selectedType"
            @change="onTypeChange"
            class="w-full border rounded-lg p-2"
        >
          <option disabled value="">Select type...</option>
          <option
              v-for="type in eventTypes || []"
              :key="type.type_id"
              :value="type"
          >
            {{ type.name }}
          </option>
        </select>
      </div>

      <!-- Genre (only if available) -->
      <div class="flex-1" v-if="selectedType && (genres?.length || 0) > 0">
        <label class="block text-sm font-medium text-gray-700 mb-1">Genre</label>
        <select
            v-model="selectedGenre"
            class="w-full border rounded-lg p-2"
        >
          <option disabled value="">Select genre...</option>
          <option
              v-for="genre in genres || []"
              :key="genre.type_id"
              :value="genre"
          >
            {{ genre.name }}
          </option>
        </select>
      </div>

      <!-- Add Button -->
      <button
          @click="addCombination"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          :disabled="!selectedType"
      >
        Add
      </button>
    </div>

    <!-- Selected combinations -->
    <div>
      <h3 class="text-lg font-medium mb-2">Added combinations</h3>
      <ul v-if="selectedList.length" class="divide-y divide-gray-200 border rounded-lg">
        <li
            v-for="(item, index) in selectedList"
            :key="index"
            class="flex justify-between items-center px-3 py-2"
        >
          <span>
            <strong>{{ item.type.name }}</strong>
            <span v-if="item.genre"> — {{ item.genre.name }}</span>
          </span>
          <button
              @click="removeCombination(index)"
              class="text-red-600 hover:text-red-800 text-sm"
          >
            Remove
          </button>
        </li>
      </ul>
      <p v-else class="text-gray-500 text-sm">No combinations added yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiFetch } from '@/api'

// --- Reactive state ---
const eventTypes = ref([])     // always array
const genres = ref([])         // always array
const selectedType = ref(null) // use null instead of ''
const selectedGenre = ref(null)
const selectedList = ref([])

// --- Fetch Functions ---
async function fetchStage1() {
  try {
    const { status, data } = await apiFetch('/api/choosable-event-types')
    if (status !== 200) throw new Error('Failed to fetch event types')
    eventTypes.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('fetchStage1 error:', err)
    eventTypes.value = []
  }
}

async function fetchStage2(stage1Id) {
  try {
    const { status, data } = await apiFetch(`/api/choosable-event-genres/event-type/${stage1Id}`)
    if (status !== 200) throw new Error('Failed to fetch genres')
    genres.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('fetchStage2 error:', err)
    genres.value = []
  }
}

// --- Handlers ---
async function onTypeChange() {
  selectedGenre.value = null
  genres.value = []
  if (selectedType.value?.type_id) {
    await fetchStage2(selectedType.value.type_id)
  }
}

function addCombination() {
  if (!selectedType.value) return

  const exists = selectedList.value.some(
      item =>
          item.type.type_id === selectedType.value.type_id &&
          (item.genre?.type_id || null) === (selectedGenre.value?.type_id || null)
  )
  if (exists) return

  selectedList.value.push({
    type: selectedType.value,
    genre: (genres.value.length > 0 ? selectedGenre.value : null),
  })

  selectedGenre.value = null
}

function removeCombination(index) {
  selectedList.value.splice(index, 1)
}

// --- On component mount ---
onMounted(fetchStage1)
</script>