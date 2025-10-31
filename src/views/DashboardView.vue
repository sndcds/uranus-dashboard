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
    await apiFetch(`/api/admin/send-message`, {
      method: 'POST',
      body: JSON.stringify({
        context: 'organizer',
        context_id: selectedOrganizer.value.id,
        subject: messageSubject.value.trim(),
        message: messageBody.value.trim(),
      }),
    })

    sendSuccess.value = sendSuccessMessage.value
    messageSubject.value = ''
    messageBody.value = ''
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
  grid-template-columns: minmax(360px, 420px) minmax(0, 1fr);
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
