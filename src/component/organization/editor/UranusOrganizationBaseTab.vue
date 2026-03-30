<!--
  src/component/event/editor/UranusOrganizationBaseTab.vue

  2026-02-08, Roald
-->

<template>
  <UranusForm>

    <UranusFormRow>
      <UranusTextfield id="org-name" size="big" :label="t('name')" v-model="org.name" required/>
    </UranusFormRow>

    <UranusFormRow>
      <UranusLabel id="org-description" :label="t('description')">
        <UranusTextEditor v-model="org.description"/>
      </UranusLabel>
    </UranusFormRow>

    <UranusFormRow :cols="2">
      <UranusLabel id="org-legal-form" :label="t('legal_form')">
        <UranusLegalFormSelect v-model="org.legalForm" />
      </UranusLabel>
      <UranusTextfield id="org-web-link" type="url" :label="t('website')" v-model="org.webLink" placeholder="https://"/>
    </UranusFormRow>

    <UranusFormRow :cols="2">
      <UranusTextfield id="org-email" type="email" :label="t('email')" v-model="org.contactEmail" />
      <UranusTextfield id="org-phone":label="t('phone')" v-model="org.contactPhone" />
    </UranusFormRow>

    <UranusFormRow :cols="2">
      <UranusTextfield id="org-street" :label="t('street')" v-model="org.street" />
      <UranusTextfield id="org-house-number" :label="t('house_number')" v-model="org.houseNumber" />
    </UranusFormRow>

    <UranusFormRow>
      <UranusTextfield id="org-address-addition" :label="t('address_addition')" v-model="org.addressAddition" />
    </UranusFormRow>

    <UranusFormRow :cols="2">
      <UranusTextfield id="org-postal-code" :label="t('postal_code')" v-model="org.postalCode" />
      <UranusTextfield id="org-city" :label="t('city')" v-model="org.city" />
    </UranusFormRow>

    <UranusFormRow :cols="2">
      <UranusLabel id="org-country" :label="t('country')">
        <UranusCountrySelect  v-model="org.country" />
      </UranusLabel>
      <UranusLabel id="org-state" :label="t('state')">
        <UranusStateSelect v-model="org.state" :country-code="org.country" />
      </UranusLabel>
    </UranusFormRow>

    <UranusFormActions>
      <UranusButton @click="resetTab" :disabled="store.saving || !isDirty">
        {{ t('discard') }}
      </UranusButton>
      <UranusButton @click="commitTab" :disabled="store.saving || !isDirty">
        {{ t('save') }}
      </UranusButton>
    </UranusFormActions>

  </UranusForm>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import { useUranusOrganizationStore } from '@/store/uranusOrganizationStore.ts'
import type { OrganizationModel } from '@/domain/organization/organization.model.ts'
import UranusCountrySelect from '@/component/select/UranusCountrySelect.vue'
import UranusStateSelect from '@/component/select/UranusStateSelect.vue'
import UranusLegalFormSelect from '@/component/select/UranusLegalFormSelect.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusTextEditor from '@/component/ui/UranusTextEditor.vue'
import UranusLabel from '@/component/ui/UranusLabel.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusButton from '@/component/ui/UranusButton.vue'

const { t } = useI18n({ useScope: 'global' })

const store = useUranusOrganizationStore()
const org = computed(() => store.draft!)

const baseFields = [
  'name', 'description', 'legalForm', 'contactEmail', 'contactPhone', 'webLink',
    'street', 'houseNumber', 'addressAddition', 'postalCode', 'city', 'state', 'country',
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
    draft: OrganizationModel,
    original: OrganizationModel
) {
  const payload: Record<string, any> = {}

  const set = (key: string, value: any) => {
    payload[key] = value === '' ? null : value
  }

  if (draft.name !== original.name) set('name', draft.name)
  if (draft.description !== original.description) set('description', draft.description)
  if (draft.legalForm !== original.legalForm) set('legal_form', draft.legalForm)
  if (draft.contactEmail !== original.contactEmail) set('contact_email', draft.contactEmail)
  if (draft.contactPhone !== original.contactPhone) set('contact_phone', draft.contactPhone)
  if (draft.webLink !== original.webLink) set('web_link', draft.webLink)

  if (draft.street !== original.street) set('street', draft.street)
  if (draft.houseNumber !== original.houseNumber) set('house_number', draft.houseNumber)
  if (draft.addressAddition !== original.addressAddition) set('address_addition', draft.addressAddition)
  if (draft.postalCode !== original.postalCode) set('postal_code', draft.postalCode)
  if (draft.city !== original.city) set('city', draft.city)
  if (draft.state !== original.state) set('state', draft.state)
  if (draft.country !== original.country) set('country', draft.country)

  return payload
}

function copyFields(source: OrganizationModel, target: OrganizationModel) {
  target.name = source.name ?? null
  target.description = source.description ?? null
  target.legalForm = source.legalForm ?? null
  target.contactEmail = source.contactEmail ?? null
  target.contactPhone = source.contactPhone ?? null
  target.webLink = source.webLink ?? null
  target.street = source.street ?? null
  target.houseNumber = source.houseNumber ?? null
  target.addressAddition = source.addressAddition ?? null
  target.postalCode = source.postalCode ?? null
  target.city = source.city ?? null
  target.state = source.state ?? null
  target.country = source.country ?? null
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

    const apiPath = `/api/admin/organization/${draft.uuid}/fields`
    await apiFetch(apiPath, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    copyFields(draft, original)
  } catch (err) {
    store.error = 'Failed to save organization details'
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
