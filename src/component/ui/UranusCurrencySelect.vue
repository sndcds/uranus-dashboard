<!-- src/component/ui/UranusCurrencySelect.vue -->
<template>
  <label>
    <span>{{ label }}</span>
    <select v-model="internalValue">
      <option value="" disabled>{{ placeholder }}</option>
      <option v-for="(name, id) in currencies" :key="id" :value="id">
        {{ name }}
      </option>
    </select>
  </label>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCurrencyLookupStore } from '@/store/uranusCurrencyLookup.ts'

const props = defineProps<{
  modelValue: string | null
  language?: string
  placeholder?: string
  label?: string
}>()


// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

// i18n
const { locale } = useI18n({ useScope: 'global' })

// Pinia store
const currencyStore = useCurrencyLookupStore()

// Determine which language to use: prop > i18n locale
const currentLang = computed(() => props.language || locale.value)

// Load currencies for this language
onMounted(async () => {
  await currencyStore.load([currentLang.value])
})

// Watch locale changes if no explicit language prop
watch(currentLang, async (lang) => {
  await currencyStore.load([lang])
})

// Computed currencies for dropdown
const currencies = computed(() => currencyStore.data[currentLang.value] ?? {})

// Internal v-model
const internalValue = computed({
  get: () => props.modelValue,
  set: (val: string | null) => emit('update:modelValue', val)
})
</script>

<style scoped lang="scss">
label {
  display: flex;
  flex-direction: column;
  font-weight: 500;
  gap: 0.25rem;

  select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    cursor: pointer;
  }
}
</style>