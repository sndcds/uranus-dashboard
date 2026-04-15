<template>
  <form
      class="uranus-form"
      @submit.prevent="handleSubmit"
      :novalidate="!validate"
  >
    <slot />
  </form>
</template>

<script setup lang="ts">

const props = defineProps({
  validate: { type: Boolean, default: true }
})

const emit = defineEmits<{
  (e: 'submit', event: SubmitEvent): void
}>()

const handleSubmit = (event: SubmitEvent) => {
  emit('submit', event)
}

</script>

<style scoped>
.uranus-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}
</style>