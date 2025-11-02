<template>
  <div class="about-page">
    <div class="about-content">
      <section class="about-layout">
        <!-- Header Section -->
        <article class="about-header uranus-hover-section">
          <h1 class="about-header__title">{{ t('about_title') }}</h1>
          <p class="about-header__subtitle">{{ t('about_subtitle') }}</p>
        </article>

        <!-- Mission Section -->
        <article class="about-mission uranus-hover-section">
          <div class="section-icon">🎭</div>
          <h2 class="section-title">{{ t('about_mission_title') }}</h2>
          <p class="section-text">{{ t('about_mission_text') }}</p>
        </article>

        <!-- Features Section -->
        <article class="about-features uranus-hover-section">
          <h2 class="section-title">{{ t('about_features_title') }}</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">📅</div>
              <h3>{{ t('about_feature_calendar_title') }}</h3>
              <p>{{ t('about_feature_calendar_text') }}</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🏛️</div>
              <h3>{{ t('about_feature_venues_title') }}</h3>
              <p>{{ t('about_feature_venues_text') }}</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">👥</div>
              <h3>{{ t('about_feature_organizers_title') }}</h3>
              <p>{{ t('about_feature_organizers_text') }}</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🌐</div>
              <h3>{{ t('about_feature_multilingual_title') }}</h3>
              <p>{{ t('about_feature_multilingual_text') }}</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">♿</div>
              <h3>{{ t('about_feature_accessibility_title') }}</h3>
              <p>{{ t('about_feature_accessibility_text') }}</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔒</div>
              <h3>{{ t('about_feature_privacy_title') }}</h3>
              <p>{{ t('about_feature_privacy_text') }}</p>
            </div>
          </div>
        </article>

        <!-- Organization Section -->
        <article class="about-organization uranus-hover-section">
          <h2 class="section-title">{{ t('about_organization_title') }}</h2>
          <div class="organization-content">
            <div class="organization-info">
              <h3>{{ organizationName }}</h3>
              <p>{{ t('about_organization_description') }}</p>
              <div class="organization-details">
                <p>
                  <strong>{{ t('about_organization_location') }}:</strong><br>
                  {{ street }}<br>
                  {{ postalCode }} {{ city }}
                </p>
                <p>
                  <strong>{{ t('about_organization_contact') }}:</strong><br>
                  {{ t('imprint_email') }}: <a :href="`mailto:${email}`">{{ email }}</a><br>
                  <template v-if="website">
                    {{ t('imprint_website') }}: <a :href="website" target="_blank" rel="noopener">{{ website }}</a>
                  </template>
                </p>
              </div>
            </div>
          </div>
        </article>

        <!-- Open Source Section -->
        <article class="about-opensource uranus-hover-section">
          <div class="section-icon">💻</div>
          <h2 class="section-title">{{ t('about_open_source_title') }}</h2>
          <p class="section-text">{{ t('about_open_source_text') }}</p>
          <p class="tech-stack">
            <strong>{{ t('about_tech_stack_title') }}:</strong>
            Vue.js 3, TypeScript, Vite, Pinia, Vue Router, Vue i18n, MapLibre GL
          </p>
        </article>

        <!-- Vision Section -->
        <article class="about-vision uranus-hover-section">
          <h2 class="section-title">{{ t('about_vision_title') }}</h2>
          <p class="section-text">{{ t('about_vision_text') }}</p>
          <div class="vision-points">
            <div class="vision-point">
              <span class="vision-icon">✨</span>
              <p>{{ t('about_vision_point_1') }}</p>
            </div>
            <div class="vision-point">
              <span class="vision-icon">🤝</span>
              <p>{{ t('about_vision_point_2') }}</p>
            </div>
            <div class="vision-point">
              <span class="vision-icon">🌍</span>
              <p>{{ t('about_vision_point_3') }}</p>
            </div>
          </div>
        </article>

        <!-- Contact Section -->
        <article class="about-contact uranus-hover-section">
          <h2 class="section-title">{{ t('about_contact_title') }}</h2>
          <p class="section-text">{{ t('about_contact_text') }}</p>
          <div class="contact-actions">
            <a :href="`mailto:${email}`" class="contact-button">
              <span class="button-icon">✉️</span>
              {{ t('about_contact_email') }}
            </a>
            <template v-if="website">
              <a :href="website" target="_blank" rel="noopener" class="contact-button">
                <span class="button-icon">🌐</span>
                {{ t('about_visit_website') }}
              </a>
            </template>
          </div>
        </article>
      </section>

      <!-- Sidebar with version info -->
      <aside class="about-sidebar">
        <div class="version-card uranus-hover-section">
          <h3>{{ t('about_version') }}</h3>
          <p class="version-number">{{ appVersion }}</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

