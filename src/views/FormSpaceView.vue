<template>
    <div class="space-page">
        <section class="space-hero">
            <h1>{{ title }}</h1>
            <p>{{ subtitle }}</p>
        </section>

        <section class="space-card">
            <form class="space-form" @submit.prevent="submitForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="name">{{ t('space_name') }}</label>
                        <input v-model="space.name" id="name" type="text" required />
                    </div>
                    <div class="form-group">
                        <label for="total_capacity">{{ t('space_total_capacity') }}</label>
                        <input v-model.number="space.total_capacity" id="total_capacity" type="number" min="0"
                            required />
                    </div>
                    <div class="form-group">
                        <label for="seating_capacity">{{ t('space_seating_capacity') }}</label>
                        <input v-model.number="space.seating_capacity" id="seating_capacity" type="number" min="0"
                            required />
                    </div>
                    <div class="form-group">
                        <label for="building_level">{{ t('space_building_level') }}</label>
                        <input v-model.number="space.building_level" id="building_level" type="number" required />
                    </div>
                    <div class="form-group">
                        <label for="space_type_id">{{ t('space_type') }}</label>
                        <select v-model.number="space.space_type_id" id="space_type_id" required>
                            <option :value="null" disabled>
                                {{ t('select_space_type') }}
                            </option>
                            <option v-for="type in spaceTypes" :key="type.id" :value="type.id">
                                {{ type.name }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="website_url">{{ t('website') }}</label>
                        <input v-model="space.website_url" id="website_url" type="url" />
                    </div>
                </div>

                <transition name="fade">
                    <p v-if="errorMessage" class="feedback feedback--error" role="alert">{{ errorMessage }}</p>
                </transition>

                <div class="form-actions">
                    <button :disabled="isSubmitting" type="submit">
                        <span v-if="!isSubmitting">{{ t('save_space') }}</span>
                        <span v-else>{{ t('saving') }}</span>
                    </button>
                </div>
            </form>
        </section>
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed, reactive, ref } from 'vue'
import { apiFetch } from '../api'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const { t, te } = useI18n()
const venueId = Number(route.params.venueId)
const organizerId = Number(route.params.id)
const space = reactive({
    name: '',
    total_capacity: 0,
    seating_capacity: 0,
    building_level: 0,
    space_type_id: null as number | null,
    website_url: ''
})

const spaceTypes = ref<Array<{ id: number; name: string }>>([])

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const title = computed(() => (te('space_details_title') ? t('space_details_title') : 'Space Details'))
const subtitle = computed(() => (te('space_details_subtitle') ? t('space_details_subtitle') : 'Add or update key information for your venue space.'))


onMounted(() => {
    fetchSpaceTypes()
})

async function fetchSpaceTypes() {
    try {
        const { data, status } = await apiFetch<Array<{ id: number; name: string }> | { space_types?: Array<{ id: number; name: string }> }>('/api/space/types', {
            method: 'GET',
        })

        if (status >= 200 && status < 300) {
            let types: Array<{ id: number; name: string }> | undefined

            if (Array.isArray(data)) {
                types = data
            } else if (data && typeof data === 'object' && 'space_types' in data && Array.isArray(data.space_types)) {
                types = data.space_types
            }

            if (types) {
                spaceTypes.value = types
                return
            }
        }

        console.error(`Failed to fetch space types (status ${status}).`)
    } catch (error) {
        console.error('Error fetching space types:', error)
    }
}

async function submitForm() {
    const spaceTypeId = space.space_type_id

    if (spaceTypeId === null) {
        errorMessage.value = t('select_space_type_error')
        return
    }

    const payload: SpacePayload = {
        name: space.name,
        total_capacity: space.total_capacity,
        seating_capacity: space.seating_capacity,
        building_level: space.building_level,
        space_type_id: spaceTypeId,
        website_url: space.website_url,
        venue_id: venueId
    }

    isSubmitting.value = true
    errorMessage.value = null

    try {
        const { status } = await apiFetch(`/api/admin/space/create`, {
            method: 'POST',
            body: JSON.stringify(payload),
        })

        if (status >= 200 && status < 300) {
            if (Number.isFinite(organizerId)) {
                router.push(`/organizer/${organizerId}/venues`)
            }
        } else {
            errorMessage.value = `Failed to save space (status ${status}).`
        }
    } catch (error: unknown) {
        if (typeof error === 'object' && error && 'data' in error) {
            const err = error as { data?: { error?: string } }
            errorMessage.value = err.data?.error ?? 'Failed to save space.'
        } else if (error instanceof Error) {
            errorMessage.value = error.message
        } else {
            errorMessage.value = 'Failed to save space.'
        }
    } finally {
        isSubmitting.value = false
    }
}


