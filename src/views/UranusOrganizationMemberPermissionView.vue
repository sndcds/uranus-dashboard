<!--
  UranusOrganizationMemberPermissionView.vue

  View and manage permissions for a user who is a member of an organization.
  Allows enabling or disabling individual permission bits via checkboxes.
-->
<template>
  <div class="uranus-main-layout member-permission-view">
    <UranusDashboardHero :title="t('permissions')" :subtitle="pageSubtitle" />

    <transition name="fade">
      <p v-if="updateError" class="feedback feedback--error" role="alert">
        {{ updateError }}
      </p>
    </transition>

    <div v-if="isLoading" class="member-permission__state">
      {{ t('user_permissions_loading') }}
    </div>

    <div v-else-if="error" class="member-permission__state member-permission__state--error" role="alert">
      {{ error }}
    </div>

    <div v-else-if="!permissionGroups.length" class="member-permission__state">
      {{ t('user_permissions_invalid_response') }}
    </div>

    <div v-else class="member-permission__groups">
      <article v-for="group in permissionGroups" :key="group.type" class="member-permission__group">
        <header class="member-permission__group-header">
          <div>
            <h2>{{ group.label }}</h2>
            <p class="member-permission__group-count">
              {{ replaceInTemplate(t('user_permissions_entities'), { count: group.entries.length }) }}
            </p>
          </div>
        </header>

        <UranusCard class="member-permission__card">
          <ul class="member-permission__bits">
            <li v-for="entry in group.entries" :key="`${group.type}-${entry.bit}`" class="member-permission__bit">
              <label class="member-permission__bit-checkbox">
                <input
                  type="checkbox"
                  :value="entry.bit"
                  :checked="isBitSelected(entry.bit)"
                  :disabled="isUpdatingBit === entry.bit || !canModifyPermissions"
                  :aria-label="entry.label"
                  @change="onPermissionToggle(entry, $event)"
                />
              </label>

              <div class="member-permission__bit-content">
                <div class="member-permission__bit-header">
                  <span class="member-permission__bit-label">{{ entry.label }}</span>
                  <span class="member-permission__bit-code">#{{ entry.bit }}</span>
                </div>
                <p class="member-permission__bit-description">{{ entry.description }}</p>
              </div>
            </li>
          </ul>
        </UranusCard>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { replaceInTemplate } from '@/utils/UranusStringUtils.ts'
import UranusDashboardHero from '@/components/dashboard/UranusDashboardHero.vue'
import UranusCard from '@/components/ui/UranusCard.vue'

interface PermissionBitEntry {
  bit: number
  label: string
  description: string
}

interface PermissionGroup {
  type: string
  label: string
  entries: PermissionBitEntry[]
}

type PermissionListResponse = Record<string, PermissionBitEntry[] | null | undefined>

const route = useRoute()
const { t, locale } = useI18n({ useScope: 'global' })

const organizationId = computed(() => {
  const raw = Number(route.params.organizationId)
  return Number.isFinite(raw) ? raw : null
})

const memberId = computed(() => {
  const raw = Number(route.params.memberId)
  return Number.isFinite(raw) ? raw : null
})

const pageSubtitle = computed(() => replaceInTemplate(t('user_permissions_subtitle'), {
  name: memberDisplayName.value ?? t('user_unknown'),
  organization: organizationName.value ?? t('organization_unknown'),
}))

const entityTypeLabels = computed<Record<string, string>>(() => ({
  organization: t('user_permissions_type_organization'),
  venue: t('user_permissions_type_venue'),
  space: t('user_permissions_type_space'),
  event: t('user_permissions_type_event'),
}))

const isLoading = ref(true)
const error = ref<string | null>(null)
const permissionGroups = ref<PermissionGroup[]>([])
const selectedBits = ref<number[]>([])
const memberDisplayName = ref<string | null>(null)
const organizationName = ref<string | null>(null)
const permissionMask = ref<number | null>(null)
const isUpdatingBit = ref<number | null>(null)
const updateError = ref<string | null>(null)
const canModifyPermissions = computed(() => memberId.value != null && organizationId.value != null)

const toMaskValue = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value.trim())
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const computeSelectedBitsFromMask = (mask: number) => {
  const bits: number[] = []
  permissionGroups.value.forEach((group) => {
    group.entries.forEach((entry) => {
      const bitValue = 1 << entry.bit
      if ((mask & bitValue) === bitValue) {
        bits.push(entry.bit)
      }
    })
  })
  return bits
}

