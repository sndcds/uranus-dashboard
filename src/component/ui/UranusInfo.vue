<template>
  <div>
    <Info :size="32"/>
    {{ infoText }}
  </div>
</template>

<script setup lang="ts">
import { Info } from 'lucide-vue-next'

const props = defineProps({
  infoText: String
})
</script>

<style lang="scss" scoped>
div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>

