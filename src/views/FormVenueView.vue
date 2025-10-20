<template>
    <div class="venue-page">
        <section class="venue-hero">
            <h1>{{ t('create_venue') }}</h1>
            <p>{{ venueDescription }}</p>
        </section>

        <section class="card">
            <div class="venue-layout">
                <form class="venue-form" @submit.prevent="submitForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="venue_name">{{ t('venue_name') }}</label>
                            <input v-model="venueName" id="venue_name" type="text" required />
                        </div>
                        <div class="form-group">
                            <label for="street">{{ t('street') }}</label>
                            <input v-model="street" id="street" type="text" required />
                        </div>
                        <div class="form-group">
                            <label for="house_number">{{ t('house_number') }}</label>
                            <input v-model="houseNumber" id="house_number" type="text" required />
                        </div>
                        <div class="form-group">
                            <label for="postal_code">{{ t('postal_code') }}</label>
                            <input v-model="postalCode" id="postal_code" type="text" required />
                        </div>
                        <div class="form-group">
                            <label for="city">{{ t('city') }}</label>
                            <input v-model="city" id="city" type="text" required />
                        </div>
                        <div class="form-group">
                            <label for="email">{{ t('email') }}</label>
                            <input v-model="email" id="email" type="email" required />
                        </div>
                        <div class="form-group">
                            <label for="website">{{ t('website') }}</label>
                            <input v-model="website" id="website" type="url" required />
                        </div>
                        <div class="form-group">
                            <label for="phone">{{ t('phone') }}</label>
                            <input v-model="phone" id="phone" type="tel" required />
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit">{{ t('create_venue') }}</button>
                    </div>
                </form>

                <aside class="venue-map-panel">
                    <LocationMapComponent v-model="location" :zoom="13">
                        <template #footer>
                            {{ mapHint }}
                        </template>
                    </LocationMapComponent>
                    <div class="location-meta">
                        <span class="meta-label">{{ t('location') }}</span>
                        <span class="meta-value">{{ locationSummary }}</span>
                    </div>
                </aside>
            </div>

            <transition name="fade">
                <p v-if="error" class="feedback feedback--error">{{ error }}</p>
            </transition>
            <transition name="fade">
                <p v-if="success" class="feedback feedback--success">{{ success }}</p>
            </transition>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LatLngLiteral } from 'leaflet'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { apiFetch } from '../api'
import LocationMapComponent from '@/components/LocationMapComponent.vue'

const { t, te } = useI18n()
const route = useRoute()
const organizerId = Number(route.params.id)

const venueName = ref('')
const street = ref('')
const houseNumber = ref('')
const postalCode = ref('')
const city = ref('')
const email = ref('')
const website = ref('')
const phone = ref('')
const location = ref<LatLngLiteral | null>(null)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const venueDescription = computed(() => (te('venue_create_description') ? t('venue_create_description') : 'Add the essential information for your venue profile.'))
const mapHint = computed(() => (te('venue_map_hint') ? t('venue_map_hint') : 'Click the map to drop a pin where the venue is located.'))
const locationSummary = computed(() => {
    if (!location.value) {
        return te('venue_map_no_selection') ? t('venue_map_no_selection') : 'No location selected yet'
    }
    const { lat, lng } = location.value
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
})

const submitForm = async () => {
    try {
        error.value = null
        const payload: Record<string, unknown> = {
            name: venueName.value,
            street: street.value,
            house_number: houseNumber.value,
            postal_code: postalCode.value,
            city: city.value,
            contact_email: email.value,
            website_url: website.value,
            contact_phone: phone.value,
            organizer_id: organizerId
        }

        if (location.value) {
            payload.latitude = location.value.lat
            payload.longitude = location.value.lng
        }

        const { status } = await apiFetch('/api/admin/venue/create', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
        if (status >= 200 && status < 300) {
            success.value = t('venue_created')
        } else {
            throw new Error('Unexpected status code')
        }
    } catch (err: unknown) {
        success.value = null
        if (typeof err === 'object' && err && 'data' in err) {
            const e = err as { data?: { error?: string } }
            error.value = e.data?.error || t('failed_to_create_venue')
        } else {
            error.value = t('unknown_error')
        }
    }
}
</script>

<style scoped lang="scss">
.venue-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(1.5rem, 3vw, 2.5rem);
    padding: clamp(1.5rem, 4vw, 3rem);
    background: linear-gradient(135deg, rgba(72, 93, 255, 0.1), rgba(141, 233, 255, 0.15));
    backdrop-filter: blur(6px);
}

.venue-hero {
    text-align: center;
    max-width: 540px;
    color: #1f2937;

    h1 {
        font-size: clamp(1.9rem, 3vw, 2.5rem);
        font-weight: 700;
        margin-bottom: 0.5rem;
    }

    p {
        font-size: clamp(1rem, 2.3vw, 1.15rem);
        color: rgba(31, 41, 55, 0.75);
        line-height: 1.6;
        margin: 0;
    }
}

.venue-card {
    width: min(960px, 100%);
    background: #ffffff;
    border-radius: 24px;
    padding: clamp(1.75rem, 4vw, 2.75rem);
    box-shadow: 0 24px 50px rgba(31, 41, 55, 0.16);
    display: flex;
    flex-direction: column;
    gap: clamp(1.25rem, 3vw, 1.75rem);
}

.venue-layout {
    display: grid;
    gap: clamp(1.5rem, 3vw, 2.25rem);
    grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
}

.venue-form {
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

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 25px rgba(72, 93, 255, 0.35);
        filter: brightness(1.05);
    }

    &:active {
        transform: translateY(0);
        box-shadow: 0 6px 15px rgba(72, 93, 255, 0.3);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.35);
    }
}

.venue-map-panel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.location-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-size: 0.9rem;
    background: rgba(243, 244, 246, 0.7);
    border-radius: 14px;
    padding: 0.75rem 1rem;
}

.meta-label {
    font-weight: 600;
    color: #111827;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.78rem;
}

.meta-value {
    font-variant-numeric: tabular-nums;
    color: rgba(17, 24, 39, 0.8);
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

    &--success {
        color: #065f46;
        background: rgba(167, 243, 208, 0.45);
        border-color: rgba(110, 231, 183, 0.35);
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

@media (max-width: 900px) {
    .venue-layout {
        grid-template-columns: 1fr;
    }

    .form-actions {
        justify-content: center;
    }
}

@media (max-width: 540px) {
    .venue-card {
        padding: clamp(1.25rem, 6vw, 1.8rem);
    }
}
</style>
