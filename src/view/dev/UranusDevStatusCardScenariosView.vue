<template>
  <div class="status-simulator">
    <header class="status-simulator__header">
      <h1>Status Card Simulator</h1>
      <p>Simuliere User-Activation und Org-Invite-Ergebnisse ohne API Calls.</p>
    </header>

    <section class="status-simulator__controls">
      <label>
        Preset
        <select v-model="selectedPreset">
          <option value="default">Default</option>
          <option value="mobile-narrow">Mobile Narrow</option>
          <option value="long-success-copy">Long Success Copy</option>
          <option value="multiline-error">Multiline Error</option>
          <option value="error-with-help-link">Error + Help Link</option>
        </select>
      </label>

      <label>
        Flow
        <select v-model="selectedFlow">
          <option value="user-activate">User Activate</option>
          <option value="org-invite-activate">Org Invite Activate</option>
        </select>
      </label>

      <label>
        Ergebnis
        <select v-model="selectedOutcome">
          <option value="loading">Loading</option>
          <option value="success">Success</option>
          <option value="error-generic">Error Generic</option>
          <option value="error-token">Error Missing Token</option>
          <option value="error-server">Error Server</option>
        </select>
      </label>

      <label>
        Delay (ms)
        <select v-model.number="simulationDelayMs">
          <option :value="0">0</option>
          <option :value="500">500</option>
          <option :value="1200">1200</option>
          <option :value="2000">2000</option>
        </select>
      </label>

      <label>
        Mock Org Name
        <input v-model="mockOrgName" type="text" />
      </label>

      <label>
        Mock Error Message
        <input v-model="customErrorMessage" type="text" />
      </label>

      <UranusButton size="small" variant="tertiary" @click="runSimulation">
        Erneut simulieren
      </UranusButton>
    </section>

    <div
      class="status-simulator__preview"
      :class="{
        'is-mobile': forceNarrowCard,
        'is-long-copy': emphasizeLongContent,
      }"
    >
      <UranusBasicCardPage>
        <UranusStatusCard
          :state="statusState"
          :title="cardTitle"
          :loading-message="loadingMessage"
        >
          <template #success>
            <template v-if="selectedFlow === 'user-activate'">
              <p class="success-message" v-html="t('activation_success')" />
              <UranusButton>
                {{ t('go_to_login') }}
              </UranusButton>
            </template>

            <template v-else>
              <p class="success-message">
                {{ t('invite_accept_joined_org_message') }}
                <strong>{{ mockOrgName }}</strong>
              </p>
              <p class="info-message">
                {{ t('invite_accept_permissions_info_message') }}
              </p>
              <p class="info-message">
                {{ t('invite_accept_no_action_required_message') }}
              </p>
              <p class="help-message">
                {{ t('invite_accept_membership_help_message') }}
              </p>
              <UranusButton>
                {{ t('invite_accept_go_to_orgs_cta') }}
              </UranusButton>
            </template>
          </template>

          <template #error>
            <template v-if="selectedFlow === 'user-activate'">
              <p class="error-message">{{ resolvedErrorMessage }}</p>
              <a
                v-if="showErrorHelpLink"
                href="#"
                class="error-help-link"
                @click.prevent
              >
                Support kontaktieren
              </a>
              <UranusButton>
                {{ t('retry') }}
              </UranusButton>
            </template>

            <template v-else>
              <p class="error-message">{{ resolvedErrorMessage }}</p>
              <a
                v-if="showErrorHelpLink"
                href="#"
                class="error-help-link"
                @click.prevent
              >
                Support kontaktieren
              </a>
              <UranusButton>
                {{ t('invite_activate_back_to_login') }}
              </UranusButton>
            </template>
          </template>
        </UranusStatusCard>
      </UranusBasicCardPage>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusStatusCard from '@/component/uranus/UranusStatusCard.vue'
import UranusBasicCardPage from '@/component/layout/UranusBasicCardPage.vue'

type SimulatorFlow = 'user-activate' | 'org-invite-activate'
type SimulatorOutcome = 'loading' | 'success' | 'error-generic' | 'error-token' | 'error-server'
type SimulatorPreset = 'default' | 'mobile-narrow' | 'long-success-copy' | 'multiline-error' | 'error-with-help-link'

const { t } = useI18n({ useScope: 'global' })

const selectedPreset = ref<SimulatorPreset>('default')
const selectedFlow = ref<SimulatorFlow>('user-activate')
const selectedOutcome = ref<SimulatorOutcome>('success')
const simulationDelayMs = ref(1200)
const mockOrgName = ref('Kulturzentrum Uranus Nord / Festival Team')
const customErrorMessage = ref('')
const forceNarrowCard = ref(false)
const emphasizeLongContent = ref(false)
const showErrorHelpLink = ref(false)
const statusState = ref<'loading' | 'success' | 'error'>('loading')

let simulationTimer: ReturnType<typeof setTimeout> | null = null

