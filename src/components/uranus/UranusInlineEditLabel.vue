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
defineProps({
  labelText: {
    type: String,
    required: true
  },
  editButtonText: {
    type: String,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})


// Emit an event when editing starts
const emit = defineEmits(['edit-started'])

function startEditing() {
  emit('edit-started')
}
</script>

<style scoped>
.uranus-inline-edit-button:hover {
  background-color: var(--uranus-secondary-button-background-color);
}
</style>
