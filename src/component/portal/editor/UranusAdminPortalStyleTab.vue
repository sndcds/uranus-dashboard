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

    <section class="portal-style-group">
      <h2>Custom CSS</h2>
      <UranusTextarea
          id="portal-style-custom-css"
          v-model="form.customCss"
          label="CSS"
          height="260px"
          resize="vertical"
          spellcheck="false"
      />
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
import UranusTextarea from '@/component/ui/UranusTextarea.vue'
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
    | 'eventCard.padding'
    | 'eventCard.gap'
    | 'eventCard.border'
    | 'eventCard.radius'
    | 'eventCard.shadow'
    | 'eventCard.transition'
    | 'eventCard.hover.background'
    | 'eventCard.hover.border'
    | 'eventCard.hover.shadow'
    | 'eventCard.hover.scale'
    | 'eventCardImage.background'
    | 'eventCardImage.aspectRatio'
    | 'eventCardImage.borderRadius'
    | 'eventCardImage.objectFit'
    | 'eventCardImage.filter'
    | 'eventCardImage.transition'
    | 'eventCardImage.hover.filter'
    | 'eventCardImage.hover.scale'
    | 'eventCardInfo.padding'
    | 'eventCardInfo.background'
    | 'eventCardInfo.border'
    | 'eventCardInfo.borderRadius'
    | 'eventCardInfo.color'
    | 'eventCardInfo.titleFontFamily'
    | 'eventCardInfo.titleFontSize'
    | 'eventCardInfo.titleFontWeight'
    | 'eventCardInfo.metaFontFamily'
    | 'eventCardInfo.metaFontSize'
    | 'eventCardInfo.metaFontWeight'
    | 'eventCardInfo.metaLineHeight'
    | 'eventCardInfo.metaGap'

type StyleField = {
  path: StyleFieldPath
  label: string
  type?: 'text' | 'number'
}

type PortalStyleForm = {
  customCss: string
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
    padding: string
    gap: string
    border: string
    radius: string
    shadow: string
    transition: string
    hover: {
      background: string
      border: string
      shadow: string
      scale: number | null
    }
  }
  eventCardImage: {
    background: string
    aspectRatio: string
    borderRadius: string
    objectFit: string
    filter: string
    transition: string
    hover: {
      filter: string
      scale: number | null
    }
  }
  eventCardInfo: {
    padding: string
    background: string
    border: string
    borderRadius: string
    color: string
    titleFontFamily: string
    titleFontSize: string
    titleFontWeight: string
    metaFontFamily: string
    metaFontSize: string
    metaFontWeight: string
    metaLineHeight: string
    metaGap: string
  }
}

