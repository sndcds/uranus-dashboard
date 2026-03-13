<template>
  <div class="color-scale">
    <div v-if="label" class="label">{{ label }}</div>

    <div class="grid">
      <div
          v-for="l in lightnessSteps"
          :key="l"
          class="color-swatch"
          :style="swatchStyle(l)"
      >
        {{ l }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  size: { type: String, default: "4rem" },
  hueVar: { type: String, required: true }, // e.g., "--uranus-hue"
  label: { type: String, default: "" },
})

const lightnessSteps = [5, 10, 20, 40, 60, 80, 90]

const swatchStyle = (l: number) => ({
  width: props.size,
  height: props.size,
  background: `oklch(${l}% 0.2 var(${props.hueVar}))`,
})
</script>

<style scoped>
.color-scale {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.label {
  font-weight: 600;
}

.grid {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.color-swatch {
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  border-radius: 4px;
  font-size: 0.8rem;
}
</style>