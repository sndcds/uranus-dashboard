<template>
  <div class="icon-heading">
    <!-- Render the passed icon and forward props -->
    <component
        v-if="icon"
        :is="icon"
        class="icon"
        :stroke-width="strokeWidth"
        :color="color"
    />
    <h2 class="text"><slot>Info Text</slot></h2>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'UranusInfoHeading',
  props: {
    icon: {
      type: [Object, Function],
      required: false,
      default: null,
    },
    strokeWidth: {
      type: Number,
      default: 2, // default Lucide stroke width
    },
    color: {
      type: String,
      default: 'var(--uranus-color)', // Tailwind blue-500 as default
    }
  }
})
</script>

<style scoped>
.icon-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  width: 2rem;
  height: 2rem;
}

.text {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}
</style>