type PortalStylePayload = {
  'custom-css': string
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
    padding: string
    gap: string
    border: string
    radius: string
    shadow: string
    transition: string
    hover: {
      background: string
      border: string
      shadow: string
      scale: number | null
    }
  }
  'event-card-image': {
    background: string
    'aspect-ratio': string
    'border-radius': string
    'object-fit': string
    filter: string
    transition: string
    hover: {
      filter: string
      scale: number | null
    }
  }
  'event-card-info': {
    padding: string
    background: string
    border: string
    'border-radius': string
    color: string
    'title-font-family': string
    'title-font-size': string
    'title-font-weight': string
    'meta-font-family': string
    'meta-font-size': string
    'meta-font-weight': string
    'meta-line-height': string
    'meta-gap': string
  }
  'event-card-tags': Record<string, never>
  'event-card-type-chips': Record<string, never>
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
        { path: 'eventCard.padding', label: 'Padding' },
        { path: 'eventCard.gap', label: 'Gap' },
      ],
      [
        { path: 'eventCard.border', label: 'Border' },
        { path: 'eventCard.radius', label: 'Radius' },
        { path: 'eventCard.shadow', label: 'Shadow' },
      ],
      [
        { path: 'eventCard.transition', label: 'Transition' },
      ],
    ],
  },
  {
    key: 'event-card-hover',
    label: 'Event card hover',
    rows: [
      [
        { path: 'eventCard.hover.background', label: 'Background' },
        { path: 'eventCard.hover.border', label: 'Border' },
      ],
      [
        { path: 'eventCard.hover.shadow', label: 'Shadow' },
        { path: 'eventCard.hover.scale', label: 'Scale', type: 'number' },
      ],
    ],
  },
  {
    key: 'event-card-image',
    label: 'Event card image',
    rows: [
      [
        { path: 'eventCardImage.background', label: 'Background' },
        { path: 'eventCardImage.aspectRatio', label: 'Aspect ratio' },
      ],
      [
        { path: 'eventCardImage.borderRadius', label: 'Border radius' },
        { path: 'eventCardImage.objectFit', label: 'Object fit' },
      ],
      [
        { path: 'eventCardImage.filter', label: 'Filter' },
        { path: 'eventCardImage.transition', label: 'Transition' },
      ],
      [
        { path: 'eventCardImage.hover.filter', label: 'Hover filter' },
        { path: 'eventCardImage.hover.scale', label: 'Hover scale', type: 'number' },
      ],
    ],
  },
  {
    key: 'event-card-info',
    label: 'Event card info',
    rows: [
      [
        { path: 'eventCardInfo.padding', label: 'Padding' },
        { path: 'eventCardInfo.background', label: 'Background' },
      ],
      [
        { path: 'eventCardInfo.border', label: 'Border' },
        { path: 'eventCardInfo.borderRadius', label: 'Border radius' },
        { path: 'eventCardInfo.color', label: 'Color' },
      ],
      [
        { path: 'eventCardInfo.titleFontFamily', label: 'Title font family' },
        { path: 'eventCardInfo.titleFontSize', label: 'Title font size' },
        { path: 'eventCardInfo.titleFontWeight', label: 'Title font weight' },
      ],
      [
        { path: 'eventCardInfo.metaFontFamily', label: 'Meta font family' },
        { path: 'eventCardInfo.metaFontSize', label: 'Meta font size' },
        { path: 'eventCardInfo.metaFontWeight', label: 'Meta font weight' },
      ],
      [
        { path: 'eventCardInfo.metaLineHeight', label: 'Meta line height' },
        { path: 'eventCardInfo.metaGap', label: 'Meta gap' },
      ],
    ],
  },
]

