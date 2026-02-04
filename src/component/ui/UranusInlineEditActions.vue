<!--
  UranusInlineEditActions.vue
-->
<template>
  <UranusInlineActionBar>
    <UranusInlineCancelButton
        :label="translatedCancelLabel"
        :disabled="isSaving"
        @click="emitCancel"
    />
    <UranusInlineSaveButton
        :label="translatedSaveLabel"
        :busyLabel="translatedBusyLabel"
        :disabled="!canSave || isSaving"
        :loading="isSaving"
        @click="emitSave"
    />
  </UranusInlineActionBar>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import UranusInlineActionBar from "@/component/ui/UranusInlineActionBar.vue";
import UranusInlineCancelButton from "@/component/ui/UranusInlineCancelButton.vue";
import UranusInlineSaveButton from "@/component/ui/UranusInlineSaveButton.vue";
import { computed } from "vue";

const { t } = useI18n({ useScope: 'global' })

const props = defineProps({
  isSaving: { type: Boolean, default: false },
  canSave: { type: Boolean, default: false },
  saveLabel: { type: String, default: 'Save' },
  busyLabel: { type: String, default: 'Saving' },
  cancelLabel: { type: String, default: 'Cancel' }
});

const translatedSaveLabel = computed(() => t('save'))
const translatedBusyLabel = computed(() => t('saving'))
const translatedCancelLabel = computed(() => t('cancel'))

const emit = defineEmits<{
  (e: 'save'): void;
  (e: 'cancel'): void;
}>()

const emitSave = () => {
  emit('save')
}

const emitCancel = () => {
  emit('cancel')
}
</script>