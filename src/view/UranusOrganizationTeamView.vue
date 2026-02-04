<template>
    <div class="uranus-main-layout organization-team-view">
        <UranusDashboardHero :title="t('organization_team_management')" :subtitle="t('organization_team_management_description')" />

        <section class="organization-team">
            <div v-if="isLoading" class="team-state">
                {{ t('organization_team_loading') }}
            </div>

            <div v-else-if="loadError" class="team-state team-state--error" role="alert">
                {{ loadError }}
            </div>

            <div v-else class="team-grid">
                <article class="uranus-card uranus-form team-card team-card--members">
                    <header class="team-card__header">
                        <div>
                            <h2>{{ t('organization_team_members_title') }}</h2>
                            <p class="team-card__meta">{{ t('organization_team_members_count', { count: members.length }) }}</p>
                        </div>
                        <button v-if="searchQuery || roleFilter !== 'all'" class="uranus-secondary-button team-reset-button"
                            type="button" @click="resetFilters">
                            {{ t('organization_team_filters_reset') }}
                        </button>
                    </header>

                    <UranusFormRow class="team-toolbar">
                        <UranusTextInput id="team-search" v-model="searchQuery" :placeholder="t('organization_team_search_placeholder')"
                            :label="t('organization_team_search_label')" />

                        <div class="uranus-textfield-wrapper team-role-filter">
                            <UranusFieldLabel id="team-role-filter-select"
                                :label="t('organization_team_role_filter_label')">
                                <select id="team-role-filter-select" v-model="roleFilterModel" class="uranus-text-input">
                                    <option value="all">{{ t('organization_team_role_filter_all') }}</option>
                                    <option v-for="role in roles" :key="role.id" :value="role.id">
                                        {{ role.name }}
                                    </option>
                                </select>
                            </UranusFieldLabel>
                        </div>
                    </UranusFormRow>

                    <transition name="fade">
                        <p v-if="memberActionError" class="feedback feedback--error" role="alert">
                            {{ memberActionError }}
                        </p>
                    </transition>

                    <ul v-if="filteredMembers.length" class="team-member-list">
                        <li v-for="member in filteredMembers" :key="member.user_id" class="team-member">
                            <div class="team-member__avatar" aria-hidden="true">
                                <img v-if="member.avatar_url" :src="member.avatar_url" :alt="member.display_name || member.email">
                            </div>

                            <div class="team-member__details">
                                <div class="team-member__heading">
                                    <div>
                                        <p class="team-member__name">{{ member.display_name || member.email }}</p>
                                        <p class="team-member__email">{{ member.email }}</p>
                                    </div>
                                    <span class="team-member__role">{{ member.role_name }}</span>
                                </div>

                                <div class="team-member__meta">
                                    <span v-if="member.last_active_at">
                                        {{ t('organization_team_last_active', { time: formatRelativeTime(member.last_active_at) || formatDate(member.last_active_at) || t('organization_team_date_unknown') }) }}
                                    </span>
                                    <span v-else-if="member.joined_at">
                                        {{ t('organization_team_joined', { date: formatDate(member.joined_at) || t('organization_team_date_unknown') }) }}
                                    </span>
                                </div>
                            </div>

                            <div class="team-member__actions">
                              <UranusDashboardButton
                                  v-if="true"
                                  class="uranus-tertiary-button"
                                  icon="delete"
                                  @click.prevent.stop="removeMember(member)"
                              >
                                {{ t('delete') }}
                              </UranusDashboardButton>

                              <UranusDashboardButton
                                  v-if="true"
                                  class="uranus-tertiary-button"
                                  icon="edit"
                                  :to="`/admin/organization/${organizationId}/member/${member.member_id}/permissions`"
                              >
                                {{ t('edit') }}
                              </UranusDashboardButton>
                            </div>
                        </li>
                    </ul>

                    <div v-else class="team-empty">
                        <p>{{ t('organization_team_empty_members') }}</p>
                    </div>
                </article>

                <article class="uranus-card team-card team-card--sidebar">
                    <header class="team-card__header">
                        <div>
                            <h2>{{ t('organization_team_section_invite_title') }}</h2>
                            <p class="team-card__meta">{{ t('organization_team_section_invite_description') }}</p>
                        </div>
                    </header>

                    <form class="team-form uranus-form" @submit.prevent="submitInvite">
                        <transition name="fade">
                            <p v-if="inviteError" class="feedback feedback--error" role="alert">
                                {{ inviteError }}
                            </p>
                        </transition>
                        <transition name="fade">
                            <p v-if="inviteSuccess" class="feedback feedback--success" role="status">
                                {{ inviteSuccess }}
                            </p>
                        </transition>

                        <UranusFormRow>
                            <UranusTextInput id="invite-email" v-model="inviteEmail" type="email"
                                :label="t('organization_team_invite_email_label')" autocomplete="email" required />
                            <div class="uranus-textfield-wrapper team-role-select">
                                <UranusFieldLabel id="team-invite-role-select"
                                    :label="t('organization_team_invite_role_label')" :required="true">
                                    <select id="team-invite-role-select" v-model="inviteRoleModel"
                                        class="uranus-text-input" :disabled="!roles.length" required>
                                        <option v-for="role in roles" :key="role.id" :value="role.id">
                                            {{ role.name }}
                                        </option>
                                    </select>
                                </UranusFieldLabel>
                            </div>
                        </UranusFormRow>

                        <button class="uranus-button" type="submit" :disabled="isInviting">
                            <span v-if="!isInviting">{{ t('organization_team_invite_button') }}</span>
                            <span v-else>{{ t('organization_team_inviting') }}</span>
                        </button>
                    </form>

                    <section class="team-pending">
                        <header>
                            <h3>{{ t('organization_team_pending_title') }}</h3>
                            <p class="team-card__meta">{{ t('organization_team_pending_description') }}</p>
                        </header>

                        <transition name="fade">
                            <p v-if="inviteActionError" class="feedback feedback--error" role="alert">
                                {{ inviteActionError }}
                            </p>
                        </transition>

                        <ul v-if="pendingInvitations.length" class="team-pending-list">
                            <li v-for="invite in pendingInvitations" :key="invite.invite_id" class="team-pending-item">
                                <div>
                                    <p class="team-pending__email">{{ invite.email }}</p>
                                    <p class="team-pending__meta">
                                        <span>{{ invite.role_name }}</span>
                                        <span>·</span>
                                        <span>
                                            {{ t('organization_team_invite_sent', { date: formatDate(invite.invited_at) || t('organization_team_date_unknown') }) }}
                                        </span>
                                    </p>
                                    <p v-if="invite.expires_at" class="team-pending__expires">
                                        {{ t('organization_team_invite_expires', {
                                            time: formatRelativeTime(invite.expires_at) || formatDate(invite.expires_at) ||
                                                t('organization_team_date_unknown')
                                        }) }}
                                    </p>
                                </div>
                                <button class="uranus-secondary-button" type="button"
                                    :disabled="inviteActionId === invite.invite_id" @click="cancelInvite(invite)">
                                    <span v-if="inviteActionId === invite.invite_id">{{ t('organization_team_removing') }}</span>
                                    <span v-else>{{ t('organization_team_pending_cancel') }}</span>
                                </button>
                            </li>
                        </ul>

                        <div v-else class="team-empty team-empty--compact">
                            <p>{{ t('organization_team_pending_empty') }}</p>
                        </div>
                    </section>
                </article>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'

