<template>
  <div class="terms-view">
    <div class="terms-container">
      <h1>{{ t('terms_title') }}</h1>

      <section class="terms-section">
        <h2>{{ t('terms_scope_title') }}</h2>
        <p>{{ t('terms_scope_text_1') }}</p>
        <p>{{ t('terms_scope_text_2') }}</p>
        <p>{{ t('terms_scope_text_3') }}</p>
        <p>
          <strong>{{ organizationName }}</strong><br>
          {{ street }}<br>
          {{ postalCode }} {{ city }}<br>
          {{ country }}
        </p>
        <p>
          {{ t('imprint_email') }}: <a :href="`mailto:${email}`">{{ email }}</a><br>
          <template v-if="website">
            {{ t('imprint_website') }}: <a :href="website" target="_blank" rel="noopener">{{ website }}</a>
          </template>
        </p>
      </section>

      <section class="terms-section">
        <h2>{{ t('terms_registration_title') }}</h2>
        <p>{{ t('terms_registration_text_1') }}</p>
        <p><strong>{{ t('terms_registration_requirements_title') }}</strong></p>
        <ul>
          <li>{{ t('terms_registration_req_1') }}</li>
          <li>{{ t('terms_registration_req_2') }}</li>
          <li>{{ t('terms_registration_req_3') }}</li>
        </ul>
        <p>{{ t('terms_registration_text_2') }}</p>
        <p>{{ t('terms_registration_text_3') }}</p>
      </section>

      <section class="terms-section">
        <h2>{{ t('terms_account_title') }}</h2>
        <p>{{ t('terms_account_text_1') }}</p>
        <p>{{ t('terms_account_text_2') }}</p>
        <p>{{ t('terms_account_text_3') }}</p>
      </section>

      <section class="terms-section">
        <h2>{{ t('terms_services_title') }}</h2>
        <p>{{ t('terms_services_intro') }}</p>
        <ul>
          <li>{{ t('terms_service_1') }}</li>
          <li>{{ t('terms_service_2') }}</li>
          <li>{{ t('terms_service_3') }}</li>
          <li>{{ t('terms_service_4') }}</li>
          <li>{{ t('terms_service_5') }}</li>
        </ul>
        <p>{{ t('terms_services_disclaimer') }}</p>
      </section>

      <section class="terms-section">
        <h2>{{ t('terms_user_content_title') }}</h2>
        <p>{{ t('terms_user_content_text_1') }}</p>
        <p><strong>{{ t('terms_user_content_grant_title') }}</strong></p>
        <p>{{ t('terms_user_content_grant_text') }}</p>
        <p><strong>{{ t('terms_user_content_responsibility_title') }}</strong></p>
        <p>{{ t('terms_user_content_responsibility_text') }}</p>
        <ul>
          <li>{{ t('terms_content_prohibition_1') }}</li>
          <li>{{ t('terms_content_prohibition_2') }}</li>
          <li>{{ t('terms_content_prohibition_3') }}</li>
          <li>{{ t('terms_content_prohibition_4') }}</li>
          <li>{{ t('terms_content_prohibition_5') }}</li>
        </ul>
        <p>{{ t('terms_user_content_removal') }}</p>
      </section>

      <section class="terms-section">
        <h2>{{ t('terms_intellectual_property_title') }}</h2>
        <p>{{ t('terms_intellectual_property_text_1') }}</p>
        <p>{{ t('terms_intellectual_property_text_2') }}</p>
      </section>

      <section class="terms-section">
        <h2>{{ t('terms_prohibited_uses_title') }}</h2>
        <p>{{ t('terms_prohibited_uses_intro') }}</p>
        <ul>
          <li>{{ t('terms_prohibited_use_1') }}</li>
          <li>{{ t('terms_prohibited_use_2') }}</li>
          <li>{{ t('terms_prohibited_use_3') }}</li>
          <li>{{ t('terms_prohibited_use_4') }}</li>
          <li>{{ t('terms_prohibited_use_5') }}</li>
          <li>{{ t('terms_prohibited_use_6') }}</li>
          <li>{{ t('terms_prohibited_use_7') }}</li>
        </ul>
      </section>

      <section class="terms-section">
        <h2>{{ t('terms_availability_title') }}</h2>
        <p>{{ t('terms_availability_text_1') }}</p>
        <p>{{ t('terms_availability_text_2') }}</p>
      </section>

      <section class="terms-section">
        <h2>{{ t('terms_liability_title') }}</h2>
        <p>{{ t('terms_liability_text_1') }}</p>
        <p>{{ t('terms_liability_text_2') }}</p>
        <p>{{ t('terms_liability_text_3') }}</p>
      </section>

      <section class="terms-section">
        <h2>{{ t('terms_data_protection_title') }}</h2>
        <p>{{ t('terms_data_protection_text') }}</p>
        <p>
          <router-link :to="{ name: 'privacy' }">{{ t('terms_privacy_link') }}</router-link>
        </p>
      </section>

      <section class="terms-section">
        <h2>{{ t('terms_changes_title') }}</h2>
        <p>{{ t('terms_changes_text_1') }}</p>
        <p>{{ t('terms_changes_text_2') }}</p>
      </section>

      <section class="terms-section">
        <h2>{{ t('terms_termination_title') }}</h2>
        <p>{{ t('terms_termination_text_1') }}</p>
        <p>{{ t('terms_termination_text_2') }}</p>
        <p>{{ t('terms_termination_text_3') }}</p>
      </section>

      <section class="terms-section">
        <h2>{{ t('terms_final_provisions_title') }}</h2>
        <p><strong>{{ t('terms_applicable_law_title') }}</strong></p>
        <p>{{ t('terms_applicable_law_text') }}</p>
        <p><strong>{{ t('terms_place_of_jurisdiction_title') }}</strong></p>
        <p>{{ t('terms_place_of_jurisdiction_text') }}</p>
        <p><strong>{{ t('terms_severability_title') }}</strong></p>
        <p>{{ t('terms_severability_text') }}</p>
      </section>

      <section class="terms-section">
        <h2>{{ t('terms_contact_title') }}</h2>
        <p>{{ t('terms_contact_text') }}</p>
        <p>
          <strong>{{ organizationName }}</strong><br>
          {{ street }}<br>
          {{ postalCode }} {{ city }}<br>
          {{ t('imprint_email') }}: <a :href="`mailto:${email}`">{{ email }}</a>
        </p>
      </section>

      <section class="terms-section">
        <p class="terms-update-info">
          {{ t('terms_last_updated') }}: {{ lastUpdated }}
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

