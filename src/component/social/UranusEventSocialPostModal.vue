<template>
  <UranusModal :show="!configure" :title="t('social_post_event')" max-width="760px" @close="close">
    <div class="social-content">
      <h2>{{ eventTitle }}</h2>
      <p>{{ t('social_event_content') }}</p>
      <UranusFeedback v-if="selected.length && !publishingSupported" type="warning">{{ t('social_preview_only_hint') }}</UranusFeedback>
      <UranusFeedback v-if="error" type="error">{{ t(error) }}</UranusFeedback>
      <p v-if="loading" role="status">{{ t('loading') }}</p>
      <UranusButton v-if="loadFailed || creationUncertain" :disabled="busy" @click="load">{{ t('social_reload') }}</UranusButton>
      <p v-if="creationUncertain">{{ t('social_creation_uncertain') }}</p>
      <template v-if="!loading && !loadFailed">
        <section v-if="posts.length && !post">
          <h3>{{ t('social_existing_posts') }}</h3>
          <p>{{ t('social_existing_hint') }}</p>
          <UranusButton v-for="existing in posts" :key="existing.uuid" variant="secondary" :disabled="busy" @click="openPost(existing)">
            {{ formatDate(existing.createdAt) }} · {{ existing.targets.map(target => t(`social_status_${target.status}`)).join(', ') }}
          </UranusButton>
        </section>
        <template v-if="!post || editable">
          <h3>{{ t('social_targets') }}</h3>
          <p v-if="!activeAccounts.length">{{ t('social_no_accounts') }}</p>
          <fieldset class="social-targets" :disabled="busy || creationUncertain">
            <UranusCheckbox v-for="account in activeAccounts" :id="`social-target-${account.uuid}`" :key="account.uuid"
              v-model="selected" :value="account.uuid" :label="`${account.name} · ${account.platform}${socialPublishingPlatforms.includes(account.platform) ? '' : ' · ' + t('social_preview_only')}`" />
          </fieldset>
          <UranusButton variant="secondary" :disabled="busy" @click="configure = true">{{ t('social_configure') }}</UranusButton>
        </template>
        <template v-if="post">
          <UranusFeedback v-if="allPublished" type="success">{{ t('social_published') }}</UranusFeedback>
          <UranusFeedback v-else-if="accepted && pending" type="success">{{ t('social_accepted') }}</UranusFeedback>
          <UranusFeedback v-else-if="editable" type="notice">{{ t('social_draft_created') }}</UranusFeedback>
          <UranusFeedback v-if="reconciliationRequired" type="warning">{{ t('social_reconciliation_required') }}</UranusFeedback>
          <UranusFeedback v-else-if="pollingPaused && pending" type="warning">{{ t('social_polling_paused') }}</UranusFeedback>
          <p v-if="pending">{{ t('social_worker_hint') }}</p>
          <ul class="social-status" aria-live="polite">
            <li v-for="target in post.targets" :key="target.uuid">
              <strong>{{ accountName(target.socialAccountUuid) }}</strong>: {{ t(`social_status_${target.status}`) }}
              <span v-if="target.status === 'scheduled' && target.publicationSource === 'manual'"> · {{ t('social_manual_queue') }}</span>
              <p v-if="target.status === 'failed'">{{ t('social_target_failed') }}</p>
            </li>
          </ul>
          <UranusButton variant="secondary" :disabled="busy || refreshing" @click="refresh">{{ t('social_refresh_status') }}</UranusButton>
        </template>
        <template v-if="!post || editable || post.targets.every(target => target.status === 'failed' || target.status === 'draft')">
          <UranusButton :disabled="!selected.length || busy || refreshing || creationUncertain" :loading="busy" :loading-text="t('loading')" @click="prepare">{{ t('social_prepare_preview') }}</UranusButton>
        </template>
        <article v-for="preview in previews" :key="preview.targetUuid" class="social-preview">
          <h3>{{ preview.platform }}</h3>
          <p class="social-preview-text">{{ preview.text }}</p>
          <img v-if="preview.imageUrl" :src="preview.imageUrl" :alt="preview.imageAlt || eventTitle" referrerpolicy="no-referrer" />
          <a v-if="preview.url" :href="preview.url" target="_blank" rel="noopener noreferrer">{{ t('social_open_link') }}</a>
        </article>
      </template>
    </div>
    <template #actions>
      <UranusFormActions>
        <UranusButton :disabled="busy" @click="close">{{ t('close') }}</UranusButton>
        <UranusButton v-if="post" variant="secondary" :disabled="busy" @click="newPost">{{ t('social_back_to_posts') }}</UranusButton>
        <UranusButton v-if="canPublish" :loading="busy" :loading-text="t('loading')" @click="publish">{{ t('social_publish') }}</UranusButton>
      </UranusFormActions>
    </template>
  </UranusModal>
  <UranusSocialAccountsModal v-if="configure" :org-uuid="orgUuid" @close="closeConfiguration" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSocialEventPost } from '@/composable/useSocialEventPost'
import { socialPublishingPlatforms } from '@/domain/social/social.model'
import UranusModal from '@/component/uranus/UranusModal.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusCheckbox from '@/component/ui/UranusCheckbox.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusSocialAccountsModal from '@/component/social/UranusSocialAccountsModal.vue'

const props = defineProps<{ orgUuid: string; eventUuid: string; eventTitle: string }>()
const emit = defineEmits<{ close: [] }>()
const { t, locale } = useI18n()
const configure = ref(false)
const { accounts, activeAccounts, posts, selected, post, previews, loading, busy, error,
  refreshing, pollingPaused, reconciliationRequired,
  loadFailed, creationUncertain, accepted, pending, allPublished, editable, canPublish, publishingSupported,
  load, refresh, newPost, openPost, invalidatePreview, prepare, publish } = useSocialEventPost(props.orgUuid, props.eventUuid, () => locale.value)
function accountName(uuid: string) { return accounts.value.find(a => a.uuid === uuid)?.name ?? t('social_target') }
function formatDate(value: string) { return new Date(value).toLocaleString(locale.value) }
function close() { if (!busy.value && !configure.value) emit('close') }
async function closeConfiguration() { configure.value = false; invalidatePreview(); await load() }
watch([selected, locale], invalidatePreview, { deep: true })
onMounted(load)
</script>

<style scoped lang="scss">
.social-content, .social-targets { display: flex; flex-direction: column; gap: 1rem; }
.social-targets { border: 0; padding: 0; margin: 0; min-width: 0; }
.social-targets :deep(.label-text) { white-space: normal; overflow-wrap: anywhere; }
.social-preview { border-top: 1px solid var(--uranus-color-7); padding-top: 1rem; }
.social-preview-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.social-preview img { display: block; max-width: 100%; max-height: 320px; object-fit: contain; margin: 1rem 0; }
.social-status { padding-left: 1.25rem; }
section .uranus-button { margin: 0.25rem; }
</style>
