<!--
  src/component/event/editor/UranusEventPriceTab.vue
-->

<template>
  <section class="price-tab">

    <UranusCard class="ticket-options">
      <h2>{{ t('event_ticket_options') }}</h2>
      <UranusCheckbox
          v-model="draftTicketFlags"
          value="advance_ticket"
          id="event-advance-ticket"
          :label="t('event_advance_ticket')"
      />
      <UranusCheckbox
          v-model="draftTicketFlags"
          value="ticket_required"
          id="event-ticket-required"
          :label="t('event_ticket_required')"
      />
      <UranusCheckbox
          v-model="draftTicketFlags"
          value="on_site_ticket_sales"
          id="event-on-site-ticket-sales"
          :label="t('event_on_site_ticket_sales')"
      />
      <UranusCheckbox
          v-model="draftTicketFlags"
          value="registration_required"
          id="event-registration-required"
          :label="t('event_registration_required')"
      />
    </UranusCard>

    <UranusForm>
      <div class="dirty-indicator" v-if="isDirty">{{ t('unsaved_changes') }}</div>

      <UranusFormRow :cols="2" style="max-width: 600px;">

        <UranusLabel id="event-currency" :label="t('currency')">
          <UranusCurrencySelect v-model="draftEvent.currency" :placeholder="t('select_currency')" />
        </UranusLabel>

        <UranusLabel id="event-currency" :label="t('event_price_type')">
          <select v-model="draftEvent.priceType">
            <option value="not_specified">{{ t('event_price_not_specified') }}</option>
            <option value="free">{{ t('event_price_free') }}</option>
            <option value="donation">{{ t('event_price_donation') }}</option>
            <option value="regular_price">{{ t('event_price_regular') }}</option>
            <option value="tiered_prices">{{ t('event_price_tiered') }}</option>
          </select>
        </UranusLabel>

      </UranusFormRow>

      <UranusFormRow :cols="2" style="max-width: 600px;">
        <UranusNumberInput
            id="event-min-attendees"
            :label="t('event_min_price')"
            :min="0"
            v-model="draftEvent.minPrice!"
        />
        <UranusNumberInput
            id="event-max-attendees"
            :label="t('event_max_price')"
            :min="0"
            v-model="draftEvent.maxPrice!"
        />
      </UranusFormRow>

    </UranusForm>


    <div class="tab-actions">
      <UranusButton :disabled="store.saving || !isDirty" @click="resetTab">
        <template #icon><Undo /></template>
        {{ t('discard')}}
      </UranusButton>

      <UranusButton
          :disabled="store.saving || !isDirty"
          :loading="store.saving"
          loading-text="Saving..."
          @click="commitTab"
      >
        <template #icon><Save /></template>
        {{ t('save')}}
      </UranusButton>
    </div>

  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useUranusAdminEventStore } from '@/store/adminEventStore.ts'
import UranusCurrencySelect from '@/component/ui/UranusCurrencySelect.vue'
import { equalStringArrays } from '@/type/utils.ts'
import type {AdminEvent} from '@/domain/event/adminEvent.model.ts'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusLabel from '@/component/ui/UranusLabel.vue'
import UranusNumberInput from '@/component/ui/UranusNumberInput.vue'
import UranusCheckbox from '@/component/ui/UranusCheckbox.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import {Save, Undo} from 'lucide-vue-next'
import UranusButton from '@/component/ui/UranusButton.vue'

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
    draft: AdminEvent,
    original: AdminEvent
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

    const apiPath = `/api/admin/event/${draftEvent.value.uuid}/fields`
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
  max-width: var(--uranus-dashboard-content-width);

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

  .tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .dirty-indicator {
    color: #c00;
    font-weight: 500;
  }
}

.ticket-options {
  display: flex;
  gap: 0.5rem;
}
</style>