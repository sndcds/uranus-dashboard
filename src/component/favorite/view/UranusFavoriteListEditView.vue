<template>
  <div class="uranus-main-layout">
    <UranusOrgTitle />
    <UranusDashboardHero
        :title="t('favorite_list_edit')"
        :subtitle="favoriteListStore.draft?.name ?? ''"
    />

    <UranusFeedback :show="favoriteListStore.loading" type="warning">
      {{ t('loading') }}
    </UranusFeedback>

    <UranusFeedback :show="!!favoriteListStore.error" type="error">
      {{ favoriteListStore.error }}
    </UranusFeedback>

    <UranusForm v-if="favoriteListStore.isLoaded && favoriteListStore.draft" @submit="commit">
      <UranusFormRow>
        <UranusTextfield
            id="favorite-list-edit-name"
            v-model="favoriteListStore.draft.name"
            :label="t('name')"
            size="medium"
            required
        />
      </UranusFormRow>

      <UranusFormRow>
        <UranusLabel id="favorite-list-description" :label="t('description')">
          <UranusTextEditor v-model="favoriteListStore.draft.description!" />
        </UranusLabel>
      </UranusFormRow>

      <UranusFeedback :show="!!saveError" type="error">
        {{ saveError }}
      </UranusFeedback>

      <UranusFormActions>
        <UranusButton type="button" variant="secondary" :disabled="favoriteListStore.saving || !favoriteListStore.isDirty" @click="reset">
          {{ t('discard') }}
        </UranusButton>
        <UranusButton type="submit" :disabled="favoriteListStore.saving || !favoriteListStore.isDirty" :loading="favoriteListStore.saving" :loading-text="t('saving')">
          {{ t('save') }}
        </UranusButton>
      </UranusFormActions>
    </UranusForm>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { apiFetch } from '@/api.ts'
import { useFavoriteListStore } from '@/store/favoriteListStore.ts'
import { useAppStore } from '@/store/appStore.ts'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusTextEditor from '@/component/ui/UranusTextEditor.vue'
import UranusLabel from '@/component/ui/UranusLabel.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusOrgTitle from '@/component/layout/UranusOrgTitle.vue'

const { t } = useI18n({ useScope: 'global' })
const route = useRoute()
const favoriteListStore = useFavoriteListStore()
const appStore = useAppStore()
const saveError = ref<string | null>(null)

async function loadFavoriteList() {
  const listUuid = String(route.params.favoriteListUuid ?? '')
  if (!listUuid) return

  favoriteListStore.loading = true
  favoriteListStore.error = null

  try {
    const apiResponse = await apiFetch<any>(`/api/admin/favorite-list/${listUuid}`)
    favoriteListStore.loadFromApi(apiResponse.data)
  } catch {
    favoriteListStore.error = t('favorite_list_load_error')
  } finally {
    favoriteListStore.loading = false
  }
}

async function commit() {
  const draft = favoriteListStore.draft
  const original = favoriteListStore.original
  if (!draft || !original || !favoriteListStore.isDirty) return

  favoriteListStore.saving = true
  saveError.value = null

  try {
    const payload: Record<string, string | null> = {}
    if (normalize(draft.name) !== normalize(original.name)) payload.name = draft.name.trim()
    if (normalize(draft.description) !== normalize(original.description)) payload.description = normalize(draft.description)

    await apiFetch(`/api/admin/favorite-list/${draft.uuid}/fields`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    favoriteListStore.commitDraftToOriginal()
    if (appStore.favoriteListUuid === draft.uuid) {
      appStore.setFavoriteList(draft.uuid, draft.name)
    }
  } catch {
    saveError.value = t('favorite_list_save_error')
  } finally {
    favoriteListStore.saving = false
  }
}

function reset() {
  if (!favoriteListStore.original || !favoriteListStore.draft) return
  favoriteListStore.draft.name = favoriteListStore.original.name
  favoriteListStore.draft.description = favoriteListStore.original.description
}

function normalize(value: string | null | undefined) {
  return value === '' || value == null ? null : value
}

onMounted(() => {
  void loadFavoriteList()
})

onUnmounted(() => {
  favoriteListStore.clear()
})
</script>
