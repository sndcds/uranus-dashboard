<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero
        :title="t('team')"
        :subtitle="t('organization_manage_team_description')"
    />

    <p v-if="isLoading">{{ t('organization_team_loading') }}</p>
    <p v-else-if="error">{{ error }}</p>

    <div class="team-members-grid">
      <UranusCard v-for="member in members" :key="member.user_uuid" class="team-member-card">

        <!--
          "user_uuid": "019d237b-3563-74c6-8085-6d5fc5afb2b3",
          "email": "roald@grain.one",
          "username": "roald",
          "display_name": "mapmeister",
          "avatar_url": "http://localhost:9090/api/user/019d237b-3563-74c6-8085-6d5fc5afb2b3/avatar/64",
          "last_active_at": "2026-04-12T13:09:26.420769Z",
          "joined_at": "2026-03-27T11:53:38.77816Z"
        -->

          <div class="team-member-avatar">
            <img
                v-if="member.avatar_url"
                :src="member.avatar_url"
                :alt="member.display_name || member.email"
            />
          </div>

          <div class="team-member-content">
            <h2>{{ member.display_name || member.email }}</h2>
            <p v-if="member.username">{{ member.username }}</p>
            <p>{{ member.email }}</p>
            <div>
              <UranusIconAction
                  :icon="Edit" :title="t('edit')"
                  :to="`/admin/organization/${orgUuid}/member/${member.user_uuid}/permissions`"
              />

              <UranusIconAction
                  :icon="Trash2"
                  :title="t('delete')"
                  :onClick="() => onRemoveMember"
              />
            </div>
          </div>


        </UranusCard>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import {Edit, Trash2} from "lucide-vue-next";
import UranusIconAction from "@/component/ui/UranusIconAction.vue";

const { t, locale } = useI18n()
const route = useRoute()

const orgUuid = computed(() => route.params.orgUuid as string)

const isLoading = ref(true)
const error = ref<string | null>(null)
const members = ref<any[]>([])

const loadTeam = async () => {
  if (!orgUuid.value) {
    error.value = t('organization_team_load_error')
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const apiPath = `/api/admin/organization/${orgUuid.value}/team?lang=${locale.value}`
    const apiResponse = await apiFetch<any>(apiPath)

    members.value = Array.isArray(apiResponse.data?.members)
        ? apiResponse.data.members
        : []
  } catch (err) {
    error.value =
        err instanceof Error ? err.message : t('organization_team_load_error')
  } finally {
    isLoading.value = false
  }
}

function onRemoveMember() {

}

onMounted(loadTeam)
</script>

<style scoped lang="scss">
.team-members-grid {
  display: flex;
  flex-direction: column;
  grid-template-columns: repeat(auto-fill, minmax(360px, 500px));
  grid-auto-rows: auto;
  gap: var(--uranus-grid-gap);
  max-width: var(--uranus-dashboard-content-width);
}

.team-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.team-member-card {
  display: flex;
  flex-direction: row;
}

.team-member-avatar img {
  width: 64px;
  height: 64px;
  border: 1px solid var(--uranus-color-6);
  border-radius: 9999px;
  object-fit: cover;
}

.team-member-content {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  * {
    margin: 0;
  }
}

.team-empty {
  text-align: center;
  color: var(--uranus-muted-text);
  padding: 1rem;
}
</style>