<template>
  <div class="inspector">
    <h1>Uranus Design</h1>

    <!-- Uranus Colors -->
    <section>
      <h2>Hues</h2>
      <div class="colors">
        <div class="color-swatch" style="background: var(--uranus-color);"></div>
        <div class="color-swatch" style="background: var(--uranus-color-1);"></div>
        <div class="color-swatch" style="background: var(--uranus-color-2);"></div>
        <div class="color-swatch" style="background: var(--uranus-color-3);"></div>
        <div class="color-swatch" style="background: var(--uranus-color-4);"></div>
        <div class="color-swatch" style="background: var(--uranus-color-5);"></div>
        <div class="color-swatch" style="background: var(--uranus-color-6);"></div>
        <div class="color-swatch" style="background: var(--uranus-color-7);"></div>
        <div class="color-swatch" style="background: var(--uranus-color-8);"></div>
        <div class="color-swatch" style="background: var(--uranus-color-9);"></div>
      </div>
    </section>

    <!-- Colors -->
    <section>
      <h2>Hues</h2>
      <UranusDevHueSamples label="--uranus-hue" size="3rem" hueVar="--uranus-hue" />
      <UranusDevHueSamples label="--uranus-active-hue" size="3rem" hueVar="--uranus-active-hue" />
      <UranusDevHueSamples label="--uranus-link-hue" size="3rem" hueVar="--uranus-link-hue" />
    </section>

    <!-- Background colors -->
    <section>
      <h2>Background colors</h2>
      <div class="grid">
        <UranusDevColorSwatch bgVar="--uranus-bg" colorVar="--uranus-color" />
        <UranusDevColorSwatch bgVar="--uranus-bg-d1" colorVar="--uranus-color" />
        <UranusDevColorSwatch bgVar="--uranus-bg-d2" colorVar="--uranus-color" />
        <UranusDevColorSwatch bgVar="--uranus-bg-d3" colorVar="--uranus-color" />
      </div>
    </section>

    <section>
      <h2>UranusActionButton</h2>
      <div class="grid">
        <UranusButton @click="">Action Button</UranusButton>

        <UranusButton
            :to="`/dev-theme-view`"
        >
          Router Link
        </UranusButton>

        <UranusButton type="submit" form="formId" :loading="true">
          Submit Button Loading ...
        </UranusButton>

        <UranusButton dimmed>
          Coming Soon
        </UranusButton>
      </div>

      <h3>Colors</h3>
      <div class="grid">
        <UranusDevColorSwatch bgVar="--uranus-button-bg" colorVar="--uranus-button-color" />
        <UranusDevColorSwatch bgVar="--uranus-button-bg-hover" colorVar="--uranus-button-color-hover" />
      </div>
    </section>

    <!-- Dashboard Buttons-->
    <section>
      <h2>UranusDashboardButton</h2>
      <div class="grid card">
        <UranusButton class="" icon="edit">Button</UranusButton>
        <UranusButton class="tiny" icon="delete">Tiny Button</UranusButton>
        <UranusButton class="active" icon="delete">Active Button</UranusButton>
      </div>
    </section>

    <!-- Navigation colors -->
    <section>
      <h2>Navigation Colors</h2>
      <div class="grid navigation">
        <UranusDevColorSwatch bgVar="--uranus-nav-bg" colorVar="--uranus-nav-color" />
        <UranusDevColorSwatch bgVar="--uranus-nav-bg-hover" colorVar="--uranus-nav-color-hover" />
        <UranusDevColorSwatch bgVar="--uranus-nav-bg-active" colorVar="--uranus-nav-color-active" />
        <UranusDevColorSwatch bgVar="--uranus-nav-bg-active-hover" colorVar="--uranus-nav-color-active-hover" />
      </div>
    </section>

    <!-- Notifications -->
    <section>
      <h2>Notifications</h2>
      <UranusNotification type="info">
        <template #title>Info</template>
        Info Text ...
        <template #actions>
          <UranusButton @click="" color="primary">Accept</UranusButton>
          <UranusButton @click="" color="secondary">Cancel</UranusButton>
        </template>
      </UranusNotification>

      <UranusNotification type="warning">
        <template #title>Warning</template>
        Warning Text ...
      </UranusNotification>

      <UranusNotification type="error">
        <template #title>Error</template>
        Error Text ...
      </UranusNotification>

    </section>

    <section>
      <UranusFeedback :show="true" type="notice"><h1>Notice</h1>A notice text info box</UranusFeedback>
      <UranusFeedback :show="true" type="success"><h1>Success</h1>A success text info box</UranusFeedback>
      <UranusFeedback :show="true" type="warning"><h1>Warning</h1>A warning text info box</UranusFeedback>
      <UranusFeedback :show="true" type="error"><h1>Error</h1>A error text info box</UranusFeedback>
    </section>

    <section>
      <section class="chart-card">
        <h2>Monatsumsatz &ndash; Standard</h2>
        <p class="subtitle">Standard-Theme (CSS Custom Properties)</p>
        <UranusLineChart :data="chartData" />
      </section>

      <div style="display: flex; gap: 2rem;">

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
      </div>

    </section>
  </div>
</template>

<script setup lang="ts">
import UranusDevColorSwatch from '@/component/dev/UranusDevColorSwatch.vue'
import UranusDevHueSamples from '@/view/dev/UranusDevHueSamples.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusNotification from "@/component/ui/UranusNotification.vue";
import UranusFeedback from "@/component/uranus/UranusFeedback.vue";
import UranusPrioritySelect from "@/component/ui/UranusPrioritySelect.vue";
import UranusSegmentedSelect from "@/component/ui/UranusSegmentedSelect.vue";
import UranusLineChart from "@/component/chart/UranusLineChart.vue";
import {ref} from "vue";
import {BarChart, Calendar, Clock} from "lucide-vue-next";

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

const options = [
  { label: 'Day', value: 'day', icon: Clock },
  { label: 'Week', value: 'week', icon: Calendar },
  { label: 'Month', value: 'month', icon: BarChart }
]

const selected = ref('day')

</script>

<style scoped>
.inspector {
  padding: 2rem;
  max-width: 1440px;
}

h2 {
  margin-top: 24px;
  margin-bottom: 16px;
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

.color-swatch {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 3rem;
  border-radius: 3px;
  aspect-ratio: 1/ 1;
  color: white;
}

.colors {
  display: flex;
  flex-direction: row;
  gap: 4px;
}
</style>