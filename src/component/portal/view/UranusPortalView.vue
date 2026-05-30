<!--
  src/component/portal/view/UranusPortalView.vue
-->

<template>
  <component
      :is="'style'"
      v-if="portalRenderReady && portalStructuredCss"
      type="text/css"
      v-text="portalStructuredCss"
  ></component>
  <component
      :is="'style'"
      v-if="portalRenderReady && portalCustomCss"
      type="text/css"
      v-text="portalCustomCss"
  ></component>
  <div
      v-if="portalRenderReady"
      class="uranus-portal-events"
      :class="`uranus-portal-events--header-${headerConfig.layout}`"
      :data-portal-uuid="portalUuid"
      :style="portalRootStyle"
  >
    <header
        class="uranus-portal-events-header"
        :class="portalHeaderLayoutClass"
    >
      <div v-if="headerConfig.showLogo" class="uranus-portal-events-header__logo">
        <div
            v-if="webLogoUrl"
            class="uranus-portal-events-header__logo-frame"
            :style="headerLogoFrameStyle"
        >
          <a
              v-if="headerConfig.logoLinkUrl"
              class="uranus-portal-events__logo-link"
              :href="headerConfig.logoLinkUrl"
              :target="headerConfig.logoLinkTarget"
              :rel="getLinkRel(headerConfig.logoLinkTarget)"
          >
            <UranusLogoImage
                class="uranus-portal-events-header__logo-image"
                :logoURL="webLogoUrl"
                theme="light"
                :pixelCount="headerLogoPixelCount"
                :maxWidth="headerConfig.logoWidth"
                :maxHeight="headerConfig.logoHeight"
            />
          </a>

          <UranusLogoImage
              v-else
              class="uranus-portal-events-header__logo-image"
              :logoURL="webLogoUrl"
              theme="light"
              :pixelCount="headerLogoPixelCount"
              :maxWidth="headerConfig.logoWidth"
              :maxHeight="headerConfig.logoHeight"
          />
        </div>
      </div>

      <div
          v-if="headerConfig.showTitle || headerConfig.showDescription"
          class="uranus-portal-events-header__title"
      >
        <h1 v-if="headerConfig.showTitle">{{ portal?.name ?? t('events') }}</h1>
        <p v-if="headerConfig.showDescription">
          {{ portal?.description }}
        </p>
      </div>

      <nav class="uranus-portal-events-header__buttons">
        <a
            v-for="(button, index) in headerConfig.buttons"
            :key="`${button.url}-${index}`"
            :href="button.url"
            :target="button.target"
            :rel="getLinkRel(button.target)"
            :class="['uranus-portal__button', button.cssClass]"
        >
          {{ button.label }}
        </a>
      </nav>

      <div class="uranus-portal-events-header__icon-links"></div>

    </header>

    <div v-if="portalError" class="uranus-portal-events__state">
      {{ portalError }}
    </div>

    <div v-else class="uranus-portal-events__map-wrapper">
      <UranusVenuesMap
          load-mode="all"
          :show-details-action="false"
          :persist-view-state="false"
      />
    </div>

    <footer
        v-if="showPortalFooter"
        class="uranus-portal-events__footer"
    >
      <div class="uranus-portal-events__footer-logo">
        <div
            v-if="footerConfig.showLogo && footerLogoUrl"
            class="uranus-portal-events__footer-logo-frame"
            :style="footerLogoFrameStyle"
        >
          <a
              v-if="footerConfig.logoLinkUrl"
              class="uranus-portal-events__footer-logo-link"
              :href="footerConfig.logoLinkUrl"
              :target="footerConfig.logoLinkTarget"
              :rel="getLinkRel(footerConfig.logoLinkTarget)"
          >
            <UranusLogoImage
                :logoURL="footerLogoUrl"
                theme="light"
                :pixelCount="footerLogoPixelCount"
                :maxWidth="footerConfig.logoWidth"
                :maxHeight="footerConfig.logoHeight"
            />
          </a>

          <UranusLogoImage
              v-else
              :logoURL="footerLogoUrl"
              theme="light"
              :pixelCount="footerLogoPixelCount"
              :maxWidth="footerConfig.logoWidth"
              :maxHeight="footerConfig.logoHeight"
          />
        </div>
      </div>

      <div
          v-if="footerTextHtml"
          class="uranus-portal-events__footer-text"
          v-html="footerTextHtml"
      ></div>

      <nav v-if="footerConfig.links.length" class="uranus-portal-events__footer-links">
        <a
            v-for="(link, index) in footerConfig.links"
            :key="`${link.url}-${index}`"
            :href="link.url"
            :target="link.target"
            :rel="getLinkRel(link.target)"
        >
          {{ link.label }}
        </a>
      </nav>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { apiFetch } from '@/api.ts'
