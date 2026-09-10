<template>
  <section
    class="notification-center"
    aria-labelledby="notification-heading"
    :aria-busy="store.loading"
  >
    <h2 id="notification-heading">
      {{ t('notification_center') }}
      <span v-if="store.unreadCount">({{ store.unreadCount }})</span>
    </h2>
    <UranusFeedback v-if="store.error" type="error" role="alert">
      {{ t('notification_update_error') }}
      <UranusButton
        variant="secondary"
        :disabled="store.loading"
        @click="store.load()"
        >{{ t('notification_retry') }}</UranusButton
      >
    </UranusFeedback>
    <p v-if="store.loading" role="status">{{ t('loading') }}</p>
    <p v-else-if="!store.error && !store.notifications.length">
      {{ t('notification_empty') }}
    </p>
    <UranusCard
      v-for="item in store.notifications"
      :key="item.uuid"
      class="notification-center__item"
      :class="{ 'notification-center__item--unread': !item.readAt }"
    >
      <span v-if="!item.readAt" class="notification-center__unread">{{
        t('notification_unread')
      }}</span>
      <h3>{{ t(keys(item.type).title) }}</h3>
      <p>
        {{
          t(keys(item.type).description, {
            organization: item.organizationName,
            member: item.memberName || t('notification_member_fallback'),
          })
        }}
      </p>
      <p v-if="item.type === 'organization_team_invite_accepted'">
        {{ t('notification_permissions_hint') }}
      </p>
      <p v-if="item.type === 'organization_team_joined'">
        {{ t('notification_joined_hint') }}
      </p>
      <div class="notification-center__actions">
        <UranusButton
          v-if="item.actionUrl"
          :disabled="store.busyIds.includes(item.uuid)"
          @click="openNotification(item)"
        >
          {{ t(keys(item.type).action) }}
        </UranusButton>
        <UranusButton
          v-if="!item.readAt"
          variant="secondary"
          :disabled="store.busyIds.includes(item.uuid)"
          @click="store.update(item.uuid, 'read')"
        >
          {{ t('notification_mark_read') }}
        </UranusButton>
        <UranusButton
          variant="tertiary"
          :disabled="store.busyIds.includes(item.uuid)"
          @click="store.update(item.uuid, 'dismiss')"
        >
          {{ t('notification_dismiss') }}
        </UranusButton>
      </div>
    </UranusCard>
    <UranusButton
      v-if="store.hasMore"
      variant="secondary"
      :disabled="store.loading"
      @click="store.load(true)"
      >{{ t('notification_load_more') }}</UranusButton
    >
  </section>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/store/notificationStore'
import { useTokenStore } from '@/store/uranusTokenStore'
import { useUserStore } from '@/store/userStore'
import type { UserNotification } from '@/domain/notification/notification.model'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'

const { t } = useI18n()
const router = useRouter()
const store = useNotificationStore()
const auth = useTokenStore()
const user = useUserStore()
let timer: ReturnType<typeof setInterval> | undefined

function keys(type: string) {
  if (type === 'organization_team_invite_accepted')
    return {
      title: 'notification_member_joined_title',
      description: 'notification_member_joined_description',
      action: 'notification_permissions_action',
    }
  if (type === 'organization_team_joined')
    return {
      title: 'notification_team_joined_title',
      description: 'notification_team_joined_description',
      action: 'notification_open_organization',
    }
  return {
    title: 'notification_generic_title',
    description: 'notification_generic_description',
    action: 'notification_open',
  }
}

async function openNotification(item: UserNotification) {
  if (
    item.actionUrl &&
    (item.readAt || (await store.update(item.uuid, 'read')))
  )
    await router.push(item.actionUrl)
}

function refresh() {
  if (
    document.visibilityState !== 'hidden' &&
    !store.loading &&
    !store.busyIds.length
  )
    void store.load()
}

watch(
  () => [user.userUuid, auth.isAuthenticated],
  () => {
    void store.load()
  },
)
onMounted(() => {
  void store.load()
  window.addEventListener('focus', refresh)
  timer = setInterval(refresh, 60000)
})
onBeforeUnmount(() => {
  window.removeEventListener('focus', refresh)
  if (timer) clearInterval(timer)
})
</script>

<style scoped lang="scss">
.notification-center {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: var(--uranus-dashboard-content-width);
  min-width: 0;
}
.notification-center__item {
  padding: 1rem;
  overflow-wrap: anywhere;
  border-inline-start: 4px solid transparent;
}
.notification-center__item--unread {
  border-inline-start-color: var(--uranus-color);
}
.notification-center__unread {
  font-weight: 700;
}
.notification-center__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
