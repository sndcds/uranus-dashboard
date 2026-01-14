<template>
  <section class="composer-panel">
    <div v-if="!selectedOrganization" class="inbox-placeholder">
      <p>{{ placeholderLabel }}</p>
    </div>

    <form
      v-else
      class="message-form"
      @submit.prevent="sendMessage"
      :aria-busy="isSending"
      novalidate
    >
      <header class="message-form__header">
        <div class="message-recipient">
          <span class="message-recipient__label">{{ recipientLabel }}</span>
          <strong class="message-recipient__name">{{ selectedOrganization.name }}</strong>
          <span v-if="selectedOrganization.email" class="message-recipient__email">
            {{ selectedOrganization.email }}
          </span>
          <span v-if="selectedOrganizationLocation" class="message-recipient__meta">
            {{ selectedOrganizationLocation }}
          </span>
        </div>
      </header>

      <transition name="fade">
        <p
          v-if="sendError"
          class="inbox-feedback inbox-feedback--error"
          role="alert"
          aria-live="assertive"
        >
          {{ sendError }}
        </p>
      </transition>
      <transition name="fade">
        <p
          v-if="sendSuccess"
          class="inbox-feedback inbox-feedback--success"
          role="status"
          aria-live="polite"
        >
          {{ sendSuccess }}
        </p>
      </transition>

      <div class="input-group">
        <label for="message-subject">{{ subjectLabel }}</label>
        <input
          id="message-subject"
          v-model="messageSubject"
          type="text"
          :placeholder="subjectPlaceholder"
          required
        />
      </div>

      <div class="input-group">
        <label for="message-body">{{ messageLabel }}</label>
        <textarea
          id="message-body"
          v-model="messageBody"
          rows="8"
          :placeholder="messagePlaceholder"
          required
        />
      </div>

      <div class="message-form__actions">
        <button type="submit" :disabled="isSending || !canSend">
          <span v-if="!isSending">{{ sendButtonLabel }}</span>
          <span v-else>{{ sendingLabel }}</span>
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'

interface Organization {
  id: string | number;
  name: string;
  email?: string;
}

const props = defineProps<{
  selectedOrganization: Organization | null;
  selectedOrganizationLocation: string | null;
}>()

const emit = defineEmits<{
  sent: []
}>()

const { t } = useI18n()

const messageSubject = ref('')
const messageBody = ref('')
const isSending = ref(false)
const sendError = ref<string | null>(null)
const sendSuccess = ref<string | null>(null)

const placeholderLabel = computed(() => t('message_placeholder'))
const recipientLabel = computed(() => t('message_recipient_label'))
const subjectLabel = computed(() => t('message_subject_label'))
const subjectPlaceholder = computed(() => t('message_subject_placeholder'))
const messageLabel = computed(() => t('message_body_label'))
const messagePlaceholder = computed(() => t('message_body_placeholder'))
const sendButtonLabel = computed(() => t('message_send_cta'))
const sendingLabel = computed(() => t('message_sending'))
const missingFieldsMessage = computed(() => t('message_missing_fields'))
const sendErrorFallback = computed(() => t('message_send_error'))
const sendSuccessMessage = computed(() => t('message_send_success'))

const canSend = computed(() => messageSubject.value.trim().length > 0 && messageBody.value.trim().length > 0)

const resetState = () => {
  messageSubject.value = ''
  messageBody.value = ''
  sendError.value = null
  sendSuccess.value = null
  isSending.value = false
}

watch(
  () => props.selectedOrganization,
  () => {
    resetState()
  }
)

const resolveErrorMessage = (err: unknown, fallback: string): string => {
  if (typeof err === 'string' && err.trim().length > 0) {
    return err
  }

  if (err && typeof err === 'object') {
    const maybeError = err as { message?: unknown; data?: unknown }

    if (maybeError.data && typeof maybeError.data === 'object' && 'error' in (maybeError.data as Record<string, unknown>)) {
      const apiMessage = (maybeError.data as Record<string, unknown>).error
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        return apiMessage
      }
    }

    if (typeof maybeError.message === 'string' && maybeError.message.trim().length > 0) {
      return maybeError.message
    }
  }

  return fallback
}

const sendMessage = async () => {
  if (!props.selectedOrganization) {
    return
  }

  if (!canSend.value) {
    sendError.value = missingFieldsMessage.value
    sendSuccess.value = null
    return
  }

  sendError.value = null
  sendSuccess.value = null
  isSending.value = true

  try {
    const rawContextId =
      typeof props.selectedOrganization.id === 'number'
        ? props.selectedOrganization.id
        : Number.parseInt(String(props.selectedOrganization.id), 10)
    const contextIdPayload =
      typeof rawContextId === 'number' && Number.isFinite(rawContextId)
        ? rawContextId
        : props.selectedOrganization.id

    await apiFetch(`/api/admin/user/send-message`, {
      method: 'POST',
      body: JSON.stringify({
        context: 'organization',
        context_id: contextIdPayload,
        subject: messageSubject.value.trim(),
        message: messageBody.value.trim(),
      }),
    })

    sendSuccess.value = sendSuccessMessage.value
    messageSubject.value = ''
    messageBody.value = ''
    emit('sent')
  } catch (err: unknown) {
    sendError.value = resolveErrorMessage(err, sendErrorFallback.value)
  } finally {
    isSending.value = false
  }
}

defineExpose({
  reset: resetState,
})
</script>

<style scoped lang="scss">
.composer-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.inbox-placeholder {
  min-height: 240px;
  display: grid;
  place-items: center;
  text-align: center;
  color: var(--uranus-muted-text);
  font-size: 0.95rem;
}

.message-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.message-form__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-soft);
}

.message-recipient {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.message-recipient__label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--uranus-muted-text);
}

.message-recipient__name {
  font-size: 1.1rem;
  font-weight: 600;
}

.message-recipient__email,
.message-recipient__meta {
  font-size: 0.85rem;
  color: var(--uranus-muted-text);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.input-group label {
  font-size: 0.95rem;
  font-weight: 600;
}

.input-group input,
.input-group textarea {
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 0.9rem;
  border: 1px solid var(--input-border);
  background-color: var(--input-bg);
  font-size: 0.95rem;
  color: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-group textarea {
  resize: vertical;
  min-height: 12rem;
}

.input-group input:focus-visible,
.input-group textarea:focus-visible {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.18);
  outline: none;
}

.message-form__actions {
  display: flex;
  justify-content: flex-end;
}

.message-form__actions button {
  border: none;
  border-radius: 999px;
  padding: 0.85rem 2.1rem;
  font-weight: 600;
  font-size: 0.95rem;
  background: var(--accent-primary);
  color: #fff;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}

.message-form__actions button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(79, 70, 229, 0.25);
}

.message-form__actions button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.inbox-feedback {
  margin: 0;
  padding: 0.85rem 1rem;
  border-radius: 0.9rem;
  font-size: 0.9rem;
}

.inbox-feedback--error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #b91c1c;
}

.inbox-feedback--success {
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.22);
  color: #047857;
}
</style>
