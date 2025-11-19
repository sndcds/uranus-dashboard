<template>
  <UranusFieldLabel :id="countrySelectId" :label="countryLabel" :required="true" :error="countryError">
    <select v-model="countryModel" :id="countrySelectId" :disabled="countriesLoading" class="uranus-select"
      :aria-required="true" :aria-invalid="countryError ? 'true' : 'false'">
      <option value="" disabled>{{ countryPlaceholder }}</option>
      <option v-for="country in countries" :key="country.code" :value="country.code">
        {{ country.name }}
      </option>
    </select>
  </UranusFieldLabel>

  <!-- State -->
  <UranusFieldLabel :id="stateSelectId" :label="stateLabel" :required="true" :error="stateError">
    <select v-model="stateModel" :id="stateSelectId" :disabled="statesLoading || !countryModel" class="uranus-select"
      :aria-required="true" :aria-invalid="stateError ? 'true' : 'false'">
      <option value="" disabled>{{ statePlaceholder }}</option>
      <option v-for="state in states" :key="state.code" :value="state.code">
        {{ state.name }}
      </option>
    </select>
  </UranusFieldLabel>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import UranusFieldLabel from "@/components/uranus/UranusFieldLabel.vue"

// Models
const countryModel = defineModel<string>('countryCode', { default: '' })
const stateModel = defineModel<string>('stateCode', { default: '' })

// Translation
const { t, te, locale } = useI18n()

// Data
const countries = ref<{ code: string; name: string }[]>([])
const states = ref<{ code: string; name: string }[]>([])
const countriesLoading = ref(false)
const statesLoading = ref(false)
let pendingStateCountry: string | null = null
let pendingCountryReload = false

// IDs (used internally for select elements)
const baseFieldId = useId()
const countrySelectId = `${baseFieldId}-country`
const stateSelectId = `${baseFieldId}-state`

// Labels and placeholders
const countryLabel = computed(() => t('organizer_country_code'))
const stateLabel = computed(() => t('organizer_state_code'))
const countryPlaceholder = computed(() =>
  te('organizer_country_placeholder') ? t('organizer_country_placeholder') : 'Select country'
)
const statePlaceholder = computed(() =>
  te('organizer_state_placeholder') ? t('organizer_state_placeholder') : 'Select state'
)

// Optional error messages
const countryError = ref('')
const stateError = ref('')

// Ensure country/state exists in the list (for prefilled values)
const ensureCountryOption = (code: string) => {
  const trimmed = code.trim()
  if (!trimmed.length) return
  if (!countries.value.some(c => c.code === trimmed)) {
    countries.value.push({ code: trimmed, name: trimmed })
  }
}

const ensureStateOption = (code: string) => {
  const trimmed = code.trim()
  if (!trimmed.length) return
  if (!states.value.some(s => s.code === trimmed)) {
    states.value.push({ code: trimmed, name: trimmed })
  }
}

// Load countries
const loadCountries = async () => {
  if (countriesLoading.value) {
    pendingCountryReload = true
    return
  }

  countriesLoading.value = true
  pendingCountryReload = false
  try {
    const { data } = await apiFetch<{ country_code: string; country_name?: string | null }[]>(
      `/api/choosable-countries?lang=${locale.value}`
    )
    countries.value = Array.isArray(data)
      ? data
        .map(item => {
          const code = (item.country_code ?? '').trim()
          const name = (item.country_name ?? code).trim()
          return code ? { code, name } : null
        })
        .filter((v): v is { code: string; name: string } => !!v)
      : []
  } catch (err) {
    countries.value = []
    console.error('Failed to load countries', err)
  } finally {
    countriesLoading.value = false
    if (pendingCountryReload) {
      pendingCountryReload = false
      await loadCountries()
      return
    }
    ensureCountryOption(countryModel.value)
  }
}

// Load states for a given country
const loadStates = async (countryCode: string) => {
  const trimmedCountry = countryCode.trim()
  if (!trimmedCountry.length) {
    states.value = []
    pendingStateCountry = null
    return
  }

  if (statesLoading.value) {
    pendingStateCountry = trimmedCountry
    return
  }

  statesLoading.value = true
  try {
    const { data } = await apiFetch<{ state_code: string; state_name?: string | null }[]>(
      `/api/choosable-states?country-code=${encodeURIComponent(trimmedCountry)}`
    )
    states.value = Array.isArray(data)
      ? data
        .map(item => {
          const code = (item.state_code ?? '').trim()
          const name = (item.state_name ?? code).trim()
          return code ? { code, name } : null
        })
        .filter((v): v is { code: string; name: string } => !!v)
      : []
  } catch (err) {
    states.value = []
    console.error('Failed to load states', err)
  } finally {
    statesLoading.value = false
    if (pendingStateCountry && pendingStateCountry !== trimmedCountry) {
      const next = pendingStateCountry
      pendingStateCountry = null
      await loadStates(next)
    } else {
      pendingStateCountry = null
    }
    ensureStateOption(stateModel.value)
    if (stateModel.value && !states.value.some(s => s.code === stateModel.value.trim())) {
      stateModel.value = ''
    }
  }
}

// Watchers
watch(
  () => countryModel.value,
  (code, previous) => {
    const trimmed = code.trim()
    if (!trimmed.length) {
      states.value = []
      if (stateModel.value) stateModel.value = ''
      pendingStateCountry = null
      return
    }

    ensureCountryOption(trimmed)

    const previousTrimmed = (previous ?? '').trim()
    if (previousTrimmed && previousTrimmed !== trimmed) stateModel.value = ''

    loadStates(trimmed)
  },
  { immediate: true }
)

watch(
  () => stateModel.value,
  code => {
    if (!code.trim().length) return
    ensureStateOption(code)
  }
)

watch(
  () => locale.value,
  () => {
    loadCountries()
    if (countryModel.value.trim().length) loadStates(countryModel.value)
  }
)

// Initial load
onMounted(() => {
  loadCountries()
})
</script>

<style scoped lang="scss"></style>
