import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useUserStore } from '@/store/userStore'
import { useAppStore } from '@/store/appStore'

const LOGOUT_CHANNEL_NAME = 'uranus-auth-channel'
const LOGOUT_STORAGE_KEY = 'uranus-auth-logout'
const isBrowser = typeof window !== 'undefined'

let logoutChannel: BroadcastChannel | null = null
let listenersRegistered = false

const ensureBroadcastChannel = () => {
  if (!isBrowser || logoutChannel || typeof BroadcastChannel === 'undefined') {
    return
  }
  logoutChannel = new BroadcastChannel(LOGOUT_CHANNEL_NAME)
}

const emitCrossTabLogout = () => {
  if (!isBrowser) return
  if (logoutChannel) {
    logoutChannel.postMessage({ type: 'logout' })
  } else {
    localStorage.setItem(LOGOUT_STORAGE_KEY, Date.now().toString())
  }
}

const redirectToLoginIfNeeded = () => {
  if (!isBrowser) return
  const path = window.location.pathname
  if (path.startsWith('/admin') || path.startsWith('/app')) {
    window.location.href = '/app/login'
  }
}

type TokenValue = string | null

const registerCrossTabListeners = (onLogout: () => void) => {
  if (!isBrowser || listenersRegistered) return

  ensureBroadcastChannel()

  if (logoutChannel) {
    logoutChannel.addEventListener('message', (event) => {
      if (event?.data?.type === 'logout') {
        onLogout()
      }
    })
  }

  window.addEventListener('storage', (event) => {
    if (event.key === LOGOUT_STORAGE_KEY) {
      onLogout()
    }
  })

  listenersRegistered = true
}

export const useTokenStore = defineStore('token', () => {
  // State as refs
  const accessToken = ref<TokenValue>(null)
  const refreshToken = ref<TokenValue>(null)

  // Getters as computed
  const isAuthenticated = computed(() => Boolean(accessToken.value))

  // Actions as functions
  function setTokens(access: string, refresh?: string | null) {
    setAccessToken(access)
    if (refresh !== undefined) {
      setRefreshToken(refresh)
    }
  }

  function setAccessToken(token: string) {
    accessToken.value = token
  }

  function setRefreshToken(token: string | null) {
    refreshToken.value = token
  }

  const applyTokenClear = () => {
    accessToken.value = null
    refreshToken.value = null

    // Clear user store
    const userStore = useUserStore()
    userStore.clearUserId()
    userStore.clearDisplayName()
    userStore.clearEmailAddress()

    // Clear app store
    const appStore = useAppStore()
    appStore.clearOrganizationId()
  }

  function clearTokens(options?: { broadcast?: boolean }) {
    applyTokenClear()
    if (options?.broadcast !== false) {
      emitCrossTabLogout()
    }
  }

  const handleRemoteLogout = () => {
    clearTokens({ broadcast: false })
    redirectToLoginIfNeeded()
  }

  registerCrossTabListeners(handleRemoteLogout)

  return {
    accessToken,
    refreshToken,
    isAuthenticated,
    setTokens,
    setAccessToken,
    setRefreshToken,
    clearTokens
  }
}, {
  persist: true
})
