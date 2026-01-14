<template>
  <div class="swatch-wrapper">
    <!-- Swatch + example row -->
    <div
        class="swatch"
        :style="{
        backgroundColor: resolvedBg,
        color: resolvedColor
      }"
    >
      <!-- Uranus icon -->
      <svg class="uranus-logo" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <g transform="matrix(0.989112,0,0,0.989112,1.39367,1.76998)">
          <path
              d="M96.444,252.074C41.038,238.005 0,187.757 0,128C0,57.355 57.355,0 128,0C198.645,0 256,57.355 256,128C256,180.269 224.602,225.263 179.655,245.133C178.757,234.235 176.834,212.752 175.175,206.693C172.923,198.468 170.795,188.607 152.697,179.313C149.336,177.587 145.629,176.468 141.776,175.818C141.243,172.854 141.272,170.278 141.48,167.461C166.531,158.728 192.282,127.97 192.282,96.139C192.282,58.822 164.829,35.762 128.93,35.604C128.62,35.602 128.31,35.602 128,35.604C92.101,35.762 64.647,58.822 64.647,96.139C64.647,127.327 89.369,157.484 113.931,166.904C114.218,170.473 114.265,173.6 113.319,177.518C107.003,179.061 101.951,181.035 99.519,182.494C92.595,186.648 87.063,195.802 80.515,200.671C76.323,195.817 75.328,185.394 75.328,185.394C75.328,185.394 79.304,179.514 81.528,174.437C83.752,169.36 85.546,165.408 83.092,162.038C80.639,158.668 76.874,163.454 72,167.92C69.518,164.452 67.498,151.88 66.345,147.328C65.191,142.777 58.715,141.948 58.306,145.131C57.896,148.313 58.961,156.441 59.704,160.665C60.447,164.888 58.633,166.323 57.286,164.334C55.94,162.344 51.593,156.507 48.847,153.985C46.102,151.464 41.379,149.143 42.013,155.02C42.647,160.898 48.129,171.3 49.099,174.458C50.069,177.616 52.414,186.701 58.651,190.712C63.344,213.629 71.713,224 80.958,221.355C90.204,218.71 97.271,212.262 97.271,212.262C97.271,212.262 96.036,237.199 96.444,252.074Z"
              fill="currentColor"
          />
        </g>
      </svg>
      <span class="text">Example text</span>
    </div>

    <!-- Name & computed values -->
    <div class="info">
      <span class="var-name">{{ bgVar }}</span>
      <span class="var-value">
        <span class="color-code">{{ originalBg }}</span>
      </span>
      <span class="var-value">
        <span class="color-code">{{ resolvedBg }}</span>
      </span>
      <span class="contrast" :class="contrastClass">
        {{ contrastLabel }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import * as culori from 'culori'

interface Props {
  bgVar: string
  colorVar: string
}
const props = defineProps<Props>()
const { bgVar, colorVar } = props

// Original CSS value (e.g., oklch(80% 0.01 266))
const originalBg = ref('')
const originalColor = ref('')

// Resolved RGB value for swatch + contrast
const resolvedBg = ref('')
const resolvedColor = ref('')

// Convert OKLCH / RGB / HEX CSS variable to rgb string
const toRgbString = (val: string) => {
  if (!val) return 'rgb(0,0,0)'
  try {
    const parsed = culori.parse(val.trim())
    if (!parsed) return val
    return culori.formatRgb(parsed)
  } catch {
    return val
  }
}

// Update colors from CSS variables
const updateColors = () => {
  const bg = getComputedStyle(document.documentElement).getPropertyValue(bgVar)
  const color = getComputedStyle(document.documentElement).getPropertyValue(colorVar)
  originalBg.value = bg.trim()
  originalColor.value = color.trim()
  resolvedBg.value = toRgbString(bg)
  resolvedColor.value = toRgbString(color)
}

// WCAG contrast helpers
const luminance = (rgb: number[]) => {
  if (rgb.length < 3) throw new Error("RGB array must have 3 elements")

  const a = rgb.map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * a[0]! + 0.7152 * a[1]! + 0.0722 * a[2]!
}

const parseRGB = (rgb: string) => {
  const m = rgb.match(/rgb\((\d+), (\d+), (\d+)\)/)
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}

const contrastRatio = (bg: string, fg: string) => {
  const bgRgb = parseRGB(bg)
  const fgRgb = parseRGB(fg)
  if (!bgRgb || !fgRgb) return null
  const L1 = luminance(bgRgb)
  const L2 = luminance(fgRgb)
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
}

const contrastLabel = computed(() => {
  const ratio = contrastRatio(resolvedBg.value, resolvedColor.value)
  if (!ratio) return 'n/a'
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  return 'Fail'
})

const contrastClass = computed(() => `contrast--${contrastLabel.value.toLowerCase()}`)

onMounted(() => {
  updateColors()

  // Watch for theme changes
  const observer = new MutationObserver(() => {
    updateColors()
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'class']
  })
})
</script>

<style scoped>
.swatch-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 220px;
}

.swatch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 16px;
  border-radius: 0.5rem;
}

.uranus-logo {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.text {
  font-size: 1rem;
}

.info {
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  margin-top: 8px;
}

.var-name {
  font-weight: bold;
}

.var-value code {
  font-family: monospace;
  background: rgba(0,0,0,0.05);
  padding: 0 0.2rem;
  border-radius: 2px;
}

.contrast {
  font-size: 0.75rem;
  font-weight: 600;
}

.color-code {
  font-family: monospace;
  padding: 0 0.2rem;
  border-radius: 2px;
  font-size: 0.85rem;
  white-space: nowrap;
}

/* WCAG contrast colors */
.contrast--fail {
  color: red;
}
.contrast--aa {
  color: orange;
}
.contrast--aaa {
  color: green;
}
</style>