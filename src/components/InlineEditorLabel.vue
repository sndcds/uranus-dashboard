<template>
  <div class="uranus-inline-label">
    <span>{{ labelText }}</span>
    <button
      v-if="!isEditing"
      type="button"
      class="uranus-inline-edit-button"
      @click="startEditing"
      style="margin-left: 8px"
    >
      {{ editButtonText }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props for dynamic text
defineProps({
  labelText: {
    type: String,
    required: true
  },
  editButtonText: {
    type: String,
    required: true
  }
})


// Emit an event when editing starts
const emit = defineEmits(['edit-started'])

function startEditing() {
  emit('edit-started')
}
</script>

<style scoped>
.uranus-hover-section {
  display: flex;            /* use flex layout */
  align-items: center;      /* vertically centers children */
  gap: 0.5rem;              /* optional spacing between span and button */
  margin: 0;
  padding: 0;
}

.uranus-inline-edit-button:hover {
  background-color: var(--uranus-secondary-button-background-color);
}
</style>