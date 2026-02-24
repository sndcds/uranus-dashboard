<!--
  src/component/event/ui/UranusEventReleaseStatusSelect.vue

  2026-02-24, Roald
-->

<template>
  <select v-model="selected" class="uranus-select-event-release-status">
    <option
        v-for="opt in options"
        :key="opt.key"
        :value="opt.key"
    >
      {{ opt.name }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useEventReleaseStatusStore } from '@/store/uranusEventReleaseStatusStore.ts'
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n({ useScope: 'global' })

// Props: v-model binding for selected key and optional locale
interface Props {
  modelValue?: string | null
  locale?: string
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>();

const selected = ref(props.modelValue ?? '')

// Pinia store
const store = useEventReleaseStatusStore()
const options = ref<{ key: string; name: string }[]>([])

// Load data on mount
onMounted(async () => {
  /*
  if (!store.loaded) {
    await store.load(['en', 'de', 'da']); // TODO: Get from config!
  }
   */
  updateOptions()
});

// Update options whenever locale changes or store updates
const updateOptions = () => {
  options.value = store.options(locale.value)
  console.log(store.options(locale.value))
};

// Watch for prop changes
watch(() => props.modelValue, (val) => {
  selected.value = val ?? ''
});
watch(selected, (val) => {
  emit("update:modelValue", val)
})
watch(() => props.locale, (val) => {
  if (val) {
    locale.value = val
    updateOptions()
  }
})
</script>

<style scoped>
.uranus-select-event-release-status {
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  border: 1px solid var(--uranus-color);
  background-color: var(--uranus-bg);
  color: var(--uranus-color);
  font-size: 1rem;
}
.uranus-select-event-release-status option {
  padding: 0.2rem 0.4rem;
}
</style>