<!--
  src/component/ui/UranusSVG.vue
-->

<template>
  <span :style="style" aria-hidden="true" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  src: string
  width?: number | string
  color?: string
}>()

const style = computed(() => {
  const width =
      typeof props.width === 'number'
          ? `${props.width}px`
          : props.width || '24px'

  return {
    width,
    height: width,
    display: 'inline-block',

    backgroundColor: props.color || 'currentColor',

    WebkitMaskImage: `url(${props.src})`,
    maskImage: `url(${props.src})`,

    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',

    WebkitMaskPosition: 'center',
    maskPosition: 'center',

    WebkitMaskSize: 'contain',
    maskSize: 'contain',
  }
})
</script>