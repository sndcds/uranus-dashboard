<!--
  src/component/org/view/UranusOrgInviteTeamMemberView.vue
-->

<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero
        :title="t('org_invite_team_member')"
        :subtitle="''" />

    <div v-html="t('org_team_member_description')" />

    <UranusHelpPopup baseUrl="/help/org-invite-team-member" />

    <UranusForm @submit.prevent="onSubmit">
      <UranusTextfield
          type="email"
          size="medium"
          id="user_email"
          :label="t('email')"
          required
          v-model="userEmailAddress"
      />

      <UranusFeedback v-if="!!error" type="error">
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
    const apiPath = `/api/admin/org/${orgUuid.value}/team/invite?lang=${locale.value}`
    const apiResponse = await apiFetch<any>(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })


    if (apiResponse.status >= 200 && apiResponse.status <= 300) {
      router.push({ name: 'admin-team-org' })
      return
    }

    if (apiResponse.message) {
      error.value = apiResponse.message!
      return
    }

    error.value = t('invite_failed')
  } catch (err) {
    error.value = t('unknown_error_occured')
  }
}

</script>