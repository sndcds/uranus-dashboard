<template>
  <UranusForm>

    <UranusFormRow>
      <p>{{ t('marker_set_location_hint') }}</p>
    </UranusFormRow>

    <UranusFormRow>
      <UranusMapLocationPicker
          class="location-map"
          v-model="internalLocation"
          :zoom="12"
          :selectable="true"
      />
    </UranusFormRow>

    <UranusFormRow :cols="2">
      <UranusNumberInput id="org-lat" :label="t('latitude')" v-model="latModel" />
      <UranusNumberInput id="org-lon" :label="t('longitude')" v-model="lonModel" />
    </UranusFormRow>

  </UranusForm>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusMapLocationPicker from '@/component/uranus/UranusMapLocationPicker.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusLabel from '@/component/ui/UranusLabel.vue'
import UranusNumberInput from '@/component/ui/UranusNumberInput.vue'

type MapLocation = { lat: number; lng: number } | null

const { t } = useI18n({ useScope: 'global' })

// Props: external values
const props = defineProps<{
  modelValueLat: number | null
  modelValueLon: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValueLat', val: number): void
  (e: 'update:modelValueLon', val: number): void
}>()

// Internal reactive location
const internalLocation = computed<MapLocation>({
  get: () => {
    if (props.modelValueLat === null || props.modelValueLon === null) return null
    return { lat: props.modelValueLat, lng: props.modelValueLon }
  },
  set: (val) => {
    emit('update:modelValueLat', val?.lat ?? 0)
    emit('update:modelValueLon', val?.lng ?? 0)
  }
})

const latModel = computed<number>({
  get: () => props.modelValueLat ?? 0,
  set: (val: number) => emit('update:modelValueLat', val)
})

const lonModel = computed<number>({
  get: () => props.modelValueLon ?? 0,
  set: (val: number) => emit('update:modelValueLon', val)
})
</script>

<style scoped lang="scss">
.location-map {
  height: 600px;
}
</style>