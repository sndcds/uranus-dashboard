<template>
  <section class="messages-panel" aria-labelledby="dashboard-messages-heading">
    <header class="messages-panel__header">
      <h2 id="dashboard-messages-heading" class="messages-panel__title">
        {{ inboxMessagesTitle }}
      </h2>
      <div class="messages-panel__controls">
        <span v-if="unreadCount > 0" class="messages-panel__badge">
          {{ unreadCount }} {{ unreadLabel }}
        </span>
        <button type="button" class="messages-panel__refresh" @click="refreshMessages" :disabled="messagesLoading">
          <span v-if="!messagesLoading">{{ refreshMessagesLabel }}</span>
          <span v-else>{{ refreshingMessagesLabel }}</span>
        </button>
      </div>
    </header>

    <transition name="fade">
      <p v-if="messagesError" class="inbox-feedback inbox-feedback--error" role="alert" aria-live="assertive">
        {{ messagesError }}
      </p>
    </transition>

    <div class="messages-panel__body">
      <div class="message-list-wrapper">
        <ul class="message-list" role="listbox" :aria-busy="messagesLoading" :aria-label="inboxMessagesTitle">
          <li v-if="messagesLoading" class="message-list__loading">
            {{ loadingMessagesLabel }}
          </li>
          <template v-else>
            <li v-if="messages.length === 0" class="message-list__empty">
              {{ messagesEmptyLabel }}
            </li>
            <li v-for="message in messages" :key="message.id">
              <button type="button" class="message-card" :class="{
                'message-card--active': message.id === selectedMessageId,
                'message-card--unread': !message.isRead
              }" role="option" :aria-selected="message.id === selectedMessageId" @click="selectMessage(message)">
                <div class="message-card__header">
                  <span class="message-card__subject">{{ message.subject }}</span>
                  <time class="message-card__timestamp" :datetime="message.createdAt">
                    {{ formatMessageTimestamp(message.createdAt) }}
                  </time>
                </div>
                <p class="message-card__preview">
                  {{ formatMessagePreview(message.message) }}
                </p>
              </button>
            </li>
          </template>
        </ul>
      </div>

      <article class="message-detail" aria-live="polite">
        <div v-if="selectedMessage" class="message-detail__content">
          <header class="message-detail__header">
            <h3 class="message-detail__subject">{{ selectedMessage.subject }}</h3>
            <time class="message-detail__timestamp" :datetime="selectedMessage.createdAt">
              {{ formatMessageTimestamp(selectedMessage.createdAt) }}
            </time>
          </header>

          <dl class="message-detail__meta">
            <div>
              <dt>{{ messageFromLabel }}</dt>
              <dd>{{ formatMessageSender(selectedMessage) }}</dd>
            </div>
            <div>
              <dt>{{ messageSentLabel }}</dt>
              <dd>{{ formatMessageTimestamp(selectedMessage.createdAt) }}</dd>
            </div>
          </dl>

          <div class="message-detail__body">
            <p v-if="selectedMessage.modifiedAt" class="message-detail__updated">
              {{ messageUpdatedLabel }}
              {{ formatMessageTimestamp(selectedMessage.modifiedAt) }}
            </p>
            <pre class="message-detail__text">{{ selectedMessage.message }}</pre>
          </div>
        </div>
        <div v-else class="message-detail__placeholder">
          <p>{{ messageDetailPlaceholderLabel }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

interface InboxMessage {
  id: number
  subject: string
  message: string
  createdAt: string
  modifiedAt: string | null
  fromUserId: number | null
  isRead: boolean
}

const { t } = useI18n()

const messages = ref<InboxMessage[]>([])
const messagesLoading = ref(false)
const messagesError = ref<string | null>(null)
const selectedMessageId = ref<number | null>(null)

const unreadCount = computed(() => messages.value.reduce((acc, item) => (!item.isRead ? acc + 1 : acc), 0))
const selectedMessage = computed(() => {
  if (selectedMessageId.value == null) {
    return null
  }

  return messages.value.find((item) => item.id === selectedMessageId.value) ?? null
})

const inboxMessagesTitle = computed(() => t('dashboard_inbox_messages_title'))
const refreshMessagesLabel = computed(() => t('dashboard_inbox_refresh_label'))
const refreshingMessagesLabel = computed(() => t('dashboard_inbox_refreshing_label'))
const messagesEmptyLabel = computed(() => t('dashboard_inbox_empty_label'))
const messagesErrorFallback = computed(() => t('dashboard_inbox_error_label'))
const unreadLabel = computed(() => t('dashboard_inbox_unread_label'))
const messageFromLabel = computed(() => t('dashboard_inbox_from_label'))
const messageSentLabel = computed(() => t('dashboard_inbox_sent_label'))
const messageUpdatedLabel = computed(() => t('dashboard_inbox_updated_label'))
const messageDetailPlaceholderLabel = computed(() => t('dashboard_inbox_placeholder_label'))
const loadingMessagesLabel = computed(() => t('dashboard_inbox_loading_label'))
const unknownSenderLabel = computed(() => t('dashboard_inbox_unknown_sender_label'))

const formatMessageTimestamp = (value: string | null | undefined): string => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  } catch {
    return date.toLocaleString()
  }
}