const defaultStyleForm: PortalStyleForm = {
  customCss: '',
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
    padding: '1rem',
    gap: '1rem',
    border: '1px solid green',
    radius: '2px',
    shadow: '0 1px 2px rgba(0,0,0,0.08)',
    transition: '220ms ease',
    hover: {
      background: '#ff6600',
      border: '1px solid green',
      shadow: '0 3px 1px rgba(0,0,0,0.12)',
      scale: 1.03,
    },
  },
  eventCardImage: {
    background: 'transparent',
    aspectRatio: '2 / 1',
    borderRadius: '0.5rem',
    objectFit: 'cover',
    filter: 'none',
    transition: '220ms ease',
    hover: {
      filter: 'none',
      scale: 1.03,
    },
  },
  eventCardInfo: {
    padding: '0.2rem',
    background: '#ffcc99',
    border: '1px solid green',
    borderRadius: '2px',
    color: '#ffcc00',
    titleFontFamily: 'Helvetica-Neue, Arial',
    titleFontSize: '2rem',
    titleFontWeight: '700',
    metaFontFamily: 'Helvetica-Neue, Arial',
    metaFontSize: '2rem',
    metaFontWeight: '500',
    metaLineHeight: '1.05',
    metaGap: '1.05',
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
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
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
  const eventCardImage = readRecord(style, 'event-card-image')
  const eventCardImageHover = readRecord(eventCardImage, 'hover')
  const eventCardInfo = readRecord(style, 'event-card-info')

  return {
    customCss: readString(style, 'custom-css', defaults.customCss),
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
      padding: readString(eventCard, 'padding', defaults.eventCard.padding),
      gap: readString(eventCard, 'gap', defaults.eventCard.gap),
      border: readString(eventCard, 'border', defaults.eventCard.border),
      radius: readString(eventCard, 'radius', readString(eventCard, 'border-radius', defaults.eventCard.radius)),
      shadow: readString(eventCard, 'shadow', defaults.eventCard.shadow),
      transition: readString(eventCard, 'transition', defaults.eventCard.transition),
      hover: {
        background: readString(eventCardHover, 'background', defaults.eventCard.hover.background),
        border: readString(eventCardHover, 'border', defaults.eventCard.hover.border),
        shadow: readString(eventCardHover, 'shadow', defaults.eventCard.hover.shadow),
        scale: readNumber(eventCardHover, 'scale', defaults.eventCard.hover.scale),
      },
    },
    eventCardImage: {
      background: readString(eventCardImage, 'background', defaults.eventCardImage.background),
      aspectRatio: readString(eventCardImage, 'aspect-ratio', defaults.eventCardImage.aspectRatio),
      borderRadius: readString(eventCardImage, 'border-radius', defaults.eventCardImage.borderRadius),
      objectFit: readString(eventCardImage, 'object-fit', defaults.eventCardImage.objectFit),
      filter: readString(eventCardImage, 'filter', defaults.eventCardImage.filter),
      transition: readString(eventCardImage, 'transition', defaults.eventCardImage.transition),
      hover: {
        filter: readString(eventCardImageHover, 'filter', defaults.eventCardImage.hover.filter),
        scale: readNumber(eventCardImageHover, 'scale', defaults.eventCardImage.hover.scale),
      },
    },
    eventCardInfo: {
      padding: readString(eventCardInfo, 'padding', defaults.eventCardInfo.padding),
      background: readString(eventCardInfo, 'background', defaults.eventCardInfo.background),
      border: readString(eventCardInfo, 'border', defaults.eventCardInfo.border),
      borderRadius: readString(eventCardInfo, 'border-radius', defaults.eventCardInfo.borderRadius),
      color: readString(eventCardInfo, 'color', defaults.eventCardInfo.color),
      titleFontFamily: readString(eventCardInfo, 'title-font-family', defaults.eventCardInfo.titleFontFamily),
      titleFontSize: readString(eventCardInfo, 'title-font-size', defaults.eventCardInfo.titleFontSize),
      titleFontWeight: readString(eventCardInfo, 'title-font-weight', defaults.eventCardInfo.titleFontWeight),
      metaFontFamily: readString(eventCardInfo, 'meta-font-family', defaults.eventCardInfo.metaFontFamily),
      metaFontSize: readString(eventCardInfo, 'meta-font-size', defaults.eventCardInfo.metaFontSize),
      metaFontWeight: readString(eventCardInfo, 'meta-font-weight', defaults.eventCardInfo.metaFontWeight),
      metaLineHeight: readString(eventCardInfo, 'meta-line-height', defaults.eventCardInfo.metaLineHeight),
      metaGap: readString(eventCardInfo, 'meta-gap', defaults.eventCardInfo.metaGap),
    },
  }
}

function buildStylePayload(value: PortalStyleForm): PortalStylePayload {
  return {
    'custom-css': value.customCss,
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
      padding: value.eventCard.padding,
      gap: value.eventCard.gap,
      border: value.eventCard.border,
      radius: value.eventCard.radius,
      shadow: value.eventCard.shadow,
      transition: value.eventCard.transition,
      hover: {
        background: value.eventCard.hover.background,
        border: value.eventCard.hover.border,
        shadow: value.eventCard.hover.shadow,
        scale: value.eventCard.hover.scale,
      },
    },
    'event-card-image': {
      background: value.eventCardImage.background,
      'aspect-ratio': value.eventCardImage.aspectRatio,
      'border-radius': value.eventCardImage.borderRadius,
      'object-fit': value.eventCardImage.objectFit,
      filter: value.eventCardImage.filter,
      transition: value.eventCardImage.transition,
      hover: {
        filter: value.eventCardImage.hover.filter,
        scale: value.eventCardImage.hover.scale,
      },
    },
    'event-card-info': {
      padding: value.eventCardInfo.padding,
      background: value.eventCardInfo.background,
      border: value.eventCardInfo.border,
      'border-radius': value.eventCardInfo.borderRadius,
      color: value.eventCardInfo.color,
      'title-font-family': value.eventCardInfo.titleFontFamily,
      'title-font-size': value.eventCardInfo.titleFontSize,
      'title-font-weight': value.eventCardInfo.titleFontWeight,
      'meta-font-family': value.eventCardInfo.metaFontFamily,
      'meta-font-size': value.eventCardInfo.metaFontSize,
      'meta-font-weight': value.eventCardInfo.metaFontWeight,
      'meta-line-height': value.eventCardInfo.metaLineHeight,
      'meta-gap': value.eventCardInfo.metaGap,
    },
    'event-card-tags': {},
    'event-card-type-chips': {},
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
