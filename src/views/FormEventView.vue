<template>
    <div class="event-form-page">
        <section class="event-form-hero">
            <h1>{{ t('event_form_title') }}</h1>
            <p>{{ t('event_form_subtitle') }}</p>
        </section>

        <section class="event-form-grid">
            <EventBasicInfoComponent />
            <EventDatesComponent />
            <EventDetailsComponent />
        </section>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import EventBasicInfoComponent from '@/components/EventBasicInfoComponent.vue'
import EventDatesComponent from '@/components/EventDatesComponent.vue'
import EventDetailsComponent from '@/components/EventDetailsComponent.vue'

const { t } = useI18n({ useScope: 'global' })
</script>

<style scoped lang="scss">
.event-form-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(1.5rem, 3vw, 2.5rem);
    padding: clamp(1.5rem, 4vw, 3rem);
    background: linear-gradient(135deg, rgba(72, 93, 255, 0.1), rgba(141, 233, 255, 0.15));
    backdrop-filter: blur(6px);
}

.event-form-hero {
    text-align: center;
    max-width: 560px;
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

.event-form-grid {
    width: min(1080px, 100%);
    display: grid;
    gap: clamp(1.5rem, 3vw, 2rem);
}
</style>
