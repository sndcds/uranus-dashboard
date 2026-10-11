<template>
  <UranusModal :show="true" :title="t('social_media')" max-width="650px" @close="close">
    <div class="social-content">
      <UranusFeedback v-if="error" type="error">{{ t(error) }}</UranusFeedback>
      <UranusFeedback v-if="success" type="success">{{ t('social_saved') }}</UranusFeedback>
      <p v-if="loading" role="status">{{ t('loading') }}</p>
      <UranusButton v-if="loadFailed" @click="load">{{ t('social_reload') }}</UranusButton>
      <template v-if="!loading && !loadFailed && !editing">
        <p v-if="!accounts.length">{{ t('social_no_accounts') }}</p>
        <article v-for="account in accounts" :key="account.uuid" class="social-account">
          <div>
            <strong>{{ account.name }}</strong> · {{ account.platform }}
            <p>{{ account.remoteAccountName || account.remoteAccountId }}</p>
            <p>{{ t(account.enabled ? 'social_enabled' : 'social_disabled') }}</p>
          </div>
          <UranusButton size="small" variant="secondary" :disabled="busy" @click="edit(account)">{{ t('edit') }}</UranusButton>
          <UranusButton size="small" variant="danger" :disabled="busy" @click="deleting = account">{{ t('delete') }}</UranusButton>
        </article>
        <UranusFeedback v-if="deleting" type="warning">
          <p>{{ t('social_delete_confirm', { name: deleting.name }) }}</p>
          <UranusFormActions>
            <UranusButton :disabled="busy" @click="deleting = null">{{ t('cancel') }}</UranusButton>
            <UranusButton variant="danger" :loading="busy" :loading-text="t('loading')" @click="remove">{{ t('delete') }}</UranusButton>
          </UranusFormActions>
        </UranusFeedback>
        <UranusButton :disabled="busy" @click="edit(null)"><template #icon><Plus /></template>{{ t('social_add_account') }}</UranusButton>
      </template>
      <UranusForm v-if="editing" @submit="save">
        <fieldset :disabled="busy" class="social-fields">
          <UranusLabel :label="t('social_platform')">
            <UranusPopupSelect v-model="form.platform" :options="platformOptions" :aria-label="t('social_platform')" :disabled="busy" />
          </UranusLabel>
          <UranusInput id="social-name" v-model="form.name" :label="t('social_name')" required />
          <UranusInput id="social-remote-id" v-model="form.remoteAccountId" :label="t('social_remote_id')" required />
          <p class="social-hint">{{ t(`social_identity_${form.platform}`) }}</p>
          <UranusInput id="social-remote-name" v-model="form.remoteAccountName" :label="t('social_remote_name')" />
          <UranusInput id="social-base-url" v-model="form.baseUrl" type="url" :label="t('social_base_url')" :required="form.platform === 'mastodon'" />
          <UranusCheckbox id="social-enabled" v-model="form.enabled" :label="t('social_enabled')" />
          <p>{{ t('social_credentials_hint') }}</p>
          <p v-if="editingAccount">{{ t('social_access_stored') }}: {{ t(editingAccount.hasAccessToken ? 'yes' : 'no') }} · {{ t('social_refresh_stored') }}: {{ t(editingAccount.hasRefreshToken ? 'yes' : 'no') }}</p>
          <UranusInput id="social-access-token" v-model="accessToken" type="password" autocomplete="new-password" :label="t('social_access_token')" />
          <UranusCheckbox v-if="editingAccount" id="social-clear-access" v-model="clearAccess" :label="t('social_clear_access')" />
          <UranusInput id="social-refresh-token" v-model="refreshToken" type="password" autocomplete="new-password" :label="t('social_refresh_token')" />
          <UranusCheckbox v-if="editingAccount" id="social-clear-refresh" v-model="clearRefresh" :label="t('social_clear_refresh')" />
          <UranusInput id="social-token-expiry" v-model="form.tokenExpiresAt" :label="t('social_token_expiry')" placeholder="2026-12-31T23:00:00Z" />
        </fieldset>
        <UranusFormActions>
          <UranusButton :disabled="busy" @click="cancelEdit">{{ t('cancel') }}</UranusButton>
          <UranusButton type="submit" :loading="busy" :loading-text="t('loading')">{{ t('save') }}</UranusButton>
        </UranusFormActions>
      </UranusForm>
    </div>
    <template #actions><UranusButton :disabled="busy" @click="close">{{ t('close') }}</UranusButton></template>
  </UranusModal>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus } from 'lucide-vue-next'
import { socialApi, socialErrorKey, safeSocialUrl } from '@/api/social'
import { socialPlatforms, type SocialAccount, type SocialAccountInput } from '@/domain/social/social.model'
import UranusModal from '@/component/uranus/UranusModal.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusInput from '@/component/ui/UranusInput.vue'
import UranusCheckbox from '@/component/ui/UranusCheckbox.vue'
import UranusPopupSelect from '@/component/ui/UranusPopupSelect.vue'
import UranusLabel from '@/component/ui/UranusLabel.vue'

