import { computed, onBeforeUnmount, ref } from 'vue'
import { socialApi, socialErrorKey } from '@/api/social'
import { socialPublishingPlatforms, type SocialAccount, type SocialPost, type SocialPreview } from '@/domain/social/social.model'

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
  const canPublish = computed(() => !!post.value?.targets.length && previews.value.length === post.value.targets.length &&
    publishingSupported.value && previewLanguage === language() && post.value.targets.every(t =>
      (t.status === 'draft' || t.status === 'failed') && previews.value.some(p => p.targetUuid === t.uuid) &&
      activeAccounts.value.some(a => a.uuid === t.socialAccountUuid && socialPublishingPlatforms.includes(a.platform))))

  function remember(updated: SocialPost) {
    if (updated.orgUuid !== orgUuid || updated.sourceType !== 'event' || updated.sourceUuid !== eventUuid) throw new Error('Invalid post scope')
    post.value = updated
    posts.value = [...posts.value.filter(p => p.uuid !== updated.uuid), updated]
  }
  function stopPolling() { clearTimeout(timer); timer = undefined }
  function schedulePoll() {
    stopPolling()
    if (!disposed && pending.value) timer = setTimeout(() => { void refresh() }, 3000)
  }
  async function refresh() {
    if (!post.value || busy.value || disposed) return
    const uuid = post.value.uuid
    try {
      const updated = await socialApi.getPost(uuid)
      if (disposed || post.value?.uuid !== uuid) return
      remember(updated)
      error.value = ''
      schedulePoll()
    } catch (err) {
      if (!disposed) error.value = socialErrorKey(err)
      stopPolling() // Explicit refresh after a network/auth error; no infinite failing polling loop.
    }
  }
  async function load() {
    stopPolling()
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
    stopPolling()
    post.value = null
    selected.value = []
    previews.value = []
    accepted.value = false
    error.value = ''
  }
  async function openPost(existing: SocialPost) {
    if (busy.value) return
    stopPolling()
    remember(existing)
    selected.value = existing.targets.map(t => t.socialAccountUuid)
    previews.value = []
    accepted.value = false
    error.value = ''
    await refresh()
  }
  function invalidatePreview() { previews.value = []; accepted.value = false }
  async function prepare() {
    if (busy.value || loading.value || loadFailed.value || creationUncertain.value || !selected.value.length) return
    if (!selected.value.every(uuid => activeAccounts.value.some(a => a.uuid === uuid))) {
      error.value = 'social_error_input'
      return
    }
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
    busy.value = true
    error.value = ''
    try {
      const results = await socialApi.publish(post.value.uuid, previewLanguage)
      accepted.value = results.some(result => result.status === 'scheduled' && !result.error)
      if (results.some(result => result.error)) error.value = 'social_error_conflict'
    } catch (err) { error.value = socialErrorKey(err) }
    finally {
      // Also reconcile an ambiguous network failure; never automatically send publish twice.
      try { remember(await socialApi.getPost(post.value.uuid)) }
      catch (err) { error.value = socialErrorKey(err) }
      busy.value = false
      schedulePoll()
    }
  }
  onBeforeUnmount(() => { disposed = true; stopPolling() })
  return { accounts, activeAccounts, posts, selected, post, previews, loading, busy, error,
    loadFailed, creationUncertain, accepted, pending, allPublished, editable, canPublish, publishingSupported,
    load, refresh, newPost, openPost, invalidatePreview, prepare, publish }
}