import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusFieldLabel from '@/component/ui/UranusFieldLabel.vue'
import UranusTextInput from '@/component/ui/UranusTextInput.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusDashboardButton from "@/component/dashboard/UranusDashboardButton.vue";

interface OrganizationTeamRole {
    id: number
    name: string
    description?: string | null
}

interface OrganizationTeamMember {
  member_id: number
  user_id: number
  display_name: string | null
  email: string
  role_id: number | null
  role_name: string
  avatar_url?: string | null
  last_active_at?: string | null
  joined_at?: string | null
}

interface OrganizationTeamInvitation {
  user_id: number
  email: string
  role_id: number | null
  role_name: string
  invited_by?: string | null
  invited_at?: string | null
  expires_at?: string | null
}

interface OrganizationTeamResponse {
    members?: OrganizationTeamMember[]
    invitations?: OrganizationTeamInvitation[]
    roles?: OrganizationTeamRole[]
}

const route = useRoute()
const { t, locale } = useI18n({ useScope: 'global' })

const organizationId = computed(() => {
    const raw = Number(route.params.id)
    return Number.isFinite(raw) ? raw : null
})

const isLoading = ref(true)
const loadError = ref<string | null>(null)
const members = ref<OrganizationTeamMember[]>([])
const invitations = ref<OrganizationTeamInvitation[]>([])
const roles = ref<OrganizationTeamRole[]>([])

