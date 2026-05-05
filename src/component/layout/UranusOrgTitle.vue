<!-- src/component/ui/UranusOrgTitle.vue -->

<template>
  <component
      :is="tag"
      class="org-title"
      :style="computedStyle"
  >
    <slot>
      Organization: {{ appStore.orgName }}
    </slot>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/appStore.ts'

const appStore = useAppStore()

const props = defineProps({
  text: { type: String, default: '' },
  tag: { type: String, default: 'h3' },
  marginBottom: { type: String, default: '1rem' },
  fontWeight: { type: [String, Number], default: 300 }
})

const computedStyle = computed(() => ({
  marginBottom: props.marginBottom,
  fontWeight: props.fontWeight
}))
</script>

<style scoped>
.org-title {
  margin: 0;
}
</style>