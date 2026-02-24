<!--
  src/component/event/editor/AdminEventPriceTab.vue

  2026-02-05, Roald
-->

<template>
  <section class="price-tab">
    <!-- Dirty indicator -->
    <div class="dirty-indicator" v-if="isDirty">{{ t('unsaved_changes') }}</div>

    <label>
      {{ t('currency') }}
      <UranusCurrencySelect v-model="draftEvent.currency" :placeholder="t('select_currency')" />
    </label>

    <!-- Price Type -->
    <label>
      {{ t('event_price_type') }}
      <select v-model="draftEvent.priceType">
        <option value="not_specified">{{ t('event_price_not_specified') }}</option>
        <option value="regular_price">{{ t('event_price_regular') }}</option>
        <option value="free">{{ t('event_price_free') }}</option>
        <option value="donation">{{ t('event_price_donation') }}</option>
        <option value="tiered_prices">{{ t('event_price_tiered') }}</option>
      </select>
    </label>

    <!--label>
      {{ t('currency') }}
      <input type="text" maxlength="3" v-model="draftEvent.currency" placeholder="EUR, USD…" />
    </label-->

    <label>
      {{ t('event_min_price') }}
      <input type="number" step="0.01" :value="draftEvent.minPrice ?? ''" @input="e => draftEvent.minPrice = parseFloatOrNull(e)" />
    </label>

    <label>
      {{ t('event_max_price') }}
      <input type="number" step="0.01" :value="draftEvent.maxPrice ?? ''" @input="e => draftEvent.maxPrice = parseFloatOrNull(e)" />
    </label>

    <div class="field">
      <span>{{ t('event_ticket_information') }}</span>
      <div class="checkbox-group">
        <label>
          <input type="checkbox" value="advance_ticket" v-model="draftTicketFlags" />
          {{ t('event_advance_ticket') }}
        </label>
        <label>
          <input type="checkbox" value="ticket_required" v-model="draftTicketFlags" />
          {{ t('event_ticket_required') }}
        </label>
        <label>
          <input type="checkbox" value="on_site_ticket_sales" v-model="draftTicketFlags" />
          {{ t('event_on_site_ticket_sales') }}
        </label>
        <label>
          <input type="checkbox" value="registration_required" v-model="draftTicketFlags" />
          {{ t('event_registration_required') }}
        </label>
      </div>
    </div>

    <div class="tab-actions">
      <button @click="resetTab" :disabled="store.saving || !isDirty">
        {{ t('discard') }}
      </button>
      <button @click="commitTab" :disabled="store.saving || !isDirty">
        {{ t('save') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import UranusCurrencySelect from '@/component/ui/UranusCurrencySelect.vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { equalStringArrays } from '@/type/utils.ts'
import type {UranusAdminEvent} from '@/domain/event/UranusAdminEvent.ts'

const { t } = useI18n({ useScope: 'global' })
const store = useUranusAdminEventStore()
const draftEvent = computed(() => store.draft!)

const draftTicketFlags = computed({
  get: () => draftEvent.value.ticketFlags ?? [],
  set: (val: string[]) => {
    draftEvent.value.ticketFlags = val.length ? val : null
  },
})

// Fields tracked for this tab
const priceFields = [
  'priceType',
  'minPrice',
  'maxPrice',
  'currency',
  'ticketFlags',
] as const

const isDirty = computed(() => {
  const draftVal = store.draft
  const original = store.original
  if (!draftVal || !original) return false

  return priceFields.some((key) => {
    return JSON.stringify(draftVal[key]) !== JSON.stringify(original[key])
  })
})

function parseFloatOrNull(e: Event): number | null {
  const target = e.target as HTMLInputElement
  return target.value === '' ? null : parseFloat(target.value)
}

function buildPayload(
    draft: UranusAdminEvent,
    original: UranusAdminEvent
) {
  const payload: Record<string, any> = {}

  if (draft.priceType !== original.priceType) { payload.price_type = draft.priceType }
  if (draft.minPrice !== original.minPrice) { payload.min_price = draft.minPrice }
  if (draft.maxPrice !== original.maxPrice) { payload.max_price = draft.maxPrice }
  if (draft.currency !== original.currency) { payload.currency = draft.currency }
  if (!equalStringArrays(draft.ticketFlags, original.ticketFlags)) { payload.ticket_flags = draft.ticketFlags }

  console.log(JSON.stringify(payload, null, 2))
  return payload
}


// Commit changes
async function commitTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return
  store.saving = true
  store.error = null

  try {
    const payload = buildPayload(draft, original)
    if (Object.keys(payload).length === 0) return

    const apiPath = `/api/admin/event/${draftEvent.value.id}/fields`
    await apiFetch(apiPath, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    // Commit locally
    original.priceType = draft.priceType ?? null
    original.minPrice = draft.minPrice ?? null
    original.maxPrice = draft.maxPrice ?? null
    original.currency = draft.currency ?? null
    original.ticketFlags = draft.ticketFlags ?? null
  } catch (err) {
    store.error = t('failed_to_save_tab')
    console.error(err)
  } finally {
    store.saving = false
  }
}

// Reset tab
function resetTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return

  draft.priceType = original.priceType ?? null
  draft.minPrice = original.minPrice ?? null
  draft.maxPrice = original.maxPrice ?? null
  draft.currency = original.currency ?? null
  draft.ticketFlags = original.ticketFlags ?? null
}
</script>

<style lang="scss" scoped>
.price-tab {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;

  label {
    display: flex;
    flex-direction: column;
    font-weight: 500;
    gap: 0.25rem;

    input,
    select {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      width: 100%;
      box-sizing: border-box;
    }

    select {
      cursor: pointer;
    }
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;

    button {
      padding: 0.5rem 1rem;
      cursor: pointer;
      border-radius: 4px;
      border: 1px solid #888;
      background-color: #f5f5f5;

      &:hover:not(:disabled) {
        background-color: #e0e0e0;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
  }

  .dirty-indicator {
    color: #c00;
    font-weight: 500;
  }
}
</style>