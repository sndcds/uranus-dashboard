<template>
  <UranusCard custom-style="width:100%;">
    <div class="portal-card">
      <div class="portal-card__content">
        <h2>{{ portalListItem.portalName }}</h2>
        <p v-if="portalListItem.description">{{ portalListItem.description }}</p>
        <p v-else class="portal-card__muted">{{ t('portal_no_description') }}</p>
      </div>

      <div class="uranus-card-button-container">
        <UranusButton
            v-if="portalListItem.canEditPortal"
            variant="secondary"
            size="small"
            :to="`/admin/org/${orgUuid}/portal/${portalListItem.portalUuid}/edit`"
        >
          {{ t('edit') }}
        </UranusButton>

        <UranusButton
            v-if="portalListItem.canDeletePortal"
            variant="secondary"
            size="small"
            @click="requestDeletePortal"
        >
          {{ t('delete') }}
        </UranusButton>
      </div>
    </div>

    <UranusPasswordConfirmModal
        :show="showDeleteModal"
        :title="t('delete_portal')"
        :question="deleteQuestion"
        :confirm-text="t('delete_portal')"
        :loading-text="t('deleting')"
        :error="deleteError"
        :is-submitting="isDeleting"
        @confirm="confirmDeletePortal"
        @cancel="cancelDeletePortal"
    />
  </UranusCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import type { PortalListItem } from '@/domain/portal/portalList.model.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusPasswordConfirmModal from '@/component/uranus/UranusPasswordConfirmModal.vue'
import { uranusStringInterpolate } from '@/util/UranusStringUtils.ts'

const { t } = useI18n({ useScope: 'global' })

const props = defineProps<{
  portalListItem: PortalListItem
  orgUuid: string
}>()

const emit = defineEmits<{
  deleted: [portalUuid: string]
}>()

const showDeleteModal = ref(false)
const deleteError = ref('')
const isDeleting = ref(false)

const deleteQuestion = computed(() =>
    uranusStringInterpolate(t('confirm_delete_portal'), { name: props.portalListItem.portalName })
)

function requestDeletePortal() {
  if (!props.portalListItem.canDeletePortal) return
  deleteError.value = ''
  showDeleteModal.value = true
}

function cancelDeletePortal() {
  showDeleteModal.value = false
  deleteError.value = ''
}

async function confirmDeletePortal({ password }: { password: string }) {
  deleteError.value = ''
  isDeleting.value = true

  try {
    await apiFetch(`/api/admin/portal/${props.portalListItem.portalUuid}`, {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    })

    emit('deleted', props.portalListItem.portalUuid)
    cancelDeletePortal()
  } catch (err: unknown) {
    const status = typeof err === 'object' && err !== null ? (err as { status?: number }).status : undefined
    deleteError.value = status === 401 || status === 403
        ? t('incorrect_password')
        : t('failed_to_delete_portal')
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped lang="scss">
.portal-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.portal-card__content {
  min-width: 0;
}

.portal-card__content h2 {
  margin: 0 0 0.35rem;
}

.portal-card__content p {
  margin: 0;
}

.portal-card__muted {
  color: var(--uranus-muted-text);
}

@media (max-width: 640px) {
  .portal-card {
    flex-direction: column;
  }
}
</style>
