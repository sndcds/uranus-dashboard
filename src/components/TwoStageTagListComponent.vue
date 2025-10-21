<template>
  <div class="p-4 max-w-xl mx-auto">
    <h2 class="text-xl font-semibold mb-3">Add Event Type + Genre</h2>

    <div class="flex gap-2 items-end mb-4">
      <!-- Event Type Selector -->
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
        <select v-model="selectedType" class="w-full border rounded-lg p-2">
          <option disabled value="">Select type...</option>
          <option v-for="type in eventTypes" :key="type.id" :value="type">
            {{ type.name }}
          </option>
        </select>
      </div>

      <!-- Genre Selector (optional) -->
      <div class="flex-1" v-if="selectedType && selectedType.hasGenres">
        <label class="block text-sm font-medium text-gray-700 mb-1">Genre</label>
        <select v-model="selectedGenre" class="w-full border rounded-lg p-2">
          <option disabled value="">Select genre...</option>
          <option v-for="genre in genres" :key="genre.id" :value="genre">
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

    <!-- Added Combinations List -->
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
import { ref } from 'vue'

// Mock data — replace with API data or props
const eventTypes = [
  { id: 1, name: 'Koncert', hasGenres: true },
  { id: 2, name: 'Theater', hasGenres: true },
  { id: 3, name: 'Workshop', hasGenres: false },
  { id: 4, name: 'Lecture', hasGenres: false },
]

const genres = [
  { id: 1, name: 'Jazz' },
  { id: 2, name: 'Rock' },
  { id: 3, name: 'Classical' },
  { id: 4, name: 'Electronic' },
]

const selectedType = ref('')
const selectedGenre = ref('')
const selectedList = ref([])

function addCombination() {
  if (!selectedType.value) return

  // Prevent duplicates (type+genre)
  const exists = selectedList.value.some(
      (item) =>
          item.type.id === selectedType.value.id &&
          (item.genre?.id || null) === (selectedGenre.value?.id || null)
  )
  if (exists) return

  selectedList.value.push({
    type: selectedType.value,
    genre: selectedType.value.hasGenres ? selectedGenre.value || null : null,
  })

  // Reset selections
  selectedGenre.value = ''
}

function removeCombination(index) {
  selectedList.value.splice(index, 1)
}
</script>