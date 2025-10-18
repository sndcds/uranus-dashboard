<template>
  <aside class="sidebar">
    <SidebarOptionComponent
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
import SidebarOptionComponent from './SidebarOptionComponent.vue'
import type { SidebarOption } from '@/types/types'

const props = defineProps<{
  options: SidebarOption[]
}>()

const route = useRoute()

// track the currently active route
const activeRoute = ref(route.path)

watch(route, (newRoute) => {
  activeRoute.value = newRoute.path
})

</script>