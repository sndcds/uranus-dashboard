<!-- UranusEventVenueSpaceSelect.vue -->
<template>
  <UranusFieldLabel
      id="event-venue-space-select"
      :label="t('event_place')"
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
    { key: string; label: string; venue_id: number; space_id: number | null }[]
>([])

const isLoading = ref(false)

async function fetchVenueSpaceOptions() {
  isLoading.value = true
  try {
    const { data } = await apiFetch(`/api/admin/user/choosable-venues-spaces`)

    options.value = (Array.isArray(data) ? data : []).map((item) => ({
      key: `${item.venue_id}_${item.space_id ?? "null"}`,
      label: item.space_name
          ? `${item.venue_name} / ${item.space_name}`
          : item.venue_name,
      venue_id: item.venue_id,
      space_id: item.space_id,
    }))
  } catch (err) {
    console.error("Failed to fetch venue/space options:", err)
    options.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchVenueSpaceOptions)

// --- Select Key (computed v-model) -----------------------------------------

const selectedKey = computed({
  get(): string {
    if (localValue.venueId == null) return ""
    return `${localValue.venueId}_${localValue.spaceId ?? "null"}`
  },

  set(newKey: string) {
    if (!newKey) {
      // Reset selection
      Object.assign(localValue, {
        venueId: null,
        spaceId: null,
        venueName: null,
        spaceName: null,
      })
      emit("update:modelValue", { ...localValue })
      return
    }

    const [vStr, sStr] = newKey.split("_")
    const venueId = Number(vStr)
    const spaceId = sStr === "null" ? null : Number(sStr)

    const found = options.value.find(
        (o) => o.venue_id === venueId && o.space_id === spaceId
    )
    if (!found) return

    const hasSpace = found.space_id !== null
    const [venueName, spaceName] = found.label.split(" / ")

    Object.assign(localValue, {
      venueId,
      spaceId,
      venueName: venueName ?? null,
      spaceName: hasSpace ? spaceName ?? null : null,
    })

    emit("update:modelValue", { ...localValue })
  },
})
</script>

<style scoped>
</style>