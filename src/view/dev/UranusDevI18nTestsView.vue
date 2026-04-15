<template>
  <div class="inspector">
    <h1>Uranus I18n Tests</h1>

    <section>
      <h2>Replacements</h2>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>one_of_n</td>
            <td>{{ uranusStringInterpolate(t('one_of_n'), { n: 7, m: 13 }) }}</td>
          </tr>
          <tr>
            <td>in_n_days</td>
            <td>{{ uranusStringInterpolate(t('in_n_days'), { n: 6 }) }}</td>
          </tr>
          <tr>
            <td>in_n_days</td>
            <td>{{ uranusStringInterpolate(t('n_days_ago'), { n: 3 }) }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { uranusStringInterpolate } from '@/util/UranusStringUtils.ts'

const { t } = useI18n()

t('venue')
</script>

<style scoped lang="scss">
.inspector {
  padding: 2rem;
  max-width: 1440px;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 24px;
  border-radius: var(--uranus-card-border-radius);
  background: var(--uranus-bg);

  &.card {
    background: var(--uranus-card-bg);
  }
  &.navigation {
    background: var(--uranus-nav-bg);
  }
}

section {
  border: var(--uranus-card-border);
  border-radius: var(--uranus-card-border-radius);
  padding: 1rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

h2 {
  margin-top: 24px;
  margin-bottom: 16px;
}

table {
  border-collapse: collapse;
}

td, th {
  padding: 0.5rem;
  border: 1px solid var(--uranus-color-5);
}

th { text-align: left;}
</style>