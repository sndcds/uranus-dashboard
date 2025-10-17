<template>
  <div class="tag-list">
    <ComboTag
        v-for="(tag, index) in tags"
        :key="index"
        :label="tag.label"
        :theme="tag.theme"
        @remove="removeTag(index)"
    />

    <input
        v-model="newTag"
        @keyup.enter="addTag"
        placeholder="Add a tag"
        class="add-input"
    />
  </div>
</template>


<script setup lang="ts">
  import { ref } from 'vue'
  import ComboTag from './ComboTag.vue'

  interface Tag {
    label: string
    theme?: string
  }

  const tags = ref<Tag[]>([
    { label: 'Vue', theme: 'light' },
    { label: 'TypeScript', theme: 'light' },
    { label: 'Composition API', theme: 'light' },
  ])

  const newTag = ref('')

  function addTag() {
    const trimmed = newTag.value.trim()
    if (trimmed) {
      tags.value.push({ label: trimmed, theme: 'light' })
      newTag.value = ''
    }
  }

  function removeTag(index: number) {
    tags.value.splice(index, 1)
  }
</script>


<style scoped>
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4em;
    align-items: center;
  }

  .add-input {
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid #ccc;
    outline: none;
  }
</style>