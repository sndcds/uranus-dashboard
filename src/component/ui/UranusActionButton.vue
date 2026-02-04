<template>
  <router-link
      v-if="to"
      :to="to"
      class="uranus-action-button"
      :class="stateClasses"
      :aria-disabled="isDisabled || isDimmed"
      @click="handleRouterClick"
  >
    <slot />
  </router-link>

  <button
      v-else-if="!to"
      :type="type"
      :form="form"
      class="uranus-action-button"
      :class="stateClasses"
      :disabled="isDisabled || isDimmed"
      @click="handleButtonClick"
  >
    <slot />
  </button>

  <!-- Fallback div only if somehow neither of the above render -->
  <div
      v-else
      class="uranus-action-button"
      :class="stateClasses"
      role="button"
      tabindex="0"
      :aria-disabled="isDisabled || isDimmed"
      @click="handleClick"
      @keydown.enter.space.prevent="handleClick"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  to?: string
  type?: 'button' | 'submit' | 'reset'
  form?: string
  disabled?: boolean
  loading?: boolean
  dimmed?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const isDisabled = computed(() => props.disabled || props.loading)
const isDimmed = computed(() => props.dimmed)

const stateClasses = computed(() => ({
  'is-disabled': isDisabled.value,
  'is-loading': props.loading,
  'is-dimmed': isDimmed.value,
}))

// Emits click only if type !== submit
function handleButtonClick(e: Event) {
  if (isDisabled.value || isDimmed.value) return

  if (props.type !== 'submit') {
    emit('click')
  }
  // If type === submit, do nothing — native form submit happens automatically
}

// Generic click for fallback div
function handleClick(e?: Event) {
  if (isDisabled.value || isDimmed.value) return
  emit('click')
}

// Router-link disabled handling
function handleRouterClick(e: Event) {
  if (isDisabled.value || isDimmed.value) {
    e.preventDefault()
    e.stopPropagation()
  }
}
</script>