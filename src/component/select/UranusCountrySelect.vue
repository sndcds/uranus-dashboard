<!--
  src/component/select/UranusCountrySelect.vue

  2026-02-08, Roald
-->

<template>
  <select
      v-model="countryModel"
      :id="countrySelectId"
      :disabled="loading || countryStore.loading"
      class="uranus-admin-select"
      :aria-required="true"
      :aria-invalid="props.errorMessage ? 'true' : 'false'">
    <option value="" disabled>{{ placeholder }}</option>
    <option v-for="country in countries" :key="country.code" :value="country.code">
      {{ country.name }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCountryLookupStore } from '@/store/uranusCountryLookup.ts'

// --------------------
// Props / v-model
// --------------------
const props = defineProps<{
  modelValue?: string | null
  label?: string
  placeholder?: string
  errorMessage?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const countryModel = ref(props.modelValue ?? '')
// internal → parent
watch(countryModel, val => {
  emit('update:modelValue', val)
})

// parent → internal
watch(
    () => props.modelValue,
    value => {
      if (value !== countryModel.value) {
        countryModel.value = value ?? ''
      }
    }
)

// --------------------
// IDs & i18n
// --------------------
const baseId = useId()
const countrySelectId = `${baseId}-country`

const { t, locale } = useI18n({ useScope: 'global' })
const placeholder = computed(() => props.placeholder ?? t('organization_country_placeholder') ?? 'Select country')

// --------------------
// Countries via store
// --------------------
const countryStore = useCountryLookupStore()

// Reactive list for current locale
const countries = computed(() => {
  return Object.entries(countryStore.data[locale.value] ?? {}).map(([code, name]) => ({
    code,
    name
  }))
})

// Loading state combines prop + store
const loading = ref(false)

// Load countries on mount (for multiple UI languages)
onMounted(async () => {
  if (!countryStore.loaded) {
    await countryStore.load(['de', 'da', 'en'])
  }
})
</script>