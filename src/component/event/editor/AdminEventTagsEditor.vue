<template>
  <UranusCard class="tags-tab">
    <h2>{{ t('event_tags') }}</h2>

    <div class="event-tag-list">
      <span
          v-for="tag in store.draft?.tags ?? []"
          :key="tag"
          class="event-tag-chip"
      >
        {{ tag }}
        <button @click="removeTag(tag)">×</button>
      </span>
    </div>

    <UranusFormRow>
      <UranusTextfield
          id="event-tag"
          v-model="newTag"
          :placeholder="t('event_input_tag')"
          @keyup.enter="addTag"
      />
    </UranusFormRow>
  </UranusCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'

import UranusCard from '@/component/ui/UranusCard.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'

const { t } = useI18n({ useScope: 'global' })
const store = useUranusAdminEventStore()
const newTag = ref('')

// ------------------------------
// Add / Remove tags directly on store.draft.tags
// ------------------------------
function addTag() {
  if (!newTag.value || !store.draft) return
  if (!store.draft.tags!.includes(newTag.value)) {
    store.draft!.tags!.push(newTag.value)
  }
  newTag.value = ''
}

function removeTag(tag: string) {
  if (!store.draft) return
  store.draft.tags = store.draft.tags!.filter(t => t !== tag)
}
</script>

<style scoped lang="scss">
.tags-tab {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.event-tag-chip {
  color: #594d85;
  background-color: #e6e1f4;
  padding: 0.2rem 0.8rem;
  border-radius: 40px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.event-tag-chip button {
  border: none;
  background: inherit;
  color: inherit;
  cursor: pointer;
  border-radius: 50px;
  width: 1.8rem;
  aspect-ratio: 1/1;
  font-weight: bold;
}

.event-tag-chip button:hover {
  background: #d1cbea;
}
</style>