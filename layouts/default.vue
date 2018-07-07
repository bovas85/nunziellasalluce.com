<template>
  <div class="app">
    <the-nav />
    <div class="app-main">
      <nuxt/>
    </div>
    <the-footer />
  </div>
</template>

<script>
  import TheNav from '@/components/Nav/TheNav'
  import TheFooter from '@/components/Footers/TheFooter'

  export default {
    components: {
      TheNav,
      TheFooter
    }
  }
</script>


<style lang="scss" scoped>
</style>
