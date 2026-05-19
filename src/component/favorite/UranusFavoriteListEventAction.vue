<template>
  <div
      v-if="tokenStore.isAuthenticated && appStore.favoriteListUuid"
      class="favorite-list-event-action"
      @click.stop.prevent
  >
    <UranusIconAction
        :icon="isSaved ? BookmarkCheck : BookmarkPlus"
        :label="label"
        :title="label"
        :selected="isSaved"
        :onClick="saveToFavoriteList"
        style="padding-left: 0;"
    />

    <span v-if="feedback" class="favorite-list-event-action__feedback" :class="`favorite-list-event-action__feedback--${feedbackType}`">
      {{ feedback }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { BookmarkCheck, BookmarkPlus } from 'lucide-vue-next'
import { apiFetch } from '@/api.ts'
import { useAppStore } from '@/store/appStore.ts'
import { useTokenStore } from '@/store/uranusTokenStore.ts'
import UranusIconAction from '@/component/ui/UranusIconAction.vue'

const props = defineProps<{
  eventUuid: string | null
  eventDateUuid?: string | null
}>()

const { t } = useI18n({ useScope: 'global' })
const appStore = useAppStore()
const tokenStore = useTokenStore()
const isSaving = ref(false)
const isSaved = ref(false)
const feedback = ref('')
const feedbackType = ref<'success' | 'error'>('success')

const label = computed(() => {
  if (isSaving.value) return t('favorite_list_event_saving')
  if (isSaved.value) return t('favorite_list_event_saved')
  return t('favorite_list_event_save')
})

async function saveToFavoriteList() {
  if (isSaving.value || !appStore.favoriteListUuid || !props.eventUuid) return

  isSaving.value = true
  feedback.value = ''

  try {
    await apiFetch(`/api/admin/favorite-list/${appStore.favoriteListUuid}/event`, {
      method: 'POST',
      body: JSON.stringify({
        event_uuid: props.eventUuid,
        event_date_uuid: props.eventDateUuid ?? null,
      }),
    })

    isSaved.value = true
    feedbackType.value = 'success'
    feedback.value = t('favorite_list_event_saved')
  } catch {
    feedbackType.value = 'error'
    feedback.value = t('favorite_list_event_save_error')
  } finally {
    isSaving.value = false
    window.setTimeout(() => {
      feedback.value = ''
    }, 3000)
  }
}
</script>

<style scoped lang="scss">
.favorite-list-event-action {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.favorite-list-event-action__feedback {
  font-size: 0.85rem;
  line-height: 1.3;
}

.favorite-list-event-action__feedback--success {
  color: rgb(var(--uranus-feedback-success-rgb));
}

.favorite-list-event-action__feedback--error {
  color: rgb(var(--uranus-error-color-rgb));
}
</style>
