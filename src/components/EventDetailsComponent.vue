<template>
    <section class="event-section">
        <header class="event-section__header">
            <h2>{{ t('event_section_details') }}</h2>
            <p>{{ t('event_section_details_subtitle') }}</p>
        </header>

        <form class="event-section__form">
            <div class="event-section__grid event-section__grid--two">
                <div class="form-field form-field--wide">
                    <label for="description">{{ t('event_description_label') }}</label>
                    <textarea
                        id="description"
                        v-model="description"
                        rows="4"
                        :placeholder="t('event_description_placeholder')"
                        required
                    ></textarea>

                <div class="form-field">
                    <label for="teaser-text">{{ t('event_teaser_label') }}</label>
                    <input
                        id="teaser-text"
                        v-model="teaserText"
                        type="text"
                        :placeholder="t('event_teaser_placeholder')"
                    />
                </div>
                </div>

                <div class="form-field">
                    <label for="language">{{ t('event_language_label') }}</label>
                    <select id="language" v-model="language" required>
                        <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                        <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                            {{ lang.name }}
                        </option>
                    </select>
                </div>

                <div class="form-field">
                    <label for="min-age">{{ t('event_min_age') }}</label>
                    <input
                        id="min-age"
                        v-model.number="minAge"
                        type="number"
                        min="0"
                        :placeholder="t('event_min_age_placeholder')"
                    />
                </div>

                <div class="form-field">
                    <label for="max-age">{{ t('event_max_age') }}</label>
                    <input
                        id="max-age"
                        v-model.number="maxAge"
                        type="number"
                        min="0"
                        :placeholder="t('event_max_age_placeholder')"
                    />
                </div>

                <div class="form-field form-field--wide">
                    <label for="participation-info">{{ t('event_participation_label') }}</label>
                    <textarea
                        id="participation-info"
                        v-model="participationInfo"
                        rows="3"
                        :placeholder="t('event_participation_placeholder')"
                    ></textarea>
                </div>

                <div class="form-field">
                    <label for="organizer">{{ t('event_presented_by_label') }}</label>
                    <input
                        id="organizer"
                        v-model="organizer"
                        type="text"
                        :placeholder="t('event_presented_by_placeholder')"
                    />
                </div>
            </div>
        </form>
    </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const description = ref('')
const teaserText = ref('')
const language = ref<string | null>(null)
const minAge = ref<number | null>(null)
const maxAge = ref<number | null>(null)
const participationInfo = ref('')
const location = ref('')
const organizer = ref('')

const languages = ref([
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
])
</script>

<style scoped lang="scss">
.event-section {
    background: #ffffff;
    border-radius: 24px;
    padding: clamp(1.75rem, 4vw, 2.5rem);
    box-shadow: 0 24px 50px rgba(31, 41, 55, 0.14);
    display: flex;
    flex-direction: column;
    gap: clamp(1.25rem, 3vw, 1.75rem);
}

.event-section__header {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    h2 {
        font-size: clamp(1.35rem, 2.5vw, 1.75rem);
        font-weight: 700;
        color: #111827;
        margin: 0;
    }

    p {
        margin: 0;
        color: rgba(55, 65, 81, 0.8);
        line-height: 1.6;
        font-size: 0.98rem;
    }
}

.event-section__form {
    display: flex;
    flex-direction: column;
    gap: clamp(1.25rem, 2.5vw, 1.75rem);
}

.event-section__grid {
    display: grid;
    gap: clamp(1rem, 2vw, 1.5rem);
}

.event-section__grid--two {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
        font-weight: 600;
        color: #1f2937;
        letter-spacing: 0.01em;
    }

    input,
    select,
    textarea {
        padding: 0.75rem 0.9rem;
        border: 1px solid rgba(17, 24, 39, 0.1);
        border-radius: 12px;
        background-color: rgba(243, 244, 246, 0.6);
        color: #0f172a;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        font-size: 1rem;
        resize: vertical;

        &::placeholder {
            color: rgba(100, 116, 139, 0.6);
        }

        &:focus {
            outline: none;
            border-color: rgba(79, 70, 229, 0.75);
            box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
            background-color: #fff;
        }
    }

    select {
        padding-right: 2.4rem;
        background:
            linear-gradient(180deg, rgba(243, 244, 246, 0.9), rgba(229, 231, 235, 0.65)),
            url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.646 6.646a.5.5 0 0 1 .708 0L8 10.293l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708z' fill='%2363748B'/%3E%3C/svg%3E")
                no-repeat right 0.85rem center/0.9rem;
        appearance: none;

        &:focus {
            background:
                linear-gradient(180deg, #ffffff, rgba(229, 231, 235, 0.65)),
                url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.646 6.646a.5.5 0 0 1 .708 0L8 10.293l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708z' fill='%234856FF'/%3E%3C/svg%3E")
                    no-repeat right 0.85rem center/0.9rem;
        }
    }
}

.form-field--wide {
    grid-column: 1 / -1;
}

@media (max-width: 540px) {
    .event-section {
        padding: clamp(1.25rem, 6vw, 1.8rem);
    }

    .event-section__grid--two {
        grid-template-columns: 1fr;
    }
}
</style>
