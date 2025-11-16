<template>
  <div class="uranus-inline-label">
    <span
        v-if="labelText"
        :class="['uranus-inline-label-text', labelClass]"
    >
      {{ labelText }}
    </span>
    <button
        type="button"
        class="uranus-inline-edit-button"
        @click="startEditing"
        :style="{ marginLeft: labelText ? '8px' : '0' }"
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
  labelClass: {
    type: [String, Array, Object],
    default: '' // optional class for the label span
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

const emit = defineEmits(['edit-started'])

function startEditing() {
  emit('edit-started')
}
</script>

<style scoped>
.uranus-inline-label {
  display: flex;
  align-items: center; /* vertically center button with label if present */
}

/* Label span is hidden if empty, takes no space */
.uranus-inline-label span:empty {
  display: none;
}

/* Optional: remove spacing if label is gone */
.uranus-inline-edit-button {
  margin-left: 8px;
}

.uranus-inline-label span:empty + .uranus-inline-edit-button {
  margin-left: 0; /* button sticks to top-left when label missing */
}

.uranus-inline-edit-button:hover {
  background-color: var(--uranus-secondary-button-background-color);
}
</style>