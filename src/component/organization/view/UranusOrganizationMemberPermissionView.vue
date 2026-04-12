<!--
  src/component/organization/view/UranusOrganizationMemberPermissionView.vue

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
      <div v-for="group in sortedPermissionGroups" :key="group.type" class="member-permission__group">
        <UranusCard class="member-permission__card">
          <h3>{{ group.label }}</h3>
          <div v-for="entry in group.entries" :key="entry.label" class="member-permission__group">
            <UranusCheckbox
                :id="`perm-${group.type}-${entry.bit}`"
                :label="entry.label + ' / ' + entry.bit"
                :model-value="isBitEnabled(entry.bit)"
                :value="entry.bit.toString()"
                :disabled="isUpdatingBit === entry.bit || !canModifyPermissions"
                @update:modelValue="(val: any) => onBitChange(entry.bit, val)"
            />
          </div>
        </UranusCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { uranusReplaceInTemplate } from '@/util/UranusStringUtils.ts'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusCheckbox from "@/component/ui/UranusCheckbox.vue";

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

const orgUuid = computed(() => {
  return route.params.uuid
})

const memberUuid = computed(() => {
  return route.params.memberUuid
})

const pageSubtitle = computed(() => uranusReplaceInTemplate(t('user_permissions_subtitle'), {
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
const selectedBits = ref<string[]>([])
const memberDisplayName = ref<string | null>(null)
const organizationName = ref<string | null>(null)
const permissionMask = ref<number | null>(null)
const isUpdatingBit = ref<number | null>(null)
const updateError = ref<string | null>(null)
const canModifyPermissions = computed(() => memberUuid.value != null && orgUuid.value != null)

const groupOrder: Record<string, number> = {
  organization: 0,
  venue: 1,
  space: 2,
  event: 3,
}

const sortedPermissionGroups = computed(() => {
  return [...permissionGroups.value].sort((a, b) => {
    const ao = groupOrder[a.type] ?? 999
    const bo = groupOrder[b.type] ?? 999
    return ao - bo
  })
})

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
  const bits: string[] = []

  permissionGroups.value.forEach(group => {
    group.entries.forEach(entry => {
      const bitValue = 1 << entry.bit
      if ((mask & bitValue) === bitValue) {
        bits.push(entry.bit.toString())
      }
    })
  })

  return bits
}

const buildQuery = () => {
  const params = new URLSearchParams({ lang: locale.value })
  if (memberUuid.value != null) {
    params.set('member_id', String(memberUuid.value))
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

const loadOrganization = async () => {
  if (orgUuid.value == null) {
    return
  }

  try {
    const apiPath = `/api/organization/${orgUuid.value}`
    const apiResponse = await apiFetch<{ name: string | null }>(apiPath)

    if (apiResponse.data) {
      organizationName.value = apiResponse.data.name
    }
  } catch (err) {
    console.error('Failed to load organization details', err)
  }
}

const loadPermissions = async () => {
  isLoading.value = true
  error.value = null

  try {
    const apiPath = `/api/admin/permissions/list${buildQuery()}`
    const apiResponse = await apiFetch<PermissionListResponse | null>(apiPath)

    if (!apiResponse.data) {
      permissionGroups.value = []
      selectedBits.value = []
      permissionMask.value = null
      return
    }

    permissionGroups.value = Object.entries(apiResponse.data)
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

const applyBitSelection = (bit: number, enabled: boolean) => {
  const b = bit.toString()
  if (enabled) {
    if (!selectedBits.value.includes(b)) {
      selectedBits.value = [...selectedBits.value, b]
    }
  } else {
    selectedBits.value = selectedBits.value.filter((value) => value !== b)
  }
}

const updateLocalMask = (bit: number, enabled: boolean) => {
  const bitValue = 1 << bit
  const current = permissionMask.value ?? 0
  permissionMask.value = enabled ? current | bitValue : current & ~bitValue
}

const updatePermission = async (
  bit: number,
  enabled: boolean,
) => {
  if (!memberUuid.value) {
    updateError.value = t('user_permissions_load_error')
    return
  }

  const previous = selectedBits.value.slice()
  applyBitSelection(bit, enabled)
  isUpdatingBit.value = bit
  updateError.value = null

  try {
    await apiFetch(`/api/admin/organization/${orgUuid.value}/member/${memberUuid.value}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ bit: bit, enabled }),
    })
    updateLocalMask(bit, enabled)
  } catch (err) {
    console.error('Failed to update permission bit', err)
    selectedBits.value = previous
    updateError.value =
      err instanceof Error && err.message ? err.message : t('user_permissions_load_error')
  } finally {
    isUpdatingBit.value = null
  }
}

const loadUserPermissions = async () => {
  if (
    memberUuid.value == null ||
    orgUuid.value == null ||
    !permissionGroups.value.length
  ) {
    return
  }

  try {
    const apiPath = `/api/admin/organization/${orgUuid.value}/member/${memberUuid.value}/permissions`
    const apiResponse = await apiFetch<{
      permissions?: number | string | null;
      user_display_name?: string;
      user_id?: number
    }>(apiPath)

    memberDisplayName.value = apiResponse.data?.user_display_name ?? ''

    const mask = toMaskValue(apiResponse.data?.permissions ?? null)
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
  () => [memberUuid.value, orgUuid.value, locale.value],
  () => {
    void loadPermissions()
  }
)

onMounted(() => {
  void loadPermissions()
  void loadOrganization()
})

const isBitEnabled = (bit: number) => {
  if (permissionMask.value == null) return false
  return (permissionMask.value & (1 << bit)) !== 0
}

const onBitChange = (bit: number, value: boolean | string[]) => {
  const enabled = typeof value === 'boolean' ? value : isBitEnabled(bit)
  void updatePermission(bit, enabled)
}

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
