<template>
  <div class="home-carousel">

    <div @mouseover="interacting = true" @mouseleave="interacting = false" ref="homeCarousel" v-swiper:mySwiper="swiperOption">
      <div class="swiper-wrapper" v-if="images != null">
          <div class="swiper-slide" :key="index" v-for="(slide, index) in images" v-if="slide != null">

            <transition name="fadeIn" mode="out-in">
              <img 
                v-if="index > limit && !slide.acf.header.image"
                :src="slide.acf.header.image ? slide.acf.header.image.sizes.thumbnail : ''"
                class="blurry"
                v-show="slide.acf.header.image"
                :class="{'animate-out': $store.state.lazyloaded}"
                :alt="slide.acf.header.image.alt"
              >
              <lazy-image 
                v-else
                :home="true"
                noPlaceHolder
                :destination="index === 0 ? false : true"
                :style="`z-index: ${100 - index}`"
                :image="slide.acf.header.image"
              ></lazy-image>
            </transition>
            

            <div class="destination-text is-flex-column">
              <nuxt-link class="is-flex-colum" :to="slide.slug">
                <h1 class="destination-title" v-html="slide.title.rendered"></h1>
                <h2 class="destination-subtitle">
                  {{ slide.acf.block_1.title.toLowerCase() }}
                </h2>
                <h2 class="destination-body">
                  {{ slide.acf.slider_intro ? slide.acf.slider_intro : capitalizeFirstLetter(slide.acf.block_1.body.toLowerCase()) }}
                </h2>
                <div
                  v-if="slide.slug != null && slide.acf.block_1.button != null"
                  class="destination-cta"
                >
                  {{ slide.acf.block_1.button.body || 'Explore Destination' }}
                </div>
              </nuxt-link>
            </div>
          </div>
      </div>
    </div>

      <div class="left" :class="{'animated': imageModal}">
        <div class="side-navi navi-left" @click="slideshowLeft()">
          <div class="side-navi-inner">
            <span>
              <p class="side-navi-inner-text">Previous</p>
            </span>
          </div>
        </div>
      </div>

      <div class="right" :class="{'animated': imageModal}">
        <div class="side-navi navi-right" @click="slideshowRight()">
          <div class="side-navi-inner">
            <span>
              <p class="side-navi-inner-text">Next</p>
            </span>
          </div>
        </div>
      </div>

  </div>
</template>

