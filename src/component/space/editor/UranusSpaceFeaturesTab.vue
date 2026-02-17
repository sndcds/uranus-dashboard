<!--
  src/component/space/editor/UranusSpaceFeaturesTab.vue

  2026-02-13, Roald
-->

<template>
  <section class="uranus-admin-edit-section uranus-admin-responsive-grid">

    <div v-for="(options, key) in featureOptions" :key="key" class="feature-group">
      <h3>{{ keyLabels[key] }}</h3>
      <div class="feature-options">
        <label v-for="opt in options" :key="opt.value">
          <input
              type="checkbox"
              :value="opt.value"
              :checked="hasFeature(key, opt.value)"
              @change="toggleFeature(key, opt.value)"
          />
          {{ opt.label }}
        </label>
      </div>
    </div>

    <!-- Actions -->
    <div class="tab-actions">
      <button @click="resetTab" :disabled="store.saving || !isDirty">
        {{ t('discard') }}
      </button>
      <button @click="commitTab" :disabled="store.saving || !isDirty">
        {{ t('save') }}
      </button>
    </div>

  </section>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import { useUranusSpaceStore } from '@/store/uranusSpaceStore.ts'
import type { UranusSpace } from '@/domain/space/UranusSpace'

const { t } = useI18n({ useScope: 'global' })

const store = useUranusSpaceStore()
const space = computed(() => store.draft!)

const spaceFields = [
    'environmentalFeatures',
    'audioFeatures',
    'presentationFeatures',
    'lightingFeatures',
    'climateFeatures',
    'miscFeatures',
] as const


// Define bitmask options (example)
const featureOptions = reactive({
  environmentalFeatures: [
    { value: 1, label: 'Eco-friendly' },
    { value: 2, label: 'Recyclable' },
    { value: 4, label: 'Solar Panels' },
  ],
  audioFeatures: [
    { value: 1, label: 'PA System' },
    { value: 2, label: 'Stage Monitors' },
    { value: 4, label: 'Acoustic Treatment' },
  ],
  presentationFeatures: [
    { value: 1, label: 'Projector' },
    { value: 2, label: 'Screen' },
    { value: 4, label: 'Video Conferencing' },
  ],
  lightingFeatures: [
    { value: 1, label: 'Spotlights' },
    { value: 2, label: 'Stage Lighting' },
    { value: 4, label: 'Dimmable Lighting' },
  ],
  climateFeatures: [
    { value: 1, label: 'Air Conditioning' },
    { value: 2, label: 'Heating' },
    { value: 4, label: 'Ventilation' },
  ],
  miscFeatures: [
    { value: 1, label: 'Wi-Fi' },
    { value: 2, label: 'Parking' },
    { value: 4, label: 'Catering' },
  ],
})

const keyLabels: Record<string, string> = {
  environmentalFeatures: 'Environmental Features',
  audioFeatures: 'Audio Features',
  presentationFeatures: 'Presentation Features',
  lightingFeatures: 'Lighting Features',
  climateFeatures: 'Climate Features',
  miscFeatures: 'Miscellaneous Features',
}

const normalize = (val: any) =>
    val === '' || val == null ? null : val

const isDirty = computed(() => {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return false

  return spaceFields.some(key => {
    const draftVal = normalize(draft[key])
    const origVal = normalize(original[key])
    return draftVal !== origVal
  })
})

type FeatureKey =
    | 'environmentalFeatures'
    | 'audioFeatures'
    | 'presentationFeatures'
    | 'lightingFeatures'
    | 'climateFeatures'
    | 'miscFeatures'

const fields: Record<FeatureKey, string> = {
  environmentalFeatures: 'environmental_features',
  audioFeatures: 'audio_features',
  presentationFeatures: 'presentation_features',
  lightingFeatures: 'lighting_features',
  climateFeatures: 'climate_features',
  miscFeatures: 'misc_features',
}

function hasFeature(key: FeatureKey, value: number) {
  const val = space.value[key] ?? 0
  return (val & value) !== 0
}

function toggleFeature(key: FeatureKey, value: number) {
  const val = space.value[key] ?? 0
  if ((val & value) === 0) {
    space.value[key] = val | value
  } else {
    space.value[key] = val & ~value
  }
}

function buildPayload(draft: UranusSpace, original: UranusSpace) {
  const payload: Record<string, any> = {}

  for (const [key, apiKey] of Object.entries(fields)) {
    const k = key as keyof UranusSpace
    if (draft[k] !== original[k]) {
      payload[apiKey] = draft[k]
    }
  }

  return payload
}

function copyFields(source: UranusSpace, target: UranusSpace) {
  target.environmentalFeatures = source.environmentalFeatures
  target.audioFeatures = source.audioFeatures
  target.presentationFeatures = source.presentationFeatures
  target.lightingFeatures = source.lightingFeatures
  target.climateFeatures = source.climateFeatures
  target.miscFeatures = source.miscFeatures
}


async function commitTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return

  store.saving = true
  store.error = null

  try {
    const payload = buildPayload(draft, original)
    if (Object.keys(payload).length === 0) {
      store.saving = false
      return
    }

    const apiPath = `/api/admin/space/${draft.id}/fields`
    await apiFetch(apiPath, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    copyFields(draft, original)
  } catch (err) {
    store.error = 'Failed to save space features'
    console.error(err)
  } finally {
    store.saving = false
  }
}

function resetTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return
  copyFields(original, draft)
}
</script>

<style scoped lang="scss">
.space-features-tab {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 800px;

  .feature-group {
    h3 {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .feature-options {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;

      label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
  }

  .tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
}
</style>