<template>
    <div class="testimonial" v-if="data != null && testimonial.image">
        <img :src="testimonial.image.sizes.medium" alt="name of person">
        <blockquote>
            {{testimonial.text}}
            <span class='author'>
              {{testimonial.name}}, {{testimonial.position}}
            </span>
        </blockquote>
    </div>
</template>

<script>
  export default {
    name: 'TheTestimonial',
    props: {
      data: {
        type: Object
      }
    },
    computed: {
      testimonial () {
        if (!this.data || this.data == null) return false
        return this.data.acf
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
      object-fit: contain;
      margin: 0 auto;
      margin-bottom: $gap / 2;
    }

    blockquote {
      margin: 0 auto;
      text-align: center;
      font-size: 26px;
      font-weight: 600;
      margin-top: 60px;
      padding: 0 $gap;

      @include media(sm) {
        padding: 0;
        max-width: 540px;
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