import UranusLogoImage from '@/component/ui/UranusLogoImage.vue'
import UranusVenuesMap from '@/component/map/UranusVenuesMap.vue'
import { apiBaseUrl } from '@/util/util.ts'
import '@/style/portal_view.scss'
import { marked } from 'marked'
import {
  createFooterConfig,
  createHeaderConfig,
  type PortalFooterConfig,
  type PortalHeaderConfig,
  type PortalLinkTarget,
} from '@/component/portal/editor/portalLayoutConfig.ts'

type PortalStyleSection = Record<string, string | number | null | undefined>

interface PortalStyle {
  'custom-css'?: string
  portal?: PortalStyleSection
  content?: PortalStyleSection
  header?: {
    title?: PortalStyleSection
    description?: PortalStyleSection
  }
  'event-grid'?: PortalStyleSection
  'event-card'?: PortalStyleSection & {
    hover?: PortalStyleSection
  }
  'event-card-image'?: PortalStyleSection & {
    hover?: PortalStyleSection
  }
  'event-card-info'?: PortalStyleSection
  'event-card-tags'?: PortalStyleSection
  'event-card-type-chips'?: PortalStyleSection
  // Legacy style keys kept for existing portal records.
  grid?: PortalStyleSection
  card?: PortalStyleSection
}

interface PortalDTO {
  uuid: string
  name: string
  description?: string | null
  org_uuid: string
  spatial_filter_mode?: string | null
  pre_filter?: Record<string, unknown> | string | null
  prefilter?: Record<string, unknown> | null
  style?: PortalStyle | string | null
  header?: Record<string, unknown> | string | null
  footer?: Record<string, unknown> | string | null
  web_logo_uuid?: string | null
  background_image_uuid?: string | null
  footer_logo_uuid?: string | null
}

const { t } = useI18n({ useScope: 'global' })

const route = useRoute()
const apiBase = apiBaseUrl()


const webLogoUrl = computed(() => {
  const uuid = portal.value?.web_logo_uuid
  return uuid
      ? `${apiBase}/api/image/${uuid}?width=480&type=png&quality=80`
      : null
})

const footerLogoUrl = computed(() => {
  const uuid = portal.value?.footer_logo_uuid
  return uuid
      ? `${apiBase}/api/image/${uuid}?width=480&type=png&quality=80`
      : null
})

const backgroundUrl = computed(() => {
  const uuid = portal.value?.background_image_uuid
  return uuid
      ? `${apiBase}/api/image/${uuid}?width=1920`
      : null
})

const portalUuid = computed(() => route.params.uuid?.toString() ?? null)

const portal = ref<PortalDTO | null>(null)
const portalLoading = ref(false)
const portalError = ref<string | null>(null)
const portalRenderReady = computed(() => !portalLoading.value && (!!portal.value || !!portalError.value))
const portalCustomCss = computed(() => {
  const css = normalizedPortalStyle.value?.['custom-css']
  return typeof css === 'string' && css.trim() ? css : ''
})
const normalizedPortalStyle = computed(() => normalizePortalStyle(portal.value?.style))
const headerConfig = computed<PortalHeaderConfig>(() => createHeaderConfig(normalizeJsonObject(portal.value?.header)))
const portalHeaderLayoutClass = computed(() => {
  return headerConfig.value.layout === 'centered'
      ? 'uranus-portal-events-header__centered'
      : 'uranus-portal-events-header__left'
})
const footerConfig = computed<PortalFooterConfig>(() => createFooterConfig(normalizeJsonObject(portal.value?.footer)))
const footerTextHtml = computed(() => formatMarkdown(footerConfig.value.text))
const showPortalFooter = computed(() =>
    footerConfig.value.showLogo ||
    !!footerTextHtml.value ||
    footerConfig.value.links.length > 0
)
const headerLogoFrameStyle = computed(() => createPixelSizeStyle(headerConfig.value.logoWidth, headerConfig.value.logoHeight))
const footerLogoFrameStyle = computed(() => createPixelSizeStyle(footerConfig.value.logoWidth, footerConfig.value.logoHeight))
const headerLogoPixelCount = computed(() => headerConfig.value.logoWidth * headerConfig.value.logoHeight)
const footerLogoPixelCount = computed(() => footerConfig.value.logoWidth * footerConfig.value.logoHeight)
const portalRootStyle = computed(() => ({
  '--portal-background-image': backgroundUrl.value ? `url(${backgroundUrl.value})` : undefined,
}))
const portalStructuredCss = computed(() => {
  const style = normalizedPortalStyle.value
  const uuid = portalUuid.value

  if (!style || !uuid) return ''

  return createPortalStructuredCss(style, uuid)
})

