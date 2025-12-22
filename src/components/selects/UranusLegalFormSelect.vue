<!--
  UranusLegalFormSelect.vue
-->
<template>
  <UranusFieldLabel
      id="legal-form-select"
      :label="labelMessage('organization_legal_form_id')"
  >
    <select
        v-model="selectedId"
        class="uranus-select"
        :disabled="isLoading"
        @change="onSelect"
    >
      <!-- Placeholder -->
      <option value="" disabled>
        {{ legalFormPlaceholder }}
      </option>

      <!-- Options -->
      <option
          v-for="form in legalForms"
          :key="form.id"
          :value="String(form.id)"
      >
        {{ form.name }}
      </option>
    </select>
  </UranusFieldLabel>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { apiFetch } from "@/api";
import UranusFieldLabel from "@/components/ui/UranusFieldLabel.vue";

/* ------------------------------------------------------------------
 * i18n
 * ------------------------------------------------------------------ */
const { t, locale } = useI18n({ useScope: "global" });

function labelMessage(key: string) {
  return t(key);
}

const legalFormPlaceholder = t("select_legal_form");

/* ------------------------------------------------------------------
 * Props + v-model
 * ------------------------------------------------------------------ */
const props = defineProps<{
  modelValue: string | number | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
}>();

/* ------------------------------------------------------------------
 * State
 * ------------------------------------------------------------------ */
const isLoading = ref(false);
const selectedId = ref<string>("");

const legalForms = ref<{ id: number | string; name: string }[]>([]);

/* ------------------------------------------------------------------
 * Sync with parent
 * ------------------------------------------------------------------ */
watch(
    () => props.modelValue,
    (newVal) => {
      selectedId.value = newVal !== null ? String(newVal) : "";
    },
    { immediate: true }
);

/* ------------------------------------------------------------------
 * Emit change
 * ------------------------------------------------------------------ */
function onSelect() {
  emit("update:modelValue", selectedId.value || null);
}

/* ------------------------------------------------------------------
 * Fetch legal forms
 * ------------------------------------------------------------------ */
async function fetchLegalForms() {
  isLoading.value = true;
  try {
    const { data } = await apiFetch(
        `/api/choosable-legal-forms?lang=${locale.value}`
    );


    legalForms.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Failed to fetch legal forms:", err);
    legalForms.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchLegalForms);
</script>
