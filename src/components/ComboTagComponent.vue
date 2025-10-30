<template>
  <div class="combo-tag" :class="theme">
    {{ label }}
    <button
        v-if="editable"
        type="button"
        class="close-btn"
        @click="$emit('remove')"
        aria-label="Remove tag"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  theme?: string
  label: string
  editable?: boolean
}>(), {
  theme: 'light',
  editable: false,
})

const emit = defineEmits<{
  (e: 'remove'): void
}>()
</script>

<style scoped lang="scss">
.combo-tag {
  display: inline-flex;
//  flex-wrap: wrap;
  position: relative;
  justify-content: center;
  align-items: center;
  height: 1.8em;
  padding: 0 2em 0 1em;
  border-radius: 100px;
  color: #2a239c;
  font-size: 0.9rem;

  &.light { background-color: rgba(79, 70, 229, 0.2); }
  &.dark { background-color: #4f46e5; }

  .close-btn {
    position: absolute;
    right: 5px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: calc(2em - 8px);
    height: calc(2em - 8px);
    background-color: rgba(0, 0, 0, 0.4);
    border: 0;
    color: white;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
      background-color: rgba(0, 0, 0, 1);
    }
  }
}
</style>