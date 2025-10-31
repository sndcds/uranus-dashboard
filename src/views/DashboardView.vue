<template>
  <div class="events-page">
    <div class="dashboard-hero">
      <h1>{{ t('dashboard') }}</h1>
      <p>{{ t('dashboard_description') }}</p>
    </div>

    <div class="dashboard-inbox">
      <section class="inbox-sidebar">
        <h2 class="inbox-sidebar__title">{{ inboxTitle }}</h2>

        <form class="organizer-search" @submit.prevent="searchOrganizers" novalidate>
          <label class="organizer-search__label" for="organizer-search-input">
            {{ searchLabel }}
          </label>
          <div class="organizer-search__controls">
            <input
              id="organizer-search-input"
              v-model="searchTerm"
              type="search"
              :placeholder="searchPlaceholder"
              :aria-label="searchLabel"
              :aria-busy="isSearching"
            />
            <button type="submit" :disabled="isSearchDisabled">
              <span v-if="!isSearching">{{ searchButtonLabel }}</span>
              <span v-else>{{ searchingLabel }}</span>
            </button>
          </div>
        </form>

        <transition name="fade">
          <p
            v-if="searchError"
            class="inbox-feedback inbox-feedback--error"
            role="alert"
            aria-live="assertive"
          >
            {{ searchError }}
          </p>
        </transition>

        <ul
          class="organizer-results"
          role="listbox"
          :aria-busy="isSearching"
          :aria-label="searchResultsLabel"
        >
          <li v-for="organizer in organizers" :key="organizer.id">
            <button
              type="button"
              class="organizer-item"
              :class="{ 'organizer-item--active': organizer.id === selectedOrganizerId }"
              @click="selectOrganizer(organizer)"
              :aria-pressed="organizer.id === selectedOrganizerId"
            >
              <span class="organizer-item__name">{{ organizer.name }}</span>
              <span v-if="organizer.email" class="organizer-item__email">{{ organizer.email }}</span>
              <span v-if="formatLocation(organizer)" class="organizer-item__meta">
                {{ formatLocation(organizer) }}
              </span>
            </button>
          </li>
          <li v-if="!isSearching && hasSearched && organizers.length === 0">
            <p class="organizer-results__empty">{{ noResultsLabel }}</p>
          </li>
        </ul>
      </section>

      <section class="inbox-content">
        <section class="messages-panel" aria-labelledby="dashboard-messages-heading">
          <header class="messages-panel__header">
            <h2 id="dashboard-messages-heading" class="messages-panel__title">
              {{ inboxMessagesTitle }}
            </h2>
            <div class="messages-panel__controls">
              <span v-if="unreadCount > 0" class="messages-panel__badge">
                {{ unreadCount }} {{ unreadLabel }}
              </span>
              <button
                type="button"
                class="messages-panel__refresh"
                @click="fetchMessages"
                :disabled="messagesLoading"
              >
                <span v-if="!messagesLoading">{{ refreshMessagesLabel }}</span>
                <span v-else>{{ refreshingMessagesLabel }}</span>
              </button>
            </div>
          </header>

          <transition name="fade">
            <p
              v-if="messagesError"
              class="inbox-feedback inbox-feedback--error"
              role="alert"
              aria-live="assertive"
            >
              {{ messagesError }}
            </p>
          </transition>

          <div class="messages-panel__body">
            <div class="message-list-wrapper">
              <ul
                class="message-list"
                role="listbox"
                :aria-busy="messagesLoading"
                :aria-label="inboxMessagesTitle"
              >
                <li v-if="messagesLoading" class="message-list__loading">
                  {{ loadingMessagesLabel }}
                </li>
                <template v-else>
                  <li v-if="messages.length === 0" class="message-list__empty">
                    {{ messagesEmptyLabel }}
                  </li>
                  <li v-for="message in messages" :key="message.id">
                    <button
                      type="button"
                      class="message-card"
                      :class="{
                        'message-card--active': message.id === selectedMessageId,
                        'message-card--unread': !message.isRead
                      }"
                      role="option"
                      :aria-selected="message.id === selectedMessageId"
                      @click="selectMessage(message)"
                    >
                      <div class="message-card__header">
                        <span class="message-card__subject">{{ message.subject }}</span>
                        <time
                          class="message-card__timestamp"
                          :datetime="message.createdAt"
                        >
                          {{ formatMessageTimestamp(message.createdAt) }}
                        </time>
                      </div>
                      <p class="message-card__preview">
                        {{ formatMessagePreview(message.message) }}
                      </p>
                      <div
                        v-if="formatMessageContext(message, '')"
                        class="message-card__meta"
                      >
                        <span>{{ formatMessageContext(message, '') }}</span>
                      </div>
                    </button>
                  </li>
                </template>
              </ul>
            </div>

            <article class="message-detail" aria-live="polite">
              <div v-if="selectedMessage" class="message-detail__content">
                <header class="message-detail__header">
                  <h3 class="message-detail__subject">{{ selectedMessage.subject }}</h3>
                  <time
                    class="message-detail__timestamp"
                    :datetime="selectedMessage.createdAt"
                  >
                    {{ formatMessageTimestamp(selectedMessage.createdAt) }}
                  </time>
                </header>

                <dl class="message-detail__meta">
                  <div>
                    <dt>{{ messageFromLabel }}</dt>
                    <dd>{{ formatMessageSender(selectedMessage) }}</dd>
                  </div>
                  <div>
                    <dt>{{ messageContextLabel }}</dt>
                    <dd>{{ formatMessageContext(selectedMessage) }}</dd>
                  </div>
                  <div>
                    <dt>{{ messageSentLabel }}</dt>
                    <dd>{{ formatMessageTimestamp(selectedMessage.createdAt) }}</dd>
                  </div>
                </dl>

                <div class="message-detail__body">
                  <p
                    v-if="selectedMessage.modifiedAt"
                    class="message-detail__updated"
                  >
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

        <section class="composer-panel">
          <div v-if="!selectedOrganizer" class="inbox-placeholder">
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
                <strong class="message-recipient__name">{{ selectedOrganizer.name }}</strong>
                <span v-if="selectedOrganizer.email" class="message-recipient__email">
                  {{ selectedOrganizer.email }}
                </span>
                <span v-if="selectedOrganizerLocation" class="message-recipient__meta">
                  {{ selectedOrganizerLocation }}
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
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

