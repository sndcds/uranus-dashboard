<template>
  <div class="privacy-view">
    <div class="privacy-container">
      <h1>{{ t('privacy_title') }}</h1>

      <section class="privacy-section">
        <h2>{{ t('privacy_overview_title') }}</h2>
        <h3>{{ t('privacy_general_info_title') }}</h3>
        <p>{{ t('privacy_general_info_text') }}</p>
        
        <h3>{{ t('privacy_data_collection_title') }}</h3>
        <p>{{ t('privacy_data_collection_text') }}</p>
        <p><strong>{{ t('privacy_automatic_data_title') }}</strong></p>
        <p>{{ t('privacy_automatic_data_text') }}</p>
      </section>

      <section class="privacy-section">
        <h2>{{ t('privacy_hosting_title') }}</h2>
        <p>{{ t('privacy_hosting_text') }}</p>
        <p><strong>{{ t('privacy_hosting_provider_title') }}</strong></p>
        <p>
          {{ hostingProvider }}<br>
          <template v-if="hostingProviderAddress">
            {{ hostingProviderAddress }}<br>
          </template>
          <template v-if="hostingProviderCountry">
            {{ hostingProviderCountry }}
          </template>
        </p>
        <p>{{ t('privacy_hosting_legal_basis') }}</p>
      </section>

      <section class="privacy-section">
        <h2>{{ t('privacy_general_mandatory_title') }}</h2>
        
        <h3>{{ t('privacy_data_protection_title') }}</h3>
        <p>{{ t('privacy_data_protection_text') }}</p>
        
        <h3>{{ t('privacy_responsible_party_title') }}</h3>
        <p>{{ t('privacy_responsible_party_text') }}</p>
        <p>
          <strong>{{ organizationName }}</strong><br>
          {{ street }}<br>
          {{ postalCode }} {{ city }}<br>
          {{ country }}
        </p>
        <p>
          {{ t('imprint_phone') }}: <a :href="`tel:${phone}`">{{ phone }}</a><br>
          {{ t('imprint_email') }}: <a :href="`mailto:${email}`">{{ email }}</a>
        </p>
        
        <h3>{{ t('privacy_data_protection_officer_title') }}</h3>
        <p>{{ t('privacy_data_protection_officer_text') }}</p>
        <p v-if="dataProtectionOfficer">
          {{ dataProtectionOfficer.name }}<br>
          <template v-if="dataProtectionOfficer.email">
            {{ t('imprint_email') }}: <a :href="`mailto:${dataProtectionOfficer.email}`">{{ dataProtectionOfficer.email }}</a>
          </template>
        </p>
        <p v-else>
          {{ t('privacy_no_officer_required') }}
        </p>
        
        <h3>{{ t('privacy_storage_duration_title') }}</h3>
        <p>{{ t('privacy_storage_duration_text') }}</p>
        
        <h3>{{ t('privacy_legal_basis_title') }}</h3>
        <p>{{ t('privacy_legal_basis_text') }}</p>
        
        <h3>{{ t('privacy_revoke_consent_title') }}</h3>
        <p>{{ t('privacy_revoke_consent_text') }}</p>
        
        <h3>{{ t('privacy_right_to_object_title') }}</h3>
        <p>{{ t('privacy_right_to_object_text') }}</p>
        
        <h3>{{ t('privacy_right_to_complain_title') }}</h3>
        <p>{{ t('privacy_right_to_complain_text') }}</p>
        
        <h3>{{ t('privacy_data_portability_title') }}</h3>
        <p>{{ t('privacy_data_portability_text') }}</p>
        
        <h3>{{ t('privacy_right_to_information_title') }}</h3>
        <p>{{ t('privacy_right_to_information_text') }}</p>
      </section>

      <section class="privacy-section">
        <h2>{{ t('privacy_data_collection_website_title') }}</h2>
        
        <h3>{{ t('privacy_cookies_title') }}</h3>
        <p>{{ t('privacy_cookies_text') }}</p>
        
        <h3>{{ t('privacy_server_log_files_title') }}</h3>
        <p>{{ t('privacy_server_log_files_text') }}</p>
        <ul>
          <li>{{ t('privacy_log_browser_type') }}</li>
          <li>{{ t('privacy_log_os') }}</li>
          <li>{{ t('privacy_log_referrer') }}</li>
          <li>{{ t('privacy_log_hostname') }}</li>
          <li>{{ t('privacy_log_access_time') }}</li>
          <li>{{ t('privacy_log_ip') }}</li>
        </ul>
        <p>{{ t('privacy_server_log_legal_basis') }}</p>
        
        <h3>{{ t('privacy_contact_form_title') }}</h3>
        <p>{{ t('privacy_contact_form_text') }}</p>
        
        <h3>{{ t('privacy_registration_title') }}</h3>
        <p>{{ t('privacy_registration_text') }}</p>
      </section>

      <section class="privacy-section">
        <h2>{{ t('privacy_analytics_title') }}</h2>
        <p>{{ t('privacy_analytics_text') }}</p>
      </section>

      <section class="privacy-section">
        <h2>{{ t('privacy_plugins_tools_title') }}</h2>
        
        <h3>{{ t('privacy_fonts_title') }}</h3>
        <p>{{ t('privacy_fonts_text') }}</p>
        
        <h3>{{ t('privacy_maps_title') }}</h3>
        <p>{{ t('privacy_maps_text') }}</p>
      </section>

      <section class="privacy-section">
        <h2>{{ t('privacy_your_rights_title') }}</h2>
        <p>{{ t('privacy_your_rights_text') }}</p>
        <ul>
          <li><strong>{{ t('privacy_right_access') }}</strong>: {{ t('privacy_right_access_text') }}</li>
          <li><strong>{{ t('privacy_right_rectification') }}</strong>: {{ t('privacy_right_rectification_text') }}</li>
          <li><strong>{{ t('privacy_right_erasure') }}</strong>: {{ t('privacy_right_erasure_text') }}</li>
          <li><strong>{{ t('privacy_right_restriction') }}</strong>: {{ t('privacy_right_restriction_text') }}</li>
          <li><strong>{{ t('privacy_right_data_portability') }}</strong>: {{ t('privacy_right_data_portability_text') }}</li>
          <li><strong>{{ t('privacy_right_object') }}</strong>: {{ t('privacy_right_object_text') }}</li>
          <li><strong>{{ t('privacy_right_complain') }}</strong>: {{ t('privacy_right_complain_text') }}</li>
        </ul>
      </section>

      <section class="privacy-section">
        <p class="privacy-update-info">
          {{ t('privacy_last_updated') }}: {{ lastUpdated }}
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
const phone = import.meta.env.VITE_IMPRINT_PHONE || ''
const email = import.meta.env.VITE_IMPRINT_EMAIL || ''

