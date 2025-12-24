<template>
  <div class="slide">
    <!-- Image fades in/out -->
    <transition name="fade">
      <img v-if="imageUrl" :src="imageUrl" :alt="title" class="slide-image" :key="imageUrl"/>
    </transition>

    <!-- Text container -->
    <div class="slide-text-container">
      <div class="slide-text title" :style="randomTextStyle(0)">
        <div class="slide-text-inner">
          {{ title }}
        </div>
      </div>

      <div class="slide-text subtitle" :style="randomTextStyle(1)">
        <div class="slide-text-inner">
          {{ subtitle }}
        </div>
      </div>

      <div class="slide-text date-venue" :style="randomTextStyle(2)">
        <div class="slide-text-inner">
          {{ date }} — {{ venue }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  imageUrl: string
  title: string
  subtitle: string
  venue: string
  date: string
}>()

const randomColors = [
  { bg: '#000000', fg: '#ffffff' },
  { bg: '#000000', fg: '#ffffff' },
  { bg: '#000000', fg: '#ffffff' },
  { bg: '#f0d1ff', fg: '#1a1a1a' },
]

function randomTextStyle(seed: number) {
  const color = randomColors[seed % randomColors.length] || { bg: '#ffffff', fg: '#000000' }

  return {
    backgroundColor: color.bg, // hexToRgba(color.bg, 1),
    color: color.fg,
    padding: '0.5rem 1rem',
    display: 'inline-block',
  }
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
</script>

<style scoped>
.slide {
  position: relative;
  width: 100%;
  height: 100%;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 1s ease;
}
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-to, .fade-leave-from { opacity: 1; }

.slide-text-container {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  align-items: flex-start;
}

.slide-text {
  font-size: 3vw;
  transform: translateX(-160%);
  animation: slideInLeft 1s forwards 0.3s;
}

.slide-text-inner {
  padding: 0rem 3rem;           /* now the padding is applied properly */
}

.title {
  font-size: 5vw;
  animation: slideInLeft 1s forwards 0.3s;
}

.subtitle {
  animation: slideInLeft 1s forwards 0.6s; /* duration + delay */
}

.date-venue {
  animation: slideInLeft 1s forwards 0.9s;
}

@keyframes slideInLeft { to { transform: translateX(0); } }

@keyframes slideInRight {
  from { transform: translateX(100vw); }
  to { transform: translateX(0); }
}
</style>