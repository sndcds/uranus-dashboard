<!--
  src/component/portal/UranusPortalHeader.vue
-->

<template>
  <header
      class="uranus-portal-header"
      :class="layoutClass"
  >
    <!-- Languages -->
    <div class="uranus-portal-header__languages">
      <span
          v-for="lang in displayLocaleOptions"
          :key="lang"
          @click="setLang(lang)"
          :class="{ active: lang === (displayLocale ?? locale) }"
          class="uranus-portal-header__lang-button"
      >
        {{ lang }}
      </span>
    </div>

    <!-- Logo -->
    <div v-if="config.showLogo" class="uranus-portal-header__logo">
      <div
          v-if="logoUrl"
          class="uranus-portal-header__logo-frame"
          :style="logoFrameStyle"
      >
        <a
            v-if="config.logoLinkUrl"
            class="uranus-portal__logo-link"
            :href="config.logoLinkUrl"
            :target="config.logoLinkTarget"
            :rel="linkRel(config.logoLinkTarget)"
        >
          <UranusLogoImage
              class="uranus-portal-header__logo-image"
              :logoURL="logoUrl"
              theme="light"
              :pixelCount="logoPixelCount"
              :maxWidth="config.logoWidth"
              :maxHeight="config.logoHeight"
          />
        </a>

        <UranusLogoImage
            v-else
            class="uranus-portal-header__logo-image"
            :logoURL="logoUrl"
            theme="light"
            :pixelCount="logoPixelCount"
            :maxWidth="config.logoWidth"
            :maxHeight="config.logoHeight"
        />
      </div>
    </div>

    <div
        v-if="config.showTitle || config.showDescription"
        class="uranus-portal-header__title"
    >
      <h1 v-if="config.showTitle">
        {{ title }}
      </h1>

      <p v-if="config.showDescription">
        {{ description }}
      </p>
    </div>

    <nav class="uranus-portal-header__buttons">
      <a
          v-for="(button, index) in config.buttons"
          :key="`${button.url}-${index}`"
          :href="button.url"
          :target="button.target"
          :rel="linkRel(button.target)"
          :class="['uranus-portal__button', button.cssClass]"
      >
        {{ button.label }}
      </a>
    </nav>

    <div class="uranus-portal-header__content-nav">
      <template v-if="$slots['content-nav']">
        <slot name="content-nav" />
      </template>
    </div>

    <div class="uranus-portal-header__search">
      <slot name="search" />
    </div>

    <div class="uranus-portal-header__icon-links">
      <slot name="icon-links" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SUPPORTED_UI_LANGUAGES } from '@/store/uranusConstants'
import UranusLogoImage from '@/component/ui/UranusLogoImage.vue'
import {
  type PortalHeaderConfig,
  type PortalLinkTarget,
} from '@/component/portal/editor/portalLayoutConfig'
import type { UranusLocaleKey } from '@/i18n/uranus-i18n-index.ts'

const { locale } = useI18n({ useScope: 'global' })

const displayLocale = defineModel<string | undefined>('displayLocale')
const displayLocaleOptions = computed(() =>
    SUPPORTED_UI_LANGUAGES.map((lang) => lang)
)

function setLang(lang: string) {
  locale.value = lang
  displayLocale.value = lang
  localStorage.setItem('app-locale', lang)
}

const props = defineProps<{
  config: PortalHeaderConfig
  title: string
  description?: string | null
  logoUrl: string | null
  displayLocale?: UranusLocaleKey
}>()

const layoutClass = computed(() =>
    props.config.layout === 'centered'
        ? 'uranus-portal-header__centered'
        : 'uranus-portal-header__left'
)

const logoFrameStyle = computed(() => ({
  width: `${props.config.logoWidth}px`,
  height: `${props.config.logoHeight}px`,
}))

const logoPixelCount = computed(() =>
    props.config.logoWidth * props.config.logoHeight
)

function linkRel(target: PortalLinkTarget) {
  return target === '_blank'
      ? 'noopener noreferrer'
      : undefined
}
</script>