const searchQuery = ref('')
const roleFilter = ref<'all' | number>('all')

const inviteEmail = ref('')
const inviteRoleId = ref<number | null>(null)
const inviteError = ref<string | null>(null)
const inviteSuccess = ref<string | null>(null)
const inviteActionError = ref<string | null>(null)
const isInviting = ref(false)

const memberActionId = ref<number | null>(null)
const inviteActionId = ref<number | null>(null)
const memberActionError = ref<string | null>(null)

const roleFilterModel = computed({
    get: () => (roleFilter.value === 'all' ? 'all' : String(roleFilter.value)),
    set: (value: string) => {
        roleFilter.value = value === 'all' ? 'all' : Number(value)
    },
})

const inviteRoleModel = computed({
    get: () => (inviteRoleId.value == null ? '' : String(inviteRoleId.value)),
    set: (value: string) => {
        inviteRoleId.value = value ? Number(value) : null
    },
})

const pendingInvitations = computed(() =>
    [...invitations.value].sort((a, b) => {
        const aTime = a.invited_at ? new Date(a.invited_at).getTime() : 0
        const bTime = b.invited_at ? new Date(b.invited_at).getTime() : 0
        return bTime - aTime
    })
)

const filteredMembers = computed(() => {
    const term = searchQuery.value.trim().toLowerCase()
    return members.value
        .filter((member) => {
            const matchesSearch =
                !term ||
                [member.display_name, member.email]
                    .filter(Boolean)
                    .some((value) => value!.toLowerCase().includes(term))

            const matchesRole = roleFilter.value === 'all' || member.role_id === roleFilter.value
            return matchesSearch && matchesRole
        })
        .sort((a, b) => {
            const labelA = (a.display_name || a.email).toLocaleLowerCase()
            const labelB = (b.display_name || b.email).toLocaleLowerCase()
            return labelA.localeCompare(labelB, locale.value)
        })
})

const relativeFormatter = computed(
    () => new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })
)

const timeUnits: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
    { unit: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
    { unit: 'day', ms: 1000 * 60 * 60 * 24 },
    { unit: 'hour', ms: 1000 * 60 * 60 },
    { unit: 'minute', ms: 1000 * 60 },
    { unit: 'second', ms: 1000 },
]

const formatRelativeTime = (value?: string | null) => {
    if (!value) return null
    const timestamp = new Date(value).getTime()
    if (Number.isNaN(timestamp)) {
        return null
    }

    const diff = timestamp - Date.now()
    const abs = Math.abs(diff)

    for (const entry of timeUnits) {
        if (abs >= entry.ms || entry.unit === 'second') {
            const amount = Math.round(diff / entry.ms)
            return relativeFormatter.value.format(amount, entry.unit)
        }
    }

    return null
}

const formatDate = (value?: string | null) => {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(date)
}

