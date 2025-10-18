import { defineStore } from 'pinia'

type TokenValue = string | null

const getStoredToken = (key: string): TokenValue => {
  if (typeof window === 'undefined') {
    return null
  }

  return localStorage.getItem(key)
}

export const useTokenStore = defineStore('token', {
  state: () => ({
    accessToken: getStoredToken('access_token') as TokenValue,
    refreshToken: getStoredToken('refresh_token') as TokenValue,
  }),
  actions: {
    setTokens(access: string, refresh?: string | null) {
      this.setAccessToken(access)
      if (refresh !== undefined) {
        this.setRefreshToken(refresh)
      }
    },
    setAccessToken(token: string) {
      this.accessToken = token
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', token)
      }
    },
    setRefreshToken(token: string | null) {
      this.refreshToken = token
      if (typeof window === 'undefined') {
        return
      }

      if (token === null) {
        localStorage.removeItem('refresh_token')
      } else {
        localStorage.setItem('refresh_token', token)
      }
    },
    clearTokens() {
      this.accessToken = null
      this.refreshToken = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    },
  },
})
