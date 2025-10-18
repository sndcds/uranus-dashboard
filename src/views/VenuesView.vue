<template>
  <div class="dashboard-container">
    <h1>{{ t('venues') }}</h1>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="cards">
      <div class="card" v-for="event in events" :key="event.id">
        <h2>{{ event.name }}</h2>
        <p><strong>ID:</strong> {{ event.id }}</p>
        <p><strong>Organizer:</strong> {{ event.organizer_id }}</p>
        <p><strong>Location:</strong> {{ event.city }}, {{ event.postal_code }}, {{ event.country_code }}</p>
      </div>
    </div>

  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiFetch } from '../api'
import {useI18n} from "vue-i18n";

const { t } = useI18n()

interface EventItem {
  id: number
  name: string
  organizer_id: number
  city: string
  postal_code: string
  country_code: string
}

const events = ref<EventItem[]>([])
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const data = await apiFetch<{ events: EventItem[] }>(
        '/api/user?mode=venues'
    )
    events.value = data.events || []
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'data' in err) {
      const e = err as { data?: { error?: string } }
      error.value = e.data?.error || 'Failed to load dashboard'
    } else {
      error.value = 'Unknown error'
    }
  }
})
</script>


<style scoped lang="scss">
.dashboard-container {
  // Grow naturally, no fixed height, no scroll
}

.error {
  color: red;
  margin-bottom: 16px;
}

.cards {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));

  .card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 16px;
    background-color: #fafafa;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      // transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    h2 {
      margin-top: 0;
      margin-bottom: 8px;
      font-size: 1.2rem;
    }
  }
}
</style>