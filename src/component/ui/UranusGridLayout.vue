<template>
  <form class="uranus-form-grid">
    <!-- Everything inside comes from the parent via slot -->
    <slot></slot>
  </form>
</template>

<script setup lang="ts">
// No internal state — fully slot-based
</script>

<style scoped>
.uranus-form-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}

/* Column spans */
.col-12 { grid-column: span 12; }
.col-6  { grid-column: span 6; }
.col-4  { grid-column: span 4; }
.col-3  { grid-column: span 3; }

/* Responsive behavior */

/* Tablet */
@media (max-width: 1024px) {
  .col-3 { grid-column: span 6; } /* 25% → 50% */
  .col-4 { grid-column: span 6; } /* 33% → 50% */
}

/* Mobile */
@media (max-width: 768px) {
  .col-3,
  .col-4,
  .col-6 {
    grid-column: span 12; /* everything full width */
  }
}
</style>