interface Organizer {
  id: string | number;
  name: string;
  email?: string;
  city?: string | null;
  countryCode?: string | null;
}

interface InboxMessage {
  id: number;
  context: string;
  contextId: number | null;
  subject: string;
  message: string;
  createdAt: string;
  modifiedAt: string | null;
  fromUserId: number | null;
  isRead: boolean;
}

const { t, te } = useI18n()

const searchTerm = ref('')
const organizers = ref<Organizer[]>([])
const isSearching = ref(false)
const hasSearched = ref(false)
const searchError = ref<string | null>(null)

const selectedOrganizer = ref<Organizer | null>(null)
const messageSubject = ref('')
const messageBody = ref('')
const isSending = ref(false)
const sendError = ref<string | null>(null)
const sendSuccess = ref<string | null>(null)

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

const clearComposer = () => {
  selectedOrganizer.value = null
  messageSubject.value = ''
  messageBody.value = ''
  sendError.value = null
  sendSuccess.value = null
}

interface InboxPersistedState {
  searchTerm: string;
  organizers: Organizer[];
  selectedOrganizerId: Organizer['id'] | null;
  hasSearched: boolean;
}

const STORAGE_KEY = 'uranus-dashboard-inbox'

const inboxTitle = computed(() => (te('dashboard_message_inbox_title') ? t('dashboard_message_inbox_title') : 'Organizer inbox'))
const searchLabel = computed(() => (te('dashboard_message_search_label') ? t('dashboard_message_search_label') : 'Search organizers'))
const searchPlaceholder = computed(() => (te('dashboard_message_search_placeholder') ? t('dashboard_message_search_placeholder') : 'Type a name or email'))
const searchButtonLabel = computed(() => (te('dashboard_message_search_cta') ? t('dashboard_message_search_cta') : 'Search'))
const searchingLabel = computed(() => (te('dashboard_message_searching') ? t('dashboard_message_searching') : 'Searching...'))
const searchResultsLabel = computed(() => (te('dashboard_message_results_label') ? t('dashboard_message_results_label') : 'Organizer results'))
const noResultsLabel = computed(() => (te('dashboard_message_no_results') ? t('dashboard_message_no_results') : 'No organizers found.'))
const placeholderLabel = computed(() => (te('dashboard_message_placeholder') ? t('dashboard_message_placeholder') : 'Search for an organizer to start a conversation.'))
const recipientLabel = computed(() => (te('dashboard_message_recipient_label') ? t('dashboard_message_recipient_label') : 'Message to'))
const subjectLabel = computed(() => (te('dashboard_message_subject_label') ? t('dashboard_message_subject_label') : 'Subject'))
const subjectPlaceholder = computed(() => (te('dashboard_message_subject_placeholder') ? t('dashboard_message_subject_placeholder') : 'Add a short subject'))
const messageLabel = computed(() => (te('dashboard_message_body_label') ? t('dashboard_message_body_label') : 'Message'))
const messagePlaceholder = computed(() => (te('dashboard_message_body_placeholder') ? t('dashboard_message_body_placeholder') : 'Write your message here'))
const sendButtonLabel = computed(() => (te('dashboard_message_send_cta') ? t('dashboard_message_send_cta') : 'Send message'))
const sendingLabel = computed(() => (te('dashboard_message_sending') ? t('dashboard_message_sending') : 'Sending...'))
const searchErrorFallback = computed(() => (te('dashboard_message_search_error') ? t('dashboard_message_search_error') : 'We could not search for organizers right now. Please try again.'))
const missingFieldsMessage = computed(() => (te('dashboard_message_missing_fields') ? t('dashboard_message_missing_fields') : 'Please add a subject and message before sending.'))
const sendErrorFallback = computed(() => (te('dashboard_message_send_error') ? t('dashboard_message_send_error') : 'We could not send your message. Please try again.'))
const sendSuccessMessage = computed(() => (te('dashboard_message_send_success') ? t('dashboard_message_send_success') : 'Message sent successfully.'))

