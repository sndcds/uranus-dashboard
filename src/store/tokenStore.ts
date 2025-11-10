import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useUserStore } from '@/store/userStore'
import { useAppStore } from '@/store/appStore'

type TokenValue = string | null

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

  function clearTokens() {
    accessToken.value = null
    refreshToken.value = null
    
    // Clear user store
    const userStore = useUserStore()
    userStore.clearUserId()
    userStore.clearDisplayName()
    
    // Clear app store
    const appStore = useAppStore()
    appStore.clearOrganizerId()
  }

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