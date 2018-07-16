<template>
  <div class="carousel" v-if="data != null && data.length">

    <div @mouseover="hovering = true" @mouseleave="hovering = false" ref="Carousel" v-swiper:blogSwiper="swiperOption" >
      <div class="app-carousel swiper-wrapper">
        <div class="swiper-slide" v-for="(item, index) in data" :key="index">
          <lazy-image class='image'
            v-if="item.acf.image"
            :hover="false"
            :image="item.acf.image"
            :imageMobile="item.acf.image_mobile"
            :link="false"
          ></lazy-image>
          <div class="text-section">
            <h2>{{item.acf.title}}</h2>
            <h3 class="subtitle">{{item.acf.intro}}</h3>
          </div>
        </div>

      </div>
      <!-- slider arrows -->
      <div class="prev">Prev</div>
      <div class="next">Next</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'TheCarousel',
    props: {
      data: {
        type: Array
      },
      location: {
        type: String,
        default: ''
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
        nudged: false,
        nudgedVal: 0,
        swiperOption: {
          initialSlide: 1,
          // loopedSlides: this.data.length + 1,
          slidesPerView: 'auto',
          centeredSlides: true,
          // freeMode: true,
          spaceBetween: 32,
          // speed: 200,
          autoplay: false,
          loop: true,
          // autoHeight: true,
          paginationHide: false,
          pagination: '.swiper-pagination'
        }
      }
    },
    mounted () {
      // this.imageModal = false;
      // this.$root.$on("smallClicked", (activeIndex) => {
      //   this.image = activeIndex;
      // });

      // this.$root.$on("carouselClick", (loopedSlides, activeIndex) => {
      //   // console.log((activeIndex - loopedSlides) - 1);
      //   this.image = (activeIndex - loopedSlides) - 1;
      // });

      // hack to click the duplicated sliders

      // document.querySelector(".app-carousel").addEventListener("click", event => {
      //     event.preventDefault();
      //     try {
      //       if (event.target.currentSrc != null) {
      //         // console.log('img', event)
      //         this.$root.$emit("clicked", event.target.currentSrc);
      //       } else if (event.target.currentSrc == null) {
      //         // console.log('lazy', event)
      //         this.$root.$emit(
      //           "clicked",
      //           event.toElement.children[0].children[0].children[0].attributes.src
      //             .value
      //         );
      //       }
      //     } catch (e) {}
      // })

      document.querySelector('.prev').addEventListener(
        'click',
        event => {
          event.preventDefault()
          try {
            this.$refs.Carousel.swiper.slidePrev()
          } catch (e) {}
        },
        false
      )

      document.querySelector('.next').addEventListener(
        'click',
        event => {
          event.preventDefault()
          try {
            this.$refs.Carousel.swiper.slideNext()
          } catch (e) {}
        },
        false
      )

      // this.$root.$on("clicked", index => {
      //   let found = this.data.findIndex(function (element) {
      //     if (element.image) {
      //       return element.image.sizes.large === index;
      //     }
      //   });
      //   this.image = found;
      //   this.currentSlide = found;
      //   this.$emit("openCarousel", true);
      // });

      // this.$root.$on("clicked", index => {
      //   var found = this.data.findIndex(function (element) {
      //     return (
      //       element.image.sizes.medium === index ||
      //       element.image.sizes.small === index ||
      //       element.image.sizes.large === index ||
      //       element.image.sizes.ultra === index
      //     );
      //   });
      //   if (found > -1) {
      //     this.image = found - 1;
      //     this.currentSlide = found;
      //     this.offset = window.pageYOffset;
      //     this.$emit("openCarousel", true);
      //   }
      // });

      // setTimeout(() => {
      //   this.$on("openCarousel", click => {
      //     if (click) {
      //       this.openCarousel(this.image);
      //     } else if (!click) {
      //       this.closeCarousel();
      //     }
      //   });
      // }, 1000);

      // if (process.browser) {
      //   document.addEventListener("keyup", event => {
      //     if (event != null) {
      //       if (
      //         event.key === "Escape" ||
      //         event.code === "Escape" ||
      //         event.keyCode === 27
      //       ) {
      //         // escape key listener
      //         this.closeCarousel();
      //       }
      //     }
      //   });
      // }
    },
    components: {
      // InnerCarousel: () => import("@/components/Sliders/InnerCarousel"),
      // SmallCarousel: () => import("@/components/Sliders/SmallCarousel"),
      LazyImage: () => import('@/components/UI/LazyImage')
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
      nudge () {
        // let trans = document.querySelector(".swiper-wrapper");
        // if (trans) {
        //   setTimeout(() => {
        //     if (this.nudged) {
        //       return false;
        //     }
        //     this.nudged = true;
        //     try {
        //       this.blogSwiper.slideNext();
        //     } catch (e) {}
        //   }, 2000);
        //   setTimeout(() => {
        //     this.nudged = false;
        //   }, 2300);
        // } else {
        //   // restart if dom not ready
        //   setTimeout(() => {
        //     this.nudge();
        //   }, 1000);
        // }
      },
      openCarousel (modal) {
        this.$root.$emit('modalOpen')
        this.$store.commit('openModal')
        this.imageModal = true
        // this.image = modal;
        // this.currentSlide = modal;
      },
      closeCarousel () {
        this.$root.$emit('modalClosed')
        this.$store.commit('closeModal')
        this.imageModal = false
        this.image = 0
        this.currentSlide = 0
      },
      openSlide (slide) {
        // console.log("openSlide", slide);
        this.$emit('clicked', slide)
      },
      toggleSmallCarousel () {
        this.smallCarousel = !this.smallCarousel
      },
      slideshowLeft () {
        if (this.image > 0) {
          this.image--
        }
      },
      slideshowRight () {
        if (this.image < this.data.length - 1) {
          this.image++
        }
      },
      checkIndex (index) {
        // console.log("index", index);
        // console.log(this.doubles.indexOf(index) !== -1);
        return this.doubles.indexOf(index) !== -1
      },
      slidingAnimation () {
        // set a slide animation state to prevent accidental clicks
        this.sliding = true
        setTimeout(() => {
          this.sliding = false
        }, 550)
      },
      goToimage (image) {
        if (this.sliding) {
          // check animation state here
          return false
        }
        this.$root.$router.push(image.acf.link.url)
      },
      bindImage (image) {
        if (image.acf.image) {
          return `${image.acf.image.url} 500w, ${image.acf.image.url} 1024w, ${
            image.acf.image.url
          } 1100w`
        } else {
          return `https://placehold.it/1280x500 1100w`
        }
      },
      bindBackground (image) {
        return {
          'background-image': `url('${image.image.url}')`
        }
      }
    },
    updated () {
      if (this.currentIndex === 0) {
        this.sliderPosition = 0
      } else if (this.currentIndex === 1) {
        this.sliderPosition = '100%'
      } else {
        this.sliderPosition = 100 * this.currentIndex + '%'
      }
    },
    computed: {
      transformVal () {
        if (process.browser) {
          let trans = document.querySelector('.swiper-wrapper')
          return window
            .getComputedStyle(trans, null)
            .getPropertyValue('transform')
            .split(',')[4]
        } else return false
      },
      currentIndex: {
        // get current slider index
        cache: false,
        get () {
          if (this.$refs.Carousel) {
            return this.$refs.Carousel.swiper
              ? this.$refs.Carousel.swiper.realIndex
              : 0
          } else return false
        }
      }
    }
  }
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
      display: block;
      position: absolute;
      cursor: pointer;
      background-image: unset;
      top: 0;
      right: unset;
      width: 11vw;
      height: 100%;
      bottom: 0;
      z-index: 100;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
    }
    .prev {
      left: -32px;
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
      right: -32px;
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

    &.nudged {
      @media (min-width: $desktop) {
        transition: all 1s ease-in-out !important;
      }
    }
    &.hover-animation {
      animation: nudgeLeft 0.6s ease-in-out;
      animation-fill-mode: both !important;
    }
    &.hover-leave {
      animation: nudgeRight 0.6s ease-in-out;
      animation-fill-mode: both !important;
    }
  }
  .inner-carousel {
    position: absolute;
    overflow: hidden;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
  }
  .swiper-slide {
    cursor: pointer;
    cursor: -webkit-grab;
    overflow: hidden;
    width: 80vw !important;
    max-width: 80vw !important;
    box-shadow: 0 1px 5px 0 $grey;
    height: 300px;
    position: relative;
    @media (min-width: $tablet) {
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
      z-index: 1;

      .subtitle {
        opacity: 1;
        transform: translateY(0);

        @include media(lg) {
          opacity: 0;
          transform: translateY(500%);
          transition: all 0.4s ease-in-out;
        }
      }
    }
    &:hover {
      .text-section .subtitle {
        opacity: 1;
        transform: translateY(0);
      }
    }
    img {
      height: 300px;
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
