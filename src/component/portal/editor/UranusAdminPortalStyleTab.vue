<template>
  <UranusForm>
    <section
        v-for="group in styleGroups"
        :key="group.key"
        class="portal-style-group"
    >
      <h2>{{ group.label }}</h2>

      <UranusFormRow
          v-for="row in group.rows"
          :key="row.map(field => field.path).join('-')"
          :cols="row.length"
      >
        <UranusTextfield
            v-for="field in row"
            :id="`portal-style-${field.path}`"
            :key="field.path"
            :model-value="getFieldValue(field)"
            :type="field.type ?? 'text'"
            :label="field.label"
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

type StyleFieldPath =
    | 'portal.background'
    | 'portal.padding'
    | 'portal.color'
    | 'portal.fontFamily'
    | 'content.maxWidth'
    | 'content.align'
    | 'header.title.color'
    | 'header.title.fontSize'
    | 'header.title.fontWeight'
    | 'header.title.lineHeight'
    | 'header.description.color'
    | 'header.description.fontSize'
    | 'header.description.lineHeight'
    | 'eventGrid.gap'
    | 'eventGrid.minCardWidth'
    | 'eventCard.background'
    | 'eventCard.border'
    | 'eventCard.radius'
    | 'eventCard.shadow'
    | 'eventCard.hover.shadow'
    | 'eventCard.hover.scale'

type StyleField = {
  path: StyleFieldPath
  label: string
  type?: 'text' | 'number'
}

type PortalStyleForm = {
  portal: {
    background: string
    padding: string
    color: string
    fontFamily: string
  }
  content: {
    maxWidth: string
    align: string
  }
  header: {
    title: {
      color: string
      fontSize: string
      fontWeight: number | null
      lineHeight: number | null
    }
    description: {
      color: string
      fontSize: string
      lineHeight: number | null
    }
  }
  eventGrid: {
    gap: string
    minCardWidth: string
  }
  eventCard: {
    background: string
    border: string
    radius: string
    shadow: string
    hover: {
      shadow: string
      scale: number | null
    }
  }
}

type PortalStylePayload = {
  portal: {
    background: string
    padding: string
    color: string
    'font-family': string
  }
  content: {
    'max-width': string
    align: string
  }
  header: {
    title: {
      color: string
      'font-size': string
      'font-weight': number | null
      'line-height': number | null
    }
    description: {
      color: string
      'font-size': string
      'line-height': number | null
    }
  }
  'event-grid': {
    gap: string
    'min-card-width': string
  }
  'event-card': {
    background: string
    border: string
    radius: string
    shadow: string
    hover: {
      shadow: string
      scale: number | null
    }
  }
}

const { t } = useI18n({ useScope: 'global' })
const store = useUranusPortalStore()

const emit = defineEmits<{
  (event: 'dirty-change', value: boolean): void
}>()