const formatMessagePreview = (body: string, limit = 120): string => {
  if (!body) {
    return ''
  }

  if (body.length <= limit) {
    return body
  }

  return `${body.slice(0, limit).trimEnd()}...`
}

const formatMessageSender = (message: InboxMessage | null | undefined): string => {
  if (!message) {
    return unknownSenderLabel.value
  }

  if (message.fromUserId != null) {
    return `User #${message.fromUserId}`
  }

  return unknownSenderLabel.value
}

const markMessageAsReadLocally = (id: number | null) => {
  if (id == null) {
    return
  }

  const target = messages.value.find((item) => item.id === id)
  console.log('Marking message as read locally:', id, target)
  if (target) {
    target.isRead = true
  }
}

const ensureMessageSelection = () => {
  if (messages.value.length === 0) {
    selectedMessageId.value = null
    return
  }

  if (!messages.value.some((item) => item.id === selectedMessageId.value)) {
    const firstMessage = messages.value[0]
    if (firstMessage) {
      selectedMessageId.value = firstMessage.id
    }
  }

  markMessageAsReadLocally(selectedMessageId.value)
}

const selectMessage = (message: InboxMessage) => {
  selectedMessageId.value = message.id
  markMessageAsReadLocally(message.id)
  console.log('Message selected:', message.id)

  // Scroll the detail panel into view on mobile
  if (window.innerWidth <= 960) {
    setTimeout(() => {
      const detailPanel = document.querySelector('.message-detail')
      if (detailPanel) {
        detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
}

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

const normalizeMessages = (payload: unknown): InboxMessage[] => {
  const items: unknown[] = []

  if (Array.isArray(payload)) {
    items.push(...payload)
  } else if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>
    if (Array.isArray(obj.messages)) {
      items.push(...obj.messages)
    } else if (Array.isArray(obj.data)) {
      items.push(...obj.data)
    }
  }

  console.log('Normalizing messages from payload:', payload, 'Extracted items:', items)

  const parseDateValue = (value: unknown): string | null => {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value
    }

    if (value instanceof Date) {
      return value.toISOString()
    }

    if (typeof value === 'number') {
      const date = new Date(value)
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString()
      }
    }

    return null
  }

  return items
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null
      }

      const raw = entry as Record<string, unknown>

      const numericId = Number(raw.id)

      if (!Number.isFinite(numericId)) {
        return null
      }

      const subjectCandidate = raw.subject
      const messageCandidate = raw.message

      if (typeof subjectCandidate !== 'string' || typeof messageCandidate !== 'string') {
        return null
      }

      const fromUserCandidate = raw.from_user_id ?? raw.fromUserId
      const createdCandidate = raw.created_at ?? raw.createdAt
      const modifiedCandidate = raw.modified_at ?? raw.modifiedAt
      const isReadCandidate = raw.is_read ?? raw.isRead

      const createdAt = parseDateValue(createdCandidate)
      if (!createdAt) {
        return null
      }

      const modifiedAtValue = parseDateValue(modifiedCandidate)

      const fromUserId =
        fromUserCandidate == null
          ? null
          : typeof fromUserCandidate === 'number'
            ? fromUserCandidate
            : Number.parseInt(String(fromUserCandidate), 10)

      const normalizedFromUserId =
        typeof fromUserId === 'number' && Number.isFinite(fromUserId) ? fromUserId : null

      return {
        id: numericId,
        subject: subjectCandidate,
        message: messageCandidate,
        createdAt,
        modifiedAt: modifiedAtValue,
        fromUserId: normalizedFromUserId,
        isRead: Boolean(isReadCandidate),
      } satisfies InboxMessage
    })
    .filter((entry): entry is InboxMessage => Boolean(entry))
}

