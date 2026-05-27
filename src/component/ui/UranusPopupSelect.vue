<!--
  src/component/ui/UranusPopupSelect.vue
-->

<template>
  <div ref="root" class="uranus-popup-select">
    <button
      type="button"
      class="uranus-popup-select__trigger"
      :aria-expanded="open ? 'true' : 'false'"
      aria-haspopup="listbox"
      :aria-label="ariaLabel"
      :disabled="disabled"
      @click="toggleOpen"
      @keydown.down.prevent="openPopup"
      @keydown.esc.prevent="closePopup"
    >
      <span class="uranus-popup-select__label">{{ selectedLabel }}</span>
      <ChevronDown class="uranus-popup-select__icon" aria-hidden="true" />
    </button>

    <div
      v-if="open"
      class="uranus-popup-select__popup"
      role="listbox"
      :aria-label="ariaLabel"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="uranus-popup-select__option"
        :class="{ 'uranus-popup-select__option--selected': option.value === modelValue }"
        role="option"
        :aria-selected="option.value === modelValue ? 'true' : 'false'"
        @click="selectOption(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

export interface UranusPopupSelectOption {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: UranusPopupSelectOption[]
  placeholder?: string
  ariaLabel?: string
  disabled?: boolean
}>(), {
  placeholder: '',
  ariaLabel: 'Select option',
  disabled: false,
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const root = ref<HTMLElement | null>(null)
const open = ref(false)

const selectedLabel = computed(() => {
  const selected = props.options.find((option) => option.value === props.modelValue)
  if (selected) return selected.label
  return props.placeholder
})

function toggleOpen() {
  if (props.disabled) return
  open.value = !open.value
}

function openPopup() {
  if (props.disabled) return
  open.value = true
}

function closePopup() {
  open.value = false
}

function selectOption(value: string) {
  emit('update:modelValue', value)
  closePopup()
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target
  if (!(target instanceof Node) || !root.value || root.value.contains(target)) return
  closePopup()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>

<style scoped lang="scss">
.uranus-popup-select {
  position: relative;
  width: 100%;
}

.uranus-popup-select__trigger {
  display: inline-flex;
  width: 100%;
  min-height: 2rem;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border: 1px solid var(--uranus-color-6);
  border-radius: var(--uranus-input-border-radius);
  padding: 0.35rem 0.6rem;
  background: var(--uranus-bg);
  color: var(--uranus-color);
  font: inherit;
  text-align: left;
}

.uranus-popup-select__trigger:disabled {
  opacity: 0.65;
  cursor: default;
}

.uranus-popup-select__label {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.uranus-popup-select__icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.uranus-popup-select__popup {
  position: absolute;
  top: calc(100% + 0.3rem);
  left: 0;
  right: 0;
  z-index: 30;
  max-height: min(18rem, 45vh);
  overflow: auto;
  border: 1px solid var(--uranus-color-6);
  border-radius: var(--uranus-input-border-radius);
  padding: 0.25rem;
  background: var(--uranus-bg);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
}

.uranus-popup-select__option {
  display: block;
  width: 100%;
  border: 0;
  border-radius: var(--uranus-input-border-radius);
  padding: 0.4rem 0.55rem;
  background: transparent;
  color: var(--uranus-color);
  font: inherit;
  text-align: left;

  &:hover {
    background: var(--uranus-color-8);
  }

  &--selected {
    background: var(--uranus-select-bg);
    color: var(--uranus-select-color);

    &:hover {
      background: var(--uranus-select-bg-hover);
      color: var(--uranus-select-color);
    }
  }
}
</style>
