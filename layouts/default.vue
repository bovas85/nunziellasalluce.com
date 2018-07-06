<template>
  <div class="app">
    <app-nav></app-nav>
    <div class="app-main">
      <nuxt/>
    </div>
  </div>
</template>

<script>
import AppNav from '@/components/Nav/AppNav'

export default {
  components: {
    AppNav
  }
}
</script>


<style lang="scss">

</style>
