<!--
  src/component/ui/modal/UranusUnsavedChangesModal.vue
-->

<template>
  <UranusModal
      :show="show"
      :title="resolvedTitle"
      max-width="520px"
      @close="handleClose"
  >
    <UranusFormRow>
      {{ resolvedMessage }}
    </UranusFormRow>

    <UranusFormActions style="margin-top: 3rem;">
      <UranusButton variant="primary" @click="handleClose">
        {{ resolvedCancelText }}
      </UranusButton>

      <UranusButton variant="danger" @click="handleConfirm">
        {{ resolvedConfirmText }}
      </UranusButton>
    </UranusFormActions>
  </UranusModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusModal from '@/component/uranus/UranusModal.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusFormActions from "@/component/ui/UranusFormActions.vue";
import UranusFormRow from "@/component/ui/UranusFormRow.vue";

const { t } = useI18n();

const props = defineProps<{
  show: boolean
  title?: string
  message?: string
  cancelText?: string
  confirmText?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const resolvedTitle = computed(
    () => props.title ?? t('modal_unsaved_changes_title')
)

const resolvedMessage = computed(
    () => props.message ?? t('modal_unsaved_changes_message')
)

const resolvedCancelText = computed(
    () => props.cancelText ?? t('modal_unsaved_changes_cancel')
)

const resolvedConfirmText = computed(
    () => props.confirmText ?? t('modal_unsaved_changes_confirm')
)


function handleClose() {
  emit('close')
}

function handleConfirm() {
  emit('confirm')
}
</script>
