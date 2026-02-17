<!--
  src/component/event/editor/UranusOrganizationBaseTab.vue

  2026-02-08, Roald
-->

<template>
  <section class="uranus-admin-edit-section uranus-admin-responsive-grid">

    legalForm: {{ org.legalForm }}
    <label class="full-width">
      Name
      <input class="big"
          type="text"
          v-model="org.name"
          required
      />
    </label>

    <label class="full-width">
      Description
      <textarea v-model="org.description" />
    </label>

    <label>
      Legal form
      <UranusLegalFormSelect v-model="org.legalForm" />
    </label>

    <label>
      Website
      <input
          type="url"
          v-model="org.websiteLink"
          placeholder="https://"
      />
    </label>

    <label>
      Contact Email
      <input
          type="email"
          v-model="org.contactEmail"
      />
    </label>

    <label>
      Contact Phone
      <input
          type="tel"
          v-model="org.contactPhone"
      />
    </label>

    <label class="start-new-row">
      Street
      <input type="text" v-model="org.street" />
    </label>

    <label>
      House Number
      <input type="text" v-model="org.houseNumber" />
    </label>

    <label class="full-width">
      Address Addition
      <input type="text" v-model="org.addressAddition" />
    </label>

    <label class="start-new-row">
      Postal Code
      <input type="text" v-model="org.postalCode" />
    </label>

    <label>
      City
      <input type="text" v-model="org.city" />
    </label>

    <label>
      Country
      <UranusCountrySelect  v-model="org.country" />
    </label>

    <label>
      State
      <UranusStateSelect
          v-model="org.state"
          :country-code="org.country"
      />
    </label>

    <!-- Actions -->
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
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import { useUranusOrganizationStore } from '@/store/uranusOrganizationStore.ts'
import type { UranusOrganization } from '@/domain/organization/UranusOrganization'
import UranusCountrySelect from '@/component/select/UranusCountrySelect.vue'
import UranusStateSelect from '@/component/select/UranusStateSelect.vue'
import UranusLegalFormSelect from '@/component/select/UranusLegalFormSelect.vue'

const { t } = useI18n({ useScope: 'global' })

const store = useUranusOrganizationStore()
const org = computed(() => store.draft!)

const baseFields = [
  'name', 'description', 'legalForm', 'contactEmail', 'contactPhone', 'websiteLink',
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
  if (draft.websiteLink !== original.websiteLink) set('website_link', draft.websiteLink)

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
  target.websiteLink = source.websiteLink ?? null
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
  console.log("draft:", draft.addressAddition, "original:", original.addressAddition)

  store.saving = true
  store.error = null

  try {
    const payload = buildPayload(draft, original)
    if (Object.keys(payload).length === 0) {
      store.saving = false
      return
    }

    const apiPath = `/api/admin/organization/${draft.id}/fields`
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