const initialized = ref(false)

function normalizePortalStyle(style: PortalStyle | string | null | undefined): PortalStyle | null {
  return normalizeJsonObject(style) as PortalStyle | null
}

function normalizeJsonObject(value: object | string | null | undefined): Record<string, unknown> | null {
  if (!value) return null
  if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>
  if (typeof value !== 'string') return null

  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : null
  } catch {
    return null
  }
}

function formatMarkdown(markdown: string) {
  if (!markdown.trim()) return ''

  try {
    return marked(markdown)
  } catch {
    return markdown
  }
}

function getLinkRel(target: PortalLinkTarget) {
  return target === '_blank' ? 'noopener noreferrer' : undefined
}

function createPixelSizeStyle(width: number, height: number) {
  return {
    width: `${width}px`,
    height: `${height}px`,
  }
}

function createPortalStructuredCss(style: PortalStyle, portalUuid: string) {
  const rootSelector = `.uranus-portal-events[data-portal-uuid="${escapeCssString(portalUuid)}"]`
  const parts = [
    createRule(rootSelector, [
      cssDeclaration('background', readStyleValue(style.portal, 'background')),
      cssDeclaration('padding', readStyleValue(style.portal, 'padding')),
      cssDeclaration('color', readStyleValue(style.portal, 'color')),
      cssDeclaration('font-family', readStyleValue(style.portal, 'font-family')),
    ]),
    createRule(`${rootSelector} .uranus-portal-events__type-scroller,
      ${rootSelector} .uranus-portal-events__grid,
      ${rootSelector} .uranus-portal-events__map-wrapper,
      ${rootSelector} .uranus-portal-events__state,
      ${rootSelector} .uranus-portal-events__load-more-trigger`, [
      cssDeclaration('max-width', readStyleValue(style.content, 'max-width')),
      cssDeclaration('align-self', normalizeContentAlign(readStyleValue(style.content, 'align'))),
    ]),
    createRule(`${rootSelector} .uranus-portal-events-header h1`, [
      cssDeclaration('color', readStyleValue(style.header?.title, 'color')),
      cssDeclaration('font-size', readStyleValue(style.header?.title, 'font-size')),
      cssDeclaration('font-weight', readStyleValue(style.header?.title, 'font-weight')),
      cssDeclaration('line-height', readStyleValue(style.header?.title, 'line-height')),
    ]),
    createRule(`${rootSelector} .uranus-portal-events-header p`, [
      cssDeclaration('color', readStyleValue(style.header?.description, 'color')),
      cssDeclaration('font-size', readStyleValue(style.header?.description, 'font-size')),
      cssDeclaration('line-height', readStyleValue(style.header?.description, 'line-height')),
    ]),
    createRule(`${rootSelector} .uranus-portal-events__grid`, [
      cssDeclaration('gap', readStyleValue(style['event-grid'] ?? style.grid, 'gap')),
      cssDeclaration('grid-template-columns', createGridTemplate(readStyleValue(style['event-grid'] ?? style.grid, 'min-card-width'))),
    ]),
    createRule(`${rootSelector} .uranus-portal-event-card`, [
      cssDeclaration('background', readStyleValue(style['event-card'] ?? style.card, 'background')),
      cssDeclaration('padding', readStyleValue(style['event-card'] ?? style.card, 'padding')),
      cssDeclaration('gap', readStyleValue(style['event-card'] ?? style.card, 'gap')),
      cssDeclaration('border', readStyleValue(style['event-card'] ?? style.card, 'border')),
      cssDeclaration('border-radius', readStyleValue(style['event-card'] ?? style.card, 'radius') ?? readStyleValue(style['event-card'] ?? style.card, 'border-radius')),
      cssDeclaration('box-shadow', readStyleValue(style['event-card'] ?? style.card, 'shadow')),
      cssDeclaration('transition', readStyleValue(style['event-card'] ?? style.card, 'transition')),
    ]),
    createRule(`${rootSelector} .uranus-portal-event-card:hover`, [
      // cssDeclaration('background', readStyleValue((style['event-card'] ?? style.card)?.hover, 'background')),
      // cssDeclaration('border', readStyleValue((style['event-card'] ?? style.card)?.hover, 'border')),
      // cssDeclaration('box-shadow', readStyleValue((style['event-card'] ?? style.card)?.hover, 'shadow')),
      //cssDeclaration('transform', createScaleTransform(readStyleValue((style['event-card'] ?? style.card)?.hover, 'scale'))),
    ]),
    createRule(`${rootSelector} .uranus-portal-event-card__image-frame`, [
      cssDeclaration('background', readStyleValue(style['event-card-image'], 'background')),
      cssDeclaration('aspect-ratio', readStyleValue(style['event-card-image'], 'aspect-ratio')),
      cssDeclaration('border-radius', readStyleValue(style['event-card-image'], 'border-radius')),
    ]),
    createRule(`${rootSelector} .uranus-portal-event-card__image`, [
      cssDeclaration('object-fit', readStyleValue(style['event-card-image'], 'object-fit')),
      cssDeclaration('filter', readStyleValue(style['event-card-image'], 'filter')),
      cssDeclaration('transition', createImageTransition(readStyleValue(style['event-card-image'], 'transition'))),
    ]),
    createRule(`${rootSelector} .uranus-portal-event-card:hover .uranus-portal-event-card__image`, [
      cssDeclaration('filter', readStyleValue(style['event-card-image']?.hover, 'filter')),
      cssDeclaration('transform', createScaleTransform(readStyleValue(style['event-card-image']?.hover, 'scale'))),
    ]),
    createRule(`${rootSelector} .uranus-portal-event-card__body`, [
      cssDeclaration('padding', readStyleValue(style['event-card-info'], 'padding')),
      cssDeclaration('background', readStyleValue(style['event-card-info'], 'background')),
      cssDeclaration('border', readStyleValue(style['event-card-info'], 'border')),
      cssDeclaration('border-radius', readStyleValue(style['event-card-info'], 'border-radius')),
      cssDeclaration('color', readStyleValue(style['event-card-info'], 'color')),
    ]),
    createRule(`${rootSelector} .uranus-portal-event-card h2`, [
      cssDeclaration('font-family', readStyleValue(style['event-card-info'], 'title-font-family')),
      cssDeclaration('font-size', readStyleValue(style['event-card-info'], 'title-font-size')),
      cssDeclaration('font-weight', readStyleValue(style['event-card-info'], 'title-font-weight')),
    ]),
    createRule(`${rootSelector} .uranus-portal-event-card__meta`, [
      cssDeclaration('font-family', readStyleValue(style['event-card-info'], 'meta-font-family')),
      cssDeclaration('font-size', readStyleValue(style['event-card-info'], 'meta-font-size')),
      cssDeclaration('font-weight', readStyleValue(style['event-card-info'], 'meta-font-weight')),
      cssDeclaration('line-height', readStyleValue(style['event-card-info'], 'meta-line-height')),
      cssDeclaration('gap', readStyleValue(style['event-card-info'], 'meta-gap')),
    ]),
  ]

  return parts.filter(Boolean).join('\n')
}

