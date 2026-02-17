<!--
  src/component/select/UranusLicenseSelect.vue

  2026-02-15, Roald
-->

<template>
  <select
      :value="modelValue"
      class="uranus-admin-select"
      @change="onChange"
  >
    <option :value="null">
      {{ t('select_unspecified') }}
    </option>

    <option
        v-for="license in localizedLicenses"
        :key="license.key"
        :value="license.key"
    >
      {{ license.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLicenseLookup } from '@/store/UranusLicenseLookup.ts'

type UiLang = 'de' | 'en' | 'da'

const props = defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const { locale, t } = useI18n({ useScope: 'global' })
const store = useLicenseLookup()

// Ensure store is initialized
onMounted(() => {
  store.initialize()
})

// Compute localized licenses for the dropdown
const localizedLicenses = computed(() => {
  const lang = locale.value as UiLang
  const map = store.data[lang] ?? {}

  return Object.entries(map).map(([key, entry]) => ({
    key,
    label: entry.label,
    description: entry.description
  }))
})

// Emit selected value
function onChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('update:modelValue', value || null)
}
</script>

<style scoped lang="scss">
.uranus-admin-select {
  flex: 0 0 auto;
  width: 100%;
}
</style>