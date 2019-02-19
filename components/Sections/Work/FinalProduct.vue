<template>
  <section class="final-product step" v-if="project.product != null">
    <div class="container">
      <div class="text-section" :class="{'animated': animateFinal}">
        <h1>{{project.product.title}}</h1>
        <p>{{project.product.body}}</p>
      </div>

      <div
        class="image-section step"
        v-for="(content, index) in project.product.the_content"
        :key="index"
      >
        <p>{{content.text}}</p>
        <LazyImage
          v-if="content.image != null"
          class="image"
          :hover="false"
          :image="content.image"
          :imageMobile="content.image"
        />
      </div>
    </div>
    <Slider
      class='slider'
      v-if="project.product.slider && project.product.slider.length"
      :data="project.product.slider"
    />
  </section>
</template>

<script>
  let interval;
  export default {
    name: "FinalProduct",
    props: ["project", "animateFinal"],
    components: {
      LazyImage: () => import("@/components/UI/LazyImage"),
      Slider: () => import("@/components/Sliders/Slider")
    },
    data () {
      return {
        currentSlide: 0
      };
    }
  };
</script>

<style lang="scss" scoped>
  .final-product {
    margin: 0;
    margin-top: 0;
    margin-bottom: $gap - 4px;
    padding: $gap 0;
    overflow: hidden;

    h1 {
      max-width: 150px;
    }

    .container {
      display: flex;
      flex-direction: column;

      @include media(md) {
        display: grid;
      }
      grid-gap: $gap;
    }

    .slider {
      display: block;
      margin: $gap 0;
      padding: $gap 0;
      width: 100vw;
      overflow: hidden;
    }

    .text-section {
      @include fadeInUp;
      margin-bottom: $gap;

      @include media(sm) {
        margin-bottom: 0;
      }

      p {
        max-width: $desktop;
      }
    }

    .image-section {
      display: grid;
      grid-gap: $gap;
      margin-top: $gap;

      @include media(md) {
        margin-top: 0;
      }

      /deep/ img {
        object-fit: cover;
        object-position: center;
        grid-row: span 1;
      }

      &:nth-child(2) {
        @include fadeInUp;
        transition-delay: 0.2s;
      }
      &:nth-child(3) {
        @include fadeInUp;
        transition-delay: 0.4s;
      }
      &:nth-child(n + 1) {
        @include fadeInUp;
        transition-delay: 0.6s;
      }
    }

    .slider-section {
      position: relative;
      width: 100%;
      @include fadeInUp;
      margin: $gap auto;
      height: 50vh;

      @include media(md) {
        height: 70vh;
      }

      .image {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        max-height: 70vh;
        opacity: 0;
        z-index: 0;
        transition: all 0.6s ease-in-out;

        p {
          width: auto;
          margin: 0 auto;
          padding-top: 12px;
          text-align: center;
        }

        &.active {
          opacity: 1;
          z-index: 100;
        }
      }

      .pagination {
        position: absolute;
        bottom: -$gap * 2;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        justify-content: space-around;
        width: auto;
        max-width: 100%;
        margin: 0 auto;

        .bullet {
          background: white;
          border: 1px solid $primary;
          display: block;
          width: 10px;
          height: 10px;
          border-radius: 10px;
          margin: 0 5px;
          transition: border 0.6s ease-in-out;

          &.active {
            background: $primary;
          }
        }
      }
    }
  }
</style>
