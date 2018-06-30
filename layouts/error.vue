<template>
  <div class="page-not-found">
    <div class="container is-gapless">
      <div class="col--6-tablet">
        <h1>We cannot seem to find the page you are looking for</h1>
        <p>Here are some useful links:</p>
        <ul>
          <li><a class="button button--main" href="/">Homepage</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    head () {
      return {
        title: "Page not Found"
      };
    },
    mounted () {
      this.$router.replace('/')
    }
  };
</script>

<style lang="scss" scoped>
  .page-not-found {
    background: $secondary;
    padding: $gap 0 $gap * 2;
    @media (min-width: $tablet) {
      padding: $gap * 4 0;
    }
    h1 {
      font-size: 44px;
      font-weight: 500;
      line-height: 1.25;
      letter-spacing: 1.5px;
      text-align: left;
      color: white;
    }
    p,
    a {
      font-size: 18px;
      line-height: 1.5;
      text-align: left;
      color: white;
      margin-top: $gap;
    }
    a {
      &:hover {
        color: $secondary;
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


