<template>
  <div class="uranus-main-layout">
    <DashboardHeroComponent
        :title="t('user_permissions_title')"
        :subtitle="t('user_permissions_subtitle')"
    />


        <div v-if="isLoading" class="user-permissions__status">
            {{ t('user_permissions_loading') }}
        </div>

        <div v-else-if="error" class="user-permissions__status user-permissions__status--error">
            {{ error }}
        </div>

        <div v-else class="user-permissions__groups">
            <article v-for="(entries, type) in groupedPermissions" :key="type" class="permission-group">
                <header class="permission-group__header">
                    <h2 class="permission-group__title">{{ entityTypeLabels[type] ?? type }}</h2>
                    <p class="permission-group__count">{{ entries.length }} {{ t('user_permissions_entities') }}</p>
                </header>

                <div class="permission-group__list">
                    <section v-for="entry in entries" :key="`${entry.entity_type}-${entry.entity_id}-${entry.role_id}`"
                        class="permission-card">
                        <header class="permission-card__header">
                            <div>
                                <h3 class="permission-card__title">{{ entry.entity_name }}</h3>
                                <p class="permission-card__role">{{ entry.role_name }}</p>
                            </div>
                            <span v-if="entry.relation_id" class="permission-card__relation">
                                {{ t('user_permissions_relation', { id: entry.relation_id }) }}
                            </span>
                        </header>

                        <ul class="permission-card__capabilities">
                            <li v-for="capability in capabilityList" :key="capability.key"
                                class="permission-card__capability">
                                <span>{{ capability.label }}</span>
                                <span class="permission-card__flag"
                                    :class="{ 'permission-card__flag--active': entry[capability.key as CapabilityKey] }">
                                    {{ entry[capability.key as CapabilityKey]
                                        ? t('user_permissions_flag_yes')
                                        : t('user_permissions_flag_no')
                                    }}
                                </span>
                            </li>
                        </ul>

                        <footer class="permission-card__footer">
                            <span class="permission-card__footer-flag"
                                :class="{ 'permission-card__footer-flag--active': entry.release_event }">
                                {{ entry.release_event ? t('user_permissions_can_release') :
                                    t('user_permissions_cannot_release') }}
                            </span>
                            <span class="permission-card__footer-flag"
                                :class="{ 'permission-card__footer-flag--active': entry.view_event_insights }">
                                {{ entry.view_event_insights ? t('user_permissions_can_view_insights') :
                                    t('user_permissions_cannot_view_insights') }}
                            </span>
                        </footer>
                    </section>
                </div>
            </article>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import DashboardHeroComponent from "@/components/DashboardHeroComponent.vue";

interface PermissionResponseEntity {
    add_event: boolean
    add_space: boolean
    add_venue: boolean
    delete_event: boolean
    delete_organizer: boolean
    delete_space: boolean
    delete_venue: boolean
    edit_event: boolean
    edit_organizer: boolean
    edit_space: boolean
    edit_venue: boolean
    entity_id: number
    entity_name: string
    entity_type: string
    relation_id: number | null
    release_event: boolean
    role_id: number
    role_name: string
    view_event_insights: boolean
}

type CapabilityKey =
    | 'add_event'
    | 'edit_event'
    | 'delete_event'
    | 'add_space'
    | 'edit_space'
    | 'delete_space'
    | 'add_venue'
    | 'edit_venue'
    | 'delete_venue'
    | 'edit_organizer'
    | 'delete_organizer'

const { t } = useI18n({ useScope: 'global' })

const isLoading = ref(true)
const error = ref<string | null>(null)
const permissions = ref<PermissionResponseEntity[]>([])