const inboxMessagesTitle = computed(() => (te('dashboard_inbox_messages_title') ? t('dashboard_inbox_messages_title') : 'Inbox messages'))
const refreshMessagesLabel = computed(() => (te('dashboard_inbox_refresh_label') ? t('dashboard_inbox_refresh_label') : 'Refresh'))
const refreshingMessagesLabel = computed(() => (te('dashboard_inbox_refreshing_label') ? t('dashboard_inbox_refreshing_label') : 'Refreshing...'))
const messagesEmptyLabel = computed(() => (te('dashboard_inbox_empty_label') ? t('dashboard_inbox_empty_label') : 'No messages yet.'))
const messagesErrorFallback = computed(() => (te('dashboard_inbox_error_label') ? t('dashboard_inbox_error_label') : 'We could not load your messages. Please try again.'))
const unreadLabel = computed(() => (te('dashboard_inbox_unread_label') ? t('dashboard_inbox_unread_label') : 'unread'))
const messageFromLabel = computed(() => (te('dashboard_inbox_from_label') ? t('dashboard_inbox_from_label') : 'From'))
const messageContextLabel = computed(() => (te('dashboard_inbox_context_label') ? t('dashboard_inbox_context_label') : 'Context'))
const messageSentLabel = computed(() => (te('dashboard_inbox_sent_label') ? t('dashboard_inbox_sent_label') : 'Received'))
const messageUpdatedLabel = computed(() => (te('dashboard_inbox_updated_label') ? t('dashboard_inbox_updated_label') : 'Updated:'))
const messageDetailPlaceholderLabel = computed(() => (te('dashboard_inbox_placeholder_label') ? t('dashboard_inbox_placeholder_label') : 'Select a message to read its contents.'))
const loadingMessagesLabel = computed(() => (te('dashboard_inbox_loading_label') ? t('dashboard_inbox_loading_label') : 'Loading messages...'))
const unknownSenderLabel = computed(() => (te('dashboard_inbox_unknown_sender_label') ? t('dashboard_inbox_unknown_sender_label') : 'System'))
const isSearchDisabled = computed(() => isSearching.value || searchTerm.value.trim().length === 0)
const formatLocation = (organizer: Organizer | null | undefined): string | null => {
  if (!organizer) {
    return null
  }

  const parts: string[] = []

  if (organizer.city) {
    parts.push(organizer.city)
  }

  if (organizer.countryCode) {
    parts.push(organizer.countryCode)
  }

  if (parts.length === 0) {
    return null
  }

  return parts.join(', ')
}

