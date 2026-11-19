<template>
  <div class="app">
    <UICookieBox />
    <NavTheNav />

    <slot />

    <FootersTheFooter />
  </div>
</template>

<style lang="scss">
body {
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow-x: clip;
  overflow-x: hidden;
  margin: 0;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow-x: clip;
  overflow-x: hidden;

  footer {
    margin-top: auto;
  }
}
</style>
