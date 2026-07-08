<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="#f4a261" :height="4" :throttle="0" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
