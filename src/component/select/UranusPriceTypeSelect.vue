<!--
  src/component/select/UranusPriceTypeSelect.vue

  2026-02-12, Roald
-->

<template>
  <UranusFieldLabel id="price-type-select" :label="t('price_types')">
    <select
        v-model="selectedCode"
        class="_language-select"
        @change="onSelect"
        :disabled="isLoading"
    >
      <option
          v-for="option in priceTypeOptions"
          :key="option.key"
          :value="option.key"
      >
        {{ option.label }}
      </option>
    </select>
  </UranusFieldLabel>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { apiFetch } from "@/api.ts";
import UranusFieldLabel from "@/component/ui/UranusFieldLabel.vue";

const { t, locale } = useI18n({ useScope: "global" });

// Props + v-model
const props = defineProps<{
  modelValue: string | number | null;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | null): void;
}>();

// State
const isLoading = ref<boolean>(false);

// Normalize null to "0"
const selectedCode = ref<string | number>(props.modelValue ?? 0);

// Watch parent updates
watch(
    () => props.modelValue,
    (newVal) => {
      selectedCode.value = newVal ?? 0;
    }
);

// Computed for dropdown options
const priceTypeOptions = computed(() => options.value);
const options = ref<{ key: string | number; label: string }[]>([]);

// Emit immediately when selection changes
function onSelect() {
  const val = selectedCode.value;
  emit("update:modelValue", val !== null ? Number(val) : null);
}

// Fetch options from API
async function fetchOptions() {
  isLoading.value = true;
  try {
    const { data } = await apiFetch(
        `/api/choosable-price-types?lang=${locale.value}`
    );
    options.value = (Array.isArray(data) ? data : []).map((item: any) => ({
      key: item.id ?? 0,
      label: item.name
    }));

    // Set selectedCode to modelValue after options are loaded
    // Use 0 if null
    selectedCode.value = props.modelValue ?? 0;
    console.log("selectedCode: ",  selectedCode.value);
  } catch (err) {
    console.error("Failed to fetch price type:", err);
    options.value = [];
    selectedCode.value = 0; // fallback
  } finally {
    isLoading.value = false;
  }
}

// Fetch on mount
onMounted(fetchOptions);
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