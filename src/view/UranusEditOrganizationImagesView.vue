<!--
  src/view/UranusEditOrganizationImagesView.vue
-->

<template>
  <div class="uranus-main-layout">
    # {{ organizationId }}
    <UranusDashboardHero
        :title="t('organization_images_title')"
        :subtitle="t('organization_images_description')"
    />

    <UranusCard>
      <div class="image-grid">
        <UranusImageSlot
            v-for="slot in IMAGE_SLOTS"
            :key="slot.id"
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
        :add-mode-title="t('add_organization_image')"
        :edit-mode-title="t('edit_organization_image')"
        :image-identifier="editImageIdentifier"
        :api-url="editImageApiUrl"
        @save="onImageSave"
        @close="onImageClosed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Ref } from 'vue'

import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { apiFetch } from '@/api.ts'

import { uranusUrlParamToInt } from '@/util/UranusUrlUtils.ts'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusImageSlot from '@/component/image/UranusImageSlot.vue'
import UranusImageEditDialog from '@/component/image/UranusImageEditDialog.vue'
import { PlutoImageMeta } from '@/model/plutoImageModel.ts'
import type { PlutoImageDTO } from '@/model/plutoImageModel.ts'
import { plutoNormalizeImage, plutoOnImageSave } from '@/composable/usePlutoImages.ts'

const { t } = useI18n()
const route = useRoute()

type SlotRefs = Record<ImageIdentifier, InstanceType<typeof UranusImageSlot> | null>

const slotRefs = ref<SlotRefs>({
  main_logo: null,
  light_theme_logo: null,
  dark_theme_logo: null,
  avatar: null
})

// Type guard to ensure we only assign component instances
function isUranusImageSlot(el: any): el is InstanceType<typeof UranusImageSlot> {
  return el?.forceReload !== undefined
}

// image slots
type ImageIdentifier = 'main_logo' | 'light_theme_logo' | 'dark_theme_logo' | 'avatar'

const IMAGE_SLOTS: Array<{ id: ImageIdentifier; label: string }> = [
  { id: 'main_logo', label: t('main_logo') },
  { id: 'light_theme_logo', label: t('light_theme_logo') },
  { id: 'dark_theme_logo', label: t('dark_theme_logo') },
  { id: 'avatar', label: t('Avatar') },
]

const IMAGE_IDENTIFIER_SET = new Set<ImageIdentifier>(['main_logo', 'light_theme_logo', 'dark_theme_logo', 'avatar'])

function isImageIdentifier(value: string): value is ImageIdentifier {
  return IMAGE_IDENTIFIER_SET.has(value as ImageIdentifier)
}

// state
const organizationId = computed(() => uranusUrlParamToInt(route.params.id))
const editImageIdentifier = ref<ImageIdentifier | null>(null)

// store full image metadata
const localImages = ref<Record<ImageIdentifier, PlutoImageMeta | null>>({
  main_logo: null,
  light_theme_logo: null,
  dark_theme_logo: null,
  avatar: null,
})

// API URLs
const organizationApiUrl = computed(() => {
  let apiUrl = '/api/admin/organization'
  if (organizationId.value) apiUrl += `/${organizationId.value}`
  return apiUrl
})

const editImageApiUrl = computed(() => {
  if (!organizationId.value || !editImageIdentifier.value) return ''
  return `/api/image/meta/organization/${organizationId.value}/${editImageIdentifier.value}`
})

// helpers
const imageByIdentifier = computed(() => (identifier: ImageIdentifier) => localImages.value[identifier])

// lifecycle
onMounted(loadOrganization)

// API response type
interface OrganizationApiResponse {
  id: number
  name: string
  images?: {
    main_logo?: PlutoImageDTO
    light_theme_logo?: PlutoImageDTO
    dark_theme_logo?: PlutoImageDTO
    avatar?: PlutoImageDTO
  }
}

interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

async function loadOrganization() {
  if (!organizationId.value) return

  const response = await apiFetch<OrganizationApiResponse>(organizationApiUrl.value)
  const data = response.data
  const images = data.images ?? {}

  // update reactive local state
  localImages.value = {
    main_logo: plutoNormalizeImage(images.main_logo),
    light_theme_logo: plutoNormalizeImage(images.light_theme_logo),
    dark_theme_logo: plutoNormalizeImage(images.dark_theme_logo),
    avatar: plutoNormalizeImage(images.avatar),
  }
}

// handlers
function onEditImage(identifier: string) {
  if (!isImageIdentifier(identifier)) return
  editImageIdentifier.value = identifier
}

async function onRemoveImage(identifier: string) {
  if (!isImageIdentifier(identifier) || !organizationId.value) return

  try {
    await apiFetch(`/api/admin/organization/${organizationId.value}/image/${identifier}`, {
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
  if (!organizationId.value) return

  // save to backend
  const raw: PlutoImageDTO = await plutoOnImageSave(
      meta,
      file,
      'organization',
      organizationId.value,
      identifier
  )

  const normalized = plutoNormalizeImage(raw)

  localImages.value = {
    ...localImages.value,
    [identifier]: normalized
  }

  const slotComponent = slotRefs.value[identifier as ImageIdentifier]
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