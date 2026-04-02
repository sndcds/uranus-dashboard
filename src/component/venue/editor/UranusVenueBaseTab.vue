<!--
  src/component/event/editor/UranusVenuenBaseTab.vue

  2026-02-08, Roald
-->

<template>
  <UranusForm>

    <UranusFormRow>
      <UranusTextfield id="venue-name" size="big" :label="t('name')" v-model="venue.name" required/>
    </UranusFormRow>

    <UranusFormRow>
      <UranusLabel id="venue-description" :label="t('description')">
        <UranusTextEditor v-model="venue.description"/>
      </UranusLabel>
    </UranusFormRow>

    <UranusFormRow :cols="2">
      <UranusDateInput id="venue-opened-at" :label="t('opened_at')" v-model="venue.openedAt"/>
      <UranusDateInput id="venue-closed-at" :label="t('closed_at')" v-model="venue.closedAt"/>
    </UranusFormRow>

    <UranusFormRow :cols="2">
      <UranusLabel id="venue-type" :label="t('venue_type')">
        <UranusVenueTypeSelect v-model="venue.type" />
      </UranusLabel>
      <UranusTextfield id="venue-web-link" type="url" :label="t('website')" v-model="venue.webLink" placeholder="https://"/>
    </UranusFormRow>

    <UranusFormRow :cols="2">
      <UranusTextfield id="venue-email" type="email" :label="t('email')" v-model="venue.contactEmail" />
      <UranusTextfield id="venue-phone" :label="t('phone')" v-model="venue.contactPhone" />
    </UranusFormRow>

    <UranusFormRow :cols="2">
      <UranusTextfield id="venue-street" :label="t('street')" v-model="venue.street" />
      <UranusTextfield id="venue-house-number" :label="t('house_number')" v-model="venue.houseNumber" />
    </UranusFormRow>

    <UranusFormRow :cols="2">
      <UranusTextfield id="venue-postal-code" :label="t('postal_code')" v-model="venue.postalCode" />
      <UranusTextfield id="ve ue-city" :label="t('city')" v-model="venue.city" />
    </UranusFormRow>

    <UranusFormRow :cols="2">
      <UranusLabel id="venue-country" :label="t('country')">
        <UranusCountrySelect  v-model="venue.country" />
      </UranusLabel>
      <UranusLabel id="venue-state" :label="t('state')">
        <UranusStateSelect v-model="venue.state" :country-code="venue.country" />
      </UranusLabel>
    </UranusFormRow>

    <UranusFormActions>
      <UranusButton @click="resetTab" :disabled="store.saving || !isDirty">{{ t('discard') }}</UranusButton>
      <UranusButton @click="commitTab" :disabled="store.saving || !isDirty">{{ t('save') }}</UranusButton>
    </UranusFormActions>

  </UranusForm>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import { useUranusVenueStore } from '@/store/UranusVenueStore.ts'
import type { VenueModel } from '@/domain/venue/venue.model.ts'
import UranusCountrySelect from '@/component/select/UranusCountrySelect.vue'
import UranusStateSelect from "@/component/select/UranusStateSelect.vue";
import UranusVenueTypeSelect from "@/component/select/UranusVenueTypeSelect.vue";
import UranusForm from "@/component/ui/UranusForm.vue";
import UranusFormRow from "@/component/ui/UranusFormRow.vue";
import UranusTextfield from "@/component/ui/UranusTextfield.vue";
import UranusLabel from "@/component/ui/UranusLabel.vue";
import UranusTextEditor from "@/component/ui/UranusTextEditor.vue";
import UranusDateInput from "@/component/ui/UranusDateInput.vue";
import UranusFormActions from "@/component/ui/UranusFormActions.vue";
import UranusButton from "@/component/ui/UranusButton.vue";

const { t } = useI18n({ useScope: 'global' })

const store = useUranusVenueStore()
const venue = computed(() => store.draft!)

const baseFields = [
  'name', 'description', 'type', 'contactEmail', 'contactPhone', 'webLink',
  'street', 'houseNumber', 'postalCode', 'city', 'state', 'country', 'openedAt', 'closedAt',
] as const

const normalize = (val: string | null | undefined) =>
    val === '' || val == null ? null : val

const isDirty = computed(() => {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return false

  return baseFields.some(key => {
    const draftVal = normalize(draft[key])
    const origVal = normalize(original[key])
    return draftVal !== origVal
  })
})


function buildPayload(
    draft: VenueModel,
    original: VenueModel
) {
  const payload: Record<string, any> = {}

  const set = (key: string, value: any) => {
    payload[key] = value === '' ? null : value
  }

  if (draft.name !== original.name) set('name', draft.name)
  if (draft.description !== original.description) set('description', draft.description)
  if (draft.type !== original.type) set('type', draft.type)
  if (draft.contactEmail !== original.contactEmail) set('contact_email', draft.contactEmail)
  if (draft.contactPhone !== original.contactPhone) set('contact_phone', draft.contactPhone)
  if (draft.webLink !== original.webLink) set('web_link', draft.webLink)

  if (draft.street !== original.street) set('street', draft.street)
  if (draft.houseNumber !== original.houseNumber) set('house_number', draft.houseNumber)
  if (draft.postalCode !== original.postalCode) set('postal_code', draft.postalCode)
  if (draft.city !== original.city) set('city', draft.city)
  if (draft.state !== original.state) set('state', draft.state)
  if (draft.country !== original.country) set('country', draft.country)

  if (draft.openedAt !== original.openedAt) set('opened_at', draft.openedAt)
  if (draft.closedAt !== original.closedAt) set('closed_at', draft.closedAt)

  return payload
}

function copyFields(source: VenueModel, target: VenueModel) {
  target.name = source.name ?? null
  target.description = source.description ?? null
  target.type = source.type ?? null
  target.contactEmail = source.contactEmail ?? null
  target.contactPhone = source.contactPhone ?? null
  target.webLink = source.webLink ?? null
  target.street = source.street ?? null
  target.houseNumber = source.houseNumber ?? null
  target.postalCode = source.postalCode ?? null
  target.city = source.city ?? null
  target.state = source.state ?? null
  target.country = source.country ?? null
  target.openedAt = source.openedAt ?? null
  target.closedAt = source.closedAt ?? null
}

async function commitTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return

  store.saving = true
  store.error = null

  try {
    const payload = buildPayload(draft, original)
    if (Object.keys(payload).length === 0) {
      store.saving = false
      return
    }

    const apiPath = `/api/admin/venue/${draft.uuid}/fields`
    await apiFetch(apiPath, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    copyFields(draft, original)
  } catch (err) {
    store.error = 'Failed to save venue details'
    console.error(err)
  } finally {
    store.saving = false
  }
}

function resetTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return
  copyFields(original, draft)
}
</script>