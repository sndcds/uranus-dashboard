<!--
  UranusLicenseSelect.vue
-->
<template>
  <UranusFieldLabel
      id="license-select"
      :label="t('license')">
    <select
        :class="className"
        :disabled="isLoading"
        @change="onSelect"
        :value="selectedLicense"
    >
      <option value="">
        {{ t('select_unspecified') }}
      </option>

      <option
          v-for="option in licenseOptions"
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
  license: number | null
  className?: string
}>()

const emit = defineEmits<{
  (e: 'update:license', value: number | null): void
}>()

// State
const isLoading = ref(false)
const selectedLicense = ref<number | null>(props.license ?? null)
const options = ref<{ key: number; label: string }[]>([])

// Watch parent updates
watch(
    () => props.license,
    (newVal) => {
      selectedLicense.value = newVal ?? null
    }
)

// Computed for dropdown options
const licenseOptions = computed(() => options.value)

// Emit when selection changes
function onSelect(event: Event) {
  const val = (event.target as HTMLSelectElement).value

  if (val === "" || val === "null") {
    selectedLicense.value = null
    emit('update:license', null)
    return
  }

  const num = Number(val)
  selectedLicense.value = num
  emit('update:license', num)
}

// Fetch licenses from API
async function fetchOptions() {
  isLoading.value = true
  try {
    const { data } = await apiFetch(`/api/choosable-licenses?lang=${locale.value}`)
    options.value = (Array.isArray(data) ? data : []).map((item: any) => ({
      key: Number(item.id ?? ''),
      label: item.name ?? item.id
    }))

    // Only select if the value exists in options
    const initial = props.license ?? null
    if (options.value.some(o => o.key === initial)) {
      selectedLicense.value = initial
    } else {
      selectedLicense.value = null
    }
  } catch (err) {
    console.error("Failed to fetch licences:", err)
    options.value = []
    selectedLicense.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchOptions)
</script>

<style scoped lang="scss">
._select {
  flex: 0 0 auto;  /* don’t grow or shrink */
  width: 100%;
}
</style>