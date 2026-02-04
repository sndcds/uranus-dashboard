<template>
  <div class="uranus-blob">
    <svg viewBox="0 0 200 200">
      <defs>
        <linearGradient id="gradient" gradientTransform="rotate(90)">
          <stop offset="0%" stop-color="var(--startColor)" />
          <stop offset="100%" stop-color="var(--stopColor)" />
        </linearGradient>
      </defs>
      <path ref="path" fill="url(#gradient)" />
    </svg>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { spline } from '@georgedoescode/spline'
import * as SimplexNoise from 'simplex-noise'

// references
const path = ref(null)
const root = document.documentElement

// create simplex noise generator
const noise2D = SimplexNoise.createNoise2D()

// animation parameters
let hueNoiseOffset = 0
let noiseStep = 0.005

// helper functions
function map(n, start1, end1, start2, end2) {
  return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2
}

function noise(x, y) {
  return noise2D(x, y)
}

function createPoints() {
  const points = []
  const numPoints = 6
  const angleStep = (Math.PI * 2) / numPoints
  const rad = 75

  for (let i = 1; i <= numPoints; i++) {
    const theta = i * angleStep
    const x = 100 + Math.cos(theta) * rad
    const y = 100 + Math.sin(theta) * rad
    points.push({
      x,
      y,
      originX: x,
      originY: y,
      noiseOffsetX: Math.random() * 1000,
      noiseOffsetY: Math.random() * 1000
    })
  }

  return points
}

onMounted(() => {
  const points = createPoints()

  const animate = () => {
    path.value.setAttribute('d', spline(points, 1, true))

    for (let p of points) {
      const nX = noise(p.noiseOffsetX, p.noiseOffsetY)
      const nY = noise(p.noiseOffsetY, p.noiseOffsetX)
      p.x = map(nX, -1, 1, p.originX - 20, p.originX + 20)
      p.y = map(nY, -1, 1, p.originY - 20, p.originY + 20)
      p.noiseOffsetX += noiseStep
      p.noiseOffsetY += noiseStep
    }

    const hueNoise = noise(hueNoiseOffset, hueNoiseOffset)
    const hue = map(hueNoise, -1, 1, 0, 360)
    root.style.setProperty('--startColor', `hsl(${hue}, 100%, 75%)`)
    root.style.setProperty('--stopColor', `hsl(${hue + 60}, 100%, 75%)`)
    document.body.style.background = `hsl(${hue + 60}, 75%, 5%)`

    hueNoiseOffset += noiseStep / 6
    requestAnimationFrame(animate)
  }

  animate()

  path.value.addEventListener('mouseover', () => (noiseStep = 0.01))
  path.value.addEventListener('mouseleave', () => (noiseStep = 0.005))
})
</script>

<style scoped>
:root {
  --startColor: hsl(0, 100%, 75%);
  --stopColor: hsl(60, 100%, 75%);
}

.uranus-blob {
  position: relative;
  display: grid;
  place-items: center;
  height: 100vh;
}

svg {
  width: 80vmin;
  height: 80vmin;
}

p {
  position: absolute;
  font-size: 1.125rem;
  font-weight: 500;
  bottom: 1rem;
  right: 1rem;
  color: #fff;
  font-family: system-ui, sans-serif;
}
</style>