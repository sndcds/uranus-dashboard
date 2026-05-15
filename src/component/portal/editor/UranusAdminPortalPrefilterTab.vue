<template>
  <UranusForm>
    <section
        v-for="group in filterGroups"
        :key="group.key"
        class="portal-filter-group"
    >
      <h2>{{ group.label }}</h2>

      <UranusFormRow
          v-for="row in group.rows"
          :key="row.map(field => field.key).join('-')"
          :cols="row.length"
      >
        <UranusTextfield
            v-for="field in row"
            :id="`portal-filter-${field.key}`"
            :key="field.key"
            :model-value="getFieldValue(field)"
            :type="field.type ?? 'text'"
            :label="field.label"
            :placeholder="field.placeholder ?? ''"
            :nullable-number="field.type === 'number'"
            @update:model-value="value => setFieldValue(field, value)"
        />
      </UranusFormRow>
    </section>

    <UranusFormActions>
      <UranusButton @click="resetTab" :disabled="store.saving || !isDirty">
        {{ t('discard') }}
      </UranusButton>
      <UranusButton @click="commitTab" :disabled="store.saving || !isDirty">
        {{ t('save') }}
      </UranusButton>
    </UranusFormActions>
  </UranusForm>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useUranusPortalStore } from '@/store/portalStore.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'

type FilterFieldKey =
    | 'categories'
    | 'time'
    | 'venues'
    | 'spaces'
    | 'space_types'
    | 'organizations'
    | 'countries'
    | 'postal_code'
    | 'city'
    | 'event_types'
    | 'tags'
    | 'accessibility'
    | 'visitor_infos'
    | 'age'
    | 'price'
    | 'lon'
    | 'lat'
    | 'radius'
    | 'language'

type FilterField = {
  key: FilterFieldKey
  label: string
  type?: 'text' | 'number' | 'date'
  placeholder?: string
}

type PortalFilterForm = Record<FilterFieldKey, string | number | null>
type PortalFilterPayload = Partial<Record<FilterFieldKey, string | number>>

const { t } = useI18n({ useScope: 'global' })
const store = useUranusPortalStore()

const emit = defineEmits<{
  (event: 'dirty-change', value: boolean): void
}>()

const filterGroups: Array<{ key: string, label: string, rows: FilterField[][] }> = [
  {
    key: 'basic',
    label: 'Basic',
    rows: [
      [
        { key: 'language', label: 'Language', placeholder: 'de,en' },
        { key: 'time', label: 'Time', placeholder: '18:00-21:00' },
      ],
    ],
  },
  {
    key: 'taxonomy',
    label: 'Taxonomy',
    rows: [
      [
        { key: 'categories', label: 'Categories', placeholder: '1,3,6' },
        { key: 'event_types', label: 'Event types', placeholder: '[[1,5],[2,null]]' },
      ],
      [
        { key: 'tags', label: 'Tags', placeholder: 'music,festival,autumn' },
      ],
    ],
  },
  {
    key: 'entities',
    label: 'Entities',
    rows: [
      [
        { key: 'venues', label: 'Venues', placeholder: '10,20' },
      ],
      [
        { key: 'spaces', label: 'Spaces', placeholder: '5,6' },
        { key: 'space_types', label: 'Space types', placeholder: '1,2' },
      ],
      [
        { key: 'organizations', label: 'Organizations', placeholder: '42,43' },
      ],
    ],
  },
  {
    key: 'location',
    label: 'Location',
    rows: [
      [
        { key: 'countries', label: 'Countries', placeholder: 'DEU,DNK' },
        { key: 'postal_code', label: 'Postal code', placeholder: '24118' },
      ],
      [
        { key: 'city', label: 'City', placeholder: 'Berlin' },
      ],
      [
        { key: 'lon', label: 'Longitude', type: 'number', placeholder: '13.404954' },
        { key: 'lat', label: 'Latitude', type: 'number', placeholder: '52.520008' },
        { key: 'radius', label: 'Radius', type: 'number', placeholder: '10' },
      ],
    ],
  },
  {
    key: 'properties',
    label: 'Properties',
    rows: [
      [
        { key: 'accessibility', label: 'Accessibility', type: 'number', placeholder: '1' },
        { key: 'visitor_infos', label: 'Visitor infos', type: 'number', placeholder: '128' },
      ],
      [
        { key: 'age', label: 'Age', placeholder: '12 or 12,99' },
        { key: 'price', label: 'Price', placeholder: 'free, donation or 5,EUR' },
      ],
    ],
  },
]

