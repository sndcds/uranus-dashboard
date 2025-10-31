<template>
  <div class="events-page">
    <div class="dashboard-hero">
      <h1>{{ t('user_messages_inbox') }}</h1>
    </div>

    <div class="dashboard-inbox">
      <section class="uranus-card">
        <InboxMessagesPanel />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import InboxMessagesPanel from '@/components/dashboard/InboxMessagesPanel.vue'

const { t } = useI18n()
</script>

<style scoped lang="scss">
.events-page {
  @include form-page();
}

.dashboard-hero {
  @include form-hero(560px);
}

.dashboard-inbox {
  display: grid;
  width: 100%;
  gap: clamp(1.5rem, 3vw, 2.5rem);
  margin-top: clamp(2rem, 4vw, 3rem);
}

.inbox-content {
  background: var(--card-bg);
  border-radius: clamp(1rem, 2vw, 1.5rem);
  padding: clamp(1.25rem, 2.5vw, 1.75rem);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
}

.inbox-content {
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

</style>
