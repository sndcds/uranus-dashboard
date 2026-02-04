<!--
  UranusEditVenueImagesView.vue
-->

<template>
  <div class="uranus-main-layout">
    # {{ venueId }}
    <UranusDashboardHero
        :title="t('venue_images_title')"
        :subtitle="t('venue_images_description')"
    />

    <UranusCard>
      <div class="image-grid">
        <UranusImageSlot
          v-for="slot in IMAGE_SLOTS"
          :ref="el => setSlotRef(slot.id, el)"
          :key="slot.id + '-' + slotVersion"
          :identifier="slot.id"
          :label="slot.label"
          :image="imageByIdentifier(slot.id)"
          :fitMode="'contain'"
          @edit="onEditImage"
          @remove="onRemoveImage"
        />
      </div>
    </UranusCard>

    <UranusImageEditDialog
        v-if="editImageIdentifier"
        :add-mode-title="t('add_venue_image')"
        :edit-mode-title="t('edit_venue_image')"
        :image-identifier="editImageIdentifier"
        :api-url="editImageApiUrl"
        @save="onImageSave"
        @close="onImageClosed"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, nextTick, type ComponentPublicInstance} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { apiFetch } from '@/api.ts'

import { uranusUrlParamToInt } from '@/util/UranusUrlUtils.ts'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusImageSlot from '@/component/image/UranusImageSlot.vue'
import UranusImageEditDialog from '@/component/image/UranusImageEditDialog.vue'
import { PlutoImageMeta } from '@/model/plutoImageModel.ts'
import type { PlutoImageRaw } from '@/model/plutoImageModel.ts'
import { plutoNormalizeImage, plutoOnImageSave } from '@/composable/usePlutoImages.ts'


// i18n / routing
const { t } = useI18n()
const route = useRoute()

const slotVersion = ref(0)

// image slots
type ImageIdentifier = 'main_logo' | 'light_theme_logo' | 'dark_theme_logo' | 'avatar'

const IMAGE_SLOTS: Array<{ id: ImageIdentifier; label: string }> = [
  { id: 'main_logo', label: t('main_logo') },
  { id: 'light_theme_logo', label: t('light_theme_logo') },
  { id: 'dark_theme_logo', label: t('dark_theme_logo') },
  { id: 'avatar', label: t('avatar') },
]

type SlotRefs = Record<ImageIdentifier, InstanceType<typeof UranusImageSlot> | null>

const slotRefs = ref<SlotRefs>({
  main_logo: null,
  light_theme_logo: null,
  dark_theme_logo: null,
  avatar: null,
})

function setSlotRef(
    id: ImageIdentifier,
    el: Element | ComponentPublicInstance | null
) {
  if (el && typeof el === 'object' && 'incReloadCounter' in el) {
    slotRefs.value[id] = el as InstanceType<typeof UranusImageSlot>
  } else {
    slotRefs.value[id] = null
  }
}

const IMAGE_IDENTIFIER_SET = new Set<ImageIdentifier>(['main_logo', 'light_theme_logo', 'dark_theme_logo', 'avatar'])

function isImageIdentifier(value: string): value is ImageIdentifier {
  return IMAGE_IDENTIFIER_SET.has(value as ImageIdentifier)
}



const venueId = computed(() => uranusUrlParamToInt(route.params.id))
const editImageIdentifier = ref<ImageIdentifier | null>(null)

// store full image metadata
const localImages = ref<Record<ImageIdentifier, PlutoImageMeta | null>>({
  main_logo: null,
  light_theme_logo: null,
  dark_theme_logo: null,
  avatar: null,
})

// API URLs
const venueApiUrl = computed(() => {
  let apiUrl = '/api/admin/venue'
  if (venueId.value) apiUrl += `/${venueId.value}`
  return apiUrl
})

const editImageApiUrl = computed(() => {
  if (!venueId.value || !editImageIdentifier.value) return ''
  return `/api/image/meta/venue/${venueId.value}/${editImageIdentifier.value}`
})

const imageByIdentifier = computed(() => (identifier: ImageIdentifier) => {
  return localImages.value[identifier]  // <--- return the image
})

onMounted(async () => {
  await loadVenue() // wait for API to load images
})

// API response type
interface VenueApiResponse {
  id: number
  name: string
  images?: {
    main_logo?: PlutoImageRaw
    light_theme_logo?: PlutoImageRaw
    dark_theme_logo?: PlutoImageRaw
    avatar?: PlutoImageRaw
  }
}

interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

async function loadVenue() {
  if (!venueId.value) return

  const response = await apiFetch<VenueApiResponse>(venueApiUrl.value)
  const data = response.data
  const images = data.images ?? {}

  // update reactive local state
  localImages.value = {
    main_logo: plutoNormalizeImage(images.main_logo),
    light_theme_logo: plutoNormalizeImage(images.light_theme_logo),
    dark_theme_logo: plutoNormalizeImage(images.dark_theme_logo),
    avatar: plutoNormalizeImage(images.avatar),
  }

  console.log(plutoNormalizeImage(images.main_logo))
}

// handlers
function onEditImage(identifier: string) {
  if (!isImageIdentifier(identifier)) return
  editImageIdentifier.value = identifier
}


async function onRemoveImage(identifier: string) {
  if (!isImageIdentifier(identifier)) return
  if (!venueId.value) return

  try {
    await apiFetch(`/api/admin/venue/${venueId.value}/image/${identifier}`, {
      method: 'DELETE',
    })

    // Remove from reactive state
    localImages.value[identifier] = null

    // Force child slot to refresh
    const slotComponent = slotRefs.value[identifier]
  } catch (err) {
    console.error(`Failed to remove image for ${identifier}`, err)
    // Optionally: show notification/banner to user
  }
}

async function onImageSave(meta: PlutoImageMeta, file: File | null, identifier: string | null) {
  editImageIdentifier.value = null
  if (!identifier || !isImageIdentifier(identifier)) return
  if (!venueId.value) return

  const raw: PlutoImageRaw = await plutoOnImageSave(
      meta,
      file,
      'venue',
      venueId.value,
      identifier
  )

  const normalized = plutoNormalizeImage(raw)

  localImages.value = {
    ...localImages.value,
    [identifier]: normalized
  }

  // Refresh child slot
  const slotComponent = slotRefs.value[identifier]
  console.log("slotComponent", slotComponent)
  slotRefs.value[identifier] = null
  if (slotComponent) {
    slotComponent.incReloadCounter()
  }
}

function onImageClosed() {
  editImageIdentifier.value = null
}
</script>

<style scoped>
.image-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>