<!--
  UranusEditEventDates.vue
-->
<template>
  <div v-for="(date, index) in draft.eventDates" :key="index">
    <UranusEditEventDate
      v-model="draft.eventDates[index]!">
    </UranusEditEventDate>
  </div>
</template>


<script setup lang="ts">
import {ref, reactive, computed, inject, type Ref, onMounted} from 'vue'
import {useI18n} from "vue-i18n";

import {
  type UranusEventDate,
  type UranusEventDetail,
  type UranusEventType,
  uranusSortEventTypes
} from "@/models/UranusEventModel.ts";
import UranusEditEventDate from "@/components/event/UranusEditEventDate.vue";

const { t } = useI18n({ useScope: 'global' })

const event = inject<Ref<UranusEventDetail | null>>('event')
const eventId = computed(() => event?.value?.eventId)

const draft = reactive({
  eventDates: event?.value?.eventDates
      ? [...event.value.eventDates].sort(sortEventDates)
      : []
})

onMounted(() => {
})

function sortEventDates(a: UranusEventDate, b: UranusEventDate) {
  const aDate = new Date(`${a.startDate}T${a.startTime || '00:00'}`);
  const bDate = new Date(`${b.startDate}T${b.startTime || '00:00'}`);
  return aDate.getTime() - bDate.getTime();
}

</script>
