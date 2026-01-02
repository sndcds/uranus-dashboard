<!--
  UranusEventReleaseChip.vue
-->
<template>
  <div v-if="releaseStatusId" :class="['event-meta__row', sizeClass]">
    <span
        class="release-status-chip"
        :class="[colorClass, sizeClass]"
    >
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {useI18n} from "vue-i18n";

const { t } = useI18n({ useScope: 'global' })


const props = defineProps<{
  releaseStatusId: number | null
  tiny?: boolean
  date?: string | null
}>()

const sizeClass = computed(() => (props.tiny ? 'tiny' : null))

const label = computed(() => {
  if (props.releaseStatusId === 1) return t('event_release_draft')
  if (props.releaseStatusId === 2) return t('event_release_review')
  if (props.releaseStatusId === 3) return t('event_release_released')
  if (props.releaseStatusId === 4) return t('event_release_cancelled')
  if (props.releaseStatusId === 5) return t('event_release_deferred')
  if (props.releaseStatusId === 6) return t('event_release_rescheduled')
  return ''
})

const colorClass = computed(() => {
  if (props.releaseStatusId === 1) return 'draft'
  if (props.releaseStatusId === 2) return 'review'
  if (props.releaseStatusId === 3) return 'released'
  if (props.releaseStatusId === 4) return 'cancelled'
  if (props.releaseStatusId === 5) return 'deferred'
  if (props.releaseStatusId === 6) return 'rescheduled'
  return ''
})

const date = computed(() => props.date ?? '')
</script>

<style scoped lang="scss">
.release-status-chip {
  padding: 0.24rem 0.7rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9em;
  width: fit-content;

  &.tiny {
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.76em;
  }
}

.draft {
  color: var(--uranus-event-release-color-draft);
  background: var(--uranus-event-release-background-draft);
}
.review {
  color: var(--uranus-event-release-color-review);
  background: var(--uranus-event-release-background-review);
}
.released {
  color: var(--uranus-event-release-color-released);
  background: var(--uranus-event-release-background-released);
}
.cancelled {
  color: var(--uranus-event-release-color-cancelled);
  background: var(--uranus-event-release-background-cancelled);
}
.deferred {
  color: var(--uranus-event-release-color-deferred);
  background: var(--uranus-event-release-background-deferred);
}
.rescheduled {
  color: var(--uranus-event-release-color-rescheduled);
  background: var(--uranus-event-release-background-rescheduled);
}

/* Variants */
.variant--tiny.release-status-chip {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
.variant--big.release-status-chip {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

.event-meta__row {
  display: flex;
  width: max-content;
  align-items: center;
  gap: 0.5rem;
}

.event-meta__label {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

.variant--big.event-meta__label {
  font-size: 1rem;
}

.variant--tiny.event-meta__label {
  font-size: 0.75rem;
}
</style>