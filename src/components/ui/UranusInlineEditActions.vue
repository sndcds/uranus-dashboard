<template>
  <UranusInlineActionBar>
    <UranusInlineCancelButton
        :label="translatedCancelLabel"
        :onClick="handleCancel"
    />
    <UranusInlineOKButton
        :label="translatedSaveLabel"
        :busyLabel="translatedBusyLabel"
        :onClick="handleSave"
        :disabled="!canSave || isSaving"
    />
  </UranusInlineActionBar>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import UranusInlineActionBar from "@/components/ui/UranusInlineActionBar.vue";
import UranusInlineCancelButton from "@/components/ui/UranusInlineCancelButton.vue";
import UranusInlineOKButton from "@/components/ui/UranusInlineOKButton.vue";
import {computed} from "vue";

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
}>();

const handleSave = () => emit('save');
const handleCancel = () => emit('cancel');
</script>