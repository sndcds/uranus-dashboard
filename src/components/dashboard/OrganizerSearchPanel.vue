<template>
  <section class="uranus-card">
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
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

interface Organizer {
  id: string | number;
  name: string;
  email?: string;
  city?: string | null;
  countryCode?: string | null;
}

const props = defineProps<{
  selectedOrganizerId: string | number | null;
}>()

const emit = defineEmits<{
  select: [Organizer];
  'state-change': [{ searchTerm: string; organizers: Organizer[]; hasSearched: boolean }];
}>()

const { t } = useI18n()

const searchTerm = ref('')
const organizers = ref<Organizer[]>([])
const isSearching = ref(false)
const hasSearched = ref(false)
const searchError = ref<string | null>(null)

const inboxTitle = computed(() => t('message_send_title'))
const searchLabel = computed(() => t('message_search_label'))
const searchPlaceholder = computed(() => t('message_search_placeholder'))
const searchButtonLabel = computed(() => t('message_search_cta'))
const searchingLabel = computed(() => t('message_searching'))
const searchResultsLabel = computed(() => t('message_results_label'))
const noResultsLabel = computed(() => t('message_no_results'))
const searchErrorFallback = computed(() => t('message_search_error'))

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

const emitState = () => {
  emit('state-change', {
    searchTerm: searchTerm.value,
    organizers: organizers.value.slice(),
    hasSearched: hasSearched.value,
  })
}

const searchOrganizers = async () => {
  const query = searchTerm.value.trim()

  if (!query) {
    searchError.value = null
    organizers.value = []
    hasSearched.value = false
    emitState()
    return
  }

  searchError.value = null
  isSearching.value = true

  try {
    const endpoint = `/api/organizers?search=${encodeURIComponent(query)}`
    const { data } = await apiFetch<unknown>(endpoint)
    organizers.value = normalizeOrganizers(data) ?? []
  } catch (err: unknown) {
    searchError.value = resolveErrorMessage(err, searchErrorFallback.value)
    organizers.value = []
  } finally {
    isSearching.value = false
    hasSearched.value = true
    emitState()
  }
}

const selectOrganizer = (organizer: Organizer) => {
  emit('select', organizer)
  emitState()
}

const restoreOrganizers = (initial: Organizer[]) => {
  organizers.value = initial
  emitState()
}

defineExpose({
  restoreOrganizers,
  setSearchTerm: (value: string) => {
    searchTerm.value = value
    emitState()
  },
  getSearchTerm: () => searchTerm.value,
  setHasSearched: (value: boolean) => {
    hasSearched.value = value
    emitState()
  },
  getOrganizers: () => organizers.value.slice(),
  getHasSearched: () => hasSearched.value,
})
</script>

<style scoped lang="scss">
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
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.25);
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
  transform: translateY(-1px);
  border-color: var(--accent-primary);
  background: rgba(79, 70, 229, 0.12);
}

.organizer-item--active {
  border-color: var(--accent-primary);
  background: rgba(79, 70, 229, 0.18);
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
