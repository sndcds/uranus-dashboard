<!--
  src/component/event/editor/UranusEventLinksEditor.vue

  2026-02-05, Roald
-->

<template>
  <h2>Web Links</h2>

  <section class="urls-tab">
    <div
        v-for="(url, index) in store.draft?.eventLinks ?? []"
        :key="index"
        class="event-url"
    >
      <input v-model="url.label" placeholder="Title" />

      <select v-model.number="url.type">
        <option :value="null" disabled>
          Select type
        </option>

        <option
            v-for="opt in urlTypeLookup"
            :key="opt.id"
            :value="opt.id"
        >
          {{ opt.label }}
        </option>
      </select>

      <input v-model="url.url" placeholder="URL" />

      <button
          v-if="store.draft?.eventLinks?.length && store.draft.eventLinks.length > 1"
          @click="removeUrl(index)"
          type="button"
      >
        Remove
      </button>
    </div>

    <button @click="addUrl" type="button">
      Add URL
    </button>

    <!-- Save / Discard buttons -->
    <div class="tab-actions">
      <button @click="resetUrlsTab" :disabled="store.saving || !isDirty">
        Discard
      </button>
      <button @click="commitUrlsTab" :disabled="store.saving || !isDirty">
        Save Tab
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import { UranusEventLink } from '@/domain/event/UranusEventLink.ts'
import { apiFetch } from '@/api.ts'
import { useUrlTypeLookupStore } from '@/store/uranusUrlTypesLookup.ts'

const { t, locale } = useI18n({ useScope: 'global' })
const store = useUranusAdminEventStore()
const urlTypeStore = useUrlTypeLookupStore()

const urlTypeLookup = computed(() => {
  const map =
      urlTypeStore.data['event']?.[locale.value] ?? {}

  return Object.entries(map)
      .map(([id, label]) => ({
        id: Number(id),
        label
      }))
      .sort((a, b) =>
          a.label.localeCompare(b.label, locale.value)
      )
})

// Initialize draft.eventUrls from original
onMounted(() => {
  if (store.draft) {
    store.draft.eventLinks =
        store.original?.eventLinks?.map(
            u => new UranusEventLink(u.label, u.type, u.url)
        ) ?? []
  }
})

// Dirty check
const isDirty = computed(() => {
  const draft = store.draft?.eventLinks ?? []
  const original = store.original?.eventLinks ?? []

  if (draft.length !== original.length) return true

  // Check if all entries match
  const isEqual = (a: UranusEventLink, b: UranusEventLink) =>
      a.label === b.label &&
      a.type === b.type &&
      a.url === b.url

  const allMatch = draft.every(d => original.some(o => isEqual(d, o)))
  const allOriginalMatch = original.every(o => draft.some(d => isEqual(d, o)))

  return !(allMatch && allOriginalMatch)
})

// Add new URL
function addUrl() {
  if (!store.draft) return
  if (!store.draft.eventLinks) store.draft.eventLinks = []
  store.draft.eventLinks.push(new UranusEventLink())
}

// Remove URL
function removeUrl(index: number) {
  if (!store.draft?.eventLinks) return
  store.draft.eventLinks.splice(index, 1)
}

// Helper to convert camelCase to snake_case
function toSnakeCase(str: string) {
  return str.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)
}

// Commit changes to API
async function commitUrlsTab() {
  if (!store.draft) return
  store.saving = true
  store.error = null

  try {
    const payload = store.draft.eventLinks?.map((u: UranusEventLink) => ({
      ['label']: u.label,
      ['type']: u.type != null ? Number(u.type) : 0,
      ['url']: u.url,
    })) ?? []

    const wrappedPayload = { event_links: payload }

    await apiFetch(`/api/admin/event/${store.draft.id}/urls`, {
      method: 'PUT',
      body: JSON.stringify(wrappedPayload),
    })

    // Commit locally
    store.original!.eventLinks = store.draft.eventLinks.map(
        u => new UranusEventLink(u.label, u.type, u.url)
    )
  } catch (err) {
    console.error(err)
    store.error = 'Failed to save event URLs'
  } finally {
    store.saving = false
  }
}

// Reset draft from original
function resetUrlsTab() {
  if (!store.draft) return
  store.draft.eventLinks = store.original?.eventLinks?.map(
      u => new UranusEventLink(u.label, u.type, u.url)
  ) ?? []
}
</script>

<style scoped lang="scss">
.urls-tab {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .event-url {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;

    input {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      border: 1px solid #ccc;
    }

    button {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      border: 1px solid #888;
      cursor: pointer;
      background: #f5f5f5;

      &:hover {
        background: #e0e0e0;
      }
    }
  }

  .tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;

    button {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: 2px solid #888;
      background-color: #f5f5f5;
      cursor: pointer;

      &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    }
  }
}
</style>