const styleGroups: Array<{ key: string, label: string, rows: StyleField[][] }> = [
  {
    key: 'portal',
    label: 'Portal',
    rows: [
      [
        { path: 'portal.background', label: 'Background' },
        { path: 'portal.padding', label: 'Padding' },
      ],
      [
        { path: 'portal.color', label: 'Color' },
        { path: 'portal.fontFamily', label: 'Font family' },
      ],
    ],
  },
  {
    key: 'content',
    label: 'Content',
    rows: [
      [
        { path: 'content.maxWidth', label: 'Max width' },
        { path: 'content.align', label: 'Align' },
      ],
    ],
  },
  {
    key: 'header-title',
    label: 'Header title',
    rows: [
      [
        { path: 'header.title.color', label: 'Color' },
        { path: 'header.title.fontSize', label: 'Font size' },
      ],
      [
        { path: 'header.title.fontWeight', label: 'Font weight', type: 'number' },
        { path: 'header.title.lineHeight', label: 'Line height', type: 'number' },
      ],
    ],
  },
  {
    key: 'header-description',
    label: 'Header description',
    rows: [
      [
        { path: 'header.description.color', label: 'Color' },
        { path: 'header.description.fontSize', label: 'Font size' },
        { path: 'header.description.lineHeight', label: 'Line height', type: 'number' },
      ],
    ],
  },
  {
    key: 'event-grid',
    label: 'Event grid',
    rows: [
      [
        { path: 'eventGrid.gap', label: 'Gap' },
        { path: 'eventGrid.minCardWidth', label: 'Min card width' },
      ],
    ],
  },
  {
    key: 'event-card',
    label: 'Event card',
    rows: [
      [
        { path: 'eventCard.background', label: 'Background' },
        { path: 'eventCard.border', label: 'Border' },
      ],
      [
        { path: 'eventCard.radius', label: 'Radius' },
        { path: 'eventCard.shadow', label: 'Shadow' },
      ],
    ],
  },
  {
    key: 'event-card-hover',
    label: 'Event card hover',
    rows: [
      [
        { path: 'eventCard.hover.shadow', label: 'Shadow' },
        { path: 'eventCard.hover.scale', label: 'Scale', type: 'number' },
      ],
    ],
  },
]

const defaultStyleForm: PortalStyleForm = {
  portal: {
    background: '#ffcc00',
    padding: '2rem',
    color: '#333',
    fontFamily: 'Helvetica Neue, Arial',
  },
  content: {
    maxWidth: '1600px',
    align: 'left',
  },
  header: {
    title: {
      color: '#ffcc00',
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.05,
    },
    description: {
      color: 'black',
      fontSize: '1.1rem',
      lineHeight: 1.4,
    },
  },
  eventGrid: {
    gap: '20px',
    minCardWidth: '260px',
  },
  eventCard: {
    background: '#ffcc66',
    border: '1px solid green',
    radius: '2px',
    shadow: '0 1px 2px rgba(0,0,0,0.08)',
    hover: {
      shadow: '0 3px 1px rgba(0,0,0,0.12)',
      scale: 1.03,
    },
  },
}

const form = reactive<PortalStyleForm>(createStyleForm(store.draft?.style ?? null))
const originalForm = computed(() => createStyleForm(store.original?.style ?? null))
const isDirty = computed(() => stableSerialize(buildStylePayload(form)) !== stableSerialize(buildStylePayload(originalForm.value)))

watch(isDirty, value => emit('dirty-change', value), { immediate: true })

