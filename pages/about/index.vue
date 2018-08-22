<template>
  <div class="about" v-if="page && aboutPage">
    <lazy-image
      class='image'
      :image="page.who_i_am.image"
      :hover="false"
      position="right"
      positionMobile="right"
      :imageMobile="page.who_i_am.image"
      home
    />
    <div class="container" v-if="aboutPage">
      <h1>{{aboutPage.title}}</h1>

      <h3>{{aboutPage.about.title}}</h3>
      <p>
        {{aboutPage.about.body}}
      </p>
      <h3>{{aboutPage.current_job.title}}</h3>
      <p>
        {{aboutPage.current_job.body}}
      </p>
      <h3>{{aboutPage.skills.title}}</h3>
      <p>
        {{aboutPage.skills.body}}
      </p>
    </div>
  </div>
</template>

<script>
  import LazyImage from '@/components/UI/LazyImage'
  import Config from '~/assets/config'

  export default {
    async asyncData ({ $axios }) {
      const { data } = await $axios.get(Config.wpDomain + Config.api.aboutPage)
      return { aboutPage: data.acf }
    },
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
