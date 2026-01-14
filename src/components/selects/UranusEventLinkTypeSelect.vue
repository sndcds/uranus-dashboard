<template>
  <UranusFieldLabel :label="t('event_url_type')" id="">
    <select
        v-model="selectedId"
        class="_uranus-select"
        @change="onSelect"
        :disabled="isLoading"
    >
      <option :value="null" disabled>{{ t('select_placeholder') }}</option>
      <option v-for="option in urlTypeOptions" :key="option.key" :value="Number(option.key)">
        {{ option.label }}
      </option>
    </select>
  </UranusFieldLabel>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue"
import { useI18n } from "vue-i18n"
import { apiFetch } from "@/api.ts"
import UranusFieldLabel from "@/components/ui/UranusFieldLabel.vue"
import { UranusEventUrl } from '@/models/UranusEventModel.ts'

// Props + v-model
const props = defineProps<{ modelValue: number | null }>()
const emit = defineEmits<{ (e: "update:modelValue", value: number | null): void }>()

const { t, locale } = useI18n({ useScope: "global" })

const isLoading = ref(false)
const options = ref<{ key: number; label: string }[]>([])
const selectedId = ref<number | null>(props.modelValue)

// Dropdown options
const urlTypeOptions = computed(() => options.value)

// Watch modelValue & options to preselect
watch([() => options.value, () => props.modelValue], () => {
  selectedId.value = props.modelValue
}, { immediate: true })


// Emit new value when select changes
function onSelect() {
  emit("update:modelValue", selectedId.value)
}

// Fetch options from API
async function fetchOptions() {
  isLoading.value = true
  try {
    const { data } = await apiFetch(`/api/choosable-url-types/event?lang=${locale.value}`)
    options.value = (Array.isArray(data) ? data : []).map(item => ({
      key: item.id ?? 0,
      label: item.name ?? ""
    }))
    // Ensure selectedId is valid
    if (props.modelValue !== null && !options.value.find(opt => opt.key === props.modelValue)) {
      selectedId.value = null
    }
  } catch (err) {
    console.error("Failed to fetch URL types:", err)
    options.value = []
    selectedId.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchOptions)
</script>

<style scoped lang="scss">
._uranus-select {
  flex: 3;
  border-width: 2px;
  font-size: 1em;
  padding: 0.4rem 0.6rem;
  max-width: 250px;
}
</style>