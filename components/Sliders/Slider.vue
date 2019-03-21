<template>
  <div class="carousel" v-if="data != null && data.length > 0">
    <div
      ref="Swiper"
      v-swiper:appSwiper="swiperOptions"
    >
      <div class="app-carousel swiper-wrapper">
        <div
          class="swiper-slide"
          :data-swiper-autoplay="swiperOptions.autoplay.delay"
          v-for="item in data"
          :key="item.image.ID"
        >
          <LazyImage
            class="image"
            :hover="false"
            cover
            noBg
            :key="item.image.ID"
            :image="item.image"
            :imageMobile="item.image"
          >
            <!-- <div class="text-section">
              <h3>{{item}}</h3>
              <h4 class="subtitle">{{item.acf.category}}</h4>
            </div>   -->
          </LazyImage>
        </div>
      </div>
      <div class="swiper-pagination"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Slider",
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
        hovering: false,
        currentSlide: 0,
        imageModal: false,
        smallCarousel: false,
        interacting: false,
        hoveredNext: false,
        hoveredPrev: false,
        sliderPosition: 0,
        swiperOptions: {
          initialSlide: 0,
          speed: 600,
          slidesPerView: 1.2,
          centeredSlides: true,
          spaceBetween: 32,
          breakpoints: {
            800: {
              slidesPerView: "auto"
            },
            320: {
              slidesPerView: "auto"
            }
          },
          autoplay: {
            delay: 3000
          },
          disableOnInteraction: true,
          loop: false,
          paginationHide: false,
          pagination: ".swiper-pagination"
        }
      };
    },
    mounted () {
      if (process.client) {
        setTimeout(() => {
          document.querySelector('.swiper-pagination-bullet:first-child').classList.add('swiper-pagination-bullet-active')
        }, 1000)
      }
    },
    components: {
      LazyImage: () => import("@/components/UI/LazyImage")
    }
  };
</script>

<style lang="scss" scoped>
  .swiper-container {
    height: auto !important;
    background: white;
    min-height: 100%;
    overflow: visible;
    margin-left: auto;
    margin-right: auto;
    padding: 0;
    position: relative;
    .prev,
    .next {
      display: none;
      position: absolute;
      cursor: pointer;
      background-image: unset;
      top: 0;
      right: unset;
      font-size: responsive(18px, 22px);
      font-range: 768px 1200px;
      width: 9vw;
      height: 100%;
      bottom: 0;
      z-index: 100;
      justify-content: center;
      align-items: center;
      color: white;

      @include media(md) {
        display: flex;
      }

      @include media(xl) {
        width: 10vw;
      }
    }
    .prev {
      left: -21px;
      @include media(xl) {
        left: -32px;
      }
      opacity: 1;
      background: linear-gradient(
        to left,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.4) 100%
      );
      transition: opacity 0.3s ease-in-out;
    }
    .next {
      left: unset;
      right: -21px;
      @include media(xl) {
        right: -32px;
      }
      opacity: 1;
      background: linear-gradient(
        to right,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.4) 100%
      );
      transition: opacity 0.3s ease-in-out;
    }
  }
  .swiper-wrapper {
    background: white;
    position: static;
  }
  .swiper-pagination {
    bottom: -30px;

  }
  /deep/ .swiper-pagination-bullet {
    box-shadow: 0 0 2px 1px black;
  }
  /deep/ .swiper-pagination-bullet-active {
    background: $primary;
  }
  .swiper-slide {
    cursor: pointer;
    overflow: hidden;
    box-shadow: 0 1px 5px 0 $grey;
    height: 600px;
    position: relative;
    
    @media (max-width: $tablet) {
      width: 80vw !important;
      max-width: 80vw !important;
    }

    @include media(sm) {
      /* width: unset !important;
      max-width: unset !important; */
      height: 600px;
    }
    .lazy-image {
      pointer-events: none;
    }
    .text-section {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      display: flex;
      flex-direction: column;
      text-align: center;
      opacity: 1;
      z-index: 9999;

      .subtitle {
        opacity: 1;
        transform: translateY(0);
        text-transform: uppercase;

        @include media(lg) {
          opacity: 0;
          transform: translateY(500%);
          transition: all 0.4s ease-in-out;
        }

        &--show {
          box-shadow: 0 0 0 1px white;
          border: none;
          outline: none;
          background: transparent;
          color: white;
          cursor: pointer;
          margin: 0 auto;
          margin-top: 50px;
          display: flex;
          align-items: center;
          line-height: 1;
          justify-content: center;
          height: 50px;
          font-weight: 300;
          transition: all 0.4s ease-in-out;
          width: 150px;
          font-size: 13px;

          @include media(md) {
            width: 220px;
            font-size: $font-size;
          }

          &:hover {
            border: none;
            font-weight: 600;
            box-shadow: 0 0 0 2px white;
          }
        }
      }
    }
    &:hover {
      .text-section .subtitle {
        @include media(lg) {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }
    /deep/ img {
      height: 600px;
      @media (min-width: $tablet) {
        height: 600px;
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

      @media (min-width: $tablet) {
        object-fit: contain;
      }

      &:hover {
        z-index: 1;
        transform: scale(1.05);
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
  }
</style>
