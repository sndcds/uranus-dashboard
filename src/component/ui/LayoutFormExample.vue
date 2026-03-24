<template>
  <form class="demo-form" @submit.prevent="submitForm">

    <!-- Event title with prefix icon -->
    <UranusInput
        id="event-title"
        v-model="form.title"
        label="Event Title"
        placeholder="Enter event title"
        required
        :state="titleState"
        :message="titleMessage"
        :prefix-icon="CalendarIcon"
    />

    <!-- City / Country -->
    <UranusInput
        id="city"
        v-model="form.city"
        label="City"
        placeholder="City"
        :state="cityState"
        :message="cityMessage"
    />

    <UranusInput
        id="country"
        v-model="form.country"
        label="Country"
        placeholder="Country"
    />

    <button type="submit">Submit</button>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import UranusInput from '@/component/ui/UranusInput.vue'
import { Calendar } from 'lucide-vue-next'

const CalendarIcon = Calendar

const form = reactive({
  title: '',
  city: '',
  country: ''
})

// Example validation states
const titleState = computed(() => form.title.length === 0 ? 'error' : 'success')
const titleMessage = computed(() => form.title.length === 0 ? 'Title is required' : 'Looks good!')

const cityState = computed(() => form.city.length === 0 ? 'error' : 'success')
const cityMessage = computed(() => form.city.length === 0 ? 'City is required' : 'Ok!')

function submitForm() {
  if (!form.title || !form.city) {
    alert('Please fill all required fields')
    return
  }
  alert(`Submitted: ${form.title}, ${form.city}, ${form.country}`)
}
</script>

<style scoped lang="scss">
.demo-form {
  display: grid;
  gap: 1rem;
  max-width: 500px;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #888;
  background: #f5f5f5;
  cursor: pointer;
}
</style>