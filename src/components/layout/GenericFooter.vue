<template>
  <!-- Footer -->
  <footer class="generic-layout__footer">
    <div class="generic-layout__footer-container">
      <div class="generic-layout__footer-content">
        <!-- Left side - Copyright and GitHub -->
        <div class="generic-layout__footer-left">
          <span class="generic-layout__footer-text">
            &copy; {{ currentYear }} Uranus
          </span>
          <a
            href="https://github.com/sndcds/uranus-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            class="generic-layout__footer-github"
            :aria-label="t('github_repository')"
          >
            <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
          </a>
          <a href="https://sndcds.github.io/uranus-docs/" target="_blank" rel="noopener noreferrer" class="generic-layout__footer-text">
            {{ t('nav_documentation') }}
          </a>
        </div>

        <!-- Right side - Navigation links -->
        <nav class="generic-layout__footer-nav">
          <router-link to="/imprint" class="generic-layout__footer-link">
            {{ t('nav_imprint') }}
          </router-link>
          <router-link to="/privacy" class="generic-layout__footer-link">
            {{ t('nav_privacy') }}
          </router-link>
          <router-link to="/terms" class="generic-layout__footer-link">
            {{ t('nav_terms_of_use') }}
          </router-link>
        </nav>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped lang="scss">
.generic-layout__footer {
    background: var(--surface-primary);
    border-top: 1px solid var(--border-soft);
    padding: 2rem 1.5rem;
    margin-top: auto;

    @media (max-width: 768px) {
        padding: 1.5rem 1rem;
    }
}

.generic-layout__footer-container {
    margin: 0 auto;
}

.generic-layout__footer-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
}

.generic-layout__footer-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.generic-layout__footer-text {
    font-size: 0.75rem;
    color: var(--uranus-muted-text);
    white-space: nowrap;
}

.generic-layout__footer-github {
    display: flex;
    align-items: center;
    color: var(--uranus-muted-text);
    transition: color 0.2s ease;

    &:hover {
        color: var(--accent-primary);
    }

    svg {
        display: block;
    }
}

.generic-layout__footer-nav {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        gap: 1rem;
        width: 100%;
    }
}

.generic-layout__footer-link {
    font-size: 0.75rem;
    color: var(--accent-primary);
    text-decoration: none;
    font-weight: 500;
    transition: text-decoration 0.2s ease;
    white-space: nowrap;

    &:hover {
        text-decoration: underline;
    }
}
</style>