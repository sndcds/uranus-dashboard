<!--
  UranusEditEventParticipationInfos.vue
-->
<template>
  <UranusInlineEditSection :active="isEditing">
    <UranusInlineEditLabel
        :label-text="t('event_participation_info')"
        :edit-button-text="t('edit')"
        @edit-started="onStartEdit"
    />

    <!-- Edit form -->
    <div v-if="isEditing">
      <UranusInlineSectionLayout>
        <UranusTextarea
            id="participation_info"
            v-model.trim="draft.participationInfo"
            :label="t('event_participation_info_text')"
        />

        <UranusTextarea
            id="meeting_point"
            v-model.trim="draft.meetingPoint"
            :label="t('event_meeting_point')"
        />
      </UranusInlineSectionLayout>

      <UranusInlineSectionLayout>
        <div class="uranus-grid-4">
          <UranusNumberInput
              id="min_age"
              v-model.number="draft.minAge"
              :label="t('event_min_age')"
          />
          <UranusNumberInput
              id="max_age"
              v-model.number="draft.maxAge"
              :label="t('event_max_age')"
          />
          <UranusNumberInput
              id="max_attendees"
              v-model.number="draft.maxAttendees"
              :label="t('event_max_attendees')"
          />
        </div>

        <div class="uranus-grid-4">
          <UranusPriceTypeSelect v-model="draft.priceType" />
          <UranusCurrencySelect v-model="draft.currency" />
          <UranusNumberInput
              id="min_price"
              v-model.number="draft.minPrice"
              :label="t('event_min_price')"
          />
          <UranusNumberInput
              id="max_price"
              v-model.number="draft.maxPrice"
              :label="t('event_max_price')"
          />
          <UranusEventOccasionSelect v-model="draft.occasionTypeId" />
          <UranusCheckboxButton
              id="ticket_advance"
              v-model="draft.ticketAdvance"
              :label="t('event_ticket_advance')"
          />
          <UranusCheckboxButton
              id="ticket_required"
              v-model="draft.ticketRequired"
              :label="t('event_ticket_required')"
          />
          <UranusCheckboxButton
              id="registration_required"
              v-model="draft.registrationRequired"
              :label="t('event_registration_required')"
          />
        </div>

        <UranusInlineEditActions
            :isSaving="isSaving"
            :canSave="canSave"
            @save="onSave"
            @cancel="onCancel"
        />
      </UranusInlineSectionLayout>
    </div>

    <!-- Display mode -->
    <div v-else>
      <span><strong>{{ t('event_age') }}:</strong> {{ ageDescription }}</span><br>
      <span><strong>{{ t('event_max_attendees') }}:</strong> {{ event?.maxAttendees }}</span><br>
      <span><strong>{{ t('event_price') }}:</strong> {{ priceDescription }}</span><br>
      <span><strong>{{ t('event_ticket_advance') }}:</strong> {{ event?.ticketAdvance ? capitalizeFirst(t('yes')) : capitalizeFirst(t('no')) }}</span><br>
      <span><strong>{{ t('event_ticket_required') }}:</strong> {{ event?.ticketRequired ? capitalizeFirst(t('yes')) : capitalizeFirst(t('no')) }}</span><br>
      <span><strong>{{ t('event_registration_required') }}:</strong> {{ event?.registrationRequired ? capitalizeFirst(t('yes')) : capitalizeFirst(t('no')) }}</span><br>

      <p><strong>{{ t('event_participation_info_text') }}:</strong><br>
        {{ draft.participationInfo }}
      </p>
      <p><strong>{{ t('event_meeting_point') }}:</strong><br>
        {{ event?.meetingPoint }}
      </p>
      <p><strong>{{ t('event_price_type') }}:</strong> {{ priceTypeText }}</p>
      <p><strong>{{ t('event_occasion_type') }}:</strong> {{ event?.occasionTypeId }}</p>
    </div>
  </UranusInlineEditSection>
</template>

