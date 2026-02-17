<!--
  src/component/select/UranusVenueTypeSelect.vue

  2026-02-14, Roald
-->

<template>
  <select
      :value="modelValue"
      class="uranus-admin-select"
      @change="onChange"
  >
    <option :value="null">
      {{ t('unsepcified_venue_type') }}
    </option>

    <option
        v-for="type in localizedTypes"
        :key="type.key"
        :value="type.key"
    >
      {{ type.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVenueTypeLookupStore } from '@/store/UranusVenueTypesLookup.ts'

type UiLang = 'de' | 'en' | 'da'

const props = defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const { locale, t } = useI18n({ useScope: 'global' })
const store = useVenueTypeLookupStore()

onMounted(() => {
  store.initialize()
})

const localizedTypes = computed(() => {
  const lang = locale.value as UiLang
  const map = store.data[lang] ?? {}

  return Object.entries(map).map(([key, entry]) => ({
    key,
    label: entry.label,          // use the new structure
    description: entry.description
  }))
})

function onChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('update:modelValue', value || null)
}
</script>