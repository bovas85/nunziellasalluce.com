<template>
  <div class="site-root">
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="#f4a261" :height="4" :throttle="0" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style lang="scss">
.site-root {
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow-x: clip;
  overflow-x: hidden;
}
</style>
