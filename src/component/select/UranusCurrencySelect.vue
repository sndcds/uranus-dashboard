<!--
  src/component/select/UranusCurrencySelect.vue

  2026-02-08, Roald
-->

<template>
  <UranusFieldLabel id="currency-select" :label="t('currency')">
    <select
        v-model="selectedCode"
        class="_language-select"
        @change="onSelect"
        :disabled="isLoading"
    >
      <option :value="null" disabled>{{ t('select_placeholder') }}</option>

      <option
          v-for="option in currencyOptions"
          :key="option.key"
          :value="option.key"
      >
        {{ option.label }}
      </option>
    </select>
  </UranusFieldLabel>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue"
import { useI18n } from "vue-i18n"
import { apiFetch } from "@/api.ts"
import UranusFieldLabel from "@/component/ui/UranusFieldLabel.vue"

const { t, locale } = useI18n({ useScope: "global" })

// Props + v-model
const props = defineProps<{
  modelValue: string | null
}>()
const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void
}>()

// State
const isLoading = ref(false)
const selectedCode = ref<string | null>(props.modelValue ?? null)
const options = ref<{ key: string; label: string }[]>([])

// Watch parent updates
watch(
    () => props.modelValue,
    (newVal) => {
      selectedCode.value = newVal ?? null
    }
)

// Computed for dropdown options
const currencyOptions = computed(() => options.value)

// Emit when selection changes
function onSelect() {
  emit("update:modelValue", selectedCode.value)
}

// Fetch currencies from API
async function fetchOptions() {
  isLoading.value = true
  try {
    const { data } = await apiFetch(`/api/choosable-currencies?lang=${locale.value}`)
    options.value = (Array.isArray(data) ? data : []).map((item: any) => ({
      key: String(item.id ?? ''),
      label: item.name ?? item.id
    }))

    // Only select if the value exists in options
    const initial = String(props.modelValue ?? '')
    if (options.value.some(o => o.key === initial)) {
      selectedCode.value = initial
    } else {
      selectedCode.value = null
    }
  } catch (err) {
    console.error("Failed to fetch currencies:", err)
    options.value = []
    selectedCode.value = null
  } finally {
    isLoading.value = false
  }
}

// Fetch on mount
onMounted(fetchOptions)
</script>

<style scoped lang="scss">
._language-select {
  flex: 3;
  border-width: 2px;
  font-size: 1em;
  padding: 0.4em 0.6em;
  max-width: 250px;
}
</style>