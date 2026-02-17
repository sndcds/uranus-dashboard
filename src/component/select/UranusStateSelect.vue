<!--
  src/component/select/UranusStateSelect.vue

  2026-02-08, Roald
-->

<template>
  <select
      v-model="stateModel"
      :id="stateSelectId"
      :disabled="loading || !countryCode"
      class="uranus-admin-select"
      :aria-required="required"
      :aria-invalid="errorMessage ? 'true' : 'false'"
  >
    <option value="" disabled>{{ placeholder }}</option>
    <option v-for="state in states" :key="state.code" :value="state.code">
      {{ state.name }}
    </option>
  </select>
</template>


<script setup lang="ts">
import { ref, computed, watch, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import type { UranusApiResponse } from '@/model/uranusApiResponse.ts'
import { type UranusStateDTO } from '@/api/dto/UranusCountryDTO.ts'

// Props / v-model

const props = defineProps<{
  modelValue?: string | null
  countryCode?: string | null
  label?: string
  placeholder?: string
  errorMessage?: string
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const stateModel = ref<string>('')

watch(
    () => props.modelValue,
    val => {
      stateModel.value = val ?? ''
    },
    { immediate: true }
)

// internal → parent
watch(stateModel, val => {
  emit('update:modelValue', val || null)
})

// IDs & i18n

const baseId = useId()
const stateSelectId = `${baseId}-state`

const { t, te } = useI18n({ useScope: 'global' })

const placeholder = computed(() =>
    props.placeholder ??
    (te('organization_state_placeholder')
        ? t('organization_state_placeholder')
        : 'Select state')
)

// State loading

const states = ref<{ code: string; name: string }[]>([])
const loading = ref(false)

const loadStates = async (countryCode: string) => {
  const trimmed = countryCode.trim()
  if (!trimmed) {
    states.value = []
    stateModel.value = ''
    return
  }

  loading.value = true
  try {
    const res = await apiFetch<UranusApiResponse<UranusStateDTO[]>>(
        `/api/choosable-states?country-code=${encodeURIComponent(trimmed)}`
    )

    const list = res.data?.data ?? []

    states.value = list
        .map(item => {
          const code = item.state_code.trim()
          const name = (item.state_name ?? code).trim()
          return { code, name }
        })
        .filter(s => s.code)

    // Ensure prefilled value exists
    if (
        stateModel.value &&
        !states.value.some(s => s.code === stateModel.value)
    ) {
      stateModel.value = ''
    }
  } catch (err) {
    console.error('Failed to load states', err)
    states.value = []
  } finally {
    loading.value = false
  }
}

// React to country changes

watch(
    () => props.countryCode,
    (code, prev) => {
      if (!code) {
        states.value = []
        stateModel.value = ''
        return
      }

      if (prev && prev !== code) {
        stateModel.value = ''
      }

      loadStates(code)
    },
    { immediate: true }
)
</script>