const getInitials = (value: string) => {
    if (!value) return '?'
    const parts = value.trim().split(/\s+/).slice(0, 2)
    return parts.map((part) => part.charAt(0).toUpperCase()).join('') || value.charAt(0).toUpperCase()
}

const resetFilters = () => {
    searchQuery.value = ''
    roleFilter.value = 'all'
}

const loadTeam = async () => {
    if (!organizationId.value) {
        loadError.value = t('organization_team_load_error')
        isLoading.value = false
        return
    }

    isLoading.value = true
    loadError.value = null
    memberActionError.value = null
    inviteActionError.value = null

    try {
        const { data } = await apiFetch<OrganizationTeamResponse>(
            `/api/admin/organization/${organizationId.value}/team?lang=${locale.value}`
        )

        members.value = Array.isArray(data?.members) ? data.members : []
        invitations.value = Array.isArray(data?.invitations) ? data.invitations : []
        roles.value = Array.isArray(data?.roles) ? data.roles : []
    } catch (err) {
        console.error('Failed to load team', err)
        loadError.value =
            err instanceof Error && err.message ? err.message : t('organization_team_load_error')
    } finally {
        isLoading.value = false
    }
}

const removeMember = async (member: OrganizationTeamMember) => {
    if (!organizationId.value) return

    memberActionError.value = null

    const confirmed = window.confirm(
        t('organization_team_remove_member_confirm', {
            name: member.display_name || member.email,
        })
    )

    if (!confirmed) {
        return
    }

    memberActionId.value = member.user_id

    try {
        await apiFetch(`/api/admin/organization/${organizationId.value}/team/member/${member.user_id}`, {
            method: 'DELETE',
        })

        members.value = members.value.filter((entry) => entry.user_id !== member.user_id)
    } catch (err) {
        console.error('Failed to remove member', err)
        memberActionError.value =
            err instanceof Error && err.message
                ? err.message
                : t('organization_team_remove_member_error')
    } finally {
        memberActionId.value = null
    }
}

const submitInvite = async () => {
  console.log('submitInvite')
    if (!organizationId.value) {
        inviteError.value = t('organization_team_invite_role_required')
        return
    }

    const email = inviteEmail.value.trim()

    inviteError.value = null
    inviteSuccess.value = null

    if (!email) {
        inviteError.value = t('organization_team_invite_email_required')
        return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
        inviteError.value = t('organization_team_invite_email_invalid')
        return
    }

    isInviting.value = true

    try {
        await apiFetch(`/api/admin/organization/${organizationId.value}/team/invite?lang=${locale.value}`, {
            method: 'POST',
            body: JSON.stringify({ email, role_id: inviteRoleId.value }),
        })

        inviteEmail.value = ''
        inviteSuccess.value = t('organization_team_invite_success', { email })
        await loadTeam()
    } catch (err) {
        console.error('Failed to invite member', err)
        inviteError.value =
            err instanceof Error && err.message ? err.message : t('organization_team_invite_error')
    } finally {
        isInviting.value = false
    }
}

const cancelInvite = async (invite: OrganizationTeamInvitation) => {
    if (!organizationId.value) return

    inviteActionError.value = null

    const confirmed = window.confirm(
        t('organization_team_pending_cancel_confirm', { email: invite.email })
    )

    if (!confirmed) {
        return
    }

    inviteActionId.value = invite.user_id

    try {
        await apiFetch(`/api/admin/organization/${organizationId.value}/team/member/${invite.user_id}`, {
                method: 'DELETE',
            }
        )

        invitations.value = invitations.value.filter(
            (entry) => entry.user_id !== invite.user_id
        )
    } catch (err) {
        console.error('Failed to cancel invite', err)
        inviteActionError.value =
            err instanceof Error && err.message
                ? err.message
                : t('organization_team_pending_cancel_error')
    } finally {
        inviteActionId.value = null
    }
}

watch(
    () => organizationId.value,
    (next, prev) => {
        if (next && next !== prev) {
            void loadTeam()
        }
    }
)