const selectedOrganizerId = computed(() => (selectedOrganizer.value ? selectedOrganizer.value.id : null))
const canSend = computed(() => messageSubject.value.trim().length > 0 && messageBody.value.trim().length > 0)
const selectedOrganizerLocation = computed(() => formatLocation(selectedOrganizer.value))

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

const formatMessageContext = (
  message: InboxMessage | null | undefined,
  fallback = 'N/A'
): string => {
  if (!message) {
    return fallback
  }

  const parts: string[] = []
  if (message.context) {
    parts.push(message.context)
  }

  if (message.contextId != null) {
    parts.push(`#${message.contextId}`)
  }

  if (parts.length === 0) {
    return fallback
  }

  return parts.join(' ')
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
    selectedMessageId.value = messages.value[0].id
  }

  markMessageAsReadLocally(selectedMessageId.value)
}

const selectMessage = (message: InboxMessage) => {
  selectedMessageId.value = message.id
  markMessageAsReadLocally(message.id)
}

const readPersistedState = (): InboxPersistedState | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as Partial<InboxPersistedState>
    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    const organizers = Array.isArray(parsed.organizers) ? parsed.organizers.filter(Boolean) as Organizer[] : []

    return {
      searchTerm: typeof parsed.searchTerm === 'string' ? parsed.searchTerm : '',
      organizers,
      selectedOrganizerId: parsed.selectedOrganizerId ?? null,
      hasSearched: Boolean(parsed.hasSearched),
    }
  } catch {
    return null
  }
}

const persistState = () => {
  if (typeof window === 'undefined') {
    return
  }

  const state: InboxPersistedState = {
    searchTerm: searchTerm.value,
    organizers: organizers.value.map((organizer) => ({ ...organizer })),
    selectedOrganizerId: selectedOrganizer.value ? selectedOrganizer.value.id : null,
    hasSearched: hasSearched.value,
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Swallow storage errors silently (e.g., quota exceeded, private mode)
  }
}

const restoreState = () => {
  const saved = readPersistedState()
  if (!saved) {
    return
  }

  searchTerm.value = saved.searchTerm ?? ''
  organizers.value = saved.organizers ?? []
  hasSearched.value = saved.hasSearched || organizers.value.length > 0 || searchTerm.value.trim().length > 0

  if (saved.selectedOrganizerId != null) {
    const match = organizers.value.find((item) => item.id === saved.selectedOrganizerId)
    if (match) {
      selectedOrganizer.value = { ...match }
    }
  }
}

onMounted(() => {
  restoreState()
  void fetchMessages()
})

