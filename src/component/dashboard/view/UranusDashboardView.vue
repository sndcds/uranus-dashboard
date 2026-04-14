<!--
  src/component/dashboard/view/UranusDashboardView.vue
-->

<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero
        :title="t('dashboard_hero')"
        :subtitle="t('dashboard_hero_description')"
    />

    <UranusDashboardEventNotifications />

    <UranusButton :onclick="onClanupPlutoImages">
      Cleanup Pluto Images
    </UranusButton>

    <!-- TODO: Tests
    <section class="chart-card">
      <h2>Monatsumsatz &ndash; Standard</h2>
      <p class="subtitle">Standard-Theme (CSS Custom Properties)</p>
      <UranusLineChart :data="chartData" />
    </section>

    <UranusSegmentedSelect
        v-model="selected"
        :options="options"
        variant="chip"
    />

    <UranusSegmentedSelect
        v-model="selected"
        :options="options"
    />

    <UranusPrioritySelect></UranusPrioritySelect>
    -->

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Calendar, BarChart, Clock } from 'lucide-vue-next'

import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusDashboardEventNotifications from '@/component/dashboard/UranusDashboardEventNotifications.vue'
import UranusLineChart from '@/component/chart/UranusLineChart.vue'
import UranusSegmentedSelect from '@/component/ui/UranusSegmentedSelect.vue'
import UranusPrioritySelect from '@/component/ui/UranusPrioritySelect.vue'
import UranusFeedback from "@/component/uranus/UranusFeedback.vue";
import UranusButton from "@/component/ui/UranusButton.vue";
import {apiFetch} from "@/api.ts";

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

const selected = ref('day')

const options = [
  { label: 'Day', value: 'day', icon: Clock },
  { label: 'Week', value: 'week', icon: Calendar },
  { label: 'Month', value: 'month', icon: BarChart, disabled: true }
]

function onClanupPlutoImages() {
  const apiPath = '/api/admin/image/cleanup'
  const apiResponse = apiFetch<any>(apiPath)
}

</script>