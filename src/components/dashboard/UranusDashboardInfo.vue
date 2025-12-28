<!--
  UranusDashboardInfo.vue
-->
<template>
  <div class="uranus-dashboard-info">
    <div class="header" @click="toggle">
      <span class="chevron" :class="{ open }">▶</span>
      <span class="title">{{ title }}</span>
    </div>

    <div v-if="open" class="content">
      <div class="text" v-html="text" />

      <!-- Internal route -->
      <RouterLink
          v-if="route"
          :to="route"
          class="link"
      >
        {{ linkLabel }}
      </RouterLink>

      <!-- External URL -->
      <a
          v-else-if="url"
          :href="url"
          class="link"
          target="_blank"
          rel="noopener noreferrer"
      >
        {{ linkLabel }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  title: { type: String, required: true },
  text: { type: String, required: true }, // HTML content

  // navigation (mutually exclusive)
  route: { type: [String, Object], default: null },
  url: { type: String, default: null },

  linkLabel: { type: String, default: 'More…' },
  defaultOpen: { type: Boolean, default: false },
})

const open = ref(props.defaultOpen)

const toggle = () => {
  open.value = !open.value
}
</script>

<style scoped>
.uranus-dashboard-info {
  background: var(--uranus-card-bg);
  padding: 0.75rem 1rem;
}

.header {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.chevron {
  font-size: 10px;
  display: inline-block;
  margin-right: 1rem;
  transition: transform 0.3s ease;
}

.chevron.open {
  transform: rotate(90deg);
}

.title {
  font-weight: 600;
}

.content {
  margin-top: 0.75rem;
}

.text {
  line-height: 1.4;
}

.link {
  display: inline-block;
  margin-top: 0.5rem;
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}
</style>