<template>
  <router-view v-if="!requiresSession || tokenStore.isAuthenticated" />
  <main v-else class="session-status" aria-live="polite">
    <p>{{ tokenStore.sessionError ? t(`auth_session_${tokenStore.sessionError}`) : t('loading') }}</p>
    <UranusButton v-if="tokenStore.sessionError" :disabled="tokenStore.isRestoring" @click="retrySession">
      {{ t('retry') }}
    </UranusButton>
    <router-link v-if="tokenStore.sessionError" to="/app/login">{{ t('go_to_login') }}</router-link>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTokenStore } from '@/store/uranusTokenStore.ts'
import UranusButton from '@/component/ui/UranusButton.vue'

const route = useRoute()
const { t } = useI18n()
const tokenStore = useTokenStore()
const requiresSession = computed(() => route.matched.some(record => record.meta.requiresAuth))

async function retrySession() {
  try { await tokenStore.restoreSession() } catch { /* The error remains visible. */ }
}
</script>

<style scoped lang="scss">
.session-status {
  padding: 2rem;
  display: grid;
  justify-items: start;
  gap: 1rem;
}
</style>
