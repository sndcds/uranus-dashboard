<template>
  <!-- Render router-link if "to" is provided -->
  <router-link
      v-if="to"
      :to="to"
      :class="['uranus-button', classes]"
  >
    <svg
        v-if="iconSvg"
        class="uranus-button-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
      <path :d="iconSvg" />
    </svg>
    <slot />
  </router-link>

  <!-- Or render native button -->
  <button
      v-else
      :type="type"
      :class="['uranus-button', classes]"
      :disabled="disabled"
  >
    <svg
        v-if="iconSvg"
        class="uranus-button-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
      <path :d="iconSvg" />
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UranusIcon from './UranusDashboardButtonIcon.vue'

const props = defineProps<{
  to?: string
  icon?: "edit" | "delete" | "add" | "team" // keys instead of raw SVG
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()

const type = computed(() => props.type ?? 'button')
const classes = computed(() => '')

const icons: Record<string, string> = {
  edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.004 1.004 0 0 0 0-1.42l-2.34-2.34a1.004 1.004 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z",
  delete: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  add: "M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z",
  team: "M22.09,18.9L0.88,18.9C0.52,18.9 0.22,18.6 0.22,18.24L0.22,17.25C0.22,14.22 2.06,11.83 4.39,10.92C3.57,10.29 2.82,9.27 2.82,7.88C2.82,5.72 4.54,4 6.7,4C8.86,4 10.58,5.72 10.58,7.88C10.58,9.15 9.97,10.28 9.02,11C9.96,11.37 10.79,11.95 11.46,12.7C12.14,11.95 12.97,11.37 13.9,11C12.95,10.28 12.34,9.15 12.34,7.88C12.34,5.72 14.06,4 16.22,4C18.38,4 20.1,5.72 20.1,7.88C20.1,9.15 19.49,10.28 18.54,11C20.91,11.94 22.71,14.26 22.71,17.29L22.71,18.28C22.71,18.62 22.43,18.9 22.09,18.9Z"
}

const iconSvg = computed(() => (props.icon ? icons[props.icon] : ""))

</script>