interface Space {
    name: string
    total_capacity: number
    seating_capacity: number
    building_level: number
    space_type_id: number | null
    website_url: string
    venue_id: number
}

type SpacePayload = Omit<Space, 'space_type_id'> & { space_type_id: number }
</script>

<style scoped lang="scss">
.space-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(1.5rem, 3vw, 2.5rem);
    padding: clamp(1.5rem, 4vw, 3rem);
    background: linear-gradient(135deg, rgba(72, 93, 255, 0.1), rgba(141, 233, 255, 0.15));
    backdrop-filter: blur(6px);
}

.space-hero {
    text-align: center;
    max-width: 540px;
    color: #1f2937;

    h1 {
        font-size: clamp(1.9rem, 3vw, 2.5rem);
        font-weight: 700;
        margin-bottom: 0.5rem;
    }

    p {
        margin: 0;
        font-size: clamp(1rem, 2.3vw, 1.15rem);
        color: rgba(31, 41, 55, 0.75);
        line-height: 1.6;
    }
}

.space-card {
    width: min(720px, 100%);
    background: #ffffff;
    border-radius: 24px;
    padding: clamp(1.75rem, 4vw, 2.5rem);
    box-shadow: 0 24px 50px rgba(31, 41, 55, 0.16);
    display: flex;
    flex-direction: column;
    gap: clamp(1.25rem, 3vw, 1.75rem);
}

.space-form {
    display: flex;
    flex-direction: column;
    gap: clamp(1.5rem, 3vw, 2rem);
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: clamp(1rem, 2vw, 1.5rem);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
        font-weight: 600;
        color: #111827;
        letter-spacing: 0.01em;
    }

    input {
        padding: 0.75rem 0.9rem;
        border: 1px solid rgba(17, 24, 39, 0.1);
        border-radius: 12px;
        background-color: rgba(243, 244, 246, 0.6);
        color: #111827;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;

        &::placeholder {
            color: rgba(31, 41, 55, 0.45);
        }

        &:focus {
            outline: none;
            border-color: rgba(91, 103, 255, 0.65);
            box-shadow: 0 0 0 4px rgba(91, 103, 255, 0.15);
            background-color: #fff;
        }
    }

    select {
        padding: 0.75rem 1.1rem;
        border: 1px solid rgba(17, 24, 39, 0.1);
        border-radius: 12px;
        background:
            linear-gradient(180deg, rgba(243, 244, 246, 0.9), rgba(229, 231, 235, 0.65)),
            url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.646 6.646a.5.5 0 0 1 .708 0L8 10.293l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708z' fill='%2363748B'/%3E%3C/svg%3E") no-repeat right 0.85rem center/0.9rem;
        color: #111827;
        font-size: 1rem;
        appearance: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, transform 0.2s ease;

        &:focus {
            outline: none;
            border-color: rgba(91, 103, 255, 0.65);
            box-shadow: 0 0 0 4px rgba(91, 103, 255, 0.15);
            background:
                linear-gradient(180deg, #ffffff, rgba(229, 231, 235, 0.65)),
                url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.646 6.646a.5.5 0 0 1 .708 0L8 10.293l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708z' fill='%234856FF'/%3E%3C/svg%3E") no-repeat right 0.85rem center/0.9rem;
        }
    }
}

.form-actions {
    display: flex;
    justify-content: flex-end;
}

button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.85rem 2rem;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #485dff, #60a5fa);
    color: #fff;
    font-weight: 600;
    font-size: 1rem;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 12px 25px rgba(72, 93, 255, 0.35);
        filter: brightness(1.05);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 6px 15px rgba(72, 93, 255, 0.3);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.35);
    }

    &:disabled {
        cursor: wait;
        opacity: 0.75;
        box-shadow: none;
    }
}

.feedback {
    font-size: 0.95rem;
    font-weight: 600;
    border-radius: 12px;
    padding: 0.75rem 1rem;
    margin: 0;
    text-align: center;
    border: 1px solid transparent;

    &--error {
        color: #991b1b;
        background: rgba(254, 202, 202, 0.45);
        border-color: rgba(248, 113, 113, 0.35);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@media (max-width: 540px) {
    .space-card {
        padding: clamp(1.25rem, 6vw, 1.8rem);
    }

    .form-actions {
        justify-content: center;
    }
}
</style>
