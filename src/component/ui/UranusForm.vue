<template>
  <form
      class="uranus-form"
      @submit.prevent="handleSubmit"
      novalidate
  >
    <slot />
  </form>
</template>

<script setup lang="ts">

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