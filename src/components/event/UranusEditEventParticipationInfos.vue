<!--
  UranusEditEventParticipationInfos.vue
-->
<template>
  <UranusInlineEditSection :active="isEditing">
    <UranusInlineEditLabel
        :label-text="t('event_participation_information')"
        :edit-button-text="t('edit')"
        @edit-started="startEdit"
    />

    <!-- Edit form -->
    <div v-if="isEditing">
      <UranusInlineSectionLayout>
        <UranusTextarea
            id="participation_info"
            v-model.trim="draft.participationInfo"
            :label="t('info_text')"
            placeholder="Participation info"
        />

        <UranusTextarea
            id="meeting_point"
            v-model.trim="draft.meetingPoint"
            :label="t('meeting_point')"
            placeholder="Meeting point"
        />
      </UranusInlineSectionLayout>

      <UranusInlineSectionLayout>
        <div class="uranus-grid-4">
          <UranusTextInput
              id="min_age"
              v-model.number="draft.minAge"
              type="number"
              :label="t('min_age')"
          />

          <UranusTextInput
              id="max_age"
              v-model.number="draft.maxAge"
              type="number"
              :label="t('max_age')"
          />

          <UranusTextInput
              id="max_attendees"
              v-model.number="draft.maxAttendees"
              type="number"
              :label="t('max_attendees')"
          />
        </div>

        <div class="uranus-grid-4">
          <UranusPriceTypeSelect v-model="draft.priceTypeId" />
          <UranusCurrencySelect v-model="draft.currencyCode" />

          <UranusTextInput
              id="max_attendees"
              v-model.number="draft.minPrice"
              type="number"
              :label="t('min_price')"
          />

          <UranusTextInput
              id="max_attendees"
              v-model.number="draft.maxPrice"
              type="number"
              :label="t('max_price')"
          />

          <UranusEventOccasionSelect v-model="draft.occasionTypeId" />

          <UranusCheckboxButton
              id="ticket_advance"
              v-model="draft.ticketAdvance"
              :label="t('ticket_advance')"
          />

          <UranusCheckboxButton
              id="ticket_required"
              v-model="draft.ticketRequired"
              :label="t('ticket_required')"
          />

          <UranusCheckboxButton
              id="registration_required"
              v-model="draft.registrationRequired"
              :label="t('registration_required')"
          />

        </div>

        <UranusInlineEditActions
            :isSaving="isSaving"
            :canSave="canSave"
            @save="save"
            @cancel="cancelEdit"
        />
      </UranusInlineSectionLayout>
    </div>

    <div v-else>
      <span><strong>{{ t('age') }}:</strong> {{ ageDescription }}</span><br>
      <span><strong>{{ t('max_attendees') }}:</strong> {{ event?.maxAttendees }}</span><br>
      <span><strong>{{ t('price') }}:</strong> {{ priceDescription }}</span><br>
      <span><strong>{{ t('ticket_advance') }}:</strong> {{ event?.ticketAdvance ? t('yes') : t('no') }}</span><br>
      <span><strong>{{ t('ticket_required') }}:</strong> {{ event?.ticketRequired ? t('yes') : t('no') }}</span><br>
      <span><strong>{{ t('registration_required') }}:</strong> {{ event?.registrationRequired ? t('yes') : t('no') }}</span><br>


      <p><strong>{{ t('info_text') }}:</strong> {{ event?.participationInfo }}</p>
      <p><strong>{{ t('meeting_point') }}:</strong> {{ event?.meetingPoint }}</p>
      <p><strong>{{ t('price_type') }}:</strong> {{ event?.priceTypeId }}</p>
      <p><strong>{{ t('occasion_type') }}:</strong> {{ event?.occasionTypeId }}</p>
    </div>

  </UranusInlineEditSection>
</template>

