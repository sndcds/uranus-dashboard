import { computed, onBeforeUnmount, ref } from 'vue'
import { socialApi, socialErrorKey } from '@/api/social'
import { socialPublishingPlatforms, type SocialAccount, type SocialPost, type SocialPreview } from '@/domain/social/social.model'

const POLLING_WINDOW_MS = 180_000
const STATUS_REQUEST_TIMEOUT_MS = 15_000

export function useSocialEventPost(orgUuid: string, eventUuid: string, language: () => string) {
  const accounts = ref<SocialAccount[]>([])
  const posts = ref<SocialPost[]>([])
  const selected = ref<string[]>([])
  const post = ref<SocialPost | null>(null)
  const previews = ref<SocialPreview[]>([])
  const loading = ref(false)
  const busy = ref(false)
  const error = ref('')
  const loadFailed = ref(false)
  const creationUncertain = ref(false)
  const accepted = ref(false)
  const refreshing = ref(false)
  const pollingPaused = ref(false)
  const reconciliationRequired = computed(() => post.value?.targets.some(target =>
    target.status === 'publishing' && !!target.error) ?? false)
  let pollDeadline = 0
  let pollAttempt = 0
  let statusController: AbortController | null = null
  let statusGeneration = 0
  let previewLanguage = ''
  let disposed = false
  let timer: ReturnType<typeof setTimeout> | undefined
  const activeAccounts = computed(() => accounts.value.filter(a => a.enabled))
  const pending = computed(() => post.value?.targets.some(t => t.status === 'scheduled' || t.status === 'publishing') ?? false)
  const allPublished = computed(() => !!post.value?.targets.length && post.value.targets.every(t => t.status === 'published'))
  const editable = computed(() => !post.value || post.value.targets.every(t => t.status === 'draft'))
  const publishingSupported = computed(() => selected.value.length > 0 && selected.value.every(uuid => {
    const account = accounts.value.find(a => a.uuid === uuid)
    return account && socialPublishingPlatforms.includes(account.platform)
  }))
  const canPublish = computed(() => !refreshing.value && !!post.value?.targets.length && previews.value.length === post.value.targets.length &&
    publishingSupported.value && previewLanguage === language() && post.value.targets.every(t =>
      (t.status === 'draft' || t.status === 'failed') && previews.value.some(p => p.targetUuid === t.uuid) &&
      activeAccounts.value.some(a => a.uuid === t.socialAccountUuid && socialPublishingPlatforms.includes(a.platform))))

  function remember(updated: SocialPost) {
    if (updated.orgUuid !== orgUuid || updated.sourceType !== 'event' || updated.sourceUuid !== eventUuid) throw new Error('Invalid post scope')
    post.value = updated
    posts.value = [...posts.value.filter(p => p.uuid !== updated.uuid), updated]
  }
  function stopPolling() { clearTimeout(timer); timer = undefined }
  function cancelStatusRequest() {
    statusGeneration++
    statusController?.abort()
    statusController = null
    refreshing.value = false
  }
  function resetPolling() {
    stopPolling()
    cancelStatusRequest()
    pollDeadline = Date.now() + POLLING_WINDOW_MS
    pollAttempt = 0
    pollingPaused.value = false
  }
  function schedulePoll() {
    stopPolling()
    if (disposed || !pending.value || pollingPaused.value || reconciliationRequired.value) return
    const remaining = pollDeadline - Date.now()
    if (remaining <= 0) { pollingPaused.value = true; return }
    const delay = Math.min(3000 * 2 ** Math.min(pollAttempt, 3), 15_000, remaining)
    timer = setTimeout(() => {
      if (Date.now() >= pollDeadline) { pollingPaused.value = true; return }
      pollAttempt++
      void refresh()
    }, delay)
  }
  async function refresh() {
    if (!post.value || busy.value || refreshing.value || disposed) return
    stopPolling()
    refreshing.value = true
    const uuid = post.value.uuid
    const generation = statusGeneration
    const controller = new AbortController()
    statusController = controller
    const timeout = setTimeout(() => controller.abort(), STATUS_REQUEST_TIMEOUT_MS)
    try {
      const updated = await socialApi.getPost(uuid, controller.signal)
      if (disposed || generation !== statusGeneration || post.value?.uuid !== uuid) return
      remember(updated)
      error.value = ''
      schedulePoll()
    } catch (err) {
      if (!disposed && generation === statusGeneration) {
        error.value = socialErrorKey(err)
        pollingPaused.value = true
        stopPolling() // Only an explicit read or reopening the dialog may follow an error.
      }
    } finally {
      clearTimeout(timeout)
      if (generation === statusGeneration) {
        statusController = null
        refreshing.value = false
      }
    }
  }
  async function load() {
    stopPolling()
    cancelStatusRequest()
    loading.value = true
    error.value = ''
    loadFailed.value = false
    try {
      const [loadedAccounts, loadedPosts] = await Promise.all([
        socialApi.listAccounts(orgUuid), socialApi.listEventPosts(orgUuid, eventUuid),
      ])
      if (disposed) return
      accounts.value = loadedAccounts
      posts.value = loadedPosts
      creationUncertain.value = false
    } catch (err) { error.value = socialErrorKey(err); loadFailed.value = true }
    finally { loading.value = false; schedulePoll() }
  }
  function newPost() {
    if (busy.value) return
    resetPolling()
    post.value = null
    selected.value = []
    previews.value = []
    accepted.value = false
    error.value = ''
  }
  async function openPost(existing: SocialPost) {
    if (busy.value) return
    resetPolling()
    remember(existing)
    selected.value = existing.targets.map(t => t.socialAccountUuid)
    previews.value = []
    accepted.value = false
    error.value = ''
    await refresh()
  }
  function invalidatePreview() { previews.value = []; accepted.value = false }
  async function prepare() {
    if (busy.value || refreshing.value || loading.value || loadFailed.value || creationUncertain.value || !selected.value.length) return
    if (!selected.value.every(uuid => activeAccounts.value.some(a => a.uuid === uuid))) {
      error.value = 'social_error_input'
      return
    }
    stopPolling()
    cancelStatusRequest()
    busy.value = true
    error.value = ''
    previews.value = []
    try {
      if (!post.value) {
        // Creation has no idempotency key. After an ambiguous response require list reload
        // so a committed draft can be recovered instead of blindly creating another post.
        creationUncertain.value = true
        remember(await socialApi.createEventPost(orgUuid, eventUuid, selected.value))
        creationUncertain.value = false
      } else if (editable.value) {
        remember(await socialApi.updateTargets(post.value.uuid, selected.value))
      }
      const locale = language()
      const rendered = await socialApi.preview(post.value!.uuid, locale)
      if (rendered.length !== post.value!.targets.length ||
        new Set(rendered.map(p => p.targetUuid)).size !== rendered.length ||
        rendered.some(p => !post.value!.targets.some(t => t.uuid === p.targetUuid))) throw new Error('Invalid preview targets')
      previews.value = rendered
      previewLanguage = locale
    } catch (err) { error.value = socialErrorKey(err) }
    finally { busy.value = false }
  }
  async function publish() {
    if (busy.value || !canPublish.value || !post.value) return
    resetPolling()
    busy.value = true
    error.value = ''
    try {
      const results = await socialApi.publish(post.value.uuid, previewLanguage)
      accepted.value = results.some(result => result.status === 'scheduled' && !result.error)
      if (results.some(result => result.error)) error.value = 'social_error_conflict'
      // Keep the acknowledged queue state even if the subsequent status GET fails.
      // Do not leave an accepted target looking like an unsubmitted draft.
      remember({ ...post.value, targets: post.value.targets.map(target => {
        const result = results.find(entry => entry.targetUuid === target.uuid && entry.socialAccountUuid === target.socialAccountUuid)
        return result ? { ...target, status: result.status, error: result.error,
          publicationSource: result.status === 'scheduled' && !result.error ? 'manual' : target.publicationSource } : target
      }) })
    } catch (err) { error.value = socialErrorKey(err) }
    finally {
      // Also reconcile an ambiguous network failure; never automatically send publish twice.
      busy.value = false
      const publishError = error.value
      await refresh()
      if (publishError && !error.value) error.value = publishError
    }
  }
  onBeforeUnmount(() => { disposed = true; stopPolling(); cancelStatusRequest() })
  return { accounts, activeAccounts, posts, selected, post, previews, loading, busy, error,
    refreshing, pollingPaused, reconciliationRequired,
    loadFailed, creationUncertain, accepted, pending, allPublished, editable, canPublish, publishingSupported,
    load, refresh, newPost, openPost, invalidatePreview, prepare, publish }
}
