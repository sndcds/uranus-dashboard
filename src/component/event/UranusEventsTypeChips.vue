<template>
  <div class="chips-wrapper" ref="wrapper">
    <button class="scroll-btn left" @click="scroll(-150)">‹</button>

    <div class="chips-container" ref="container">
      <span
          v-for="entry in entries"
          :key="entry.type_id"
          class="chip"
          :class="{ active: activeIds.includes(entry.type_id) }"
          @click="$emit('toggle', entry.type_id)"
      >
        {{ entry.name }} ({{ entry.date_count }})
      </span>
    </div>

    <button class="scroll-btn right" @click="scroll(150)">›</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

interface TypeEntry {
  type_id: number
  name: string
  date_count: number
}

const props = defineProps<{
  entries: TypeEntry[]
  activeIds: number[]
}>()

const wrapper = ref<HTMLElement | null>(null)
const container = ref<HTMLElement | null>(null)

const scroll = (amount: number) => {
  if (container.value) {
    container.value.scrollBy({
      left: amount,
      behavior: 'smooth'
    })
  }
}

const updateWrapperWidth = () => {
  if (!wrapper.value || !wrapper.value.parentElement) return
  const parentWidth = wrapper.value.parentElement.clientWidth
  const leftBtnWidth = 32 // approx button width
  const rightBtnWidth = 32
  wrapper.value.style.width = `${parentWidth - leftBtnWidth - rightBtnWidth}px`
}

onMounted(() => {
  nextTick(() => updateWrapperWidth())
  window.addEventListener('resize', updateWrapperWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWrapperWidth)
})

// Recalculate if entries change
watch(() => props.entries, () => nextTick(updateWrapperWidth), { deep: true })
</script>

<style scoped lang="scss">
.chips-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: #4ddfff;
}

.chips-container {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scroll-behavior: smooth;
  white-space: nowrap;
  flex: 0 0 auto;   /* <- DO NOT let it shrink */
}

.chip {
  flex-shrink: 0;
  background-color: #eee;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
}

.chip.active {
  background-color: #3b82f6;
  color: white;
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  padding: 0 8px;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
}

.scroll-btn.left {
  left: 0;
}

.scroll-btn.right {
  right: 0;
}
</style>