<template>
    <section class="uranus-dashboard-action-bar">
        <slot>
            <!-- Default content if no slot is provided -->
            <p>No actions defined.</p>
        </slot>
    </section>
</template>

<script setup>
// No props needed here; content comes from slot
</script>

<style scoped>
.dashboard-action-area {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 16px;
    background-color: var(--uranus-bg-color-d2);
    border-radius: 8px;
    align-items: flex-start;
}
</style>