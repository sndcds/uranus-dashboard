<!--
  src/component/ui/UranusHorizontalScroller.vue
-->

<template>
  <div class="uranus-horizontal-scroller">

    <ArrowLeft class="arrow arrow-left" @click="scrollLeft" />

    <div
        ref="container"
        class="scroll-container"
        @mousedown="onMouseDown"
        @mouseleave="onMouseUp"
        @mouseup="onMouseUp"
        @mousemove="onMouseMove"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
    >
      <div class="scroll-content">
        <slot />
      </div>
    </div>

    <ArrowRight class="arrow arrow-right" @click="scrollRight" />

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'

const container = ref<HTMLElement | null>(null)

const scrollAmount = 150

const scrollLeft = () => {
  container.value?.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
}

const scrollRight = () => {
  container.value?.scrollBy({ left: scrollAmount, behavior: 'smooth' })
}

/* mouse drag */

let isDown = false
let startX = 0
let scrollLeftPos = 0

const onMouseDown = (e: MouseEvent) => {
  if (!container.value) return
  isDown = true
  startX = e.pageX
  scrollLeftPos = container.value.scrollLeft
}

const onMouseUp = () => {
  isDown = false
}

const onMouseMove = (e: MouseEvent) => {
  if (!isDown || !container.value) return
  e.preventDefault()
  const walk = e.pageX - startX
  container.value.scrollLeft = scrollLeftPos - walk
}

/* touch */

let touchStartX = 0
let touchScrollLeft = 0

const onTouchStart = (e: TouchEvent) => {
  if (!container.value || !e.touches[0]) return
  touchStartX = e.touches[0].pageX
  touchScrollLeft = container.value.scrollLeft
}

const onTouchMove = (e: TouchEvent) => {
  if (!container.value || !e.touches[0]) return
  const walk = e.touches[0].pageX - touchStartX
  container.value.scrollLeft = touchScrollLeft - walk
}
</script>

<style scoped lang="scss">

.uranus-horizontal-scroller {
  display: flex;
  align-items: center;
  grid-template-columns: 36px 1fr 36px;
  width: 100%;
  height: 80px;
  padding: 10px;
  gap: 6px;
}

.scroll-container {
  position: absolute;
  left: 3.6rem;
  right: 3.6rem;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  white-space: nowrap;
  padding: 2px;
}

.arrow {
  width: 2.6rem;
  height: 2.6rem;
  position: absolute;
  color: var(--uranus-color);
  cursor: pointer;
  padding: 0.4rem;
  transition: color 0.2s ease-in-out;
  &:hover {
    color: var(--uranus-link-color-hover);
  }
}

.arrow-left {
  left: 1rem;
}

.arrow-right {
  right: 1rem;
}

.scroll-content {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 0 10px;
}

.scroll-container::-webkit-scrollbar {
  display: none;
}

.scroll-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

</style>