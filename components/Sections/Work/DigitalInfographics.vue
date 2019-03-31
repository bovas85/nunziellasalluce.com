<template>
  <section class="digital-infographics step" v-if="project != null && project.infographics != null">
    <div class="container is-flex">
      <!-- title in EmailNewsletter -->
      <LazyImage
        v-if="infographics.image_top != null && infographics.image_top.url"
        class="image image--top"
        :class="{'animated': animateDigital}"
        :hover="false"
        :image="infographics.image_top"
        :imageMobile="infographics.image_top"
      />
      <LazyImage
        v-if="infographics.image_bottom != null && infographics.image_bottom.url"
        class="image image--bottom"
        :class="{'animated': animateDigital}"
        :hover="false"
        :image="infographics.image_bottom"
        :imageMobile="infographics.image_bottom"
      />
    </div>
  </section>
</template>

<script>
  import LazyImage from '@/components/UI/LazyImage'
  export default {
    name: "DigitalInfographics",
    props: ["project", "animateDigital"],
    components: {
      LazyImage
    },
    computed: {
      infographics () {
        return this.project.infographics || null;
      }
    }
  };
</script>

<style lang="scss" scoped>
  .digital-infographics {
    display: flex;

    .container {
      flex-direction: column;
      justify-content: space-between;
    }

    .image {
      @include fadeInUp;

      @include media(md) {
        max-width: 80%;
      }

      &:not(:last-child) {
        margin-bottom: $gap;
      }

      &--top {
        align-self: flex-end;
        transition-delay: 0.4s;
      }
      &--bottom {
        align-self: flex-start;
        transition-delay: 0.8s;
      }
    }
  }
</style>