function cloneForm(value: PortalStyleForm): PortalStyleForm {
  return JSON.parse(JSON.stringify(value))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readRecord(source: Record<string, unknown> | null, key: string): Record<string, unknown> | null {
  const value = source?.[key]
  return isRecord(value) ? value : null
}

function readString(source: Record<string, unknown> | null, key: string, fallback: string) {
  const value = source?.[key]
  return typeof value === 'string' ? value : fallback
}

function readNumber(source: Record<string, unknown> | null, key: string, fallback: number | null) {
  const value = source?.[key]
  return typeof value === 'number' ? value : fallback
}

function createStyleForm(style: Record<string, unknown> | null): PortalStyleForm {
  const defaults = cloneForm(defaultStyleForm)
  const portal = readRecord(style, 'portal')
  const content = readRecord(style, 'content')
  const header = readRecord(style, 'header')
  const headerTitle = readRecord(header, 'title')
  const headerDescription = readRecord(header, 'description')
  const eventGrid = readRecord(style, 'event-grid') ?? readRecord(style, 'grid')
  const eventCard = readRecord(style, 'event-card') ?? readRecord(style, 'card')
  const eventCardHover = readRecord(eventCard, 'hover')

  return {
    portal: {
      background: readString(portal, 'background', defaults.portal.background),
      padding: readString(portal, 'padding', defaults.portal.padding),
      color: readString(portal, 'color', defaults.portal.color),
      fontFamily: readString(portal, 'font-family', defaults.portal.fontFamily),
    },
    content: {
      maxWidth: readString(content, 'max-width', defaults.content.maxWidth),
      align: readString(content, 'align', defaults.content.align),
    },
    header: {
      title: {
        color: readString(headerTitle, 'color', defaults.header.title.color),
        fontSize: readString(headerTitle, 'font-size', defaults.header.title.fontSize),
        fontWeight: readNumber(headerTitle, 'font-weight', defaults.header.title.fontWeight),
        lineHeight: readNumber(headerTitle, 'line-height', defaults.header.title.lineHeight),
      },
      description: {
        color: readString(headerDescription, 'color', defaults.header.description.color),
        fontSize: readString(headerDescription, 'font-size', defaults.header.description.fontSize),
        lineHeight: readNumber(headerDescription, 'line-height', defaults.header.description.lineHeight),
      },
    },
    eventGrid: {
      gap: readString(eventGrid, 'gap', defaults.eventGrid.gap),
      minCardWidth: readString(eventGrid, 'min-card-width', defaults.eventGrid.minCardWidth),
    },
    eventCard: {
      background: readString(eventCard, 'background', defaults.eventCard.background),
      border: readString(eventCard, 'border', defaults.eventCard.border),
      radius: readString(eventCard, 'radius', readString(eventCard, 'border-radius', defaults.eventCard.radius)),
      shadow: readString(eventCard, 'shadow', defaults.eventCard.shadow),
      hover: {
        shadow: readString(eventCardHover, 'shadow', defaults.eventCard.hover.shadow),
        scale: readNumber(eventCardHover, 'scale', defaults.eventCard.hover.scale),
      },
    },
  }
}

function buildStylePayload(value: PortalStyleForm): PortalStylePayload {
  return {
    portal: {
      background: value.portal.background,
      padding: value.portal.padding,
      color: value.portal.color,
      'font-family': value.portal.fontFamily,
    },
    content: {
      'max-width': value.content.maxWidth,
      align: value.content.align,
    },
    header: {
      title: {
        color: value.header.title.color,
        'font-size': value.header.title.fontSize,
        'font-weight': value.header.title.fontWeight,
        'line-height': value.header.title.lineHeight,
      },
      description: {
        color: value.header.description.color,
        'font-size': value.header.description.fontSize,
        'line-height': value.header.description.lineHeight,
      },
    },
    'event-grid': {
      gap: value.eventGrid.gap,
      'min-card-width': value.eventGrid.minCardWidth,
    },
    'event-card': {
      background: value.eventCard.background,
      border: value.eventCard.border,
      radius: value.eventCard.radius,
      shadow: value.eventCard.shadow,
      hover: {
        shadow: value.eventCard.hover.shadow,
        scale: value.eventCard.hover.scale,
      },
    },
  }
}

function stableSerialize(value: unknown) {
  return JSON.stringify(value)
}

function getPathTarget(path: StyleFieldPath) {
  const segments = path.split('.')
  let target: Record<string, any> = form

  for (const segment of segments.slice(0, -1)) {
    target = target[segment]
  }

  return {
    target,
    key: segments[segments.length - 1] ?? '',
  }
}

function getFieldValue(field: StyleField) {
  const { target, key } = getPathTarget(field.path)
  return target[key]
}

function setFieldValue(field: StyleField, value: string | number | null) {
  const { target, key } = getPathTarget(field.path)
  target[key] = field.type === 'number'
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
    const style = buildStylePayload(form)
    await apiFetch(`/api/admin/portal/${draft.uuid}/style`, {
      method: 'PUT',
      body: JSON.stringify(style),
    })

    draft.style = JSON.parse(JSON.stringify(style))
    original.style = JSON.parse(JSON.stringify(style))
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
    store.draft.style = store.original.style
        ? JSON.parse(JSON.stringify(store.original.style))
        : null
  }
}
</script>

<style scoped>
.portal-style-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--uranus-color-6);
}

.portal-style-group h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}
</style>