// Load organization data from environment variables
const organizationName = import.meta.env.VITE_IMPRINT_ORGANIZATION_NAME || ''
const street = import.meta.env.VITE_IMPRINT_STREET || ''
const postalCode = import.meta.env.VITE_IMPRINT_POSTAL_CODE || ''
const city = import.meta.env.VITE_IMPRINT_CITY || ''
const email = import.meta.env.VITE_IMPRINT_EMAIL || ''
const website = import.meta.env.VITE_IMPRINT_WEBSITE || ''

// App version
const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'
</script>

<style scoped lang="scss">
.about-page {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 4vw, 1.5rem);
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 4vw, 1.5rem);
}

.about-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(1rem, 4vw, 1.5rem);
}

.about-header {
  background: var(--card-bg);
  border-radius: 24px;
  padding: clamp(2rem, 5vw, 3rem) clamp(1.5rem, 4vw, 2.5rem);
  text-align: center;
}

.about-header__title {
  font-size: clamp(2rem, 4vw, 2.8rem);
  margin: 0 0 1rem 0;
  color: var(--color-text);
}

.about-header__subtitle {
  margin: 0;
  color: var(--muted-text);
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  line-height: 1.6;
}

.about-mission,
.about-features,
.about-organization,
.about-opensource,
.about-vision,
.about-contact {
  background: var(--card-bg);
  border-radius: 24px;
  padding: clamp(1.75rem, 3vw, 2.4rem);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.section-icon {
  font-size: 2.5rem;
  text-align: center;
}

.section-title {
  font-size: clamp(1.5rem, 3vw, 1.8rem);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  text-align: center;
}

.section-text {
  margin: 0;
  color: var(--color-text);
  font-size: 1.05rem;
  line-height: 1.8;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.feature-card {
  background: var(--surface-bg, #f7fafc);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color, #e2e8f0);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
    border-color: var(--accent-primary, #667eea);
  }

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text);
  }

  p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--muted-text);
  }
}

.organization-content {
  margin-top: 1rem;
}

.organization-info {
  background: var(--surface-bg, #f7fafc);
  padding: 1.5rem;
  border-radius: 12px;

  h3 {
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 1rem 0;
  }

  p {
    margin: 0 0 1rem 0;
    line-height: 1.8;
    color: var(--color-text);
  }
}

.organization-details {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;

  p {
    margin: 0;
    color: var(--color-text);

    strong {
      color: var(--color-text);
    }

    a {
      color: var(--accent-primary, #667eea);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.tech-stack {
  background: var(--surface-bg, #f7fafc);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin: 0;
  font-size: 0.95rem;
  text-align: center;
  color: var(--color-text);

  strong {
    color: var(--color-text);
  }
}

.vision-points {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.vision-point {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  background: var(--surface-bg, #f7fafc);
  padding: 1.25rem;
  border-radius: 12px;

  .vision-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  p {
    margin: 0;
    flex: 1;
    line-height: 1.6;
    color: var(--color-text);
  }
}

.contact-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.contact-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-primary, #667eea);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: var(--accent-secondary, #764ba2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .button-icon {
    font-size: 1.25rem;
  }
}

.about-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.version-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: clamp(1.25rem, 3vw, 1.5rem);
  text-align: center;

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--muted-text);
    margin: 0 0 0.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .version-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
  }
}

@media (min-width: 640px) {
  .about-page {
    gap: clamp(1.25rem, 3vw, 2rem);
    padding: 0 clamp(1.5rem, 5vw, 3rem);
  }

  .about-layout {
    gap: clamp(1.25rem, 3vw, 2rem);
  }

  .about-sidebar {
    gap: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .about-page {
    gap: clamp(1.5rem, 3vw, 2.5rem);
    margin: 0 auto;
  }

  .about-content {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: clamp(1.5rem, 3vw, 2rem);
    align-items: start;
  }

  .about-layout {
    gap: clamp(1.5rem, 3vw, 2rem);
  }

  .about-sidebar {
    align-self: stretch;
  }
}

@media (min-width: 1280px) {
  .about-page {
    padding: 0 clamp(2rem, 4vw, 3rem);
  }
}
</style>
