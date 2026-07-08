<template>
  <section v-if="project != null && project.infographics != null" class="digital-infographics step">
    <div class="container is-flex">
      <h1 class="title step">{{infographics.title}}</h1>
      
      <UILazyImage
        v-if="infographics.video_top != null"
          class="image image--top2"
          :class="{'animated': animateDigital}"
          :hover="false"
          :video-mobile="infographics.video_top"
          :video-desktop="infographics.video_top"
      />
      <UILazyImage
        v-if="infographics.video_bottom != null"
          class="image image--bottom2"
          :class="{'animated': animateDigital}"
          :hover="false"
          :video-mobile="infographics.video_bottom"
          :video-desktop="infographics.video_bottom"
      />

      <UILazyImage
        v-if="infographics.image_top != null && infographics.image_top.url"
        class="image image--top"
        :class="{'animated': animateDigital}"
        :hover="false"
        :image="infographics.image_top"
        :image-mobile="infographics.image_top"
      />
      <UILazyImage
        v-if="infographics.image_bottom != null && infographics.image_bottom.url"
        class="image image--bottom"
        :class="{'animated': animateDigital}"
        :hover="false"
        :image="infographics.image_bottom"
        :image-mobile="infographics.image_bottom"
      />
    </div>
  </section>
</template>

<script>
    export default {
    name: "DigitalInfographics",
    components: {
          },
    props: ["project", "animateDigital"],
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

      &--top2 {
        align-self: flex-end;
        transition-delay: 1.2s;
      }

      &--bottom2 {
        align-self: flex-start;
        transition-delay: 1.6s;
      }
    }
  }
</style>