const normalizeOrganizers = (payload: unknown): Organizer[] => {
  const items: unknown[] = []

  if (Array.isArray(payload)) {
    items.push(...payload)
  } else if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>
    if (Array.isArray(obj.organizers)) {
      items.push(...obj.organizers)
    } else if (Array.isArray(obj.data)) {
      items.push(...obj.data)
    }
  }

  return items
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null
      }
      const raw = entry as Record<string, unknown>
      const idCandidate = raw.id ?? raw.uuid ?? raw.organizer_id ?? raw.slug
      const nameCandidate = raw.name ?? raw.display_name ?? raw.title
      const emailCandidate = raw.email ?? raw.contact_email

      if (idCandidate == null || nameCandidate == null) {
        return null
      }

      const normalized: Organizer = {
        id: typeof idCandidate === 'string' || typeof idCandidate === 'number' ? idCandidate : String(idCandidate),
        name: typeof nameCandidate === 'string' ? nameCandidate : String(nameCandidate),
      }

      if (emailCandidate != null) {
        normalized.email =
          typeof emailCandidate === 'string'
            ? emailCandidate
            : String(emailCandidate)
      }

      if ('city' in raw && (raw.city === null || typeof raw.city === 'string')) {
        normalized.city = raw.city ?? null
      }

      if ('country_code' in raw && (raw.country_code === null || typeof raw.country_code === 'string')) {
        normalized.countryCode = raw.country_code ?? null
      }

      return normalized
	    })
	    .filter((entry): entry is Organizer => Boolean(entry))
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

      const idCandidate = raw.id ?? raw.message_id ?? raw.messageId
      const numericId =
        typeof idCandidate === 'number'
          ? idCandidate
          : Number.parseInt(String(idCandidate ?? ''), 10)

      if (!Number.isFinite(numericId)) {
        return null
      }

      const subjectCandidate = raw.subject
      const messageCandidate = raw.message

      if (typeof subjectCandidate !== 'string' || typeof messageCandidate !== 'string') {
        return null
      }

      const contextCandidate = raw.context
      const contextIdCandidate = raw.context_id ?? raw.contextId
      const fromUserCandidate = raw.from_user_id ?? raw.fromUserId
      const createdCandidate = raw.created_at ?? raw.createdAt
      const modifiedCandidate = raw.modified_at ?? raw.modifiedAt
      const isReadCandidate = raw.is_read ?? raw.isRead

      const createdAt = parseDateValue(createdCandidate)
      if (!createdAt) {
        return null
      }

      const modifiedAtValue = parseDateValue(modifiedCandidate)

      const contextId =
        contextIdCandidate == null
          ? null
          : typeof contextIdCandidate === 'number'
            ? contextIdCandidate
            : Number.parseInt(String(contextIdCandidate), 10)

      const fromUserId =
        fromUserCandidate == null
          ? null
          : typeof fromUserCandidate === 'number'
            ? fromUserCandidate
            : Number.parseInt(String(fromUserCandidate), 10)

      const normalizedContextId =
        typeof contextId === 'number' && Number.isFinite(contextId) ? contextId : null

      const normalizedFromUserId =
        typeof fromUserId === 'number' && Number.isFinite(fromUserId) ? fromUserId : null

      return {
        id: numericId,
        context: typeof contextCandidate === 'string' ? contextCandidate : '',
        contextId: normalizedContextId,
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

const fetchMessages = async (): Promise<void> => {
  messagesError.value = null
  messagesLoading.value = true

  try {
    const { data } = await apiFetch<unknown>('/api/admin/messages')
    messages.value = normalizeMessages(data)
    ensureMessageSelection()
  } catch (err: unknown) {
    messagesError.value = resolveErrorMessage(err, messagesErrorFallback.value)
    messages.value = []
    selectedMessageId.value = null
  } finally {
    messagesLoading.value = false
  }
}

const searchOrganizers = async () => {
  const query = searchTerm.value.trim()

  if (!query) {
    searchError.value = null
    organizers.value = []
    hasSearched.value = false
    clearComposer()
    persistState()
    return
  }

  searchError.value = null
  isSearching.value = true

  try {
    const endpoint = `/api/organizers?search=${encodeURIComponent(query)}`
    const { data } = await apiFetch<unknown>(endpoint)
    organizers.value = normalizeOrganizers(data) ?? []
    if (
      selectedOrganizer.value &&
      !organizers.value.some((item) => item.id === selectedOrganizer.value?.id)
    ) {
      clearComposer()
    }
  } catch (err: unknown) {
    searchError.value = resolveErrorMessage(err, searchErrorFallback.value)
    organizers.value = []
    clearComposer()
  } finally {
    isSearching.value = false
    hasSearched.value = true
    persistState()
  }
}

const selectOrganizer = (organizer: Organizer) => {
  clearComposer()
  selectedOrganizer.value = { ...organizer }
  persistState()
}

const sendMessage = async () => {
  if (!selectedOrganizer.value) {
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
      typeof selectedOrganizer.value.id === 'number'
        ? selectedOrganizer.value.id
        : Number.parseInt(String(selectedOrganizer.value.id), 10)
    const contextIdPayload =
      typeof rawContextId === 'number' && Number.isFinite(rawContextId)
        ? rawContextId
        : selectedOrganizer.value.id

    await apiFetch(`/api/admin/send-message`, {
      method: 'POST',
      body: JSON.stringify({
        context: 'organizer',
        context_id: contextIdPayload,
        subject: messageSubject.value.trim(),
        message: messageBody.value.trim(),
      }),
    })

    sendSuccess.value = sendSuccessMessage.value
    messageSubject.value = ''
    messageBody.value = ''
    await fetchMessages()
  } catch (err: unknown) {
    sendError.value = resolveErrorMessage(err, sendErrorFallback.value)
  } finally {
    isSending.value = false
    persistState()
  }
}
</script>

<style scoped lang="scss">
.events-page {
  @include form-page();
}

.dashboard-hero {
  @include form-hero(560px);
}

.dashboard-inbox {
  display: grid;
  width: 100%;
  gap: clamp(1.5rem, 3vw, 2.5rem);
  grid-template-columns: minmax(320px, 360px) minmax(0, 1fr);
  margin-top: clamp(2rem, 4vw, 3rem);
}

@media (max-width: 960px) {
  .dashboard-inbox {
    grid-template-columns: 1fr;
  }
}

.inbox-sidebar,
.inbox-content {
  background: var(--card-bg);
  border-radius: clamp(1rem, 2vw, 1.5rem);
  padding: clamp(1.25rem, 2.5vw, 1.75rem);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
}

.inbox-sidebar__title {
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.inbox-content {
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

.messages-panel {
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
  display: grid;
  gap: clamp(1rem, 2vw, 1.75rem);
  grid-template-columns: minmax(220px, 320px) minmax(0, 1fr);
}

@media (max-width: 960px) {
  .messages-panel__body {
    grid-template-columns: 1fr;
  }
}

.message-list-wrapper {
  max-height: 28rem;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.message-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  border: 1px solid transparent;
  background: var(--surface-muted);
  color: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.15s ease;
  text-align: left;
}

.message-card:hover {
  transform: translateY(-1px);
  border-color: var(--accent-primary);
  background: rgba(79, 70, 229, 0.12);
}

.message-card:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.message-card--active {
  border-color: var(--accent-primary);
  background: rgba(79, 70, 229, 0.18);
}

.message-card--unread {
  border-color: rgba(79, 70, 229, 0.35);
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
  color: var(--muted-text);
}

.message-card__preview {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted-text);
}

.message-card__meta {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--muted-text);
}

.message-list__loading,
.message-list__empty {
  margin: 0;
  padding: 0.85rem 1rem;
  border-radius: 0.85rem;
  background: var(--surface-muted);
  color: var(--muted-text);
  font-size: 0.9rem;
}

.message-detail {
  background: var(--surface-muted);
  border-radius: 1rem;
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
  color: var(--muted-text);
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
  color: var(--muted-text);
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
  color: var(--muted-text);
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
  max-height: 18rem;
  overflow-y: auto;
}

.message-detail__placeholder {
  flex: 1;
  display: grid;
  place-items: center;
  text-align: center;
  color: var(--muted-text);
  font-size: 0.95rem;
}

.composer-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.organizer-search {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.organizer-search__label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--muted-text);
}