const capabilityList = computed<Array<{ key: CapabilityKey; label: string }>>(() => [
    { key: 'add_event', label: t('user_permissions_add_event') },
    { key: 'edit_event', label: t('user_permissions_edit_event') },
    { key: 'delete_event', label: t('user_permissions_delete_event') },
    { key: 'add_space', label: t('user_permissions_add_space') },
    { key: 'edit_space', label: t('user_permissions_edit_space') },
    { key: 'delete_space', label: t('user_permissions_delete_space') },
    { key: 'add_venue', label: t('user_permissions_add_venue') },
    { key: 'edit_venue', label: t('user_permissions_edit_venue') },
    { key: 'delete_venue', label: t('user_permissions_delete_venue') },
    { key: 'edit_organizer', label: t('user_permissions_edit_organizer') },
    { key: 'delete_organizer', label: t('user_permissions_delete_organizer') },
])

const entityTypeLabels = computed<Record<string, string>>(() => ({
    organizer: t('user_permissions_type_organizer'),
    venue: t('user_permissions_type_venue'),
    space: t('user_permissions_type_space'),
    event: t('user_permissions_type_event'),
}))

const groupedPermissions = computed(() => {
    const groups: Record<string, PermissionResponseEntity[]> = {}
    permissions.value.forEach((entry) => {
        const key = entry.entity_type || 'unknown'
        if (!groups[key]) {
            groups[key] = []
        }
        groups[key].push(entry)
    })
    return groups
})

const loadPermissions = async () => {
    isLoading.value = true
    error.value = null

    try {
        const { data } = await apiFetch<PermissionResponseEntity[]>(
            '/api/admin/user/me/permissions'
        )

        if (!Array.isArray(data)) {
            permissions.value = []
            error.value = t('user_permissions_invalid_response')
            return
        }

        permissions.value = data
    } catch (err) {
        console.error('Failed to load permissions', err)
        error.value = t('user_permissions_load_error')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    void loadPermissions()
})
</script>

<style scoped lang="scss">
.user-permissions__status {
    padding: 1rem;
    border-radius: 12px;
    background: rgba(79, 70, 229, 0.08);
    color: var(--color-text);
    text-align: center;
}

.user-permissions__status--error {
    background: rgba(239, 68, 68, 0.1);
    color: rgba(239, 68, 68, 0.9);
}

.user-permissions__groups {
    display: grid;
    gap: clamp(1.25rem, 3vw, 2rem);
}

.permission-group {
    background: var(--card-bg);
    border-radius: 20px;
    padding: clamp(1.25rem, 3vw, 2rem);
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 2vw, 1.5rem);
}

.permission-group__header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.75rem;
}

.permission-group__title {
    margin: 0;
    color: var(--color-text);
}

.permission-group__count {
    margin: 0;
    color: var(--muted-text);
    font-size: 0.9rem;
}

.permission-group__list {
    display: grid;
    gap: clamp(1rem, 2vw, 1.5rem);
}

.permission-card {
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 16px;
    padding: clamp(1rem, 2vw, 1.5rem);
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.permission-card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
}

.permission-card__title {
    margin: 0;
    font-size: 1.1rem;
}

.permission-card__role {
    margin: 0.15rem 0 0;
    color: var(--muted-text);
}

.permission-card__relation {
    font-size: 0.85rem;
    color: var(--muted-text);
}

.permission-card__capabilities {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.5rem 1rem;
    list-style: none;
    margin: 0;
    padding: 0;
}

.permission-card__capability {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    color: var(--color-text);
}

.permission-card__flag {
    min-width: 1.75rem;
    text-align: center;
    border-radius: 8px;
    background: rgba(100, 116, 139, 0.08);
    color: rgba(100, 116, 139, 0.75);
    font-weight: 600;
}

.permission-card__flag--active {
    background: rgba(56, 189, 248, 0.15);
    color: rgba(14, 165, 233, 1);
}

.permission-card__footer {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: flex-end;
}

.permission-card__footer-flag {
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.16);
    color: rgba(100, 116, 139, 0.9);
    font-size: 0.85rem;
}

.permission-card__footer-flag--active {
    background: rgba(34, 197, 94, 0.18);
    color: rgba(22, 163, 74, 1);
}

@media (min-width: 1024px) {
    .permission-group__list {
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    }
}
</style>