const buildQuery = () => {
  const params = new URLSearchParams({ lang: locale.value })
  if (memberId.value != null) {
    params.set('member_id', String(memberId.value))
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

const loadOrganization = async () => {
  if (organizationId.value == null) {
    return
  }

  try {
    const { data } = await apiFetch<{ name: string | null }>(
      `/api/organization/${organizationId.value}`
    )
    if (data && data.name) {
      organizationName.value = data.name
    }
  } catch (err) {
    console.error('Failed to load organization details', err)
  }
}

const loadPermissions = async () => {
  isLoading.value = true
  error.value = null

  try {
    const { data } = await apiFetch<PermissionListResponse | null>(
      `/api/admin/permission/list${buildQuery()}`
    )

    if (!data || typeof data !== 'object') {
      permissionGroups.value = []
      selectedBits.value = []
      permissionMask.value = null
      return
    }

    permissionGroups.value = Object.entries(data)
      .map(([type, entries]) => {
        const normalized = Array.isArray(entries)
          ? entries.map((entry) => ({
            bit: entry.bit,
            label: entry.label,
            description: entry.description ?? '',
          }))
          : []

        return {
          type,
          label: entityTypeLabels.value[type] ?? type,
          entries: normalized,
        }
      })
      .filter((group) => group.entries.length > 0)

    await loadUserPermissions()
    updateError.value = null
  } catch (err) {
    console.error('Failed to load permission list', err)
    error.value = t('user_permissions_load_error')
    permissionGroups.value = []
    selectedBits.value = []
    permissionMask.value = null
  } finally {
    isLoading.value = false
  }
}

const isBitSelected = (bit: number) => selectedBits.value.includes(bit)

const applyBitSelection = (bit: number, enabled: boolean) => {
  if (enabled) {
    if (!selectedBits.value.includes(bit)) {
      selectedBits.value = [...selectedBits.value, bit]
    }
  } else {
    selectedBits.value = selectedBits.value.filter((value) => value !== bit)
  }
}

const updateLocalMask = (bit: number, enabled: boolean) => {
  const bitValue = 1 << bit
  const current = permissionMask.value ?? 0
  permissionMask.value = enabled ? current | bitValue : current & ~bitValue
}

const onPermissionToggle = (entry: PermissionBitEntry, event: Event) => {
  const target = event.target as HTMLInputElement | null
  const enabled = target?.checked ?? false
  void updatePermission(entry, enabled, target)
}

const updatePermission = async (
  entry: PermissionBitEntry,
  enabled: boolean,
  input?: HTMLInputElement | null
) => {
  if (!memberId.value) {
    updateError.value = t('user_permissions_load_error')
    if (input) {
      input.checked = !enabled
    }
    return
  }

  const previous = selectedBits.value.slice()
  applyBitSelection(entry.bit, enabled)
  isUpdatingBit.value = entry.bit
  updateError.value = null

  try {
    await apiFetch(`/api/admin/organization/${organizationId.value}/member/${memberId.value}/permission`, {
      method: 'PUT',
      body: JSON.stringify({ bit: entry.bit, enabled }),
    })
    updateLocalMask(entry.bit, enabled)
  } catch (err) {
    console.error('Failed to update permission bit', err)
    selectedBits.value = previous
    if (input) {
      input.checked = !enabled
    }
    updateError.value =
      err instanceof Error && err.message ? err.message : t('user_permissions_load_error')
  } finally {
    isUpdatingBit.value = null
  }
}

const loadUserPermissions = async () => {
  if (
    memberId.value == null ||
    organizationId.value == null ||
    !permissionGroups.value.length
  ) {
    return
  }

  try {
    const { data } = await apiFetch<{
      permissions?: number | string | null;
      user_display_name?: string;
      user_id?: number
    }>(
        `/api/admin/organization/${organizationId.value}/member/${memberId.value}/permissions`
    )

    memberDisplayName.value = data?.user_display_name ?? ''

    const mask = toMaskValue(data?.permissions ?? null)
    if (mask == null) {
      permissionMask.value = null
      selectedBits.value = []
      return
    }

    permissionMask.value = mask
    selectedBits.value = computeSelectedBitsFromMask(mask)
  } catch (err) {
    console.error('Failed to load user permissions mask', err)
    permissionMask.value = null
  }
}

watch(
  () => [memberId.value, organizationId.value, locale.value],
  () => {
    void loadPermissions()
  }
)

onMounted(() => {
  void loadPermissions()
  void loadOrganization()
})
</script>

<style scoped lang="scss">
.member-permission__state {
  padding: 1rem;
  border-radius: 12px;
  background: rgba(79, 70, 229, 0.08);
  text-align: center;
}

.member-permission__state--error {
  background: rgba(239, 68, 68, 0.1);
  color: rgba(239, 68, 68, 0.9);
}

.member-permission__groups {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.member-permission__group-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
}

.member-permission__group-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.member-permission__group-count {
  margin: 0;
  color: var(--uranus-muted-text);
  font-size: 0.9rem;
}

.member-permission__card {
  padding: 1rem;
}

.member-permission__bits {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.member-permission__bit {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-soft);
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.member-permission__bit:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.member-permission__bit-checkbox {
  display: flex;
  align-items: center;
  margin-top: 0.2rem;
}

.member-permission__bit-checkbox input {
  width: 1.1rem;
  height: 1.1rem;
}

.member-permission__bit-content {
  flex: 1;
}

.member-permission__bit-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
}

.member-permission__bit-label {
  font-weight: 600;
}

.member-permission__bit-code {
  font-size: 0.85rem;
  color: var(--uranus-muted-text);
}

.member-permission__bit-description {
  margin: 0.35rem 0 0;
  color: var(--uranus-muted-text);
  font-size: 0.95rem;
}
</style>
