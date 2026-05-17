<template>
  <UranusForm>
    <section class="portal-layout-group">
      <h2>Layout</h2>
      <UranusLabel id="portal-header-layout" label="Header layout">
        <select id="portal-header-layout" v-model="form.layout">
          <option v-for="layout in portalHeaderLayouts" :key="layout" :value="layout">
            {{ layout }}
          </option>
        </select>
      </UranusLabel>
    </section>

    <section class="portal-layout-group">
      <h2>Visible elements</h2>
      <div class="portal-layout-checkboxes">
        <UranusCheckbox
            id="portal-header-show-logo"
            v-model="form.showLogo"
            label="Logo"
        />
        <UranusCheckbox
            id="portal-header-show-title"
            v-model="form.showTitle"
            label="Titel"
        />
        <UranusCheckbox
            id="portal-header-show-description"
            v-model="form.showDescription"
            label="Description"
        />
      </div>
    </section>

    <section class="portal-layout-group">
      <h2>Logo</h2>
      <UranusFormRow :cols="2">
        <UranusTextfield
            id="portal-header-logo-link-url"
            v-model="form.logoLinkUrl"
            label="Logo link URL"
        />
        <UranusLabel id="portal-header-logo-link-target" label="Logo link target">
          <select id="portal-header-logo-link-target" v-model="form.logoLinkTarget">
            <option v-for="target in portalLinkTargets" :key="target" :value="target">
              {{ target }}
            </option>
          </select>
        </UranusLabel>
      </UranusFormRow>
    </section>

    <section class="portal-layout-group">
      <div class="portal-layout-group__head">
        <h2>Buttons</h2>
        <UranusButton size="small" variant="secondary" @click="addButton">
          {{ t('add') }}
        </UranusButton>
      </div>

      <div
          v-for="(button, index) in form.buttons"
          :key="index"
          class="portal-layout-entry"
      >
        <UranusFormRow :cols="2">
          <UranusTextfield
              :id="`portal-header-button-${index}-label`"
              v-model="button.label"
              label="Label"
          />
          <UranusTextfield
              :id="`portal-header-button-${index}-url`"
              v-model="button.url"
              label="URL"
          />
        </UranusFormRow>

        <UranusFormRow :cols="3">
          <UranusTextfield
              :id="`portal-header-button-${index}-class`"
              v-model="button.cssClass"
              label="CSS class"
          />
          <UranusLabel :id="`portal-header-button-${index}-target`" label="Target">
            <select :id="`portal-header-button-${index}-target`" v-model="button.target">
              <option v-for="target in portalLinkTargets" :key="target" :value="target">
                {{ target }}
              </option>
            </select>
          </UranusLabel>
          <UranusButton variant="danger" size="small" @click="removeButton(index)">
            {{ t('delete') }}
          </UranusButton>
        </UranusFormRow>
      </div>
    </section>

    <UranusFormActions>
      <UranusButton @click="resetTab" :disabled="store.saving || !isDirty">
        {{ t('discard') }}
      </UranusButton>
      <UranusButton @click="commitTab" :disabled="store.saving || !isDirty">
        {{ t('save') }}
      </UranusButton>
    </UranusFormActions>
  </UranusForm>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useUranusPortalStore } from '@/store/portalStore.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusCheckbox from '@/component/ui/UranusCheckbox.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusLabel from '@/component/ui/UranusLabel.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import {
  buildHeaderPayload,
  createEmptyHeaderButton,
  createHeaderConfig,
  portalHeaderLayouts,
  portalLinkTargets,
  type PortalHeaderConfig,
} from '@/component/portal/editor/portalLayoutConfig.ts'

const { t } = useI18n({ useScope: 'global' })
const store = useUranusPortalStore()

const emit = defineEmits<{
  (event: 'dirty-change', value: boolean): void
}>()

const form = reactive<PortalHeaderConfig>(createHeaderConfig(store.draft?.header))
const originalForm = computed(() => createHeaderConfig(store.original?.header))
const isDirty = computed(() => stableSerialize(buildHeaderPayload(form)) !== stableSerialize(buildHeaderPayload(originalForm.value)))

watch(isDirty, value => emit('dirty-change', value), { immediate: true })

function stableSerialize(value: unknown) {
  return JSON.stringify(value)
}

function cloneForm(value: PortalHeaderConfig): PortalHeaderConfig {
  return JSON.parse(JSON.stringify(value))
}

function addButton() {
  form.buttons.push(createEmptyHeaderButton())
}

function removeButton(index: number) {
  form.buttons.splice(index, 1)
}

async function commitTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original || !draft.uuid || !isDirty.value) return

  store.saving = true
  store.error = null

  try {
    const header = buildHeaderPayload(form)
    await apiFetch(`/api/admin/portal/${draft.uuid}/header`, {
      method: 'PUT',
      body: JSON.stringify(header),
    })

    draft.header = JSON.parse(JSON.stringify(header))
    original.header = JSON.parse(JSON.stringify(header))
  } catch (err) {
    store.error = t('failed_to_save_portal')
    console.error(err)
  } finally {
    store.saving = false
  }
}

function resetTab() {
  Object.assign(form, cloneForm(originalForm.value))
}

defineExpose({
  commitTab,
})
</script>

<style scoped>
.portal-layout-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--uranus-color-6);
}

.portal-layout-group h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.portal-layout-group__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.portal-layout-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
}

.portal-layout-entry {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: var(--uranus-card-border);
  border-radius: var(--uranus-card-border-radius);
}
</style>
