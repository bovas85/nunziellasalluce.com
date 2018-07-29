<template>
  <div class="carousel" v-if="data != null && data.length">
    <div ref="Timeline" v-swiper:blogSwiper="swiperOptions" >
      <div class="app-carousel swiper-wrapper">
        <div class="swiper-slide" v-for="(item, index) in data" :key="index">
          <img src="https://placehold.it/600x600" alt="round" />
        </div>

      </div>
    </div>

    <!-- slider arrows -->
    <div class="prev" :class="{'is-disabled': sliderPosition === 0}"><icon-arrow direction='left' :fill="'black'" name='arrow-left' :width="30" :height="40" /></div>
    <div class="next" :class="{'is-disabled': sliderPosition === data.length - 3}"><icon-arrow direction='right' :fill="'black'" name='arrow-right' :width="30" :height="40" /></div>
  </div>
</template>

<script>
  import IconArrow from '@/components/Icons/IconArrow'

  export default {
    name: 'TheTimeline',
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
          centeredSlides: false,
          spaceBetween: 0,
          autoplay: false,
          loop: false,
          grabCursor: true,
          threshold: 200,
          paginationHide: true,
          pagination: '.swiper-pagination',
          onSlideChangeStart: swiper => {
            this.$root.$emit('swiped', swiper.activeIndex)
          }
        }
      }
    },
    mounted () {
      document.querySelector('.prev').addEventListener(
        'click',
        event => {
          event.preventDefault()
          try {
            this.$refs.Timeline.swiper.slidePrev()
            this.checkIndex()
          } catch (e) {}
        },
        false
      )

      document.querySelector('.next').addEventListener(
        'click',
        event => {
          event.preventDefault()
          try {
            this.$refs.Timeline.swiper.slideNext()
            this.checkIndex()
          } catch (e) {}
        },
        false
      )

      this.$root.$on('swiped', position => {
        this.sliderPosition = position
      })
    },
    components: {
      LazyImage: () => import('@/components/UI/LazyImage'),
      IconArrow
    },
    methods: {
      move (off) {
        let trans = document.querySelector('.swiper-wrapper')
        let val = window
          .getComputedStyle(trans, null)
          .getPropertyValue('transform')
          .split(',')[4]
        if (off) {
          trans.style.transform = `translateX(${val})`
        } else trans.style.transform = `translateX(${val - 300})`
      },
      slideshowLeft () {
        if (this.image > 0) {
          this.image--
          currentIndex()
        }
      },
      slideshowRight () {
        if (this.image < this.data.length - 1) {
          this.image++
          currentIndex()
        }
      },
      checkIndex (index) {
        return this.doubles.indexOf(index) !== -1
      },
      slidingAnimation () {
        // set a slide animation state to prevent accidental clicks
        this.sliding = true
        setTimeout(() => {
          this.sliding = false
        }, 550)
      },
      currentIndex () {
        if (this.$refs.Timeline) {
          return this.$refs.Timeline.swiper
            ? this.$refs.Timeline.swiper.realIndex
            : 0
        } else return false
      }
    }
  }
</script>

<style lang="scss" scoped>
  .swiper-container {
    height: auto !important;
    min-height: 100%;
    overflow: visible;
    margin: 0;
    padding: 0;
    position: relative;
    margin-left: $gap * 3;

    &:after {
      content: '';
      height: 3px;
      background-color: $grey;
      position: absolute;
      top: calc(165px / 2 + 5px);
      left: 5px;
      width: 100%;
    }
  }
  .swiper-wrapper {
  }
  .swiper-slide {
    // cursor: pointer;
    // cursor: -webkit-grab;
    overflow: hidden;
    height: 300px;
    width: 165px;
    position: relative;
    &:last-child {
      background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 1) 30%,
        rgba(255, 255, 255, 1) 100%
      );
    }
    .lazy-image {
      pointer-events: none;
    }
    img {
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
  .prev,
  .next {
    position: absolute;
    cursor: pointer;
    display: block;
    top: 0px;
    right: $gap * 2;
    width: 100px;
    height: $gap;
    display: flex;
    justify-content: center;
    align-items: center;
    color: black;
    transition: opacity 0.3s ease-in-out;

    &.is-disabled {
      opacity: 0;
      pointer-events: none;
      cursor: not-allowed;
    }
  }
  .prev {
    right: $gap * 5;
  }
</style>
