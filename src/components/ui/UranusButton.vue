<template>
  <!-- Render router-link -->
  <router-link
      v-if="to"
      :to="to"
      :class="classes"
      class="uranus-button-base"
  >
    <UranusIcon v-if="icon" :path="icon" class="uranus-button-icon" />
    <slot />
  </router-link>

  <!-- Or render native button -->
  <button
      v-else
      :type="type"
      :class="classes"
      class="uranus-button-base"
      :disabled="disabled"
  >
    <UranusIcon v-if="icon" :path="icon" class="uranus-button-icon" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UranusIcon from './UranusIcon.vue'

const props = defineProps<{
  to?: string
  icon?: string
  variant?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()

const type = computed(() => props.type ?? 'button')

const classes = computed(() => props.variant)
</script>

<style scoped>
.uranus-button-icon {
  width: 1.2em;
  height: 1.2em;
  margin-right: 0.5rem;
}
</style>
