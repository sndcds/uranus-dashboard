<!--
  src/component/portal/view/UranusPortalFooter.vue
-->

<template>
  <footer
      v-if="visible"
      class="uranus-portal-footer"
  >
    <div class="uranus-portal-footer__logo">
      <div
          v-if="config.showLogo && logoUrl"
          class="uranus-portal-footer__logo-frame"
          :style="logoFrameStyle"
      >
        <a
            v-if="config.logoLinkUrl"
            class="uranus-portal-footer__logo-link"
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

    <div class="uranus-portal-footer__text">
      <div v-if="textHtml" v-html="textHtml" />
    </div>

    <div class="uranus-portal-footer__links">
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
    </div>
  </footer>
  <div class="uranus-portal-footer__provider">
    <a href="https://kulturbytes.de">Developed&nbsp;with&nbsp;care&nbsp;by&nbsp;&nbsp;<UranusSVG src="/icons/kulturbytes.svg" width="22px" />&nbsp;&nbsp;kulturalbytes.de</a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UranusLogoImage from '@/component/ui/UranusLogoImage.vue'
import type {
  PortalFooterConfig,
  PortalLinkTarget,
} from '@/component/portal/editor/portalLayoutConfig'
import UranusSVG from '@/component/ui/UranusSVG.vue'

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
