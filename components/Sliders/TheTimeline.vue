<template>
  <div class="carousel" v-if="data != null && data.length">
    <div ref="Timeline" v-swiper:blogSwiper="swiperOptions">
      <div class="app-carousel swiper-wrapper">
        <div class="swiper-slide" v-for="(item, index) in data" :key="index">
          <span class="circle" :style="{background: item.background}">
            <h3>{{item.title}}</h3>
          </span>
          <p>{{item.body}}</p>
        </div>
      </div>
    </div>

    <!-- slider arrows -->
    <div class="prev" :class="{'is-disabled': sliderPosition === 0}">
      <icon-arrow direction="left" :fill="'black'" name="arrow-left" :width="30" :height="40"/>
    </div>
    <div class="next" :class="{'is-disabled': sliderPosition === data.length - responsiveNumber}">
      <icon-arrow direction="right" :fill="'black'" name="arrow-right" :width="30" :height="40"/>
    </div>
  </div>
</template>

<script>
  import Vue from "vue";
  import LazyImage from "@/components/UI/LazyImage";
  import IconArrow from "@/components/Icons/IconArrow";
  import VueAwesomeSwiper from "vue-awesome-swiper/ssr";
  Vue.use(VueAwesomeSwiper);

  export default {
    name: "TheTimeline",
    props: {
      data: {
        type: Array
      }
    },
    data () {
      return {
        sliding: false,
        left: false,
        sliderPosition: 0,
        right: true,
        swiperOptions: {
          initialSlide: 0,
          slidesPerView: 3,
          breakpoints: {
            1024: {
              slidesPerView: 3
            },
            640: {
              slidesPerView: 2
            },
            480: {
              slidesPerView: 1
            }
          },
          centeredSlides: false,
          spaceBetween: 0,
          autoplay: false,
          loop: false,
          grabCursor: true,
          threshold: 60,
          paginationHide: true,
          pagination: ".swiper-pagination",
          onSlideChangeStart: swiper => {
            this.$root.$emit("swiped", swiper.activeIndex);
          }
        }
      };
    },
    mounted () {
      document.querySelector(".prev").addEventListener(
        "click",
        event => {
          event.preventDefault();
          try {
            this.$refs.Timeline.swiper.slidePrev();
            this.checkIndex();
          } catch (e) {}
        },
        false
      );

      document.querySelector(".next").addEventListener(
        "click",
        event => {
          event.preventDefault();
          try {
            this.$refs.Timeline.swiper.slideNext();
            this.checkIndex();
          } catch (e) {}
        },
        false
      );

      this.$root.$on("swiped", position => {
        this.sliderPosition = position;
      });
    },
    components: {
      LazyImage,
      IconArrow
    },
    methods: {
      checkIndex (index) {
        return this.doubles.indexOf(index) !== -1;
      }
    },
    computed: {
      responsiveNumber () {
        if (process.browser) {
          if (this.$store.state.window < 481) {
            return 1;
          } else return 3;
        } else return 3;
      }
    }
  };
</script>

<style lang="scss" scoped>
  .swiper-container {
    height: auto !important;
    min-height: 100%;
    overflow: visible;
    margin: 0;
    padding: 0;
    position: relative;
    margin-left: $gap / 2;

    @include media(md) {
      margin-left: $gap * 3;
    }

    &:after {
      content: "";
      height: 2px;
      background-color: $grey;
      position: absolute;
      top: calc(165px / 2 + 5px);
      left: 5px;
      width: 100%;
    }
  }
  .swiper-slide {
    overflow: hidden;
    min-height: 320px;
    height: 100%;
    width: 165px;
    position: relative;

    &:last-child {
      width: 1000px !important;
      background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 1) 15%,
        rgba(255, 255, 255, 1) 100%
      );
    }
    .lazy-image {
      pointer-events: none;
    }
    .circle {
      background: $lightgrey;
      display: flex;
      justify-content: center;
      text-transform: uppercase;
      color: white;
      align-items: center;
      height: 165px;
      width: 165px;
      position: absolute;
      z-index: 9999;
      top: 5px;
      left: 5px;
      border-radius: 100%;
      object-fit: cover;
      object-position: center;
      backface-visibility: hidden;
      z-index: 0;
      margin: 0 auto;
      will-change: transform;
      box-shadow: 0 0 5px 1px white;
      border: 0 solid transparent;
      transition: transform 0.3s ease-in-out;

      &:hover {
        z-index: 1;
        transform: scale(1.05);
      }

      h3 {
        font-weight: 600;
      }
    }
    .image {
      position: relative;
      height: 100%;
      .text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 24px;
      }
    }
    p {
      margin-top: 200px;
      max-width: 230px;
      padding-right: $gap / 1.5;
    }
  }
  .prev,
  .next {
    position: absolute;
    cursor: pointer;
    display: block;
    top: -100px;
    right: -$gap;
    width: 100px;
    height: $gap;
    display: flex;
    justify-content: center;
    align-items: center;
    color: black;
    transition: opacity 0.3s ease-in-out;

    @include media(md) {
      top: -160px;
      right: $gap * 2;
    }

    &.is-disabled {
      opacity: 0;
      pointer-events: none;
      cursor: not-allowed;
    }
  }
  .prev {
    right: $gap * 2;

    @include media(md) {
      right: $gap * 5;
    }
  }
</style>
