<!--
  src/component/select/UranusLinkTypeSelect.vue

  2026-02-14, Roald
-->

<template>
  <UranusFieldLabel :label="t('event_link_type')" id="">
    <select
        v-model="selectedId"
        class="uranus-admin-select"
        @change="onSelect"
        :disabled="store.loading"
    >
      <option :value="null" disabled>{{ t('select_placeholder') }}</option>
      <option
          v-for="option in linkTypeOptions"
          :key="option.key"
          :value="option.key"
      >
        {{ option.label }}
      </option>
    </select>
  </UranusFieldLabel>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { useLinkTypeLookupStore } from "@/store/UranusLinkTypeLookup.ts"
import UranusFieldLabel from "@/component/ui/UranusFieldLabel.vue"

// Props + v-model
const props = defineProps<{ modelValue: string | null }>()
const emit = defineEmits<{ (e: "update:modelValue", value: string | null): void }>()

const { t, locale } = useI18n({ useScope: "global" })
const store = useLinkTypeLookupStore()

const selectedId = ref<string | null>(props.modelValue)

// Compute dropdown options from store for current language
const linkTypeOptions = computed(() => {
  const lang = locale.value
  const map = store.data[lang] ?? {}
  return Object.entries(map).map(([key, name]) => ({ key, label: name }))
})

// Watch for prop changes or language/options changes
watch(
    [() => props.modelValue, linkTypeOptions, () => locale.value],
    () => {
      // Reset selectedId if modelValue is not in current options
      if (props.modelValue && !linkTypeOptions.value.find(opt => opt.key === props.modelValue)) {
        selectedId.value = null
      } else {
        selectedId.value = props.modelValue
      }
    },
    { immediate: true }
)

// Emit new value when select changes
function onSelect() {
  emit("update:modelValue", selectedId.value)
}

// Load store on mount
onMounted(async () => {
  if (!store.loaded && !store.loading) {
    await store.load() // loads all supported languages
  }
})
</script>