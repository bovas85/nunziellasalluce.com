<template>
    <div class="testimonial" v-if="testimonial != null">
        <img :src="testimonial.image ? testimonial.image.sizes.medium : 'https://placehold.it/200x200'" :alt="testimonial.image.alt">
        <blockquote>
            {{testimonial.body}}
            <span class='author'>
              {{testimonial.name}}
            </span>
        </blockquote>
    </div>
</template>

<script>
  export default {
    name: 'TheTestimonial',
    props: {
      testimonial: {
        type: Object
      }
    }
  }
</script>

<style lang="scss" scoped>
  .testimonial {
    display: flex;
    flex-direction: column;
    flex-basis: calc(33.3333% - 16px);
    padding: $gap 0;

    img {
      border-radius: 100%;
      width: 130px;
      height: 130px;
      object-fit: cover;
      object-position: center;
      margin: 0 auto;
      margin-bottom: $gap / 2;
    }

    blockquote {
      margin: 0 auto;
      text-align: center;
      font-size: responsive(18px, 22px);
      font-weight: 600;
      margin-top: 60px;
      padding: 0 $gap;

      @include media(sm) {
        padding: 0;
        max-width: 540px;
        min-width: 540px;
        min-height: 324px;
      }

      @include media(md) {
        padding: 0;
        max-width: 700px;
        min-width: 700px;
        min-height: 312px;
      }

      @include media(lg) {
        padding: 0;
        max-width: 740px;
        min-width: 740px;
      }

      span {
        padding-top: $gap * 1.5;
        display: block;
        color: $subtitle;
        font-style: normal;
        font-weight: 800;
      }
    }
  }
</style>
