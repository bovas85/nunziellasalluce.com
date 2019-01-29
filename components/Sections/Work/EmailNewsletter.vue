<template>
  <section class="email-newsletter step" v-if="project != null && project.newsletter != null">
    <div class="container">
      <h1 class="title" :class="{'animated': animateEmail}">{{newsletter.title}}</h1>
      <LazyImage
        v-if="newsletter.image_right != null && newsletter.image_right.url"
        class="image image--right"
        :class="{'animated': animateEmail}"
        :hover="false"
        :image="newsletter.image_right"
        :imageMobile="newsletter.image_right"
      />
      <LazyImage
        v-if="newsletter.image_left != null && newsletter.image_left.url"
        class="image image--left"
        :class="{'animated': animateEmail}"
        :hover="false"
        :image="newsletter.image_left"
        :imageMobile="newsletter.image_left"
      />
      <!-- title for next section is here to respect grid -->
      <h1 class="title title--bottom" :class="{'animated': animateEmail}">Digital Infographics</h1>
      <!-- <h1 class="title title--bottom" :class="{'animated': animateEmail}">{{projects.infographics.title}}</h1> -->
    </div>
  </section>
</template>

<script>
  export default {
    name: "EmailNewsletter",
    props: ["project", "animateEmail"],
    components: {
      LazyImage: () => import("@/components/UI/LazyImage")
    },
    computed: {
      newsletter () {
        return this.project.newsletter || null;
      }
    }
  };
</script>

<style lang="scss" scoped>
  .email-newsletter {
    display: flex;
    margin-top: 0;

    .container {
      display: flex;
      flex-direction: column;
      justify-content: center;

      @include media(lg) {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 300px 2fr 1fr;
        grid-gap: $gap;
        justify-items: center;
      }
    }

    .title {
      max-width: 405px;
      padding: 0;
      @include fadeInUp;
      transition-delay: 0.2s;
      margin-bottom: $gap * 1.5;

      @include media(lg) {
        margin-bottom: 0;
        grid-row: 1;
        justify-self: left;
        align-self: center;
      }

      &--bottom {
        margin-bottom: 0;
        margin-top: $gap * 1.5;
        @include media(lg) {
          grid-row: 3 / -1;
          grid-column: 2;
          align-self: end;
          transition-delay: 1.4s;
        }
      }
    }

    .title,
    .image {
      grid-column: span 1;
    }

    .image {
      height: 100%;

      &--right {
        grid-column: 2;
        grid-row: 1 / 3;
        @include fadeInUp;
        transition-delay: 0.6s;
      }
      &--left {
        @include fadeInUp;
        transition-delay: 1s;

        @include media(md) {
          margin-bottom: $gap;
          margin-bottom: 0;
          grid-column: 1;
          grid-row: 2 / -1;
        }
      }
    }
  }
</style>