// Load organization data from environment variables (same as imprint)
const organizationName = import.meta.env.VITE_IMPRINT_ORGANIZATION_NAME || ''
const street = import.meta.env.VITE_IMPRINT_STREET || ''
const postalCode = import.meta.env.VITE_IMPRINT_POSTAL_CODE || ''
const city = import.meta.env.VITE_IMPRINT_CITY || ''
const country = import.meta.env.VITE_IMPRINT_COUNTRY || ''
const email = import.meta.env.VITE_IMPRINT_EMAIL || ''
const website = import.meta.env.VITE_IMPRINT_WEBSITE || ''

// Last updated date
const lastUpdated = import.meta.env.VITE_TERMS_LAST_UPDATED || new Date().toLocaleDateString('de-DE')
</script>

<style scoped lang="scss">
.terms-view {
  min-height: 100vh;
  background: var(--card-bg);
  padding: 2rem 1rem;
}

.terms-container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  padding: clamp(1.5rem, 4vw, 3rem);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--accent-primary);
}

.terms-section {
  margin-bottom: 2.5rem;

  &:last-child {
    margin-bottom: 0;
  }
}

h2 {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
  margin-top: 2rem;
}

h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

p {
  line-height: 1.7;
  color: var(--color-text);
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
}

ul {
  line-height: 1.7;
  color: var(--color-text);
  margin-bottom: 1rem;
  padding-left: 1.5rem;

  li {
    margin-bottom: 0.5rem;
  }
}

.terms-update-info {
  font-size: 0.9rem;
  color: var(--uranus-muted-text);
  font-style: italic;
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

a {
  color: var(--accent-primary);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--accent-secondary);
    text-decoration: underline;
  }
}

strong {
  font-weight: 600;
  color: var(--color-text);
}

@media (max-width: 640px) {
  .terms-view {
    padding: 1rem 0.5rem;
  }

  .terms-container {
    padding: 1.5rem;
  }
}
</style>
