<template>
  <div class="inspector">
    <h1>Uranus Design</h1>

    <!-- Background colors -->
    <section>
      <h2>Background colors</h2>
      <div class="grid background">
        <UranusDevColorSwatch bgVar="--uranus-bg" colorVar="--uranus-color" />
        <UranusDevColorSwatch bgVar="--uranus-bg-d1" colorVar="--uranus-color" />
        <UranusDevColorSwatch bgVar="--uranus-bg-d2" colorVar="--uranus-color" />
        <UranusDevColorSwatch bgVar="--uranus-bg-d3" colorVar="--uranus-color" />
      </div>
    </section>


    <section>
      <h2>Action Button Colors</h2>
      <p>Use case:</p>
      <div class="grid background">
        <UranusDevColorSwatch bgVar="--uranus-action-button-bg" colorVar="--uranus-action-button-color" />
        <UranusDevColorSwatch bgVar="--uranus-action-button-bg-hover" colorVar="--uranus-action-button-color-hover" />
      </div>
    </section>


    <!-- Navigation colors -->
    <section>
      <h2>Navigation State Colors</h2>
      <div class="grid navigation">
        <UranusDevColorSwatch bgVar="--uranus-nav-bg" colorVar="--uranus-nav-color" />
        <UranusDevColorSwatch bgVar="--uranus-nav-bg-hover" colorVar="--uranus-nav-color-hover" />
        <UranusDevColorSwatch bgVar="--uranus-nav-bg-active" colorVar="--uranus-nav-color-active" />
        <UranusDevColorSwatch bgVar="--uranus-nav-bg-active-hover" colorVar="--uranus-nav-color-active-hover" />
      </div>
    </section>

    <!-- Inputs-->
    <section>
      <h2>Dashboard Buttons</h2>
      <div class="grid card">
        <UranusDashboardButton class="" icon="edit">Button</UranusDashboardButton>
        <UranusDashboardButton class="tiny" icon="delete">Tiny Button</UranusDashboardButton>
        <UranusDashboardButton class="active" icon="delete">Active Button</UranusDashboardButton>
      </div>

      <h2>Action Buttons</h2>
      <div class="grid">
        <UranusActionButton @click="">Action Button</UranusActionButton>
        <UranusActionButton
            :to="`/dev-theme-view`"
        >
          Router Link
        </UranusActionButton>
        <UranusActionButton
            type="submit"
            form="formId"
            :loading="true"
        >
          Submit Button Loading ...
        </UranusActionButton>
        <UranusActionButton dimmed>
          Coming Soon
        </UranusActionButton>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import UranusDevColorSwatch from '@/component/dev/UranusDevColorSwatch.vue'
import UranusActionButton from '@/component/ui/UranusActionButton.vue'
import UranusDashboardButton from "@/component/dashboard/UranusDashboardButton.vue";
import {ref} from "vue";

</script>

<style scoped>
.inspector {
  padding: 2rem;
  max-width: 1100px;
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

  &.background {
    background: var(--uranus-bg);
  }
  &.card {
    background: var(--uranus-card-bg);
  }
  &.navigation {
    background: var(--uranus-nav-bg);
  }
}
</style>