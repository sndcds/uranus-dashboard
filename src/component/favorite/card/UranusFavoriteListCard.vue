<template>
  <UranusCard class="favorite-list-card" :class="{ active: isActive }">
    <div class="favorite-list-card__content">
      <div>
        <h2>{{ list.name }}</h2>
        <p v-if="list.description" class="favorite-list-card__description">
          {{ list.description }}
        </p>
        <p class="favorite-list-card__meta">
          {{ t('favorite_list_item_count', { count: list.itemCount }) }}
        </p>
      </div>

      <div class="favorite-list-card__actions">
        <UranusButton variant="secondary" size="small" @click="activateList">
          {{ isActive ? t('favorite_list_active') : t('favorite_list_activate') }}
        </UranusButton>

        <UranusIconAction
            v-if="list.canEdit"
            :icon="Edit"
            :title="t('edit')"
            :to="`/admin/org/favorite-lists/${list.uuid}/edit`"
        />

        <UranusIconAction
            v-if="list.canDelete"
            :icon="Trash2"
            :title="t('delete')"
            :onClick="requestDelete"
        />
      </div>
    </div>

    <UranusPasswordConfirmModal
        :show="showDeleteModal"
        :title="t('favorite_list_delete')"
        :question="t('favorite_list_delete_question', { name: list.name })"
        :confirm-text="t('delete')"
        :loading-text="t('deleting')"
        :error="deleteError"
        :is-submitting="isDeleting"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
    />
  </UranusCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Edit, Trash2 } from 'lucide-vue-next'
import { ApiError, apiFetch } from '@/api.ts'
import { useAppStore } from '@/store/appStore.ts'
import type { FavoriteList } from '@/domain/favorite/favoriteList.model.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusIconAction from '@/component/ui/UranusIconAction.vue'
import UranusPasswordConfirmModal from '@/component/uranus/UranusPasswordConfirmModal.vue'
import { apiErrorI18nKey } from '@/util/api_error.ts'

const props = defineProps<{
  list: FavoriteList
}>()

const emit = defineEmits<{
  deleted: [listUuid: string]
}>()

const { t } = useI18n({ useScope: 'global' })
const appStore = useAppStore()
const showDeleteModal = ref(false)
const deleteError = ref('')
const isDeleting = ref(false)

const isActive = computed(() => appStore.favoriteListUuid === props.list.uuid)

function activateList() {
  appStore.setFavoriteList(props.list.uuid, props.list.name)
}

function requestDelete() {
  showDeleteModal.value = true
  deleteError.value = ''
}

function cancelDelete() {
  showDeleteModal.value = false
  deleteError.value = ''
}

async function confirmDelete({ password }: { password: string }) {
  deleteError.value = ''
  isDeleting.value = true

  try {
    await apiFetch(`/api/admin/favorite-list/${props.list.uuid}`, {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    })

    if (appStore.favoriteListUuid === props.list.uuid) {
      appStore.clearFavoriteList()
    }

    emit('deleted', props.list.uuid)
    cancelDelete()
  } catch (err) {
    if (err instanceof ApiError) {
      deleteError.value = t(apiErrorI18nKey(err.status, 'failed_to_delete_favorite_list'))
    } else {
      deleteError.value = t('failed_to_delete_favorite_list')
    }
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped lang="scss">
.favorite-list-card {
  width: 100%;
}

.favorite-list-card.active {
  border-color: var(--uranus-select-bg);
}

.favorite-list-card__content {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.favorite-list-card__description {
  white-space: pre-wrap;
  color: var(--uranus-muted-text);
}

.favorite-list-card__meta {
  margin-bottom: 0;
}

.favorite-list-card__actions {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  flex-shrink: 0;
}

@media (max-width: 700px) {
  .favorite-list-card__content {
    flex-direction: column;
  }
}
</style>
