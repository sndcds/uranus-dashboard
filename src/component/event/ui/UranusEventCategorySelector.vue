<template>
  <div class="category-selector">
    <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        :class="['category-chip', { selected: selected.includes(cat.id) }]"
        :style="{ '--chip-color': cat.color }"
        @click="toggleCategory(cat.id)"
    >
      {{ t(cat.label) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

interface Category {
  id: number
  label: string
  color: string
}

// Props
const props = defineProps<{
  modelValue: number[] | null
  multiple?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

// Category definitions
const categories: Category[] = [
  { id: 1, label: 'event_filter_category_culture', color: '#f94144' },
  { id: 2, label: 'event_filter_category_education', color: '#f3722c' },
  { id: 3, label: 'event_filter_category_sports', color: '#f9c74f' },
  { id: 4, label: 'event_filter_category_leisure', color: '#90be6d' },
  { id: 5, label: 'event_filter_category_family', color: '#384fe8' },
  { id: 6, label: 'event_filter_category_society', color: '#942dcc' }
]

// Reactive selected state
const selected = ref<number[]>(props.modelValue ?? [])

// Sync external changes
watch(
    () => props.modelValue,
    (val) => {
      selected.value = val ?? []
    }
)

function toggleCategory(id: number) {
  if (props.multiple ?? true) {
    if (selected.value.includes(id)) {
      selected.value = selected.value.filter((x) => x !== id)
    } else {
      selected.value.push(id)
    }
  } else {
    selected.value = selected.value.includes(id) ? [] : [id]
  }

  emit('update:modelValue', selected.value.length ? [...selected.value] : null)
}
</script>

<style scoped lang="scss">
.category-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  width: fit-content;
  padding: 0.5rem;
}

/* Base chip style */
.category-chip {
  position: relative;
  padding: 0.45rem 1rem;
  border-radius: 0;
  border: 0 solid rgba(0,0,0,0.08);
  background: var(--uranus-bg);
  color: var(--uranus-color);
  font-size: 1.1rem;
  cursor: pointer;
  overflow: hidden;

  transition:
      background 0.25s ease,
      color 0.25s ease,
      transform 0.15s ease;

  /* bottom color bar */
  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 5px;
    border-radius: 50px;
    background: var(--chip-color);
    transition: height 0.25s ease;
  }

  &:hover {
    transform: translateY(0px);
  }
}

/* Selected state */
.category-chip.selected {
  background: var(--chip-color);
  color: white;
  border-radius: 50px;

}

.category-chip.selected::after {
  height: 100%;
  z-index: -1;
}
</style>