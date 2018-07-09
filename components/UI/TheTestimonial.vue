<template>
    <div class="testimonial" v-if="data != null && testimonial.image">
        <img :src="testimonial.image.sizes.medium" alt="name of person">
        <blockquote>
            {{testimonial.text}}
            <span class='author'>
            -- {{testimonial.name}}, {{testimonial.position}}
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
      width: 60px;
      height: 60px;
      object-fit: contain;
      margin: 0 auto;
      margin-bottom: $gap / 2;
    }

    blockquote {
      font-style: italic;
      font-weight: 400;
      border-left: 3px solid #ccc;
      padding-left: $gap / 2;

      span {
        padding-top: $gap / 3;
        display: block;
        font-style: normal;
        font-weight: 600;
      }
    }
  }
</style>
