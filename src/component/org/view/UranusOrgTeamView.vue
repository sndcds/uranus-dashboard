<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero
        :title="t('team')"
        :subtitle="t('org_manage_team_description')"
    />

    <UranusFeedback v-if="!!errorMessage" type="error">
      {{ errorMessage }}
    </UranusFeedback>

    <div>
      <UranusButton v-if="!errorMessage" :to="`/admin/org/${orgUuid}/invite-team-member`">
        {{ t('invite_team_member') }}
      </UranusButton>
    </div>

    <div class="team-grid">
      <UranusCard v-for="member in members" :key="member.user_uuid" class="team-member-card">
        <div class="team-member-avatar">
          <img
              v-if="member.avatar_url"
              :src="member.avatar_url"
              :alt="member.display_name || member.email"
          />
        </div>

        <div class="team-member-content">
          <h2>{{ member.display_name || member.email }}</h2>
          <p>{{ member.email }}</p>
          <div v-if="canManagePermissions">
            <UranusIconAction
                :icon="Edit" :title="t('edit')"
                :to="`/admin/org/${orgUuid}/member/${member.user_uuid}/permissions`"
                style="padding: 0.5rem;"
            />

            <UranusIconAction
                :icon="Trash2"
                :title="t('delete')"
                :onClick="() => onRemoveMember"
                style="padding: 0.5rem;"
            />
          </div>
        </div>
      </UranusCard>

      <template v-if="invitations.length > 0" class="team-members-grid">

        <h2>{{ t('org_team_user_invitations') }}</h2>
        <UranusCard v-for="invitation in invitations" :key="invitation.user_uuid" class="team-member-card">
          <div class="team-member-avatar">
            <img
                v-if="invitation.avatar_url"
                :src="invitation.avatar_url"
                :alt="invitation.display_name || invitation.email"
            />
          </div>
          <div class="team-member-content">
            <h2>{{ invitation.display_name }}</h2>
            <p>{{ invitation.email }}</p>
            <p>{{ t('org_team_invited_on_date') }} {{ new Date(invitation.invited_at).toLocaleDateString() }}</p>
          </div>
        </UranusCard>

      </template>
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
import { Edit, Trash2 } from 'lucide-vue-next'
import UranusIconAction from '@/component/ui/UranusIconAction.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'

const { t, locale } = useI18n()
const route = useRoute()

const orgUuid = computed(() => route.params.orgUuid as string)

const isLoading = ref(true)
const errorMessage = ref<string | null>(null)
const members = ref<any[]>([])
const invitations = ref<any[]>([])
const canManagePermissions = ref<boolean>(false)


const loadTeam = async () => {
  if (!orgUuid.value) {
    errorMessage.value = t('org_team_load_error')
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    const apiPath = `/api/admin/org/${orgUuid.value}/team?lang=${locale.value}`
    const apiResponse = await apiFetch<any>(apiPath)

    canManagePermissions.value = apiResponse.data?.can_manage_permissions ?? false;

    members.value = Array.isArray(apiResponse.data?.members)
        ? apiResponse.data.members
        : []

    invitations.value = Array.isArray(apiResponse.data?.invitations)
        ? apiResponse.data.invitations
        : []
  } catch (err) {
    errorMessage.value =
        err instanceof Error ? err.message : t('org_team_load_error')
  } finally {
    isLoading.value = false
  }
}

function onRemoveMember() {

}

onMounted(loadTeam)
</script>

<style scoped lang="scss">
.team-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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