.organizer-search__controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.organizer-search__controls input {
  flex: 1;
  padding: 0.7rem 1rem;
  border-radius: 0.85rem;
  border: 1px solid var(--input-border);
  background-color: var(--input-bg);
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.organizer-search__controls input:focus-visible {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.18);
  outline: none;
}

.organizer-search__controls button {
  border: none;
  border-radius: 0.85rem;
  padding: 0.7rem 1.4rem;
  font-weight: 600;
  background: var(--accent-primary);
  color: #fff;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}

.organizer-search__controls button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.organizer-search__controls button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.organizer-results {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  max-height: 24rem;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.organizer-results__empty {
  margin: 0;
  padding: 0.75rem;
  font-size: 0.9rem;
  color: var(--muted-text);
}

.organizer-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  border: 1px solid transparent;
  background: var(--surface-muted);
  color: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.15s ease;
  text-align: left;
}

.organizer-item__name {
  font-weight: 600;
  font-size: 0.95rem;
}

.organizer-item__email {
  font-size: 0.85rem;
  color: var(--muted-text);
}

.organizer-item__meta {
  font-size: 0.8rem;
  color: var(--muted-text);
}

.organizer-item:hover {
  border-color: var(--accent-primary);
  background: rgba(79, 70, 229, 0.12);
}

.organizer-item--active {
  border-color: var(--accent-primary);
  background: rgba(79, 70, 229, 0.18);
}

.inbox-placeholder {
  min-height: 240px;
  display: grid;
  place-items: center;
  text-align: center;
  color: var(--muted-text);
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
  color: var(--muted-text);
}

.message-recipient__name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

.message-recipient__email {
  font-size: 0.85rem;
  color: var(--muted-text);
}

.message-recipient__meta {
  font-size: 0.85rem;
  color: var(--muted-text);
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
