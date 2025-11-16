<template>
  <form @submit.prevent="handleSubmit" class="uranus-form">
    <label for="jsonInput">JSON Input:</label>
    <textarea
        id="jsonInput"
        v-model="jsonInput"
        rows="10"
        placeholder="Paste JSON here..."
        class="uranus-textarea"
    ></textarea>

    <button class="uranus-button" type="submit" :disabled="loading">
      {{ loading ? 'Sending...' : 'Send JSON' }}
    </button>

    <p v-if="error" class="feedback feedback--error">{{ error }}</p>

    <div v-if="response" class="feedback feedback--success">
      <p><strong>HTTP Status:</strong> {{ httpStatus }}</p>
      <p><strong>Response:</strong></p>
      <pre>{{ formattedResponse }}</pre>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { apiFetch, deepClean } from '@/api.ts'


const { apiPath } = defineProps<{
  apiPath: string
}>()

const httpStatus = ref<number | null>(null)
const jsonInput = ref<string>('')
const loading = ref(false)
const error = ref<string | null>(null)
const response = ref<any>(null) // store actual response object

const formattedResponse = computed(() => {
  return response.value ? JSON.stringify(response.value, null, 2) : ''
})

const handleSubmit = async () => {
  error.value = null
  response.value = null
  httpStatus.value = null

  let parsedJson: any
  try {
    parsedJson = JSON.parse(jsonInput.value)
  } catch (e) {
    error.value = 'Invalid JSON'
    return
  }

  loading.value = true
  try {
    const { status, data } = await apiFetch(apiPath, {
      method: 'PUT',
      body: JSON.stringify(deepClean(parsedJson)),
    })

    httpStatus.value = status
    response.value = data

    if (status < 200 || status >= 300) {
      error.value = `API returned error status ${status}`
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = 'Unknown error'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.uranus-textarea {
  width: 100%;
  height: 70vh;
  font-family: monospace;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid #ccc;
}

.feedback {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.9rem;
}

.feedback--error {
  background-color: #fee;
  color: #c00;
  border: 1px solid #fcc;
}

.feedback--success {
  background-color: #efe;
  color: #060;
  border: 1px solid #cfc;
}

pre {
  background: #f9f9f9;
  padding: 0.5rem;
  border-radius: 0.25rem;
  overflow-x: auto;
}
</style>