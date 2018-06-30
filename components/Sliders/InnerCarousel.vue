<template>
  <!-- this is the small bottom carousel -->
  <div class="inner-carousel">

    <div @mouseover="interacting = true" @mouseleave="interacting = false" ref="innerCarousel" v-swiper:mySwiper="swiperOption">
      <div class="swiper-wrapper">

        <div class="swiper-slide" :key="index" v-for="(slide, index) in images">
          <responsive-image :hover="false" :sources="slide.image"></responsive-image>
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
          loop: true,
          slidesPerView: "auto",
          centeredSlides: true,
          spaceBetween: 0,
          nextButton: ".navi-right",
          prevButton: ".navi-left",
          onSlideChangeStart: swiper => {
            this.$root.$emit(
              "carouselClick",
              swiper.loopedSlides,
              swiper.activeIndex
            );
          }
        }
      };
    },
    components: {
      LazyImage: () => import("@/components/UI/LazyImage"),
      ResponsiveImage: () => import("@/components/UI/ResponsiveImage")
    },
    updated () {
      this.swiperOption.initialSlide = this.slide;
    },
    watch: {
      slide () {
        try {
          this.swiper.slideTo(this.slide, 0, false);
        } catch (e) {}
      }
    },
    mounted () {
      this.$root.$on("carouselClick", (loopedSlides, activeIndex) => {
        try {
          // console.log('slide is ', (activeIndex - loopedSlides))
          this.swiper.slideTo(activeIndex, 0, false);
        } catch (e) {}
      });
      this.$root.$on("smallClicked", index => {
        try {
          this.swiper.slideTo(index, 1000, false);
        } catch (e) {}
      });
    },
    computed: {
      swiper () {
        return this.$refs.innerCarousel.swiper;
      }
    }
  };
</script>

<style lang="scss" scoped>
  .swiper-container {
    height: 100% !important;
    // background: white;
    min-height: 100%;
    overflow: visible;
    margin-left: auto;
    margin-right: auto;
    padding: 0;
    z-index: 0;
  }
  .swiper-wrapper {
    background: white;
    transition: transform 0s ease-in-out;
    &.nudged {
      animation: nudge 1s;
      animation-fill-mode: append;
      animation-iteration-count: 1;
    }
  }
  .swiper-slide {
    height: 100%;
    max-width: 100vw !important;
    width: 100vw !important;
    img {
      height: 100% !important;
      width: 100vw !important;
      max-width: 100vw !important;
      object-fit: contain;
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
      object-fit: contain;
      object-position: center;
    }
  }
</style>
