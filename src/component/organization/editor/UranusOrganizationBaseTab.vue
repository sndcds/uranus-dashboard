<!--
  src/component/event/editor/UranusOrganizationBaseTab.vue

  2026-02-08, Roald
-->

<template>
  <section class="base-tab">
    <UranusForm>

      <UranusFormRow>
        <UranusTextfield id="event-title" size="big" :label="t('title')" v-model="org.name" required/>
      </UranusFormRow>

      <UranusFormRow>
        <UranusLabel id="organization-description" :label="t('description')">
          <UranusTextEditor v-model="org.description"/>
        </UranusLabel>
      </UranusFormRow>

      <UranusFormRow :cols="2">
        <UranusLabel id="organization-legal-form" :label="t('legal_form')">
          <UranusLegalFormSelect v-model="org.legalForm" />
        </UranusLabel>
        <UranusTextfield id="organization-website" type="url" :label="t('website')" v-model="org.webLink"/>
      </UranusFormRow>

      <UranusFormRow :cols="2">
        <UranusTextfield id="organization-email" :label="t('email')" v-model="org.contactEmail" />
        <UranusTextfield id="organization-phone" type="email" :label="t('phone')" v-model="org.contactPhone" />
      </UranusFormRow>

      <UranusFormRow :cols="2">
        <UranusTextfield id="organization-street" :label="t('street')" v-model="org.street" />
        <UranusTextfield id="organization-house-number" :label="t('house_number')" v-model="org.houseNumber" />
      </UranusFormRow>

      <UranusFormRow>
        <UranusTextfield id="organization-address-addition" type="email" :label="t('address_addition')" v-model="org.addressAddition" />
      </UranusFormRow>

      <UranusFormRow :cols="2">
        <UranusTextfield id="organization-postal-code" :label="t('postal_code')" v-model="org.postalCode" />
        <UranusTextfield id="organization-city" :label="t('city')" v-model="org.city" />
      </UranusFormRow>

      <UranusFormRow :cols="2">
        <UranusLabel id="organization-country" :label="t('country')">
          <UranusCountrySelect  v-model="org.country" />
        </UranusLabel>
        <UranusLabel id="organization-state" :label="t('state')">
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
  </section>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import { useUranusOrganizationStore } from '@/store/uranusOrganizationStore.ts'
import type { UranusOrganization } from '@/domain/organization/UranusOrganization'
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
    draft: UranusOrganization,
    original: UranusOrganization
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

function copyFields(source: UranusOrganization, target: UranusOrganization) {
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


<style scoped lang="scss">
.organization-contact-tab {
  width: 100%;
  max-width: 1024px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  label {
    display: flex;
    flex-direction: column;
    font-weight: 500;
    color: #999;
    gap: 0.25rem;

    input,
    textarea {
      padding: 0.5rem;
      border: 2px solid #fff;
      border-radius: 5px;
      font-size: 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }
  }

  .tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
  }
}
</style>