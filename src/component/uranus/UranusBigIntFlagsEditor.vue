<!--
  src/component/uranus/UranusBigIntFlagsEditor.vue
-->

<template>
  <section>
    <UranusCard
        v-for="topic in topics"
        :key="topic.topic"
        class="accessibility-card"
    >
      <h2>{{ t(topic.topic_name) }}</h2>

      <div class="accessibility-options">
        <UranusCheckbox
            v-for="flag in topic.flags"
            :key="flag.id"
            :id="`flag-${flag.id}`"
            v-model="useFlagModel(flag.id).value"
            :label="t(flag.name)"
        />
      </div>
    </UranusCard>

  </section>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBigIntFlags, setBigintByFlags, type BigIntFlags } from '@/composable/useBigIntFlags'
import UranusCheckbox from '@/component/ui/UranusCheckbox.vue'
import UranusCard from '@/component/ui/UranusCard.vue'

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

function useFlagModel(flagId: number) {
  return computed({
    get: () => flags.flagComputed(flagId).value,
    set: (val: boolean) => {
      flags.flagComputed(flagId).value = val
    },
  })
}

watch(
    () => props.modelValue,
    (newVal) => {
      flags.value.value = newVal ?? 0n
    }
)

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

watch(currentValue, (val) => {
  emit('update:modelValue', val)
})

function reset() {
  flags.value.value = props.modelValue ?? 0n
}

function save() {
  emit('update:modelValue', currentValue.value)
}
</script>


<style scoped lang="scss">
.accessibility-card {
  display: flex;
  margin-bottom: 1rem;

  h3 {
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .accessibility-options {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>