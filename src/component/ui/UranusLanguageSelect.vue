<template>
  <div class="language-select">
    <label :for="id">{{ label }}</label>
    <select :id="id" v-model="modelValue">
      <option :value="''">{{ t('choose_language') }}</option>
      <option
          v-for="(name, langId) in languageOptions"
          :key="langId"
          :value="langId"
      >
        {{ name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLanguageLookupStore } from '@/store/uranusLanguageLookupStore.ts'

const { t } = useI18n({ useScope: 'global' })

interface Props {
  modelValue: string
  label?: string
  languages?: string[] // UI languages to load: ['de', 'en', 'da']
  id?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const { locale } = useI18n({ useScope: 'global' })
const langStore = useLanguageLookupStore()

// Load languages on mount
onMounted(async () => {
  await langStore.load(props.languages ?? ['de', 'en', 'da'])
})

const languageOptions = computed(() => {
  return langStore.data[locale.value] ?? {}
})

// v-model binding
const modelValue = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val)
})
</script>

<style scoped>
.language-select {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  label {
    font-weight: 500;
    color: #555;
  }

  select {
    width: min-content;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: 1rem;
  }
}
</style>
