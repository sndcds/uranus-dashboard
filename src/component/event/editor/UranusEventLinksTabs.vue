<template>
  <section class="release-tab" v-if="store.draft">

    <h2>{{ t('event_links') }}</h2>

    <UranusCard
        v-for="(url, index) in store.draft.eventLinks ?? []">
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
              :placeholder="t('event_link_url')"
          />
        </UranusFormCol>

        <UranusFormCol :span="12">
          <UranusButton variant="tertiary" size="small" @click="removeUrl(index)"
          >
            {{ t('delete') }}
          </UranusButton>
        </UranusFormCol>
      </UranusGridLayout>

    </UranusCard>

    <button @click="addUrl" type="button" class="add-btn">
      {{ t('event_add_link') }}
    </button>

    <div class="tab-actions">
      <UranusButton :disabled="store.saving || !isDirty" @click="resetUrlsTab">
        <template #icon><Undo /></template>
        {{ t('discard')}}
      </UranusButton>

      <UranusButton
          :disabled="store.saving || !isDirty"
          :loading="store.saving"
          loading-text="Saving..."
          @click="commitUrlsTab"
      >
        <template #icon><Save /></template>
        {{ t('save')}}
      </UranusButton>
    </div>

    <!--LayoutTest />
    <LayoutFormExample /-->
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUranusAdminEventStore } from '@/store/adminEventStore.ts'
import { UranusEventLink } from '@/domain/event/UranusEventLink.ts'
import { apiFetch } from '@/api.ts'
import UranusLinkTypeSelect from '@/component/select/UranusLinkTypeSelect.vue'
import {Save, Undo} from 'lucide-vue-next'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusLabel from "@/component/ui/UranusLabel.vue";
import LayoutTest from "@/component/ui/LayoutTest.vue";
import LayoutFormExample from "@/component/ui/LayoutFormExample.vue";
import UranusGridLayout from "@/component/ui/UranusGridLayout.vue";
import UranusFormRow from "@/component/ui/UranusFormRow.vue";
import UranusFormCol from "@/component/ui/UranusFormCol.vue";
import UranusInput from "@/component/ui/UranusInput.vue";

const { t } = useI18n({ useScope: 'global' })
const store = useUranusAdminEventStore()

onMounted(() => {
  if (store.draft) {
    store.draft.eventLinks =
        store.original?.eventLinks?.map(
            u => new UranusEventLink(u.label, u.type, u.url)
        ) ?? []
  }
})

const isDirty = computed(() => {
  const draft = store.draft?.eventLinks ?? []
  const original = store.original?.eventLinks ?? []

  if (draft.length !== original.length) return true

  const isEqual = (a: UranusEventLink, b: UranusEventLink) =>
      a.label === b.label &&
      a.type === b.type &&
      a.url === b.url

  const allMatch = draft.every(d => original.some(o => isEqual(d, o)))
  const allOriginalMatch = original.every(o => draft.some(d => isEqual(d, o)))

  return !(allMatch && allOriginalMatch)
})

function addUrl() {
  if (!store.draft) return
  if (!store.draft.eventLinks) store.draft.eventLinks = []
  store.draft.eventLinks.push(new UranusEventLink())
}

function removeUrl(index: number) {
  if (!store.draft?.eventLinks) return
  store.draft.eventLinks.splice(index, 1)
}

async function commitUrlsTab() {
  if (!store.draft) return
  store.saving = true
  store.error = null

  try {
    const payload = store.draft.eventLinks!.map(u => ({
      label: u.label?.trim() || null,
      type: u.type,
      url: u.url,
    }))

    await apiFetch(`/api/admin/event/${store.draft.id}/links`, {
      method: 'PUT',
      body: JSON.stringify({ event_links: payload }),
    })

    store.original!.eventLinks = store.draft.eventLinks!.map(
        u => new UranusEventLink(u.label, u.type, u.url)
    )
  } catch (err) {
    console.error(err)
    store.error = 'Failed to save event URLs'
  } finally {
    store.saving = false
  }
}

function resetUrlsTab() {
  if (!store.draft) return
  store.draft.eventLinks = store.original?.eventLinks?.map(
      u => new UranusEventLink(u.label, u.type, u.url)
  ) ?? []
}
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
.release-tab {
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

  .tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
}
</style>