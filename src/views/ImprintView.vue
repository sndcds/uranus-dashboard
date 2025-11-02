<template>
  <div class="imprint-view">
    <div class="imprint-container">
      <h1>{{ t('imprint_title') }}</h1>

      <section class="imprint-section">
        <h2>{{ t('imprint_provider_title') }}</h2>
        <p>
          <strong>{{ organizationName }}</strong><br>
          {{ street }}<br>
          {{ postalCode }} {{ city }}<br>
          {{ country }}
        </p>
      </section>

      <section class="imprint-section">
        <h2>{{ t('imprint_contact_title') }}</h2>
        <p>
          {{ t('imprint_phone') }}: <a :href="`tel:${phone}`">{{ phone }}</a><br>
          {{ t('imprint_email') }}: <a :href="`mailto:${email}`">{{ email }}</a><br>
          <template v-if="website">
            {{ t('imprint_website') }}: <a :href="website" target="_blank" rel="noopener">{{ website }}</a>
          </template>
        </p>
      </section>

      <section class="imprint-section" v-if="representedBy">
        <h2>{{ t('imprint_represented_by_title') }}</h2>
        <p>{{ representedBy }}</p>
      </section>

      <section class="imprint-section" v-if="registerEntry">
        <h2>{{ t('imprint_register_title') }}</h2>
        <p>
          {{ t('imprint_register_court') }}: {{ registerEntry.court }}<br>
          {{ t('imprint_register_number') }}: {{ registerEntry.number }}
        </p>
      </section>

      <section class="imprint-section" v-if="vatId">
        <h2>{{ t('imprint_vat_title') }}</h2>
        <p>
          {{ t('imprint_vat_id') }}: {{ vatId }}
        </p>
      </section>

      <section class="imprint-section" v-if="responsibleForContent">
        <h2>{{ t('imprint_responsible_content_title') }}</h2>
        <p class="imprint-small-text">{{ t('imprint_responsible_content_subtitle') }}</p>
        <p>
          {{ responsibleForContent.name }}<br>
          {{ responsibleForContent.address }}<br>
          {{ responsibleForContent.postalCode }} {{ responsibleForContent.city }}
        </p>
      </section>

      <section class="imprint-section">
        <h2>{{ t('imprint_disclaimer_title') }}</h2>
        
        <h3>{{ t('imprint_liability_content_title') }}</h3>
        <p>{{ t('imprint_liability_content_text') }}</p>

        <h3>{{ t('imprint_liability_links_title') }}</h3>
        <p>{{ t('imprint_liability_links_text') }}</p>

        <h3>{{ t('imprint_copyright_title') }}</h3>
        <p>{{ t('imprint_copyright_text') }}</p>
      </section>

      <section class="imprint-section">
        <h2>{{ t('imprint_dispute_resolution_title') }}</h2>
        <p>{{ t('imprint_dispute_resolution_text') }}</p>
        <p>
          {{ t('imprint_odr_platform') }}: 
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener">
            https://ec.europa.eu/consumers/odr/
          </a>
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

// Load imprint data from environment variables
const organizationName = import.meta.env.VITE_IMPRINT_ORGANIZATION_NAME || ''
const street = import.meta.env.VITE_IMPRINT_STREET || ''
const postalCode = import.meta.env.VITE_IMPRINT_POSTAL_CODE || ''
const city = import.meta.env.VITE_IMPRINT_CITY || ''
const country = import.meta.env.VITE_IMPRINT_COUNTRY || ''
const phone = import.meta.env.VITE_IMPRINT_PHONE || ''
const email = import.meta.env.VITE_IMPRINT_EMAIL || ''
const website = import.meta.env.VITE_IMPRINT_WEBSITE || ''

// Legal representative
const representedBy = import.meta.env.VITE_IMPRINT_REPRESENTED_BY || ''

// Register entry (optional, only for registered companies)
const registerEntry = import.meta.env.VITE_IMPRINT_REGISTER_COURT && import.meta.env.VITE_IMPRINT_REGISTER_NUMBER
  ? {
      court: import.meta.env.VITE_IMPRINT_REGISTER_COURT,
      number: import.meta.env.VITE_IMPRINT_REGISTER_NUMBER
    }
  : null

// VAT ID (if available)
const vatId = import.meta.env.VITE_IMPRINT_VAT_ID || ''

// Responsible for content according to § 55 Abs. 2 RStV
const responsibleForContent = import.meta.env.VITE_IMPRINT_CONTENT_RESPONSIBLE_NAME
  ? {
      name: import.meta.env.VITE_IMPRINT_CONTENT_RESPONSIBLE_NAME,
      address: import.meta.env.VITE_IMPRINT_CONTENT_RESPONSIBLE_ADDRESS || '',
      postalCode: import.meta.env.VITE_IMPRINT_CONTENT_RESPONSIBLE_POSTAL_CODE || '',
      city: import.meta.env.VITE_IMPRINT_CONTENT_RESPONSIBLE_CITY || ''
    }
  : null
</script>

<style scoped lang="scss">
.imprint-view {
  min-height: 100vh;
  background: var(--card-bg);
  padding: 2rem 1rem;
}

.imprint-container {
  max-width: 800px;
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

.imprint-section {
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

.imprint-small-text {
  font-size: 0.9rem;
  color: var(--muted-text);
  font-style: italic;
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
  .imprint-view {
    padding: 1rem 0.5rem;
  }

  .imprint-container {
    padding: 1.5rem;
  }
}
</style>
