<template>
  <div class="uranus-inline-label">
    <span
        v-if="labelText"
        :class="[labelClass]"
    >
      {{ labelText }}
    </span>
    <button
        type="button"
        class="uranus-inline-edit-button"
        @click="$emit('edit-started')"
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

</script>

<style scoped>
.uranus-inline-label {
  display: flex;
  align-items: center;
  padding: 0px;
  margin: 0px;
}

.uranus-inline-label span:empty {
  display: none;
}
</style>