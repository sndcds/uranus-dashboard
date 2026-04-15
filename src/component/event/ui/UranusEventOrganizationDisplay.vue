<!--
  src/component/event/ui/UranusEventOrganizationDisplay.vue
-->

<template>
  <div v-if="event.orgName">

    <div class="container">
      <UranusLogoImage
          v-if="hasLogo"
          :logoURL="logoUrl"
          :lightThemeLogoURL="lightThemeLogoUrl"
          :darkThemeLogoURL="darkThemeLogoUrl"
          :theme="themeStore.theme"
          :maxWidth="240"
          :maxHeight="80"
      />

      <div v-else>
        <p class="uranus-public-event-info-label">
          {{ t('event_organizer') }}
        </p>
        <a
            v-if="event.orgWebLink"
            :href="event.orgWebLink"
            target="_blank"
            rel="noopener noreferrer"
        >
          {{ event.orgName }} ↗
        </a>

        <span v-else>
          {{ event.orgName }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/store/themeStore.ts'
import UranusLogoImage from '@/component/ui/UranusLogoImage.vue'

const { t } = useI18n({ useScope: 'global' })

const props = defineProps<{
  event: {
    orgName?: string | null
    orgWebLink?: string | null
    orgLogos?: Record<string, { uuid: string; url: string }>
  }
}>()

const themeStore = useThemeStore()

const logoUrl = computed(() => props.event.orgLogos?.main_logo?.url ?? '')
const lightThemeLogoUrl = computed(() => props.event.orgLogos?.light_theme_logo?.url ?? '')
const darkThemeLogoUrl = computed(() => props.event.orgLogos?.dark_theme_logo?.url ?? '')

const hasLogo = computed(() =>
    !!(logoUrl.value || lightThemeLogoUrl.value || darkThemeLogoUrl.value)
)
</script>

<style scoped>
.container {
  margin-top: 2rem;
}
</style>
