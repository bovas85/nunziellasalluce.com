<template>
  <div class="small-carousel-wrapper">

    <div v-if="images != null" @mouseover="interacting = true" @mouseleave="interacting = false" ref="smallCarousel" v-swiper:mySwiper="swiperOption">
      <div class="swiper-wrapper">

        <div class="swiper-slide" :key="index" v-for="(slide, index) in images">
          <img @click="$root.$emit('smallClicked', index)" :src="getThumb(slide)" />
        </div>
        
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    name: "InnerCarousel",
    props: ["images", "slide"],
    data () {
      return {
        swiperOption: {
          initialSlide: 0,
          slidesPerView: 'auto',
          slidesPerColumn: 1,
          spaceBetween: 5,
          loop: false,
          nextButton: ".small-right",
          prevButton: ".small-left"
        }
      };
    },
    updated () {
      this.swiperOption.initialSlide = this.slide - 3;
    },
    methods: {
      getThumb (slide) {
        if (slide.image.sizes != null) {
          return slide.image.sizes.thumbnail;
        } else return "https://placehold.it/40x40";
      }
    },
    computed: {
      swiper () {
        return this.$refs.smallCarousel.swiper;
      }
    }
  };
</script>

<style lang="scss" scoped>
  .small-carousel-wrapper {
    overflow: hidden;
    height: 100%;
  }
  .swiper-container {
    height: 100% !important;
    min-height: 100%;
    width: 100%;
    overflow: visible;
    margin-left: auto;
    margin-right: auto;
    padding: 0;
    z-index: 0;
  }
  .swiper-wrapper {
    background: transparent;
    display: flex;
    align-items: flex-end;
    transition: transform 1s ease-in-out;
    &.nudged {
      animation: nudge 1s;
      animation-fill-mode: append;
      animation-iteration-count: 1;
    }
  }
  .swiper-slide {
    height: 64px;
    position: relative;
    bottom: 0;
    cursor: pointer;
    max-height: 32px;
    width: 32px;
    max-width: 100% !important;
    transition: all 0.3s ease-in-out;
    img {
      object-fit: cover;
      height: 64px !important;
      width: 100%;
    }
    &:hover {
      max-height: 64px !important;
      width: 64px !important;
      max-width: 120% !important;
      transform: scale(1.1);
    }
  }
  .slider {
    overflow: hidden;
    position: relative;
    height: 100%;
    width: 100%;
    img {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
  }
</style>
