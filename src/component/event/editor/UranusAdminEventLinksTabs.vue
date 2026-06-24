<!--
  src/component/event/editor/UranusAdminEventLinksTabs.vue
-->

<template>
  <section class="links-tab" v-if="store.draft">
    <h2>{{ t('links') }}</h2>
      <UranusInput
          id="event-link-title"
          v-model="store.draft.sourceUrl"
          :label="t('event_source_link')"
          placeholder="https://"
      />

    <h2>{{ t('event_links') }}</h2>
    <UranusCard v-for="(url, index) in store.draft.eventLinks ?? []">
      <span>#{{ (index + 1) }}</span>
      <UranusGridLayout>
        <UranusFormCol :span="3">
          <UranusInput
              id="event-link-title"
              v-model="url.label"
              :label="t('event_link_title')"
              :placeholder="t('event_link_title')"
          />
        </UranusFormCol>

        <UranusFormCol :span="3">
          <UranusLinkTypeSelect
              :model-value="url.type"
              @update:modelValue="val => url.type = val"
          />
        </UranusFormCol>

        <UranusFormCol :span="6">
          <UranusInput
              id="event-link-url"
              v-model="url.url"
              :label="t('event_link_url')"
              placeholder="https://"
          />
        </UranusFormCol>

      </UranusGridLayout>

      <UranusFormActions>
        <UranusButton size="small" variant="tertiary" @click="removeUrl(index)"
        >
          {{ t('delete') }}
        </UranusButton>
      </UranusFormActions>
    </UranusCard>


    <div class="tab-actions">
      <UranusButton @click="addUrl" type="button" class="add-btn">
        {{ t('event_add_link') }}
      </UranusButton>

      <UranusButton :disabled="store.saving || !isDirty" @click="resetUrlsTab">
        <template #icon><Undo /></template>
        {{ t('discard')}}
      </UranusButton>

      <UranusButton
          :disabled="store.saving || !isDirty"
          :loading="store.saving"
          loading-text="Saving..."
          @click="onCommit"
      >
        <template #icon><Save /></template>
        {{ t('save')}}
      </UranusButton>
    </div>

  </section>

</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminEventStore } from '@/store/adminEventStore.ts'
import { EventLink } from '@/domain/event/eventProptypes.model.ts'
import { apiFetch } from '@/api.ts'
import UranusLinkTypeSelect from '@/component/select/UranusLinkTypeSelect.vue'
import { Save, Undo } from 'lucide-vue-next'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusGridLayout from '@/component/ui/UranusGridLayout.vue'
import UranusFormCol from '@/component/ui/UranusFormCol.vue'
import UranusInput from '@/component/ui/UranusInput.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'

const { t } = useI18n({ useScope: 'global' })
const store = useAdminEventStore()
const emit = defineEmits<{
  (event: 'dirty-change', value: boolean): void
}>()

onMounted(() => {
  if (store.draft) {
    store.draft.eventLinks =
        store.original?.eventLinks?.map(
            u => new EventLink(u.label, u.type, u.url)
        ) ?? []
  }
})

const isDirty = computed(() => { return !store.isEventLinksEqual() })

watch(isDirty, (value) => {
  emit('dirty-change', value)
}, { immediate: true })

function addUrl() {
  if (!store.draft) return
  if (!store.draft.eventLinks) store.draft.eventLinks = []
  store.draft.eventLinks.push(new EventLink())
}

function removeUrl(index: number) {
  if (!store.draft?.eventLinks) return
  store.draft.eventLinks.splice(index, 1)
}

async function onCommit() {
  if (!store.draft || !store.original) return
  store.saving = true
  store.error = null

  try {
    const payload = {
      event_links: store.draft.eventLinks!.map(u => ({
        label: u.label?.trim() || null,
        type: u.type,
        url: u.url,
      })),
      source_link: store.draft.sourceUrl?.trim() || null
    }

    const apiPath = `/api/admin/event/${store.draft.uuid}/links`
    await apiFetch(apiPath, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    store.original.eventLinks = store.draft.eventLinks!.map(
        u => new EventLink(u.label, u.type, u.url)
    )
    store.original.sourceUrl = store.draft.sourceUrl
  } catch (err) {
    console.error(err)
    store.error = 'Failed to save event URLs'
  } finally {
    store.saving = false
  }
}

function resetUrlsTab() {
  if (!store.draft || !store.original) return
  store.draft.eventLinks = store.original?.eventLinks?.map(
      u => new EventLink(u.label, u.type, u.url)
  ) ?? []
  store.draft.sourceUrl = store.original.sourceUrl
}

defineExpose({
  commitTab: onCommit,
})
</script>

<style lang="scss">
.uranus-form {
  .link-input,
  .link-select {
    width: 100%;
    min-width: 150px;
  }

  .remove-btn {
    grid-column: span 1;
    justify-self: start; // keep remove button aligned left in its cell
  }
}
</style>

<style scoped lang="scss">
.links-tab {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 1024px;
}

.links-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: var(--uranus-dashboard-content-width);

  .event-url {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: 1fr; // default 1 col
    height: 60px; // fixed row height
    align-items: center;

    @media (min-width: 801px) {
      grid-template-columns: repeat(2, 1fr); // 2 columns for medium screens
    }

    @media (min-width: 1025px) {
      grid-template-columns: repeat(4, 1fr); // 4 columns for wide screens
    }


    /* Make each input/select shrink but not smaller than a min-width */
    .link-input,
    .link-select {
      flex: 1 1 200px; /* grow, shrink, min 200px */
      min-width: 150px;
      max-width: 350px !important;
    }

    .remove-btn {
      flex: 0 0 auto;
    }
  }

  .add-btn {
    align-self: flex-start;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: 2px solid #888;
    background-color: #f5f5f5;
    cursor: pointer;

    &:hover {
      background-color: #e0e0e0;
    }
  }
}

.tab-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
