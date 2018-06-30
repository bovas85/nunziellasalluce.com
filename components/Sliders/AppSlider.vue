<template>
  <div class="slider">
    <div ref="carousel" v-swiper:appSlider="swiperOption">
      <div class="swiper-wrapper">
        <div class="swiper-slide" v-for="(sentence, index) in sentences" :key="index">
          <p>{{ sentence.text }}</p>
        </div>
        
      </div>
      <a><i class="swiper-button-next fa fa-arrow-right"></i></a>
        <a><i class="swiper-button-prev fa fa-arrow-left"></i></a>
    </div>
  </div>
</template>



<script>
  export default {
    name: "AppSlider",
    props: {
      sentences: {
        type: Array
      }
    },
    data () {
      return {
        swiperOption: {
          initialSlide: 0,
          slidesPerView: 1,
          autoHeight: true,
          nextButton: ".swiper-button-next",
          prevButton: ".swiper-button-prev",
          loop: true
        }
      };
    }
  };
</script>

<style lang="scss" scoped>
  .slider {
    position: relative;
    height: 100%;
    background: white;
    .swiper-button-next,
    .swiper-button-prev {
      background: none !important;
      margin-top: 0;
      color: #2d2d33;
      font-size: 22px;
      transform: translateY(-50%);
      height: 100%;
      &:before {
        position: absolute;
        top: 50%;
        width: 27px;
        transform: translateY(-50%);
      }
    }
    .swiper-button-next {
      right: 5px;
      @media (max-width: $mobile) {
        right: -10px;
      }
      &:before {
        left: 0;
      }
    }
    .swiper-button-prev {
      left: 5px;
      @media (max-width: $mobile) {
        left: -10px;
      }
      &:before {
        right: 0;
      }
    }
  }
  .swiper-wrapper {
    align-items: center;
  }
  .swiper-container {
    width: calc(100% - 80px) !important;
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    @media (min-width: $fullhd) {
      width: 1200px !important;
    }
    .swiper-slide {
      width: 100%;
      p {
        font-size: 14px;
        letter-spacing: 0.5px;
        text-align: center;
        color: #414141;
        max-width: 240px;
        margin: 0 auto;
        @include line-clamp(4, 1.86);
        line-height: 1.86;
        @media (min-width: $tablet) {
          max-width: 570px;
        }
      }
    }
  }
</style>