<script setup lang="ts">
import { ref, reactive, computed, inject, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'

import type { UranusEventDetail } from '@/model/uranusAdminEventModel.ts'
import UranusInlineEditSection from '@/component/ui/UranusInlineEditSection.vue'
import UranusInlineEditLabel from '@/component/ui/UranusInlineEditLabel.vue'
import UranusInlineEditActions from '@/component/ui/UranusInlineEditActions.vue'
import UranusInlineSectionLayout from '@/component/ui/UranusInlineSectionLayout.vue'
import UranusTextInput from '@/component/ui/UranusTextInput.vue'
import UranusCheckboxButton from '@/component/ui/UranusCheckboxButton.vue'
import UranusTextarea from "@/component/ui/UranusTextarea.vue";
import UranusPriceTypeSelect from "@/component/selects/UranusPriceTypeSelect.vue";
import UranusCurrencySelect from "@/component/selects/UranusCurrencySelect.vue";
import UranusEventOccasionSelect from "@/component/selects/UranusEventOccasionSelect.vue";
import { uranusAgeText, uranusPriceText } from '@/util/UranusStringUtils.ts'
import UranusNumberInput from "@/component/ui/UranusNumberInput.vue";

const { t } = useI18n({ useScope: 'global' })
const { locale } = useI18n({ useScope: 'global' })

const event = inject<Ref<UranusEventDetail | null>>('event')
const eventId = computed(() => event?.value?.id)

const isEditing = ref(false)
const isSaving = ref(false)
const canSave = computed(() => !isSaving.value)

// Computed property to translate price type
const priceTypeText = computed(() => {
  if (!event?.value) return ''

  switch (event.value.priceType) {
    case 0: return t('event_price_type_not_specified')
    case 1: return t('event_price_type_regular')
    case 2: return t('event_price_type_free')
    case 3: return t('event_price_type_donation')
    default: return ''
  }
})

// --- UI model (camelCase) ---
const draft = reactive({
  participationInfo: event?.value?.participationInfo ?? '',
  meetingPoint: event?.value?.meetingPoint ?? '',
  minAge: event?.value?.minAge ?? undefined,
  maxAge: event?.value?.maxAge ?? undefined,
  maxAttendees: event?.value?.maxAttendees ?? undefined,
  priceType: event?.value?.priceType ?? null,
  minPrice: event?.value?.minPrice ?? undefined,
  maxPrice: event?.value?.maxPrice ?? undefined,
  occasionTypeId: event?.value?.occasionTypeId ?? null,
})

const ageDescription = computed(() =>
    uranusAgeText(t, draft.minAge, draft.maxAge)
)

const priceDescription = computed(() =>
    uranusPriceText(t, draft.minPrice, draft.maxPrice, locale.value, draft.currency)
)

function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function onStartEdit() {
  if (!event?.value) return
  Object.assign(draft, { ...event.value })
  isEditing.value = true
}

function onCancel() {
  if (!event?.value) return
  Object.assign(draft, { ...event.value })
  isEditing.value = false
}

const toNullOrNumber = (v: number | undefined): number | null => v === undefined ? null : v
const toNullOrFloat = (v: number | undefined | null): number | null => v == null ? null : v

async function onSave() {
  if (!event?.value) return
  isSaving.value = true

  try {
    // --- API payload (snake_case) ---
    const payload = {
      participation_info: draft.participationInfo,
      meeting_point: draft.meetingPoint,
      min_age: toNullOrNumber(draft.minAge),
      max_age: toNullOrNumber(draft.maxAge),
      max_attendees: toNullOrNumber(draft.maxAttendees),
      price_type: draft.priceType,
      min_price: toNullOrFloat(draft.minPrice),
      max_price: toNullOrFloat(draft.maxPrice),
      currency: draft.currency,
      occasion_type_id: draft.occasionTypeId,
    }

    await apiFetch(`/api/admin/event/${eventId.value}/participation-infos`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    // Update UI model
    Object.assign(event.value, { ...draft })

    // Sync draft for next edit
    Object.assign(draft, { ...event.value })

    isEditing.value = false
  } catch (err) {
    console.error('Failed to save event properties', err)
  } finally {
    isSaving.value = false
  }
}
</script>