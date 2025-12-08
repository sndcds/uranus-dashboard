<template>
  <UranusFieldLabel id="price-type-select" :label="t('occasion')">
    <select
        v-model.number="selectedCode"
        class="_language-select"
        @change="onSelect"
        :disabled="isLoading"
    >
      <option :value="null" disabled>{{ t('select_placeholder') }}</option>
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
import UranusFieldLabel from "@/components/ui/UranusFieldLabel.vue";

const { t, locale } = useI18n({ useScope: "global" });

// Props + v-model
const props = defineProps<{
  modelValue: number | null; // integer or null
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: number | null): void;
}>();

// State
const isLoading = ref(false);
const selectedCode = ref<number | null>(props.modelValue ?? null);
const options = ref<{ key: number; label: string }[]>([]);

// Watch parent updates
watch(
    () => props.modelValue,
    (newVal) => {
      selectedCode.value = newVal ?? null;
    }
);

// Computed dropdown options
const priceTypeOptions = computed(() => options.value);

// Emit integer or null on selection change
function onSelect() {
  emit("update:modelValue", selectedCode.value !== null ? Number(selectedCode.value) : null);
}

// Fetch options from API
async function fetchOptions() {
  isLoading.value = true;
  try {
    const { data } = await apiFetch(`/api/choosable-event-ocassions?lang=${locale.value}`);
    options.value = (Array.isArray(data) ? data : []).map((item: any) => ({
      key: item.id ?? 0,
      label: item.name ?? "",
    }));

    // Ensure selectedCode is a number or null
    selectedCode.value = props.modelValue ?? null;
  } catch (err) {
    console.error("Failed to fetch price types:", err);
    options.value = [];
    selectedCode.value = null;
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
  padding: 0.4rem 0.6rem;
  max-width: 250px;
}
</style>