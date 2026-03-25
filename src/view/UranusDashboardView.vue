<!--
  UranusDashboardView.vue
-->
<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero
        :title="t('dashboard_hero')"
        :subtitle="t('dashboard_hero_description')"
    />

    <UranusDashboardNotifications />

    <section class="chart-card">
      <h2>Monatsumsatz &ndash; Standard</h2>
      <p class="subtitle">Standard-Theme (CSS Custom Properties)</p>
      <UranusLineChart :data="chartData" />
    </section>

  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import UranusDashboardHero from "@/component/dashboard/UranusDashboardHero.vue"
import UranusDashboardNotifications from '@/component/dashboard/UranusDashboardNotifications.vue'
import UranusLineChart from '@/component/chart/UranusLineChart.vue'

const { t } = useI18n()

const chartData = {
  x_axis: 'Monat',
  y_axis: 'Amount',
  show_x_label: true,
  show_y_label: true,
  show_grid:    true,
  values: [
    { pos: 1,  label: 'Jan', value: 102 },
    { pos: 2,  label: 'Feb', value: 209 },
    { pos: 3,  label: 'Mar', value: 98  },
    { pos: 4,  label: 'Apr', value: 175 },
    { pos: 5,  label: 'Mai', value: 234 },
    { pos: 6,  label: 'Jun', value: 187 },
    { pos: 7,  label: 'Jul', value: 310 },
    { pos: 8,  label: 'Aug', value: 265 },
    { pos: 9,  label: 'Sep', value: 198 },
    { pos: 10, label: 'Okt', value: 241 },
    { pos: 11, label: 'Nov', value: 179 },
    { pos: 12, label: 'Dez', value: 322 },
  ],
}

</script>