<!-- UranusEventVenueSpaceSelect.vue -->
<template>
  <UranusFieldLabel
      id="event-venue-space-select"
      :label="t('venue_place')"
      :required="props.required"
  >
    <select
        v-model="selectedKey"
        :disabled="isLoading"
        class="uranus-select"
    >
      <option value="">{{ props.selectLabel }}</option>

      <option
          v-for="opt in options"
          :key="opt.key"
          :value="opt.key"
      >
        {{ opt.label }}
      </option>
    </select>
  </UranusFieldLabel>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { apiFetch } from "@/api.ts"
import type { UranusVenueSpaceSelection } from "@/models/UranusEventModel.ts"
import UranusFieldLabel from "@/components/ui/UranusFieldLabel.vue"
import { buildVenueSpaceKey } from "@/utils/UranusUtils.ts"

const { t } = useI18n()

// --- Props & Emits ----------------------------------------------------------

const props = defineProps<{
  modelValue: UranusVenueSpaceSelection
  required?: boolean
  selectLabel: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: UranusVenueSpaceSelection): void
}>()

// --- Local reactive model ---------------------------------------------------

const localValue = reactive<UranusVenueSpaceSelection>({
  dateVenueId: props.modelValue?.dateVenueId ?? null,
  venueId: props.modelValue?.venueId ?? null,
  spaceId: props.modelValue?.spaceId ?? null,
  venueName: props.modelValue?.venueName ?? null,
  spaceName: props.modelValue?.spaceName ?? null,
})

// Sync when parent updates externally
watch(
    () => props.modelValue,
    (val) => {
      if (!val) return
      Object.assign(localValue, val)
    },
    { immediate: true, deep: true }
)

// --- Options ---------------------------------------------------------------

const options = ref<
    {
      key: string
      label: string
      venue_id: number
      space_id: number | null
      date_venue_id: number
      venue_name: string
      space_name: string | null
    }[]
>([])

const isLoading = ref(false)

type ChoosableEventPlace = {
  venue_id: number
  venue_name: string
  space_id: number | null
  space_name: string | null
}

type ChoosableEventPlacesResponse = {
  places: ChoosableEventPlace[]
}

async function fetchVenueSpaceOptions() {
  isLoading.value = true
  try {
    const { data } = await apiFetch<ChoosableEventPlacesResponse>(
        `/api/admin/user/choosable-event-places`
    )

    const places = Array.isArray(data?.places) ? data.places : []

    options.value = places.map((item) => ({
      key: buildVenueSpaceKey(item.venue_id, item.space_id),
      label: item.space_name
          ? `${item.venue_name} / ${item.space_name}`
          : item.venue_name,
      venue_id: item.venue_id,
      space_id: item.space_id,
      date_venue_id: item.venue_id,
      venue_name: item.venue_name,
      space_name: item.space_name ?? null,
    }))
  } catch (err) {
    console.error("Failed to fetch venue/space options:", err)
    options.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchVenueSpaceOptions)

const selectedKey = computed({
  get(): string {
    return buildVenueSpaceKey(localValue.venueId, localValue.spaceId)
  },

  set(newKey: string) {
    if (!newKey) {
      // Reset selection
      Object.assign(localValue, {
        dateVenueId: null,
        venueId: null,
        spaceId: null,
        venueName: null,
        spaceName: null,
      })
      emit("update:modelValue", { ...localValue })
      return
    }

    // Find the option by its string key (works for "venue" or "venue_space")
    const found = options.value.find(o => o.key === newKey)
    if (!found) return

    Object.assign(localValue, {
      dateVenueId: found.date_venue_id,
      venueId: found.venue_id,
      spaceId: found.space_id,
      venueName: found.venue_name ?? null,
      spaceName: found.space_name ?? null
    })

    emit("update:modelValue", { ...localValue })
  }
})
</script>

<style scoped>
</style>