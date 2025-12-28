<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero
        :title="t('user_messages_inbox')"
        :subtitle="t('dummy')"
    />
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
import UranusDashboardHero from "@/components/dashboard/UranusDashboardHero.vue";

const { t } = useI18n()
</script>

<style scoped lang="scss">
.dashboard-inbox {
  flex: 1;
  display: grid;
  width: 100%;
  gap: clamp(1.5rem, 3vw, 2.5rem);
  margin-top: clamp(2rem, 4vw, 3rem);
}

</style>
