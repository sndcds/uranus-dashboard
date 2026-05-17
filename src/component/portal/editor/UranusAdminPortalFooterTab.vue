<template>
  <UranusForm>
    <section class="portal-layout-group">
      <h2>Logo</h2>
      <UranusCheckbox
          id="portal-footer-show-logo"
          v-model="form.showLogo"
          label="Show small logo"
      />
      <UranusFormRow :cols="2">
        <UranusNumberInput
            id="portal-footer-logo-width"
            v-model="form.logoWidth"
            label="Logo width"
            min="1"
        />
        <UranusNumberInput
            id="portal-footer-logo-height"
            v-model="form.logoHeight"
            label="Logo height"
            min="1"
        />
      </UranusFormRow>
      <UranusFormRow :cols="2">
        <UranusTextfield
            id="portal-footer-logo-link-url"
            v-model="form.logoLinkUrl"
            label="Logo link URL"
        />
        <UranusLabel id="portal-footer-logo-link-target" label="Logo link target">
          <select id="portal-footer-logo-link-target" v-model="form.logoLinkTarget">
            <option v-for="target in portalLinkTargets" :key="target" :value="target">
              {{ target }}
            </option>
          </select>
        </UranusLabel>
      </UranusFormRow>
    </section>

    <section class="portal-layout-group">
      <h2>Text</h2>
      <UranusTextEditor v-model="form.text" />
    </section>

    <section class="portal-layout-group">
      <div class="portal-layout-group__head">
        <h2>Links</h2>
        <UranusButton size="small" variant="secondary" @click="addLink">
          {{ t('add') }}
        </UranusButton>
      </div>

      <div
          v-for="(link, index) in form.links"
          :key="index"
          class="portal-layout-entry"
      >
        <UranusFormRow :cols="3">
          <UranusTextfield
              :id="`portal-footer-link-${index}-label`"
              v-model="link.label"
              label="Label"
          />
          <UranusTextfield
              :id="`portal-footer-link-${index}-url`"
              v-model="link.url"
              label="URL"
          />
          <UranusLabel :id="`portal-footer-link-${index}-target`" label="Target">
            <select :id="`portal-footer-link-${index}-target`" v-model="link.target">
              <option v-for="target in portalLinkTargets" :key="target" :value="target">
                {{ target }}
              </option>
            </select>
          </UranusLabel>
        </UranusFormRow>

        <UranusButton variant="danger" size="small" @click="removeLink(index)">
          {{ t('delete') }}
        </UranusButton>
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
import UranusNumberInput from '@/component/ui/UranusNumberInput.vue'
import UranusTextEditor from '@/component/ui/UranusTextEditor.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import {
  buildFooterPayload,
  createEmptyFooterLink,
  createFooterConfig,
  portalLinkTargets,
  type PortalFooterConfig,
} from '@/component/portal/editor/portalLayoutConfig.ts'

const { t } = useI18n({ useScope: 'global' })
const store = useUranusPortalStore()

const emit = defineEmits<{
  (event: 'dirty-change', value: boolean): void
}>()

const form = reactive<PortalFooterConfig>(createFooterConfig(store.draft?.footer))
const originalForm = computed(() => createFooterConfig(store.original?.footer))
const isDirty = computed(() => stableSerialize(buildFooterPayload(form)) !== stableSerialize(buildFooterPayload(originalForm.value)))

watch(isDirty, value => emit('dirty-change', value), { immediate: true })

function stableSerialize(value: unknown) {
  return JSON.stringify(value)
}

function cloneForm(value: PortalFooterConfig): PortalFooterConfig {
  return JSON.parse(JSON.stringify(value))
}

function addLink() {
  form.links.push(createEmptyFooterLink())
}

function removeLink(index: number) {
  form.links.splice(index, 1)
}

async function commitTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original || !draft.uuid || !isDirty.value) return

  store.saving = true
  store.error = null

  try {
    const footer = buildFooterPayload(form)
    await apiFetch(`/api/admin/portal/${draft.uuid}/footer`, {
      method: 'PUT',
      body: JSON.stringify(footer),
    })

    draft.footer = JSON.parse(JSON.stringify(footer))
    original.footer = JSON.parse(JSON.stringify(footer))
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

.portal-layout-entry {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: var(--uranus-card-border);
  border-radius: var(--uranus-card-border-radius);
}
</style>
