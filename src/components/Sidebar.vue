<template>
  <aside class="sidebar">
    <SidebarOption
        v-for="option in options"
        :key="option.id"
        :option="option"
        :active="option.route === activeRoute"
        @change="$emit('change', $event)"
    />
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarOption from './SidebarOption.vue'
import type { SidebarOption as Option } from '@/types/types'

const props = defineProps<{
  options: Option[]
}>()

const route = useRoute()

// track the currently active route
const activeRoute = ref(route.path)

watch(route, (newRoute) => {
  activeRoute.value = newRoute.path
})

</script>