<template>
  <div class="content-only-layout">
    <!-- Main content only -->
    <main class="content-only-layout__main">
      <router-view />
    </main>
  </div>
</template>

<style scoped lang="scss">
.content-only-layout {
  overflow-y: auto;
  box-sizing: border-box;
  min-height: 100%;
  height: 100vh;
  background: var(--uranus-bg);
}

/* Main content wrapper */
.content-only-layout__main {
  box-sizing: border-box;
  width: 100%;
  background: var(--uranus-bg);
  padding: 0;
  max-width: 100%;
  height: 100vh;
}

/* Optional zero padding mode */
.zero-padding {
  padding: 0 !important;
}
</style>