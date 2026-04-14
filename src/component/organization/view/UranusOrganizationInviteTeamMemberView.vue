<!--
  src/component/organization/view/UranusOrganizationInviteTeamMemberView.vue
-->

<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero
        :title="t('invite_team_member')"
        :subtitle="t('invite_organization_team_member')" />

    <UranusHelpPopup baseUrl="/help/invite-organization-team-member" />

    <UranusForm @submit.prevent="onSubmit">
      <UranusTextfield
          type="email"
          size="medium"
          id="user_email"
          :label="t('email')"
          required
          v-model="userEmailAddress"
      />

      <UranusFeedback :show="!!error" type="error">
        {{ error }}
      </UranusFeedback>

      <UranusFormActions>
        <UranusButton
            type="submit"
            :disabled="userEmailAddress.trim().length === 0"
        >
          {{ t('send_invitation') }}
        </UranusButton>
      </UranusFormActions>
    </UranusForm>
  </div>
</template>


<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import router from '@/router/index.ts'
import { apiFetch } from '@/api.ts'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusHelpPopup from '@/component/uranus/UranusHelpPopup.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'

const { t, locale } = useI18n()
const route = useRoute()

const orgUuid = computed(() => route.params.orgUuid as string)
const userEmailAddress = ref<string>('')
const error = ref<string>('')

async function onSubmit() {
  error.value = ''

  const email = userEmailAddress.value.trim()
  if (email.length < 1) {
    error.value = t('invalid_email_format')
    return
  }

  const payload = { email: email }

  try {
    const apiPath = `/api/admin/organization/${orgUuid.value}/team/invite?lang=${locale.value}`
    const apiResponse = await apiFetch<any>(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (apiResponse.status == 200) {
      router.push({ name: 'admin-team-organization' })
      return
    }

    if (apiResponse.message) {
      // TODO: Handle messages "user not found", "user is already invited
      error.value = apiResponse.message!
      return
    }

    error.value = t('invite_failed')
  } catch (err) {
    alert('Organisation konnte nicht erstellt werden')
  }

}

</script>