<template>
  <div class="page-not-found">
    <div class="container is-gapless">
      <div class="col--6-tablet">
        <h1>We cannot seem to find the page you are looking for</h1>
        <p>Go back to homepage?</p>
        <ul>
          <li><nuxt-link class="button" to="/">Homepage</nuxt-link></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    head () {
      return {
        title: 'Page not Found'
      }
    },
    mounted () {
      this.$router.replace('/')
    }
  }
</script>

<style lang="scss" scoped>
  .page-not-found {
    padding: $gap 0 $gap * 2;
    @media (min-width: $tablet) {
      padding: $gap * 4 0;
    }
    h1 {
      letter-spacing: 1.5px;
      text-align: left;
    }
    p,
    a {
      text-align: left;
      margin-top: $gap;
    }
    a {
      &:hover {
        // color: $secondary;
      }
    }
    ul {
      margin-top: $gap;
      li {
        margin-bottom: $gap / 1.5;
      }
    }
  }
</style>