const defaultFilterForm: PortalFilterForm = {
  categories: '',
  time: '',
  venues: '',
  spaces: '',
  space_types: '',
  organizations: '',
  countries: '',
  postal_code: '',
  city: '',
  event_types: '',
  tags: '',
  accessibility: null,
  visitor_infos: null,
  age: '',
  price: '',
  lon: null,
  lat: null,
  radius: null,
  language: '',
}

const form = reactive<PortalFilterForm>(createFilterForm(store.draft?.prefilter ?? null))
const originalForm = computed(() => createFilterForm(store.original?.prefilter ?? null))
const isDirty = computed(() => stableSerialize(buildFilterPayload(form)) !== stableSerialize(buildFilterPayload(originalForm.value)))

watch(isDirty, value => emit('dirty-change', value), { immediate: true })

function cloneForm(value: PortalFilterForm): PortalFilterForm {
  return JSON.parse(JSON.stringify(value))
}

function readString(source: Record<string, unknown> | null, key: FilterFieldKey, fallback: unknown) {
  const value = source?.[key]
  return typeof value === 'string'
      ? value
      : (typeof fallback === 'string' ? fallback : '')
}

function readNumber(source: Record<string, unknown> | null, key: FilterFieldKey, fallback: unknown) {
  const value = source?.[key]
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed)
        ? parsed
        : (typeof fallback === 'number' ? fallback : null)
  }
  return typeof fallback === 'number' ? fallback : null
}

function createFilterForm(filter: Record<string, unknown> | null): PortalFilterForm {
  const defaults = cloneForm(defaultFilterForm)

  return {
    categories: readString(filter, 'categories', defaults.categories),
    time: readString(filter, 'time', defaults.time),
    venues: readString(filter, 'venues', defaults.venues),
    spaces: readString(filter, 'spaces', defaults.spaces),
    space_types: readString(filter, 'space_types', defaults.space_types),
    organizations: readString(filter, 'organizations', defaults.organizations),
    countries: readString(filter, 'countries', defaults.countries),
    postal_code: readString(filter, 'postal_code', defaults.postal_code),
    city: readString(filter, 'city', defaults.city),
    event_types: readString(filter, 'event_types', defaults.event_types),
    tags: readString(filter, 'tags', defaults.tags),
    accessibility: readNumber(filter, 'accessibility', defaults.accessibility),
    visitor_infos: readNumber(filter, 'visitor_infos', defaults.visitor_infos),
    age: readString(filter, 'age', defaults.age),
    price: readString(filter, 'price', defaults.price),
    lon: readNumber(filter, 'lon', defaults.lon),
    lat: readNumber(filter, 'lat', defaults.lat),
    radius: readNumber(filter, 'radius', defaults.radius),
    language: readString(filter, 'language', defaults.language),
  }
}

function buildFilterPayload(value: PortalFilterForm): PortalFilterPayload {
  const payload: PortalFilterPayload = {}

  for (const field of filterGroups.flatMap(group => group.rows).flat()) {
    const current = value[field.key]
    if (typeof current === 'string' && current.trim()) {
      payload[field.key] = current.trim()
    } else if (typeof current === 'number' && Number.isFinite(current)) {
      payload[field.key] = current
    }
  }

  return payload
}

function stableSerialize(value: unknown) {
  return JSON.stringify(value)
}

function getFieldValue(field: FilterField) {
  return form[field.key]
}

function setFieldValue(field: FilterField, value: string | number | null) {
  form[field.key] = field.type === 'number'
      ? (typeof value === 'number' ? value : null)
      : String(value ?? '')
}

async function commitTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original || !draft.uuid) return

  store.saving = true
  store.error = null

  try {
    const filter = buildFilterPayload(form)
    await apiFetch(`/api/admin/portal/${draft.uuid}/filter`, {
      method: 'PUT',
      body: JSON.stringify(filter),
    })

    draft.prefilter = JSON.parse(JSON.stringify(filter))
    original.prefilter = JSON.parse(JSON.stringify(filter))
  } catch (err) {
    store.error = t('failed_to_save_portal')
    console.error(err)
  } finally {
    store.saving = false
  }
}

function resetTab() {
  Object.assign(form, cloneForm(originalForm.value))
  if (store.draft && store.original) {
    store.draft.prefilter = store.original.prefilter
        ? JSON.parse(JSON.stringify(store.original.prefilter))
        : null
  }
}

defineExpose({
  commitTab,
})
</script>

<style scoped>
.portal-filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--uranus-color-6);
}

.portal-filter-group h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}
</style>
