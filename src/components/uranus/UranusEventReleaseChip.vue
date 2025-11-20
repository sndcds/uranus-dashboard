<template>
  <div v-if="releaseDisplay" :class="['event-meta__row', sizeClass]">
    <!-- Status chip -->
    <span
        v-if="releaseDisplay.label"
        class="release-status-chip"
        :class="[
        {
          'release-status-chip--red': releaseDisplay.id === 1,
          'release-status-chip--orange': releaseDisplay.id === 2,
          'release-status-chip--green': releaseDisplay.id === 3,
          'release-status-chip--blue': releaseDisplay.id === 4,
          'release-status-chip--pink': releaseDisplay.id === 5
        },
        sizeClass
      ]"
    >
      {{ releaseDisplay.label }}   <!-- ✅ FIXED -->
    </span>

    <!-- Date / placeholder -->
    <span class="event-meta__label" :class="sizeClass">
      {{ releaseDisplay.date || 'Noch kein Datum' }}   <!-- ✅ FIXED -->
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

interface ReleaseDisplay {
  id: number
  label: string
  date: string
}

// Props
const props = defineProps<{
  releaseDisplay: ReleaseDisplay | null
  size?: 'tiny' | 'big'
}>()

const sizeClass = computed(() => {
  return props.size === 'big' ? 'variant--big' : 'variant--tiny'
})
</script>

<style scoped lang="scss">
.release-status-chip {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-weight: 600;
  letter-spacing: 0.02em;
  width: fit-content;

  &--red {
    background: #fee2e2;
    color: #991b1b;
  }
  &--orange {
    background: #ffedd5;
    color: #9a3412;
  }
  &--green {
    background: #dcfce7;
    color: #166534;
  }
  &--blue {
    background: #dbeafe;
    color: #1e40af;
  }
  &--pink {
    background: #fce7f3;
    color: #9d174d;
  }
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