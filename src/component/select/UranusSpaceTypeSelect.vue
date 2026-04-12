<!--
  src/component/select/UranusSpaceTypeSelect.vue

  2026-02-14, Roald
-->

<template>
  <select
      :value="modelValue ?? '__null__'"
      class="uranus-admin-select"
      @change="onChange"
  >
    <option value="__null__">
      {{ t('unspecified_space_type') }}
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
import { useSpaceTypeLookupStore } from '@/store/spaceTypesLookupStore.ts'

type UiLang = 'de' | 'en' | 'da'

const props = withDefaults(defineProps<{
  modelValue: string | null
}>(), {
  modelValue: null
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const { locale, t } = useI18n({ useScope: 'global' })
const store = useSpaceTypeLookupStore()

onMounted(() => {
  store.initialize()
})

const localizedTypes = computed(() => {
  return store.getLocalizedTypes(locale.value as UiLang)
})

function onChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit(
      'update:modelValue',
      value === '__null__' ? null : value
  )
}
</script>