<script>
  import LazyImage from "@/components/UI/LazyImage";
  function getRandomInt (max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  export default {
    name: "HomeSlider",
    props: ["images", "slide", "limit"],
    data () {
      return {
        imageModal: false,
        swiperOption: {
          initialSlide: getRandomInt(this.images.length),
          slidesPerView: 1,
          lazy: true,
          loop: true,
          spaceBetween: 0,
          nextButton: ".navi-right",
          prevButton: ".navi-left",
          onSlideChangeStart: swiper => {
            this.$root.$emit("swiped", swiper.realIndex);
          }
        }
      };
    },
    components: {
      LazyImage
    },
    mounted () {
      setTimeout(() => {
        this.imageModal = true;
      }, 2000);
    },
    methods: {
      slideshowLeft () {
        if (this.image > 0) {
          this.image--;
        }
      },
      slideshowRight () {
        if (this.image < this.$store.state.destination - 1) {
          this.image++;
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  .swiper-container {
    height: 500px !important;
    min-height: 500px;
    overflow: visible;
    margin-left: auto;
    margin-right: auto;
    padding: 0;
    z-index: 0;
    @media (min-width: $tablet) {
      height: 100vh !important;
      min-height: 100vh;
    }
  }
  .swiper-wrapper {
    background: white;
    transition: transform 1s ease-in-out;
    &.nudged {
      animation: nudge 1s;
      animation-fill-mode: append;
      animation-iteration-count: 1;
    }
  }
  .swiper-slide {
    height: 500px;
    max-width: 100% !important;
    position: relative;
    overflow: hidden;
    @media (min-width: $tablet) {
      height: 100vh;
    }
    .destination-text {
      position: absolute;
      top: 50%;
      width: 90%;
      width: calc(100% - 30px);
      z-index: 200;
      left: 50%;
      transform: translate(-50%, -50%);
      @media (min-width: $tablet) {
        max-width: 551px;
      }
      a {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        &:hover {
          .destination-cta:before {
            max-width: 100%;
          }
        }
      }
    }
    .destination-title {
      font-size: responsive 42px 60px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      opacity: 0.45;
      line-height: 35px;
      letter-spacing: 1.8px;
      text-transform: uppercase;
      text-align: center;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.24);
      @media (min-width: $tablet) {
        font-size: 130px;
        line-height: .8;
        opacity: 0.4;
        letter-spacing: 3.9px;
      }
    }
    .destination-subtitle {
      font-size: 32px;
      font-style: normal;
      font-weight: 500;
      font-stretch: normal;
      line-height: 0.94;
      letter-spacing: normal;
      text-transform: capitalize;
      text-align: center;
      color: white;
      margin-top: 9px;
      margin-bottom: 20px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      @media (min-width: $tablet) {
        font-size: 40px;
        margin-top: -20px;
        line-height: 0.94;
      }
    }
    .destination-body {
      display: none;
      @media (min-width: $tablet) {
        display: block;
        font-size: 16px;
        font-weight: 400;
        font-style: normal;
        font-stretch: normal;
        line-height: 1.5;
        letter-spacing: 0.2px;
        text-align: center;
        color: white;
      }
    }
    .destination-cta {
      font-size: 14px;
      font-style: normal;
      font-stretch: normal;
      line-height: 0.86;
      font-weight: bold;
      letter-spacing: 0.7px;
      text-align: center;
      display: inline-flex;
      margin: 0 auto;
      color: white;
      position: relative;
      margin-top: 35px;
      text-align: center;
      margin-bottom: 15px;
      &:before {
        position: absolute;
        content: "";
        bottom: -15px;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        max-width: 26px;
        height: 2px;
        background: white;
        border-radius: 1px;
        border: none;
        transition: max-width 0.6s ease-in-out;
      }
      &:hover {
        &:before {
          max-width: 100%;
        }
      }
      @media (min-width: $tablet) {
        font-size: 16px;
        line-height: 1;
        letter-spacing: 0.6px;
      }
    }
    img {
      height: 100% !important;
      width: 100% !important;
      object-fit: cover;
      object-position: center;
    }
  }
  .swiper-button-disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }
  .slider {
    overflow: hidden;
    position: relative;
    height: 500px;
    width: 100%;
    @media (min-width: $tablet) {
      height: 100vh;
    }
    img {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 500px;
      object-fit: cover;
      object-position: center;
      @media (min-width: $tablet) {
        height: 100vh;
      }
    }
  }

  .close {
    position: absolute;
    cursor: pointer;
    top: 20px;
    right: 20px;
    z-index: 9999;
    color: white;
    width: 24px;
    height: 24px;
  }
  .counter {
    position: absolute;
    cursor: pointer;
    bottom: 20px;
    left: 20px;
    color: white;
    width: 50px;
    height: 24px;
  }
  .left,
  .right {
    position: absolute;
    top: 90%;
    transform: translateY(-50%);
    transition: transform 0.3s ease-in-out 0.3s;
    color: white;
    transition: all 0.6s ease-in-out 0.4s;
    display: none;
    @media (min-width: $tablet) {
      display: block;
      top: 50%;
    }
  }
  .left {
    left: -100%;
    &.animated {
      left: 0;
    }
  }
  .right {
    right: -100%;
    &.animated {
      right: 0;
    }
  }
  p {
    color: white;
    font-size: 14px;
    font-weight: 400;
  }

  .side-navi {
    position: fixed;
    bottom: 23px;
    height: 46px;
    color: white;
    cursor: pointer;
    z-index: 500;
    @media (min-width: $tablet) {
      margin: auto 0;
      top: 0;
      bottom: 0;
      z-index: inherit;
      transition: all 0.3s ease-out;
    }
    &.navi-left {
      left: 0;
      .side-navi-inner {
        margin-left: 42px;
        @media (min-width: $tablet) {
          margin-left: 25px;
        }
        @media (min-width: $desktop) {
          margin-left: 100px;
        }
      }
      &:after {
        left: 0;
      }

      &.hide {
        left: -300px;
      }
    }

    &.navi-right {
      right: 0;
      .side-navi-inner {
        margin-right: 25px;
        @media (min-width: $tablet) {
          margin-right: 25px;
        }
        @media (min-width: $desktop) {
          margin-right: 100px;
        }
      }
      &:after {
        right: 0;
      }

      &.hide {
        right: -300px;
      }
    }

    .side-navi-inner {
      position: relative;
      line-height: 46px;
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      text-align: center;
      transition: all 0.4s ease-out;

      &:before,
      &:after {
        transition: all 0.3s ease-out;
        width: 0px;
        height: 2px;
        content: "";
        display: block;
        position: absolute;
        background-color: #ffffff;
        transition-delay: 0.2s;
        opacity: 0;
      }

      span {
        display: block;
        width: 128px;
        height: 46px;

        &:before,
        &:after {
          content: "";
          width: 2px;
          height: 0;
          position: absolute;
          transition: all 0.3s ease-out;
          background: #fff;
          transition-delay: 0s;
        }

        &:before {
          left: 0;
          top: 0;
        }

        &:after {
          right: 0;
          bottom: 0;
        }
      }

      &:before {
        right: 0;
        top: 0;
      }

      &:after {
        left: 0;
        bottom: 0;
      }

      .side-navi-inner-text {
        display: block;
        width: 116px;
        height: 36px;
        position: relative;
        line-height: 36px;
        top: 5px;
        left: 6px;
        margin: 0;
        padding: 0;
        letter-spacing: 1.17px;
        transition: all 0.3s ease-out;
      }
    }

    &:hover {
      .side-navi-inner:before,
      .side-navi-inner:after {
        width: 100%;
        transition-delay: 0s;
        opacity: 1;
      }
      .side-navi-inner span:before,
      .side-navi-inner span:after {
        height: 100%;
        transition-delay: 0.2s;
      }
      .side-navi-inner .side-navi-inner-text {
        background-color: rgba(198, 202, 205, 0.3);
        border: 1px solid #c6cacd;
      }
      &:after {
        width: 24px;
        @media (min-width: $tablet) {
          width: 24px;
        }
        @media (min-width: $desktop) {
          width: 100px;
        }
      }
    }

    &:after {
      width: 60px;
      height: 2px;
      content: "";
      background-color: #ffffff;
      display: inline-block;
      position: absolute;
      top: 23px;
      transition: all 0.3s ease-out;
    }

    @media (min-width: $tablet) {
      &:after {
        width: 43px;
      }
    }

    @media (min-width: $desktop) {
      &:after {
        width: 115px;
      }
    }
  }
</style>
