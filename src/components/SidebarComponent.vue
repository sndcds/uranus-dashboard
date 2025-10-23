<template>
  <aside class="sidebar">
    <div class="user-profile">
      <img src="https://i.pravatar.cc/250?u=mail@ashallendesign.co.uk" alt="User Profile" class="profile-image" />
      <span class="user-name">John Doe</span>
    </div>
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

<style scoped lang="scss">
.sidebar {
  display: flex;
  flex-direction: column;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 12px;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--accent-primary);
}

.user-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.95rem;
}
</style>