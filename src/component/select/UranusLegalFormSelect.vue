<!--
  src/component/select/UranusLegalFormSelect.vue

  2026-02-15, Roald
-->

<template>
  <select
      :value="modelValue"
      class="uranus-admin-select"
      @change="onChange"
  >
    <option :value="null">
      {{ t('unspecified_legal_form') }}
    </option>

    <option
        v-for="item in localizedLegalForms"
        :key="item.key"
        :value="item.key"
    >
      {{ item.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLegalFormLookupStore } from '@/store/UranusLegalFormLookup.ts'

type UiLang = 'de' | 'en' | 'da'

const props = defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const { locale, t } = useI18n({ useScope: 'global' })
const store = useLegalFormLookupStore()

onMounted(() => {
  store.initialize()
})

const localizedLegalForms = computed(() => {
  const lang = locale.value as UiLang
  const map = store.data[lang] ?? {}

  return Object.entries(map).map(([key, entry]) => ({
    key,
    label: entry.label,
    description: entry.description
  }))
})

function onChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('update:modelValue', value || null)
}
</script>