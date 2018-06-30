<template>
  <div class="blog-carousel">    
    <div 
      @mouseover="interacting = true" 
      @mouseleave="interacting = false" 
      ref="homeMobileCarousel" 
      v-swiper:blogSwiper="swiperOption"
    >
      <div 
        class="swiper-wrapper" 
        :class="{'nudged': nudged}"
      >
        <div 
          v-if="item.acf.header != null" 
          class="swiper-slide" 
          v-for="(item, index) in data" 
          :key="index"
        >
          <lazy-image class='image'
            :image="item.acf.header.image"
            :link="item.slug"
            :type="'post'"
          >
            <span 
              class="text-below"
              v-html="item.title.rendered"
            ></span>
          </lazy-image>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "HomeMobileSlider",
    props: {
      data: {
        type: Array
      }
    },
    data () {
      return {
        sliding: false,
        left: false,
        right: true,
        image: 0,
        currentSlide: 0,
        imageModal: false,
        smallCarousel: false,
        interacting: false,
        hoveredNext: false,
        hoveredPrev: false,
        sliderPosition: 0,
        nudged: false,
        nudgedVal: 0,
        swiperOption: {
          initialSlide: 1,
          loopedSlides: this.data.length - 1,
          slidesPerView: "auto",
          spaceBetween: 15,
          speed: 200,
          autoplay: false,
          loop: true,
          paginationHide: true,
          pagination: ".swiper-pagination"
        }
      };
    },
    components: {
      LazyImage: () => import("@/components/UI/LazyImage")
    },
    methods: {
      // nudge () {
      //   let trans = document.querySelector(".swiper-wrapper")
      //   if (trans) {
      //     setTimeout(() => {
      //       if (this.nudged) {
      //         return false;
      //       }
      //       this.nudged = true;
      //       this.blogSwiper.slideNext()
      //     }, 2000);
      //     setTimeout(() => {
      //       this.nudged = false;
      //     }, 2300);
      //   } else {
      //     // restart if dom not ready
      //     setTimeout(() => {
      //       this.nudge();
      //     }, 1000);
      //   }
      // },
      slidingAnimation () {
        // set a slide animation state to prevent accidental clicks
        this.sliding = true;
        setTimeout(() => {
          this.sliding = false;
        }, 550);
      }
    },
    computed: {
      currentIndex: {
        // get current slider index
        cache: false,
        get () {
          if (this.$refs.blogCarousel) {
            return this.$refs.blogCarousel.swiper
              ? this.$refs.blogCarousel.swiper.realIndex
              : 0;
          } else return false;
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  .swiper-container {
    height: auto !important;
    background: #fafafa;
    min-height: 100%;
    overflow: visible;
    margin-left: auto;
    margin-right: auto;
    padding: 0;
  }
  .swiper-wrapper {
    background: #fafafa;
    &.nudged {
      @media (min-width: $desktop) {
        transition: all 1s ease-in-out !important;
      }
    }
  }
  .inner-carousel {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
  }
  .swiper-slide {
    // background: white;
    height: 350px;
    overflow: hidden;
    width: 80vw !important;
    max-width: 80vw !important;
    position: relative;
    .text-below {
      position: absolute;
      font-size: 18px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 1.8px;
      text-align: center;
      color: #2d2d33;
      top: 106%;
      top: calc(100% + 20px);
      @include line-clamp(3, 1.4);
      left: 50%;
      text-align: center;
      text-transform: uppercase;
      z-index: 999999;
      transform: translateX(-50%);
      z-index: 100;
      width: 100%;
    }
    img {
      height: 300px;
      @media (min-width: $tablet) {
        height: 300px;
      }
      width: 100%;
      object-fit: cover;
      object-position: center;
      backface-visibility: hidden;
      z-index: 0;
      cursor: pointer;
      will-change: transform;
      box-shadow: 0 0 5px 1px white;
      border: 0 solid transparent;
      transition: transform 0.3s ease-in-out;
      &:hover {
        z-index: 1;
        transform: scale(1.05);
      }
    }
    .image {
      position: relative;
      height: 270px;
      box-shadow: 0 1px 5px 0 $grey;
      .text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 24px;
      }
    }
  }
  .cancel-icon {
    position: absolute;
    cursor: pointer;
    top: 20px;
    right: 20px;
    color: white;
    display: block;
    cursor: pointer;
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2218%22%20height%3D%2218%22%20viewBox%3D%220%200%2018%2018%22%3E%20%20%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%20transform%3D%22translate%281%201%29%22%3E%20%20%20%20%3Ccircle%20cx%3D%228%22%20cy%3D%228%22%20r%3D%228%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%221%22%2F%3E%20%20%20%20%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M8.21052632%2C7.13871017%20L5.7033951%2C4.63157895%20L5.05263158%2C5.28234246%20L6.56644102%2C6.7961519%20L7.5597628%2C7.78947368%20L5.05263158%2C10.2966049%20L5.7033951%2C10.9473684%20L8.21052632%2C8.4402372%20L10.7176575%2C10.9473684%20L11.3684211%2C10.2966049%20L8.86128983%2C7.78947368%20L11.3684211%2C5.28234246%20L10.7176575%2C4.63157895%20L8.21052632%2C7.13871017%20Z%22%2F%3E%20%20%3C%2Fg%3E%3C%2Fsvg%3E");
    background-repeat: no-repeat;
    background-size: contain;
    width: 24px;
    height: 24px;
    @media (min-width: $tablet) {
      width: 32px;
      height: 30px;
    }
  }
  .image-modal {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: -1;
    background: $secondary;
    transition: all 0.3s ease-in-out;
    &.is-active {
      position: fixed;
      opacity: 1;
      z-index: 9999;
    }
    .close {
      position: absolute;
      cursor: pointer;
      top: 20px;
      right: 20px;
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
      top: 50%;
      transform: translateY(-50%);
      transition: transform 0.3s ease-in-out 0.3s;
      color: white;
      transition: all 0.6s ease-in-out 0.4s;
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
    .middle-slider {
      color: white;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
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
        margin-left: 25px;
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
