<!--
  src/component/event/ui/UranusEventReleaseStatusSelect.vue
-->

<template>
  <!-- SELECT MODE -->
  <select
      v-if="renderAs === 'select'"
      v-model="selected"
      class="uranus-select-event-release-status"
  >
    <option
        v-for="opt in options"
        :key="opt.key"
        :value="opt.key"
    >
      {{ opt.name }}
    </option>
  </select>

  <!-- BUTTON MODE -->
  <div
      v-else
      class="uranus-event-release-buttons"
  >
    <template v-for="opt in options" :key="opt.key">
      <button
          type="button"
          class="uranus-event-release-button"
          :class="[
          `uranus-event-release-${opt.key}`,
          { active: selected === opt.key }
        ]"
          @click="selected = opt.key"
      >
        {{ opt.name }}
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useEventReleaseStatusStore } from '@/store/eventReleaseStatusStore.ts'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n({ useScope: 'global' })

interface Props {
  modelValue?: string | null
  locale?: string
  mode?: 'event' | 'event_date_override'
  renderAs?: 'select' | 'buttons'
}

const props = withDefaults(defineProps<Props>(), {
  renderAs: 'select',
  mode: 'event_date_override',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const store = useEventReleaseStatusStore()

/**
 * Normalize input value:
 * null/undefined => inherited
 */
const normalize = (val: string | null | undefined) =>
    val ?? 'inherited'

/**
 * Selected state (internal UI value)
 */
const selected = ref<string>(normalize(props.modelValue))

/**
 * Allowed keys based on mode
 */
const allowedKeys = computed(() => {
  if (props.mode === 'event') {
    return ['draft', 'review', 'released', 'cancelled', 'deferred', 'rescheduled']
  }

  return ['inherited', 'cancelled', 'deferred', 'rescheduled']
})

/**
 * Options (always derived from store + mode)
 */
const options = computed(() => {
  const base = store.options(locale.value).filter(opt =>
      allowedKeys.value.includes(opt.key)
  )

  // inject virtual "inherited" if needed
  /*
  if (allowedKeys.value.includes('inherited')) {
    return [
      { key: 'inherited', name: 'Inherited' },
      ...base.filter(o => o.key !== 'inherited')
    ]
  }
   */

  return base
})

/**
 * Keep selected in sync with incoming value
 */
watch(
    () => props.modelValue,
    (val) => {
      selected.value = normalize(val)
    },
    { immediate: true }
)

/**
 * Ensure selected is always valid when options change
 */
watch(
    options,
    (opts) => {
      const keys = opts.map(o => o.key)

      if (!keys.includes(selected.value)) {
        selected.value = 'inherited'
      }
    },
    { immediate: true }
)

/**
 * Emit normalized value
 */
watch(selected, (val) => {
  emit(
      'update:modelValue',
      val === 'inherited' ? null : val
  )
})

/**
 * External locale override support
 */
watch(
    () => props.locale,
    (val) => {
      if (val) {
        locale.value = val
      }
    }
)
</script>

<style scoped>

/* SELECT */
.uranus-select-event-release-status {
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  border: 1px solid var(--uranus-color);
  background-color: var(--uranus-bg);
  color: var(--uranus-color);
  font-size: 1rem;
}

.uranus-select-event-release-status option {
  padding: 0.2rem 0.4rem;
}

/* BUTTONS */
.uranus-event-release-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.uranus-event-release-button {
  border: 1px solid var(--uranus-input-border-color);
  border-radius: 6px;
  padding: 0.3rem 0.8rem;
  cursor: pointer;
  font-size: 1rem;
  background: transparent;
  color: var(--uranus-color);
  transition: all 0.2s ease;
}

.uranus-event-release-draft.active {
  border-color: var(--uranus-event-release-background-draft);
  background: var(--uranus-event-release-background-draft);
  color: var(--uranus-event-release-color-draft);
}

.uranus-event-release-review.active {
  border-color: var(--uranus-event-release-background-review);
  background: var(--uranus-event-release-background-review);
  color: var(--uranus-event-release-color-review);
}

.uranus-event-release-released.active {
  border-color: var(--uranus-event-release-background-released);
  background: var(--uranus-event-release-background-released);
  color: var(--uranus-event-release-color-released);
}

.uranus-event-release-cancelled.active {
  border-color: var(--uranus-event-release-background-cancelled);
  background: var(--uranus-event-release-background-cancelled);
  color: var(--uranus-event-release-color-cancelled);
}

.uranus-event-release-deferred.active {
  border-color: var(--uranus-event-release-background-deferred);
  background: var(--uranus-event-release-background-deferred);
  color: var(--uranus-event-release-color-deferred);
}

.uranus-event-release-rescheduled.active {
  border-color: var(--uranus-event-release-background-rescheduled);
  background: var(--uranus-event-release-background-rescheduled);
  color: var(--uranus-event-release-color-rescheduled);
}

</style>