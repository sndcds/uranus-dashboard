<template>
  <div class="uranus-horizontal-scroller">

    <button class="scroll-btn" @click="scrollLeft">
      ‹
    </button>

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

    <button class="scroll-btn" @click="scrollRight">
      ›
    </button>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
  if (!container.value) return
  touchStartX = e.touches[0].pageX
  touchScrollLeft = container.value.scrollLeft
}

const onTouchMove = (e: TouchEvent) => {
  if (!container.value) return
  const walk = e.touches[0].pageX - touchStartX
  container.value.scrollLeft = touchScrollLeft - walk
}
</script>

<style scoped lang="scss">

.uranus-horizontal-scroller {
  display: grid;
  grid-template-columns: 36px 1fr 36px;
  align-items: center;
  width: 100%;
  gap: 6px;
}

/* buttons */

.scroll-btn {
  height: 60px;
  border: none;
  border-radius: 4px;
  background: rgba(0,0,0,0.25);
  color: white;
  font-size: 26px;
  cursor: pointer;
}

/* scroll container */

.scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  white-space: nowrap;
}

/* content */

.scroll-content {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 0 10px;
}

/* hide scrollbar */

.scroll-container::-webkit-scrollbar {
  display: none;
}

.scroll-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

</style>