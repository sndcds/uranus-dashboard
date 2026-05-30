<!--
  src/component/portal/view/UranusPortalFooter.vue
-->

<template>
  <footer
      v-if="visible"
      class="uranus-portal-events__footer"
  >
    <div class="uranus-portal-events__footer-logo">
      <div
          v-if="config.showLogo && logoUrl"
          class="uranus-portal-events__footer-logo-frame"
          :style="logoFrameStyle"
      >
        <a
            v-if="config.logoLinkUrl"
            class="uranus-portal-events__footer-logo-link"
            :href="config.logoLinkUrl"
            :target="config.logoLinkTarget"
            :rel="linkRel"
        >
          <UranusLogoImage
              :logoURL="logoUrl"
              theme="light"
              :pixelCount="logoPixelCount"
              :maxWidth="config.logoWidth"
              :maxHeight="config.logoHeight"
          />
        </a>

        <UranusLogoImage
            v-else
            :logoURL="logoUrl"
            theme="light"
            :pixelCount="logoPixelCount"
            :maxWidth="config.logoWidth"
            :maxHeight="config.logoHeight"
        />
      </div>
    </div>

    <div
        v-if="textHtml"
        class="uranus-portal-events__footer-text"
        v-html="textHtml"
    />

    <nav
        v-if="config.links.length"
        class="uranus-portal-events__footer-links"
    >
      <a
          v-for="(link, index) in config.links"
          :key="`${link.url}-${index}`"
          :href="link.url"
          :target="link.target"
          :rel="link.target === '_blank'
            ? 'noopener noreferrer'
            : undefined"
      >
        {{ link.label }}
      </a>
    </nav>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UranusLogoImage from '@/component/ui/UranusLogoImage.vue'
import type {
  PortalFooterConfig,
  PortalLinkTarget,
} from '@/component/portal/editor/portalLayoutConfig'

const props = defineProps<{
  config: PortalFooterConfig
  logoUrl: string | null
  textHtml: string | null
}>()

const visible = computed(() =>
    props.config.showLogo ||
    !!props.textHtml ||
    props.config.links.length > 0
)

const logoFrameStyle = computed(() => ({
  width: `${props.config.logoWidth}px`,
  height: `${props.config.logoHeight}px`,
}))

const logoPixelCount = computed(
    () => props.config.logoWidth * props.config.logoHeight
)

const linkRel = computed(() =>
    getLinkRel(props.config.logoLinkTarget)
)

function getLinkRel(target: PortalLinkTarget) {
  return target === '_blank'
      ? 'noopener noreferrer'
      : undefined
}
</script>