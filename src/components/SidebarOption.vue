<template>
  <div
      class="sidebar-option"
      :class="{ active: active }"
      @click="handleClick"
  >
    <span v-if="option.icon" class="icon">{{ option.icon }}</span>
    <span class="label">{{ t(option.label) }}</span>
  </div>
</template>


<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { SidebarOption as Option } from '@/types/types'
import {useI18n} from "vue-i18n";

const { t } = useI18n()

const props = defineProps<{
  option: Option
  active?: boolean
}>()

const emit = defineEmits<{ (e: 'change', id: string): void }>()

function handleClick() {
  emit('change', props.option.id)
}
</script>


<style scoped>
  .sidebar-option {
    padding: 10px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .sidebar-option:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .sidebar-option.active {
    background-color: rgba(0, 0, 0, 0.1);
    font-weight: bold;
  }
</style>