<template>
  <div class="about" v-if="page">
    <lazy-image
      class='image'
      :image="page.who_i_am.image"
      :hover="false"
      :imageMobile="page.who_i_am.image"
      home
    />
    <div class="container">
      <h1>WHO I AM</h1>

      <h3>About</h3>
      <p>
        Mobile Applications Interface Web User Interfaces User Experience Design Mobile Applications Interface Web User 
      </p>
      <h3>Current Job</h3>
      <p>
        Currently working with good people and pushing pixels at Caspian Media in London
      </p>
      <h3>Skills</h3>
      <p>
        Currently working with good people and pushing pixels at Caspian Media in London
      </p>
    </div>
  </div>
</template>

<script>
  import LazyImage from '@/components/UI/LazyImage'
  export default {
    components: {
      LazyImage
    },
    computed: {
      page () {
        return this.$store.state.homePage.acf
      }
    }
  }
</script>

<style lang="scss" scoped>
  .about {
    position: relative;
    min-height: 100vh;
    min-height: calc(100vh - 178px);

    .container {
      padding: 0 $gap $gap * 3;

      @include media(lg) {
        padding: 0;
        padding-bottom: $gap * 3;
      }
    }

    .image {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
    }

    h1 {
      color: white;
      text-transform: uppercase;
      font-weight: 600;
    }

    p {
      color: black;
      max-width: 568px;
      @include size(h3);
    }

    h1 {
      padding-top: $gap * 4;
      @include size(h1);
    }

    h3 {
      color: white;
    }
  }
</style>
