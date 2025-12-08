<!--
  UranusEventEditorView.vue
-->
<template>
  <div v-if="event" class="uranus-main-layout uranus-inline-layout">
    <DashboardHeroComponent :title="t('edit_event')" />
    <span>Edit event #{{ eventId }}</span>

    <UranusCard>
      <UranusEditEventRelease />
    </UranusCard>

    <UranusCard>
      <UranusEditEventImages
          ref="imagesRef"
          @update="onImagesUpdated"
          @edit="onEditImage"
          @remove="onRemoveImage"/>
    </UranusCard>

    <UranusCard>
      <UranusEditEventTitle />
      <UranusEditEventVenue />
    </UranusCard>

    <UranusCard>
      <UranusEditEventDates />
    </UranusCard>

    <UranusCard>
      <UranusEditEventTypes />
      <UranusEditEventLanguages />
      <UranusEditEventTags />
      <UranusEditEventLinks />
    </UranusCard>

    <UranusCard>
      <UranusEditEventDescription />
    </UranusCard>

    <UranusCard>
      <UranusEditEventParticipationInfos />
    </UranusCard>

    <UranusImageEditDialog
        v-if="editEventImageIndex !== null"
        :image-index="editEventImageIndex"
        :api-url="editImageApiUrl"
        @saved="onImageSaved"
        @close="onImageClosed"
    />
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, provide, computed} from "vue";
import { useRoute } from "vue-router";
import { useI18n } from 'vue-i18n'
import { apiFetch } from "@/api.ts";
import { mapEventData } from "@/utils/UranusEventDetailMapper.ts"
import UranusEditEventTitle from "@/components/event/UranusEditEventTitle.vue";
import {type UranusEventDetail, UranusImageMeta} from '@/models/UranusEventModel.ts'
import DashboardHeroComponent from "@/components/DashboardHeroComponent.vue";
import UranusEditEventDescription from "@/components/event/UranusEditEventDescription.vue";
import UranusEditEventTypes from "@/components/event/UranusEditEventTypes.vue";
import UranusCard from "@/components/ui/UranusCard.vue";
import UranusEditEventVenue from "@/components/event/UranusEditEventVenue.vue";
import UranusEditEventDates from "@/components/event/UranusEditEventDates.vue";
import UranusEditEventLanguages from "@/components/event/UranusEditEventLanguages.vue";
import UranusEditEventTags from "@/components/event/UranusEditEventTags.vue";
import UranusEditEventRelease from "@/components/event/UranusEditEventRelease.vue";
import UranusEditEventParticipationInfos from "@/components/event/UranusEditEventParticipationInfos.vue";
import UranusEditEventLinks from "@/components/event/UranusEditEventLinks.vue";
import UranusEditEventImages from "@/components/event/UranusEditEventImages.vue";
import UranusImageEditDialog from "@/components/image/UranusImageEditDialog.vue";

const { t } = useI18n()
const { locale } = useI18n({ useScope: 'global' })
const route = useRoute()

const eventId = Number(route.params.id || 0)

const errorMessage = ref<string | null>(null);
let event = ref<UranusEventDetail | null>(null)
provide('event', event)

const emit = defineEmits([])

const editEventImageIndex = ref<number | null>(null);
const editImageApiUrl = computed(() => {
  if (!event?.value?.eventId || !editEventImageIndex.value) return ''
  return `/api/admin/event/${event.value.eventId}/image/${editEventImageIndex.value}/meta`
})
const imagesRef = ref<InstanceType<typeof UranusEditEventImages> | null>(null)


onMounted(async () => {
  loadEvent()
})

const loadEvent = async () => {
  try {
    const { data } = await apiFetch<unknown>(`/api/admin/event/${eventId}?lang=${locale.value}`)
    const mapped = mapEventData(data)
    if (!mapped) {
      errorMessage.value = t('error_event_not_found')
      // resetState() // TODO:
      return
    }
    event.value = mapped

  } catch (err) {
    errorMessage.value = t('event_load_error')
    // resetState()
  }
}

const onImageSaved = async (imageMeta: UranusImageMeta, file: File | null, imageIndex: number | null) => {
  editEventImageIndex.value = null; // Closes the image edit dialog
  if (!imageIndex || imageIndex < 1 || imageIndex > 4) {
    return
  }

  if (event.value) {
    const formData = buildImageFormData(imageMeta, file)
    const { data, status } = await apiFetch(`/api/admin/event/${event.value?.eventId}/image/${imageIndex}`, {
      method: 'POST',
      body: formData,
    })

    const typedData = data as { image_id: number }
    event.value.imageIds[imageIndex - 1] = typedData.image_id;
    imagesRef.value?.reload()
    return data
  }
}

const onImageClosed = async () => {
  editEventImageIndex.value = null;
}

const onImagesUpdated = async () => {
}

const onEditImage = async (slotIndex: number | null) => {
  editEventImageIndex.value = slotIndex;
}

const onRemoveImage = async (slotIndex: number | null) => {
  console.log("onRemoveImage:", slotIndex)
}

function buildImageFormData(meta: UranusImageMeta, file: File | null): FormData {
  const formData = new FormData()

  // Append file if it exists
  if (file) {
    formData.append("image", file)
  }

  // Append all fields from UranusImageMeta (skip nulls)
  if (meta.id !== null) formData.append("id", meta.id.toString())
  if (meta.altText !== null) formData.append("alt_text", meta.altText)
  if (meta.description !== null) formData.append("description", meta.description)
  if (meta.copyright !== null) formData.append("copyright", meta.copyright)
  if (meta.creatorName !== null) formData.append("creator_name", meta.creatorName)
  if (meta.licenseId !== null) formData.append("license_id", meta.licenseId.toString())
  if (meta.focusX !== null) formData.append("focus_x", meta.focusX.toString())
  if (meta.focusY !== null) formData.append("focus_y", meta.focusY.toString())

  return formData
}

function printFormData(formData: FormData) {
  const obj: Record<string, string> = {}
  formData.forEach((value, key) => {
    // For File objects, just print the file name
    if (value instanceof File) {
      obj[key] = `File(name=${value.name}, size=${value.size} bytes, type=${value.type})`
    } else {
      obj[key] = value.toString()
    }
  })
  console.log(JSON.stringify(obj, null, 2))
}

</script>