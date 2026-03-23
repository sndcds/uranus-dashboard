<template>
  <UranusCard class="tags-tab">
    <h2>{{ t('event_tags') }}</h2>

    <div class="event-tag-list">
      <span v-for="tag in draft.tags ?? []" :key="tag" class="event-tag-chip">
        {{ tag }}
        <button @click="removeTag(tag)">×</button>
      </span>
    </div>

    <UranusFormRow>
      <UranusTextfield
          id="event-tag"
          v-model="newTag"
          :placeholder="t('event_input_tag')"
          @keyup.enter="addTag" />
    </UranusFormRow>
  </UranusCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'

const props = defineProps<{
  draft: { tags: string[] }
}>()
const emit = defineEmits<{
  (e: 'update', tags: string[]): void
}>()

const { t } = useI18n({ useScope: 'global' })
const newTag = ref('')

function addTag() {
  if (!newTag.value) return
  if (!props.draft.tags.includes(newTag.value)) props.draft.tags.push(newTag.value)
  emit('update', [...props.draft.tags])
  newTag.value = ''
}

function removeTag(tag: string) {
  props.draft.tags = props.draft.tags.filter(t => t !== tag)
  emit('update', [...props.draft.tags])
}
</script>

<style scoped lang="scss">
.tags-tab { display: flex; flex-direction: column; gap: 1rem; }
.event-tag-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.event-tag-chip { color: #594d85; background-color: #e6e1f4; padding: 0.2rem 0.8rem; border-radius: 40px; display: flex; align-items: center; gap: 0.3rem; }
.event-tag-chip button { border: none; background: inherit; color: inherit; cursor: pointer; border-radius: 50px; width: 1.8rem; aspect-ratio: 1/1; font-weight: bold; }
.event-tag-chip button:hover { background: #d1cbea; }
</style>