function readStyleValue(section: PortalStyleSection | null | undefined, key: string) {
  const value = section?.[key]

  if (value == null || value === '') return null
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : null
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed || /[{};]/.test(trimmed)) return null

  return trimmed
}

function createRule(selector: string, declarations: Array<string | null>) {
  const body = declarations.filter(Boolean)
  if (!body.length) return ''

  return `${selector} {\n${body.map(declaration => `  ${declaration}`).join('\n')}\n}`
}

function cssDeclaration(property: string, value: string | null | undefined) {
  return value ? `${property}: ${value};` : null
}

function createGridTemplate(minCardWidth: string | null) {
  return minCardWidth ? `repeat(auto-fill, minmax(${minCardWidth}, 1fr))` : null
}

function createScaleTransform(scale: string | null) {
  return scale ? `scale(${scale})` : null
}

function createImageTransition(transition: string | null) {
  return transition ? `transform ${transition}, filter ${transition}` : null
}

function normalizeContentAlign(value: string | null) {
  if (!value) return null

  switch (value) {
    case 'left':
    case 'start':
      return 'flex-start'
    case 'center':
      return 'center'
    case 'right':
    case 'end':
      return 'flex-end'
    case 'stretch':
      return 'stretch'
    default:
      return value
  }
}

function escapeCssString(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\a ')
}

async function fetchPortal() {
  if (!portalUuid.value) {
    portal.value = null
    portalError.value = 'Missing portal UUID'
    return
  }

  portalLoading.value = true
  portalError.value = null

  try {
    const apiPath = `/api/portal/${encodeURIComponent(portalUuid.value)}`
    const apiResponse = await apiFetch<PortalDTO>(apiPath)
    portal.value = apiResponse.data ?? null
  } catch (err) {
    portal.value = null
    portalError.value = 'Failed to load portal'
    console.error(err)
  } finally {
    portalLoading.value = false
  }
}

watch(portalUuid, async () => {
  if (!initialized.value) return
  await fetchPortal()
})

onMounted(async () => {
  await fetchPortal()
  initialized.value = true
})
</script>
