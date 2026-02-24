<!--
  src/component/uranus/UranusBigIntFlagsEditor.vue
-->

<template>
  <section class="uranus-admin-edit-section uranus-admin-responsive-grid">
    <div
        v-for="topic in topics"
        :key="topic.topic"
        class="accessibility-group"
    >
      <h3>{{ t(topic.topic_name) }}</h3>

      <div class="accessibility-options">
        <label
            v-for="flag in topic.flags"
            :key="flag.id"
        >
          <input type="checkbox" v-model="flagModels[flag.id]" />
          {{ t(flag.name) }}
        </label>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBigIntFlags, setBigintByFlags, type BigIntFlags } from '@/composable/useBigIntFlags'

interface FlagTopic {
  topic: number
  topic_name: string
  flags: { id: number; name: string }[]
}

const props = defineProps<{
  topics: FlagTopic[]
  modelValue: bigint
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: bigint): void
  (e: 'dirty-change', value: boolean): void
}>()

const { t } = useI18n({ useScope: 'global' })

const flags = useBigIntFlags(props.modelValue ?? 0n)

watch(
    () => props.modelValue,
    (newVal) => {
      flags.value.value = newVal ?? 0n
    }
)

// Reactive checkbox model
const flagModels = reactive<BigIntFlags>({})

// Bind flags dynamically
props.topics.forEach(topic => {
  topic.flags.forEach(flag => {
    Object.defineProperty(flagModels, flag.id, {
      get: () => flags.flagComputed(flag.id).value,
      set: (val: boolean) => (flags.flagComputed(flag.id).value = val),
      enumerable: true,
      configurable: true,
    })
  })
})

// Computed current BigInt
const currentValue = computed(() =>
    setBigintByFlags(flagModels)
)

// Emit value when changed
watch(currentValue, (val) => {
  emit('update:modelValue', val)
})

// Reset
function reset() {
  flags.value.value = props.modelValue ?? 0n
}

// Save just re-syncs base value
function save() {
  emit('update:modelValue', currentValue.value)
}
</script>



<style scoped lang="scss">
.accessibility-group {
  margin-bottom: 1.5rem;

  h3 {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .accessibility-options {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;

    label {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      user-select: none;
      font-size: 1rem;
      position: relative;

      input[type="checkbox"] {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        width: 24px;
        height: 24px;
        border: 2px solid #888;
        border-radius: 4px;
        background-color: #fff;
        position: relative;
        cursor: pointer;
        transition: all 0.2s;
      }

      input[type="checkbox"]:checked {
        background-color: #2a3aed;
        border-color: #2a3aed;
      }

      input[type="checkbox"]:checked::after {
        content: '';
        position: absolute;
        left: 6px;
        top: 2px;
        width: 6px;
        height: 12px;
        border: solid #fff;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }

      input[type="checkbox"]:hover {
        border-color: #2a3aed;
      }
    }
  }
}

.tab-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>