<!--
  src/component/event/editor/UranusEventLanguageEditor.vue
-->

<template>
  <UranusCard class="languages-tab">
    <h2>{{ t('event_languages') }}</h2>

    <div class="event-language-list">
      <span v-for="(lang, index) in store.draft!.languages ?? []" :key="lang" class="event-language-chip">
        {{ langLookup[lang] ?? lang }}
        <button @click="removeLanguage(index)">×</button>
      </span>
    </div>

    <UranusFormRow>
      <select v-model="selectedLang">
        <option :value="null" disabled>{{ t('event_select_language') }}</option>
        <option
            v-for="(name, id) in langLookup"
            :key="id"
            :value="id"
            :disabled="store.draft!.languages?.includes(id)"
        >
          {{ name }}
        </option>
      </select>

      <div>
        <UranusButton variant="tertiary" :disabled="!selectedLang" @click="addLanguage">
          {{ t('add') }}
        </UranusButton>
      </div>
    </UranusFormRow>
  </UranusCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLanguageLookupStore } from '@/store/UranusLanguageLookup.ts'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import {useUranusAdminEventStore} from '@/store/adminEventStore.ts'

const { t, locale } = useI18n({ useScope: 'global' })
const store = useUranusAdminEventStore()

const langStore = useLanguageLookupStore()
const selectedLang = ref<string | null>(null)

const langLookup = computed(() => langStore.data[locale.value] ?? {})

function addLanguage() {
  if (!selectedLang.value || !store.draft) return
  store.draft.languages!.push(selectedLang.value)
  selectedLang.value = null
}

function removeLanguage(index: number) {
  if (!store.draft) return
  store.draft.languages!.splice(index, 1)
}
</script>

<style scoped lang="scss">
.languages-tab { display: flex; flex-direction: column; gap: 1rem; }
.event-language-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.event-language-chip { color: #594d85; background-color: #e6e1f4; padding: 0.2rem 0.8rem; border-radius: 40px; display: flex; align-items: center; gap: 0.3rem; }
.event-language-chip button { border: none; background: inherit; color: inherit; cursor: pointer; border-radius: 50px; width: 1.8rem; aspect-ratio: 1/1; font-weight: bold; }
.event-language-chip button:hover { background: #d1cbea; }
</style>