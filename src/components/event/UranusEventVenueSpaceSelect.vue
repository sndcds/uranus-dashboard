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
      dateVenueId: number
      venue_name: string
      space_name: string | null
    }[]
>([])

const isLoading = ref(false)


async function fetchVenueSpaceOptions() {
  isLoading.value = true
  try {
    const { data } = await apiFetch(`/api/admin/user/choosable-venues-spaces`)

    options.value = (Array.isArray(data) ? data : []).map((item) => ({
      key: buildVenueSpaceKey(item.venue_id, item.space_id),
      label: item.space_name
          ? `${item.venue_name} / ${item.space_name}`
          : item.venue_name,
      venue_id: item.venue_id,
      space_id: item.space_id,
      dateVenueId: item.venue_id,
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
      dateVenueId: found.dateVenueId,
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