<script setup lang="ts">
import { ref, reactive, computed, inject, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'

import type { UranusEventDetail } from '@/models/UranusEventModel.ts'
import UranusInlineEditSection from '@/components/ui/UranusInlineEditSection.vue'
import UranusInlineEditLabel from '@/components/ui/UranusInlineEditLabel.vue'
import UranusInlineEditActions from '@/components/ui/UranusInlineEditActions.vue'
import UranusInlineSectionLayout from '@/components/ui/UranusInlineSectionLayout.vue'
import UranusTextInput from '@/components/ui/UranusTextInput.vue'
// import UranusSelectInput from '@/components/uranus/UranusSelectInput.vue'
import UranusCheckboxButton from '@/components/ui/UranusCheckboxButton.vue'
import UranusTextarea from "@/components/ui/UranusTextarea.vue";
import UranusPriceTypeSelect from "@/components/selects/UranusPriceTypeSelect.vue";
import UranusCurrencySelect from "@/components/selects/UranusCurrencySelect.vue";
import UranusEventOccasionSelect from "@/components/selects/UranusEventOccasionSelect.vue";
import { uranusAgeText, uranusPriceText } from '@/utils/UranusStringUtils.ts'

const { t, locale } = useI18n({ useScope: 'global' })

const event = inject<Ref<UranusEventDetail | null>>('event')
const eventId = computed(() => event?.value?.eventId)

const isEditing = ref(false)
const isSaving = ref(false)
const canSave = computed(() => !isSaving.value)

const draft = reactive({
  participationInfo: event?.value?.participationInfo ?? '',
  meetingPoint: event?.value?.meetingPoint ?? '',
  minAge: event?.value?.minAge ?? undefined,
  maxAge: event?.value?.maxAge ?? undefined,
  maxAttendees: event?.value?.maxAttendees ?? undefined,
  priceTypeId: event?.value?.priceTypeId ?? null,
  minPrice: event?.value?.minPrice ?? undefined,
  maxPrice: event?.value?.maxPrice ?? undefined,
  currencyCode: event?.value?.currencyCode ?? null,
  currencyName: event?.value?.currencyName ?? null,
  ticketAdvance: event?.value?.ticketAdvance ?? false,
  ticketRequired: event?.value?.ticketRequired ?? false,
  registrationRequired: event?.value?.registrationRequired ?? false,
  occasionTypeId: event?.value?.occasionTypeId ?? null,
})


const ageDescription = computed(() =>
    uranusAgeText(t, draft.minAge, draft.maxAge)
)

const priceDescription = computed(() =>
    uranusPriceText(t, draft.minPrice, draft.maxPrice, locale.value, draft.currencyCode)
)

function startEdit() {
  if (!event?.value) return
  Object.assign(draft, {
    participationInfo: event.value.participationInfo ?? '',
    meetingPoint: event.value.meetingPoint ?? '',
    minAge: event.value.minAge ?? null,
    maxAge: event.value.maxAge ?? null,
    maxAttendees: event.value.maxAttendees ?? null,
    priceTypeId: event.value.priceTypeId ?? null,
    currencyCode: event.value.currencyCode ?? null,
    currencyName: event.value.currencyName ?? null,
    ticketAdvance: event.value.ticketAdvance ?? false,
    ticketRequired: event.value.ticketRequired ?? false,
    registrationRequired: event.value.registrationRequired ?? false,
    occasionTypeId: event.value.occasionTypeId ?? null,
  })
  isEditing.value = true
}

function cancelEdit() {
  startEdit()
  isEditing.value = false
}

async function save() {
  if (!event?.value) return
  isSaving.value = true

  try {
    const payload = {
      participation_info: draft.participationInfo,
      meeting_point: draft.meetingPoint,
      min_age: draft.minAge,
      max_age: draft.maxAge,
      max_attendees: draft.maxAttendees,
      price_type_id: draft.priceTypeId,
      min_price: draft.minPrice,
      max_price: draft.maxPrice,
      currency_code: draft.currencyCode,
      ticket_advance: draft.ticketAdvance,
      ticket_required: draft.ticketRequired,
      registration_required: draft.registrationRequired,
      occasion_type_id: draft.occasionTypeId,
    }

    await apiFetch(`/api/admin/event/${eventId.value}/participation-infos`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    Object.assign(event.value, payload)
    isEditing.value = false
  } catch (err) {
    console.error('Failed to save event properties', err)
  } finally {
    isSaving.value = false
  }
}
</script>