const props = defineProps<{ orgUuid: string }>()
const emit = defineEmits<{ close: []; changed: [] }>()
const { t } = useI18n()
const accounts = ref<SocialAccount[]>([])
const loading = ref(false)
const busy = ref(false)
const loadFailed = ref(false)
const error = ref('')
const success = ref(false)
const editing = ref(false)
const editingAccount = ref<SocialAccount | null>(null)
const deleting = ref<SocialAccount | null>(null)
const emptyForm = (): SocialAccountInput => ({ platform: 'facebook', name: '', remoteAccountId: '', remoteAccountName: null, baseUrl: null, enabled: true, tokenExpiresAt: null })
const form = ref(emptyForm())
const accessToken = ref('')
const refreshToken = ref('')
const clearAccess = ref(false)
const clearRefresh = ref(false)
const platformOptions = socialPlatforms.map(value => ({ value, label: ({ facebook: 'Facebook', instagram: 'Instagram', mastodon: 'Mastodon', bluesky: 'Bluesky' })[value] }))

function clearSecrets() {
  accessToken.value = ''
  refreshToken.value = ''
  clearAccess.value = false
  clearRefresh.value = false
}
function close() {
  if (busy.value) return
  clearSecrets()
  emit('close')
}
function cancelEdit() {
  clearSecrets()
  editing.value = false
  editingAccount.value = null
}
function edit(account: SocialAccount | null) {
  clearSecrets()
  error.value = ''
  success.value = false
  deleting.value = null
  editingAccount.value = account
  form.value = account ? {
    platform: account.platform, name: account.name, remoteAccountId: account.remoteAccountId,
    remoteAccountName: account.remoteAccountName, baseUrl: account.baseUrl,
    enabled: account.enabled, tokenExpiresAt: account.tokenExpiresAt,
  } : emptyForm()
  editing.value = true
}
async function load() {
  loading.value = true
  error.value = ''
  loadFailed.value = false
  try { accounts.value = await socialApi.listAccounts(props.orgUuid) }
  catch (err) { error.value = socialErrorKey(err); loadFailed.value = true }
  finally { loading.value = false }
}
async function save() {
  if (busy.value) return
  error.value = ''
  const baseUrl = form.value.baseUrl?.trim() || null
  const expiry = form.value.tokenExpiresAt?.trim() || null
  if (!form.value.name.trim() || !form.value.remoteAccountId.trim() ||
    (form.value.platform === 'mastodon' && !baseUrl) ||
    (baseUrl && (!safeSocialUrl(baseUrl) || new URL(baseUrl).pathname !== '/' || new URL(baseUrl).search || new URL(baseUrl).hash)) ||
    (expiry && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(expiry) || !Number.isFinite(Date.parse(expiry))))) {
    error.value = 'social_error_input'
    return
  }
  busy.value = true
  try {
    const payload: SocialAccountInput = {
      ...form.value, name: form.value.name.trim(), remoteAccountId: form.value.remoteAccountId.trim(),
      remoteAccountName: form.value.remoteAccountName?.trim() || null, baseUrl, tokenExpiresAt: expiry,
      ...(clearAccess.value ? { accessToken: null } : accessToken.value ? { accessToken: accessToken.value } : {}),
      ...(clearRefresh.value ? { refreshToken: null } : refreshToken.value ? { refreshToken: refreshToken.value } : {}),
    }
    const saved = editingAccount.value
      ? await socialApi.updateAccount(editingAccount.value.uuid, payload)
      : await socialApi.createAccount(props.orgUuid, payload)
    accounts.value = [...accounts.value.filter(a => a.uuid !== saved.uuid), saved]
    cancelEdit()
    success.value = true
    emit('changed')
  } catch (err) { error.value = socialErrorKey(err) }
  finally { clearSecrets(); busy.value = false }
}
async function remove() {
  if (!deleting.value || busy.value) return
  busy.value = true
  error.value = ''
  success.value = false
  try {
    const uuid = deleting.value.uuid
    await socialApi.deleteAccount(uuid)
    accounts.value = accounts.value.filter(a => a.uuid !== uuid)
    deleting.value = null
    success.value = true
    emit('changed')
  } catch (err) { error.value = socialErrorKey(err) }
  finally { busy.value = false }
}
onMounted(load)
onBeforeUnmount(clearSecrets)
</script>

<style scoped lang="scss">
.social-content, .social-fields { display: flex; flex-direction: column; gap: 1rem; }
.social-fields { border: 0; padding: 0; margin: 0; min-width: 0; }
.social-account { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; border-bottom: 1px solid var(--uranus-color-7); padding-bottom: 1rem; }
.social-account > div { flex: 1; min-width: 12rem; overflow-wrap: anywhere; }
p { margin: 0.25rem 0; }
.social-hint { color: var(--uranus-color-3); }
</style>
