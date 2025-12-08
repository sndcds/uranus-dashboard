<template>
  <UranusFormRow>
    <select v-model="selectedCode" class="_language-select">
      <option :value="null" disabled>{{ t('select_placeholder') }}</option>

      <option
          v-for="(label, code) in languageOptions"
          :key="code"
          :value="code"
      >
        {{ label }}
      </option>
    </select>

    <button
        v-if="selectedCode"
        class="uranus-secondary-button _button"
        @click="addLanguage"
    >
      {{ t('add') }}
    </button>
  </UranusFormRow>

  <div class="uranus-dashboard-chip-wrapper">
    <span
        v-for="code in draftList"
        :key="code"
        class="uranus-dashboard-chip removable language"
    >
      {{ languageOptions[code] ?? code }}

      <span
          class="uranus-dashboard-chip-close language"
          @click="removeLanguage(code)"
      >
        ×
      </span>
    </span>
  </div>
</template>


<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import UranusFormRow from "@/components/ui/UranusFormRow.vue";
import { languages, type LanguagesLocale } from "@/i18n/languages.ts";

const { t, locale } = useI18n({ useScope: "global" });

// Props + v-model
const props = defineProps<{
  modelValue: string[]; // array of language codes
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string[]): void;
}>();

// Local draft list
const draftList = ref<string[]>([...(props.modelValue ?? [])]);

// Selected in dropdown
const selectedCode = ref<string | null>(null);

// Build translated language options using current locale
const languageOptions = computed<Record<string, string>>(() => {
  const cur = locale.value as LanguagesLocale;
  return languages[cur] ?? {};
});

// Add selected language
function addLanguage() {
  if (!selectedCode.value) return;

  if (!draftList.value.includes(selectedCode.value)) {
    draftList.value.push(selectedCode.value);
    emit("update:modelValue", draftList.value);
  }

  selectedCode.value = null;
}

// Remove a code from list
function removeLanguage(code: string) {
  draftList.value = draftList.value.filter((c) => c !== code);
  emit("update:modelValue", draftList.value);
}
</script>


<style scoped lang="scss">
._language-select {
  flex: 3;
  border-width: 2px;
  font-size: 1em;
  padding: 0.4em 0.6em;
  max-width: 250px;
}

._button {
  flex: 0 0 auto;
  display: inline-flex;
  width: max-content;
  max-width: 100%;
  padding: 0.5rem 1rem;
  white-space: nowrap;
  align-items: center;
  justify-content: center;
}
</style>