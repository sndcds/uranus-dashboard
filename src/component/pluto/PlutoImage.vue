<!--
  src/component/pluto/PlutoImage.vue

  2026-03-28
-->

<template>
  <img
      v-if="imgUrl"
      :src="imgUrl"
      :class="imgClass"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/store/themeStore.ts'
import { buildPlutoImageUrl } from '@/util/UranusUtils.ts'

const themeStore = useThemeStore()

const props = defineProps<{
  mainImageUuid?: string | null | undefined
  lightImageUuid?: string | null | undefined
  darkImageUuid?: string | null | undefined
  width?: number
  height?: number
  format?: string
  quality?: number
  contain?: boolean
  imgClass?: string
}>()

const imgUrl = computed(() => {
  let imgUuid: string | null = null

  if (themeStore.theme === 'dark') {
    if (props.darkImageUuid) {
      imgUuid = props.darkImageUuid
    }
  } else {
    if (props.lightImageUuid) {
      imgUuid = props.lightImageUuid
    }
  }

  if (!imgUuid && props.mainImageUuid) {
    imgUuid = props.mainImageUuid
  }

  if (!imgUuid) return null

  return buildPlutoImageUrl(
      imgUuid,
      props.width ?? 120,
      props.height ?? 0,
      props.format ?? 'png',
      props.quality ?? 80,
      props.contain ?? true
  )
})
</script>