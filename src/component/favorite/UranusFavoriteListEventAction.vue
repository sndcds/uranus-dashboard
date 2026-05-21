<!--
  src/component/favorite/UranusFavoriteListEventAction.vue
-->

<template>
  <div
      v-if="tokenStore.isAuthenticated && appStore.favoriteListUuid"
      class="favorite-list-event-action"
      @click.stop.prevent
  >
    <button
        class="favorite-list-event-action__button"
        :class="{
        'favorite-list-event-action__button--saved': isSaved,
        'favorite-list-event-action__button--saving': isSaving,
      }"
        :title="label"
        :aria-label="label"
        :disabled="isSaving"
        @click="saveToFavoriteList"
    >
      <component
          :is="isSaved ? HeartHandshake : Heart"
          class="favorite-list-event-action__icon"
      />
    </button>

    <span
        v-if="feedback"
        class="favorite-list-event-action__feedback"
        :class="`favorite-list-event-action__feedback--${feedbackType}`"
    >
      {{ feedback }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { Heart, HeartHandshake } from 'lucide-vue-next'
import { apiFetch } from '@/api.ts'
import { useAppStore } from '@/store/appStore.ts'
import { useTokenStore } from '@/store/uranusTokenStore.ts'

const props = defineProps<{
  eventUuid: string | null
  eventDateUuid?: string | null
}>()

const { t } = useI18n({ useScope: 'global' })
const appStore = useAppStore()
const tokenStore = useTokenStore()

const isLoadingState = ref(false)
const isSaving = ref(false)
const isSaved = ref(false)

const feedback = ref('')
const feedbackType = ref<'success' | 'error'>('success')

const label = computed(() => {
  if (isSaving.value) return t('favorite_list_event_saving')
  if (isSaved.value) return t('favorite_list_event_saved')
  return t('favorite_list_event_save')
})

watchEffect(() => {
  loadFavoriteState()
})

async function loadFavoriteState() {
  if (!appStore.favoriteListUuid || !props.eventDateUuid) {
    isSaved.value = false
    return
  }

  isLoadingState.value = true

  try {
    const apiPath = `/api/admin/favorite-list/check-event-date`

    const apiResponse = await apiFetch(apiPath, {
      method: 'POST',
      body: JSON.stringify({
        org_uuid: appStore.orgUuid,
        favorite_list_uuid: appStore.favoriteListUuid,
        event_uuid: props.eventUuid,
        event_date_uuid: props.eventDateUuid ?? null,
      }),
    })

    isSaved.value = !!apiResponse?.metadata?.favorite_status
  } catch {
    isSaved.value = false
  } finally {
    isLoadingState.value = false
  }
}

async function saveToFavoriteList() {
  if (isSaving.value || !appStore.favoriteListUuid || !props.eventUuid) {
    return
  }

  isSaving.value = true
  feedback.value = ''

  try {
    const apiPath = `/api/admin/favorite-list/toggle-event-date`

    await apiFetch(apiPath, {
      method: 'POST',
      body: JSON.stringify({
        org_uuid: appStore.orgUuid,
        favorite_list_uuid: appStore.favoriteListUuid,
        event_uuid: props.eventUuid,
        event_date_uuid: props.eventDateUuid ?? null,
      }),
    })

    await loadFavoriteState()

    feedbackType.value = 'success'
    feedback.value = isSaved.value
        ? t('favorite_list_event_saved')
        : t('favorite_list_event_removed')
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

.favorite-list-event-action__button {
  display: inline-flex; /* important: shrink-to-fit */
  align-items: center;
  justify-content: center;

  width: fit-content;
  height: fit-content;

  padding: 0;
  margin: 0;

  background: transparent;
  border: none;
  cursor: pointer;

  color: rgb(var(--uranus-text-color-rgb));

  transition:
      transform 0.15s ease,
      color 0.2s ease,
      opacity 0.2s ease;
}

.favorite-list-event-action__button:hover {
  transform: scale(1.15);
}

.favorite-list-event-action__button--saved {
  color: rgb(var(--uranus-error-color-rgb));
}

.favorite-list-event-action__button--saving {
  opacity: 0.6;
  cursor: wait;
}

.favorite-list-event-action__icon {
  width: 1.4rem;
  height: 1.4rem;
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