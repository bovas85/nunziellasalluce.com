<template>
  <div class="about" v-if="aboutPage">
    <lazy-image
      class="image"
      :image="aboutPage.about.desktop_image"
      :hover="false"
      position="right"
      positionMobile="right"
      :imageMobile="aboutPage.about.mobile_image"
      home
    />
    <div class="container" v-if="aboutPage">
      <h1>{{ aboutPage.title }}</h1>

      <h3>{{ aboutPage.about.title }}</h3>
      <p>
        {{ aboutPage.about.body }}
      </p>
      <h3>{{ aboutPage.current_job.title }}</h3>
      <p>
        {{ aboutPage.current_job.body }}
      </p>
      <h3>{{ aboutPage.skills.title }}</h3>
      <p>
        {{ aboutPage.skills.body }}
      </p>
      <p>
        <a class="link" target="_blank" href="/cv.pdf">Download my CV</a>
      </p>
    </div>
  </div>
</template>

<script>
import LazyImage from "@/components/UI/LazyImage";
import Config from "~/assets/config";

export default {
  head() {
    return {
      title: "About Me"
    };
  },
  async asyncData({ $http }) {
    const { acf } = await $http.$get(Config.wpDomain + Config.api.aboutPage);
    return { aboutPage: acf };
  },
  components: {
    LazyImage
  }
};
</script>

<style lang="scss" scoped>
.about {
  position: relative;
  min-height: 100vh;
  min-height: calc(100vh - 178px);
  background-color: #91754d;
  z-index: 1;

  a {
    color: white;
    text-decoration: underline;
    transition: color 0.3s ease-in-out;
    z-index: 1;

    &:hover {
      color: $primary;
      text-decoration: underline;
    }
  }

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
    padding-top: $gap * 4;
    @include size(h1);
  }

  h3 {
    color: white;
  }

  p {
    color: black;
    max-width: 568px;
    @include size(h3);
    margin-bottom: $gap;

    @include media(md) {
      margin-bottom: 0;
    }
  }
}
</style>
