<!--
  src/component/ui/UranusSquareSVG.vue
-->

<template>
  <span :style="style" />
</template>

<script setup>
import { computed } from 'vue'
import { getTheme, useTheme } from '@/composable/useTheme.ts'

const theme = useTheme()

const props = defineProps({
  path: { type: String, required: true },
  color: { type: String, default: null },
  size: { type: [String, Number], default: 24 }
})

const style = computed(() => {
  const size =
      typeof props.size === 'number' ? `${props.size}px` : props.size

  let color = 'var(--uranus-square-svg-color)'
  if (theme.isLight()) color = props.color

  return {
    width: size,
    aspectRatio: '1 / 1',
    display: 'inline-block',

    backgroundColor: color,

    WebkitMaskImage: `url(${props.path})`,
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    WebkitMaskSize: 'contain',

    maskImage: `url(${props.path})`,
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
    maskSize: 'contain'
  }
})
</script>