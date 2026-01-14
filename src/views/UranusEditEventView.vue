<!--
  UranusEditEventView.vue
-->
<template>
  <div v-if="event" class="uranus-main-layout uranus-inline-layout">
    <UranusDashboardHero :title="t('edit_event')" />
    <span>Edit event #{{ eventId }}</span>

    <UranusCard>
      <UranusEditEventRelease />
    </UranusCard>

    <UranusCard>
      <UranusEditEventTitle />
      <UranusEditEventVenue />
    </UranusCard>

    <UranusCard>
      <UranusEditEventTextBlock
          field="summary"
          api-path="summary"
          label-key="summary"
      />
    </UranusCard>

    <UranusCard>
      <UranusEditEventTextBlock
          field="description"
          api-path="description"
          label-key="description"
          required
          required-error-key="event_description_required"
      />
    </UranusCard>


    <UranusCard>
      <UranusEditEventImages
          ref="imagesRef"
          @update="onImagesUpdated"
          @edit="onEditImage"
          @remove="onRemoveImage"/>
    </UranusCard>

    <UranusCard>
      <UranusEditEventDates />
    </UranusCard>

    <UranusCard>
      <UranusEditEventTypes />
      <UranusEditEventLanguages />
      <UranusEditEventTags />
    </UranusCard>

    <UranusCard>
      <UranusEditEventUrls />
    </UranusCard>

    <UranusCard>
      <UranusEditEventParticipationInfos />
    </UranusCard>

    <UranusImageEditDialog
        v-if="editEventImageIndex !== null"
        :image-index="editEventImageIndex"
        :api-url="editImageApiUrl"
        @save="onImageSave"
        @close="onImageClosed"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, provide, computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from 'vue-i18n'
import { apiFetch } from "@/api.ts";
import { mapEventDetailData } from "@/utils/UranusEventDetailMapper.ts"
import { type UranusEventDetail, UranusImageMeta } from '@/models/UranusEventModel.ts'

import UranusDashboardHero from "@/components/dashboard/UranusDashboardHero.vue";
import UranusEditEventTitle from "@/components/event/UranusEditEventTitle.vue";
import UranusEditEventTypes from "@/components/event/UranusEditEventTypes.vue";
import UranusCard from "@/components/ui/UranusCard.vue";
import UranusEditEventVenue from "@/components/event/UranusEditEventVenue.vue";
import UranusEditEventDates from "@/components/event/UranusEditEventDates.vue";
import UranusEditEventLanguages from "@/components/event/UranusEditEventLanguages.vue";
import UranusEditEventTags from "@/components/event/UranusEditEventTags.vue";
import UranusEditEventRelease from "@/components/event/UranusEditEventRelease.vue";
import UranusEditEventParticipationInfos from "@/components/event/UranusEditEventParticipationInfos.vue";
import UranusEditEventImages from "@/components/event/UranusEditEventImages.vue";
import UranusImageEditDialog from "@/components/image/UranusImageEditDialog.vue";
import UranusEditEventUrls from "@/components/event/UranusEditEventUrls.vue";
import UranusEditEventTextBlock from "@/components/event/UranusEditEventTextBlock.vue";

const { t } = useI18n()
const { locale } = useI18n({ useScope: 'global' })
const route = useRoute()

const eventId = Number(route.params.id || 0)
const errorMessage = ref<string | null>(null)

const event = ref<UranusEventDetail | null>(null)
provide('event', event)

const editEventImageIndex = ref<number | null>(null)
const imagesRef = ref<InstanceType<typeof UranusEditEventImages> | null>(null)

const editImageApiUrl = computed(() => {
  if (!event.value || editEventImageIndex.value === null) return ''
  return `/api/admin/event/${event.value.eventId}/image/${editEventImageIndex.value}/meta`
})

onMounted(loadEvent)

async function loadEvent() {
  try {
    const { data } = await apiFetch(`/api/admin/event/${eventId}?lang=${locale.value}`)

    const result = mapEventDetailData(data)
    console.log(result)
    if ('error' in result) {
      console.error("Mapping failed:", result.error)
      errorMessage.value = result.error
      event.value = null  // clear the event if mapping failed
    } else {
      console.log("Event mapped successfully:", result.data)
      event.value = result.data  // assign only the mapped event
      errorMessage.value = null   // clear any previous error
    }

  } catch (err) {
    console.error("Failed to fetch event:", err)
    errorMessage.value = t('event_load_error')
    event.value = null
  }
}

async function onImageSave(
    meta: UranusImageMeta,
    file: File | null,
    imageIndex: number | null
) {
  editEventImageIndex.value = null

  if (imageIndex === null || !event.value) return

  const formData = new FormData()

  if (file) {
    formData.append('image', file)
  }

  if (meta.altText !== null) {
    formData.append('alt_text', meta.altText)
  }
  if (meta.description !== null) {
    formData.append('description', meta.description)
  }
  if (meta.copyright !== null) {
    formData.append('copyright', meta.copyright)
  }
  if (meta.creatorName !== null) {
    formData.append('creator_name', meta.creatorName)
  }
  if (meta.licenseId !== null) {
    formData.append('license_id', String(meta.licenseId))
  }
  if (meta.focusX !== null) {
    formData.append('focus_x', String(meta.focusX))
  }
  if (meta.focusY !== null) {
    formData.append('focus_y', String(meta.focusY))
  }

  const { data } = await apiFetch(
      `/api/admin/event/${event.value.eventId}/image/${imageIndex}`,
      {
        method: 'POST',
        body: formData,
      }
  )

  const typedData = data as { image_id: number }
  event.value.imageIds[imageIndex - 1] = typedData.image_id
  imagesRef.value?.reload()
}

function onImageClosed() {
  editEventImageIndex.value = null
}

function onImagesUpdated() {}
function onEditImage(slotIndex: number | null) {
  editEventImageIndex.value = slotIndex
}
function onRemoveImage(slotIndex: number | null) {
  console.log("onRemoveImage:", slotIndex)
}
</script>