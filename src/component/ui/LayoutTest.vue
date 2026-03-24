<template>
  <UranusGridLayout>

    <UranusFormCol :span="12">
      <UranusInput
          id="title"
          v-model="form.title"
          label="Title"
          placeholder="Event title"
      />
    </UranusFormCol>

    <UranusFormCol :span="6">
      <UranusInput
          id="city"
          v-model="form.city"
          label="City"
      />
    </UranusFormCol>

    <UranusFormCol :span="6">
      <UranusInput
          id="country"
          v-model="form.country"
          label="Country"
      />
    </UranusFormCol>

    <UranusFormCol :span="4">
        <UranusInput
        id="startDate"
        v-model="form.startDate"
        label="Start Date"
        type="date"
        />
    </UranusFormCol>

    <UranusFormCol :span="4">
      <UranusInput
          id="endData"
          v-model="form.endDate"
          label="End Date"
          type="date"
      />
    </UranusFormCol>

    <UranusFormCol :span="4">
      <UranusInput
          id="time"
          v-model="form.time"
          label="Time"
          type="time"
      />
    </UranusFormCol>

    <UranusFormCol :span="3">
      <UranusInput
          id="price"
          v-model="form.price"
          label="Price"
          type="number"
      />
    </UranusFormCol>

    <UranusFormCol :span="3">
      <UranusInput
          id="currency"
          v-model="form.currency"
          label="Currency"
      />
    </UranusFormCol>

    <UranusFormCol :span="3">
      <UranusInput
          id="capacity"
          v-model="form.capacity"
          label="Capacity"
      />
    </UranusFormCol>

    <UranusFormCol :span="3">
      <UranusInput
          id="age"
          v-model="form.age"
          label="Age Limit"
      />
    </UranusFormCol>

    <UranusFormCol :span="12">
      <UranusInput
          id="description"
          v-model="form.description"
          label="Description"
          required
      />
    </UranusFormCol>

  </UranusGridLayout>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import  UranusInput from '@/component/ui/UranusInput.vue'
import UranusGridLayout from "@/component/ui/UranusGridLayout.vue";
import UranusFormCol from "@/component/ui/UranusFormCol.vue";

const form = reactive({
  title: 'Summer Jazz Festival 2026',
  city: 'Hamburg',
  country: 'Germany',

  startDate: '2026-07-15',
  endDate: '2026-07-18',
  time: '18:30',

  price: '25',
  currency: 'EUR',
  capacity: '500',
  age: '16+',

  description: `Enjoy four days of live jazz music featuring international artists,
open-air stages, food trucks, and workshops for all ages.`
})
</script>