watch(
    () => roles.value.map((role) => role.id),
    (ids) => {
        if (!ids.length) {
            inviteRoleId.value = null
            return
        }

        if (inviteRoleId.value == null || !ids.includes(inviteRoleId.value)) {
            inviteRoleId.value = ids[0] ?? null
        }
    },
    { immediate: true }
)

onMounted(() => {
    if (organizationId.value) {
        void loadTeam()
    } else {
        isLoading.value = false
        loadError.value = t('organization_team_load_error')
    }
})
</script>

<style scoped lang="scss">
.organization-team {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 2vw, 1.5rem);
}

.team-state {
    padding: 1rem 1.5rem;
    border-radius: 16px;
    background: rgba(79, 70, 229, 0.08);
    text-align: center;
    border: 1px solid rgba(79, 70, 229, 0.25);
}

.team-state--error {
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.45);
    color: rgba(239, 68, 68, 0.9);
}

.team-grid {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
    gap: clamp(1rem, 3vw, 1.5rem);
}

.team-card {
    border-radius: 20px;
    border: 1px solid var(--border-soft);
    background: var(--surface-primary, var(--input-bg));
    padding: clamp(1rem, 2vw, 1.5rem);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.team-card--sidebar {
    position: sticky;
    top: 1rem;
    align-self: flex-start;
}

.team-card__header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;

    h2 {
        margin: 0;
        font-size: 1.3rem;
    }
}

.team-card__meta {
    margin: 0.25rem 0 0;
    color: var(--uranus-muted-text);
    font-size: 0.9rem;
}

.team-toolbar {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.team-role-filter {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.875rem;
    color: var(--uranus-muted-text);
    min-width: 200px;
}

.team-role-select {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.9rem;
    color: var(--uranus-muted-text);
}

.team-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.team-member-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.team-member {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 1rem;
    padding: 1rem;
    border-radius: 16px;
    border: 1px solid var(--border-soft);
    background: var(--surface-secondary, var(--surface-primary));
    align-items: center;
}

.team-member__avatar {
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 9999px;
    }
}

.team-member__details {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.team-member__heading {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.team-member__name {
    margin: 0;
    font-weight: 600;
    font-size: 1rem;
}

.team-member__email {
    margin: 0;
    color: var(--uranus-muted-text);
    font-size: 0.9rem;
}

.team-member__role {
    font-size: 0.85rem;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    background: rgba(79, 70, 229, 0.1);
    align-self: flex-start;
    white-space: nowrap;
}

.team-member__meta {
    color: var(--uranus-muted-text);
    font-size: 0.85rem;
}

.team-member__actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
    white-space: nowrap;
}

.team-empty {
    border: 1px dashed var(--border-soft);
    border-radius: 16px;
    padding: 1rem;
    text-align: center;
    color: var(--uranus-muted-text);
}

.team-empty--compact {
    padding: 0.75rem;
    font-size: 0.9rem;
}

.team-pending {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.team-pending header h3 {
    margin: 0;
    font-size: 1.1rem;
}

.team-pending__email {
    margin: 0;
    font-weight: 600;
}

.team-pending__meta,
.team-pending__expires {
    margin: 0.15rem 0 0;
    font-size: 0.85rem;
    color: var(--uranus-muted-text);
}

.team-pending-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.team-pending-item {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.9rem;
    border-radius: 16px;
    border: 1px solid var(--border-soft);
}

.team-reset-button {
    align-self: flex-start;
}

@media (max-width: 960px) {
    .team-grid {
        grid-template-columns: 1fr;
    }

    .team-card--sidebar {
        position: static;
    }

    .team-member {
        grid-template-columns: auto 1fr;
    }

    .team-member__actions {
        grid-column: span 2;
        justify-self: flex-start;
    }
}

@media (max-width: 540px) {
    .team-toolbar {
        flex-direction: column;
    }

    .team-member__heading {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