const refreshMessages = async (): Promise<void> => {
  messagesError.value = null
  messagesLoading.value = true

  try {
    const { data } = await apiFetch<unknown>('/api/admin/messages')
    console.log('Raw API data:', data)

    const normalizedMessages = normalizeMessages(data)
    console.log('Normalized messages:', normalizedMessages)

    messages.value = normalizedMessages
    ensureMessageSelection()
  } catch (err: unknown) {
    console.error('Error loading messages:', err)
    messagesError.value = resolveErrorMessage(err, messagesErrorFallback.value)
    messages.value = []
    selectedMessageId.value = null
  } finally {
    messagesLoading.value = false
  }
}

onMounted(() => {
  void refreshMessages()
})

defineExpose({
  refreshMessages,
})
</script>

<style scoped lang="scss">
.messages-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vw, 1.5rem);
}

.messages-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.messages-panel__title {
  font-size: clamp(1.05rem, 2vw, 1.3rem);
  font-weight: 600;
}

.messages-panel__controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.messages-panel__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: var(--accent-muted);
  color: var(--accent-primary);
  font-size: 0.8rem;
  font-weight: 600;
}

.messages-panel__refresh {
  border: 1px solid var(--accent-primary);
  border-radius: 999px;
  padding: 0.5rem 1.2rem;
  font-weight: 600;
  background: transparent;
  color: var(--accent-primary);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
}

.messages-panel__refresh:hover:not(:disabled) {
  background: var(--accent-primary);
  color: #fff;
  transform: translateY(-1px);
}

.messages-panel__refresh:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.messages-panel__refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.messages-panel__body {
  flex: 1;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(220px, 320px) minmax(0, 1fr);
}

@media (max-width: 960px) {
  .messages-panel__body {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
}

.message-list-wrapper {
  position: sticky;
  top: 1rem;
  left: 0;
  z-index: 1000;
  align-self: flex-start;
  max-height: calc(100vh - 8rem);
  padding-right: 0.25rem;
  overflow-y: auto;
}

@media (max-width: 960px) {
  .message-list-wrapper {
    position: static;
    max-height: 20rem;
  }
}

.message-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.9rem 1rem;
  border-radius: 4px;
  border: 1px solid transparent;
  background: var(--uranus-surface-muted);
  color: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.15s ease;
  text-align: left;
}

.message-card:hover {
  // border-color: var(--accent-primary);
  background: rgba(79, 70, 229, 0.12);
}

.message-card:focus-visible {
  // outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.message-card--active {
  // border-color: var(--accent-primary);
  background: rgba(79, 70, 229, 0.18);
}

.message-card--unread {
  // border-color: rgba(79, 70, 229, 0.35);
}

.message-card--unread .message-card__subject {
  font-weight: 700;
}

.message-card__header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.message-card__subject {
  font-weight: 600;
  font-size: 0.95rem;
}

.message-card__timestamp {
  font-size: 0.8rem;
  color: var(--uranus-muted-text);
}

.message-card__preview {
  margin: 0;
  font-size: 0.9rem;
  color: var(--uranus-muted-text);
}

.message-list__loading,
.message-list__empty {
  margin: 0;
  padding: 0.85rem 1rem;
  border-radius: 0.85rem;
  background: var(--uranus-surface-muted);
  color: var(--uranus-muted-text);
  font-size: 0.9rem;
}

.message-detail {
  background: var(--uranus-surface-muted);
  border-radius: 8px;
  padding: clamp(1rem, 2vw, 1.5rem);
  min-height: 260px;
  display: flex;
  flex-direction: column;
}

.message-detail__content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;
}

.message-detail__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.message-detail__subject {
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 600;
  margin: 0;
}

.message-detail__timestamp {
  font-size: 0.85rem;
  color: var(--uranus-muted-text);
}

.message-detail__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin: 0;
}

.message-detail__meta div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.message-detail__meta dt {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--uranus-muted-text);
}

.message-detail__meta dd {
  margin: 0;
  font-size: 0.95rem;
}

.message-detail__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.message-detail__updated {
  margin: 0;
  font-size: 0.85rem;
  color: var(--uranus-muted-text);
}

.message-detail__text {
  margin: 0;
  padding: 1rem;
  border-radius: 0.85rem;
  background: var(--card-bg);
  border: 1px solid var(--border-soft);
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-y: auto;
  flex: 1;
}

.message-detail__placeholder {
  flex: 1;
  display: grid;
  place-items: center;
  text-align: center;
  color: var(--uranus-muted-text);
  font-size: 0.95rem;
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

</style>
