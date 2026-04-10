<!--
  src/component/ui/UranusExternalLink.vue

  Usage:
  <UranusEventTicketLink
      :ticketLink="event.ticketLink"
      :label="Ticket link"
      :icon="Ticket"
  />
-->

<template>
  <div v-if="link">
    <a
        :href="link"
        target="_blank"
        rel="noopener noreferrer"
        class="uranus-external-link"
    >
      <!-- Icon (optional) -->
      <component
          v-if="icon"
          :is="icon"
          class="uranus-external-link__icon"
          :size="iconSize"
      />

      <!-- Content -->
      <slot>
        {{ label }}
      </slot>
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'

interface Props {
  link?: string | null
  label?: string
  icon?: Component
  iconSize?: number
}

const props = defineProps<Props>()

const label = computed(() => props.label ?? 'Tickets')
const iconSize = computed(() => props.iconSize ?? 18)
</script>

<style scoped>
.uranus-external-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  font-weight: 500;
}

.uranus-external-link:hover {
  text-decoration: none;
}

.uranus-external-link__icon {
  flex-shrink: 0;
}
</style>