// Hosting provider information
const hostingProvider = import.meta.env.VITE_PRIVACY_HOSTING_PROVIDER || 'Name des Hosting-Anbieters'
const hostingProviderAddress = import.meta.env.VITE_PRIVACY_HOSTING_PROVIDER_ADDRESS || ''
const hostingProviderCountry = import.meta.env.VITE_PRIVACY_HOSTING_PROVIDER_COUNTRY || ''

// Data protection officer (optional, only for larger organizations)
const dataProtectionOfficer = import.meta.env.VITE_PRIVACY_DPO_NAME
  ? {
      name: import.meta.env.VITE_PRIVACY_DPO_NAME,
      email: import.meta.env.VITE_PRIVACY_DPO_EMAIL || ''
    }
  : null

// Last updated date
const lastUpdated = import.meta.env.VITE_PRIVACY_LAST_UPDATED || new Date().toLocaleDateString('de-DE')
</script>

<style scoped lang="scss">
.privacy-view {
  min-height: 100vh;
  background: var(--card-bg);
  padding: 2rem 1rem;
}

.privacy-container {
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

.privacy-section {
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

.privacy-update-info {
  font-size: 0.9rem;
  color: var(--muted-text);
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
  .privacy-view {
    padding: 1rem 0.5rem;
  }

  .privacy-container {
    padding: 1.5rem;
  }
}
</style>
