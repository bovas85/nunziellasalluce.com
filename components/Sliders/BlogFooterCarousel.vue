<template>
  <div class="mobile-carousel">
    
    <div @mouseover="hovering = true" @mouseleave="hovering = false" ref="blogCarousel" v-swiper:blogSwiper="swiperOption" >
      <div 
        class="journal-carousel swiper-wrapper" 
        :class="{'hover-animation': hovering, 'hover-leave': !hovering}"
      >
        <div v-if="item != null" class="swiper-slide" v-for="(item, index) in data" :key="index">
          <lazy-image 
            :link="item.slug"
            :title="item.title.rendered"
            :type="'post'"
            onHover
            hoverFixed
            :image="item.acf.header.image"
          ></lazy-image>
        </div>
        
      </div>
      <!-- slider arrows -->
      <div class="prev"></div>
      <div class="next"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "BlogFooterCarousel",
    props: {
      data: {
        type: Array
      },
      location: {
        type: String,
        default: ""
      }
    },
    components: {
      LazyImage: () => import("@/components/UI/LazyImage")
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
        nudged: false,
        nudgedVal: 0,
        swiperOption: {
          initialSlide: 0,
          slidesPerView: "auto",
          centeredSlides: false,
          spaceBetween: 16,
          autoplay: false,
          loop: false,
          paginationHide: true
        }
      };
    },
    methods: {},
    updated () {},
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
  .mobile-carousel {
    position: relative;
    overflow: hidden;
    top: 30%;
    left: 0;
  }
  .swiper-container {
    height: auto !important;
    background: transparent;
    min-height: 100%;
    overflow: visible;
    margin-left: auto;
    margin-right: auto;
    padding: 0;
    position: relative;
    .prev,
    .next {
      display: none;
    }
  }
  .swiper-wrapper {
    background: transparent;
  }
  .swiper-slide {
    cursor: pointer;
    overflow: hidden;
    width: 280px !important;
    max-width: 80vw !important;
    box-shadow: 0 1px 5px 0 $grey;
    height: 159px;
    &:first-child {
      margin-left: 16px;
    }
    @media (min-width: $mobile-large) {
      width: 60vw !important;
      max-width: 80vw !important;
    }
    @media (min-width: $tablet) {
      height: 159px;
    }
    img {
      height: 159px;
      @media (min-width: $tablet) {
        height: 159px;
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