const cardTitle = computed(() =>
  selectedFlow.value === 'user-activate'
    ? t('activate_account')
    : t('invite_accept_welcome_title')
)

const loadingMessage = computed(() =>
  selectedFlow.value === 'user-activate'
    ? t('activating_account')
    : t('invite_activate_processing')
)

const resolvedErrorMessage = computed(() => {
  if (customErrorMessage.value.trim()) {
    return customErrorMessage.value.trim()
  }

  if (selectedFlow.value === 'user-activate') {
    if (selectedOutcome.value === 'error-token') return 'Missing token in activation URL.'
    if (selectedOutcome.value === 'error-server') return 'Activation failed (status 500). Please try again.'
    return t('activation_failed')
  }

  if (selectedOutcome.value === 'error-token') return t('invite_activate_missing_token')
  if (selectedOutcome.value === 'error-server') return 'Invite accept failed (status 500).'
  return t('invite_activate_error_generic')
})

function clearSimulationTimer() {
  if (simulationTimer) {
    clearTimeout(simulationTimer)
    simulationTimer = null
  }
}

function runSimulation() {
  clearSimulationTimer()
  statusState.value = 'loading'

  if (selectedOutcome.value === 'loading') return

  simulationTimer = setTimeout(() => {
    statusState.value = selectedOutcome.value === 'success' ? 'success' : 'error'
  }, simulationDelayMs.value)
}

function applySelectedPreset(preset: SimulatorPreset) {
  forceNarrowCard.value = false
  emphasizeLongContent.value = false
  showErrorHelpLink.value = false

  if (preset === 'default') {
    selectedFlow.value = 'user-activate'
    selectedOutcome.value = 'success'
    simulationDelayMs.value = 1200
    mockOrgName.value = 'Kulturzentrum Uranus Nord / Festival Team'
    customErrorMessage.value = ''
    return
  }

  if (preset === 'mobile-narrow') {
    forceNarrowCard.value = true
    selectedFlow.value = 'user-activate'
    selectedOutcome.value = 'success'
    simulationDelayMs.value = 500
    customErrorMessage.value = ''
    return
  }

  if (preset === 'long-success-copy') {
    selectedFlow.value = 'org-invite-activate'
    selectedOutcome.value = 'success'
    simulationDelayMs.value = 1200
    emphasizeLongContent.value = true
    mockOrgName.value = 'Kulturzentrum Uranus Nord und Regionale Kulturkooperation Schleswig-Holsteiner Veranstaltungsverbund e.V.'
    customErrorMessage.value = ''
    return
  }

  if (preset === 'multiline-error') {
    selectedFlow.value = 'org-invite-activate'
    selectedOutcome.value = 'error-server'
    simulationDelayMs.value = 500
    customErrorMessage.value = 'Aktivierung fehlgeschlagen (Status 500).\nBitte pruefe den Invite-Link.\nWenn das Problem bleibt, kontaktiere den Support.'
    return
  }

  if (preset === 'error-with-help-link') {
    selectedFlow.value = 'user-activate'
    selectedOutcome.value = 'error-generic'
    simulationDelayMs.value = 500
    showErrorHelpLink.value = true
    customErrorMessage.value = 'Die Aktivierung war nicht moeglich. Bitte versuche es erneut oder melde dich beim Support.'
  }
}

onMounted(() => {
  runSimulation()
})

watch([selectedFlow, selectedOutcome, simulationDelayMs], () => {
  runSimulation()
})

watch(selectedPreset, (preset) => {
  applySelectedPreset(preset)
}, { immediate: true })

onBeforeUnmount(() => {
  clearSimulationTimer()
})
</script>

<style scoped lang="scss">
.status-simulator {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.status-simulator__header h1 {
  margin: 0;
}

.status-simulator__header p {
  margin: 0.4rem 0 0;
  opacity: 0.8;
}

.status-simulator__controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  border: var(--uranus-card-border);
  border-radius: var(--uranus-card-border-radius);
  padding: 0.9rem;
  background: var(--uranus-card-bg);
}

.status-simulator__controls label {
  display: grid;
  gap: 0.35rem;
  font-size: 0.9rem;
}

.status-simulator__controls select,
.status-simulator__controls input {
  min-height: 2.25rem;
  border: 1px solid var(--uranus-color-6);
  border-radius: 0.5rem;
  padding: 0.45rem 0.6rem;
  font: inherit;
  color: inherit;
  background: var(--uranus-bg);
}

.status-simulator__preview {
  width: 100%;
}

.status-simulator__preview.is-mobile :deep(.uranus-status) {
  max-width: 420px;
  margin-inline: auto;
}

.status-simulator__preview.is-long-copy :deep(.uranus-status__content) {
  max-width: 58ch;
}

.success-message,
.info-message,
.help-message,
.error-message {
  margin: 0;
}

.error-message {
  white-space: pre-line;
}

.error-help-link {
  color: var(--uranus-link, currentColor);
}
</style>
