<template>
  <UranusFieldLabel id="url-type-select" :label="t('event_link_type')">
    <select
        v-model="selectedId"
        class="_uranus-select"
        @change="onSelect"
        :disabled="isLoading"
    >
      <option :value="null" disabled>{{ t('select_placeholder') }}</option>
      <option
          v-for="option in urlTypeOptions"
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

// Props + v-model
const props = defineProps<{
  modelValue: string | null;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: number | null): void;
}>();

const { t, locale } = useI18n({ useScope: "global" });

// State
const isLoading = ref(false);
const selectedId = ref<string | null>(props.modelValue ?? null);
const options = ref<{ key: number; label: string }[]>([]);

// Watch parent updates
watch(
    () => props.modelValue,
    (newVal) => {
      selectedId.value = newVal ?? null;
    }
);

// Computed dropdown options
const urlTypeOptions = computed(() => options.value);

// Emit integer or null on selection change
function onSelect() {
  emit("update:modelValue", selectedId.value !== null ? Number(selectedId.value) : null);
}

// Fetch options from API
async function fetchOptions() {
  isLoading.value = true;
  try {
    const { data } = await apiFetch(`/api/choosable-url-types/event?lang=${locale.value}`);
    options.value = (Array.isArray(data) ? data : []).map((item: any) => ({
      key: item.id ?? 0,
      label: item.name ?? "",
    }));
    selectedId.value = props.modelValue ?? null;
  } catch (err) {
    console.error("Failed to fetch URL types:", err);
    options.value = [];
    selectedId.value = null;
  } finally {
    isLoading.value = false;
  }
}

// Fetch on mount
onMounted(fetchOptions);
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