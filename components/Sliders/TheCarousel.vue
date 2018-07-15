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
      // &:hover {
      //   opacity: 1;
      // }
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
      // &:hover {
      //   opacity: 1;
      // }
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
    // background: white;
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
        opacity: 0;
        transform: translateY(500%);
        transition: all 0.4s ease-in-out;
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
  .cancel-icon {
    position: absolute;
    cursor: pointer;
    top: 20px;
    right: 20px;
    color: white;
    display: block;
    cursor: pointer;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2218%22%20height%3D%2218%22%20viewBox%3D%220%200%2018%2018%22%3E%20%20%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%20transform%3D%22translate%281%201%29%22%3E%20%20%20%20%3Ccircle%20cx%3D%228%22%20cy%3D%228%22%20r%3D%228%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%221%22%2F%3E%20%20%20%20%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M8.21052632%2C7.13871017%20L5.7033951%2C4.63157895%20L5.05263158%2C5.28234246%20L6.56644102%2C6.7961519%20L7.5597628%2C7.78947368%20L5.05263158%2C10.2966049%20L5.7033951%2C10.9473684%20L8.21052632%2C8.4402372%20L10.7176575%2C10.9473684%20L11.3684211%2C10.2966049%20L8.86128983%2C7.78947368%20L11.3684211%2C5.28234246%20L10.7176575%2C4.63157895%20L8.21052632%2C7.13871017%20Z%22%2F%3E%20%20%3C%2Fg%3E%3C%2Fsvg%3E');
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
        content: '';
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
          content: '';
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
      content: '';
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

  .inner-carousel {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
  }
  .middle-slider {
    height: 60px;
    background: transparent;
    bottom: 30px;
    display: flex;
    align-items: space-between;
    flex-direction: column;
    position: relative;
    .small-left,
    .small-right {
      position: absolute;
      top: 33px;
      cursor: pointer;
      width: 13px;
      height: 21px;
      display: block;
      background-repeat: no-repeat;
      background-size: contain;
    }
    .small-left {
      background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2221%22%20viewBox%3D%220%200%2012%2021%22%3E%20%20%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%222%22%20transform%3D%22scale%281%20-1%29%20rotate%28-45%20-11.803%20-6.303%29%22%20stroke-linecap%3D%22square%22%3E%20%20%20%20%3Cpath%20d%3D%22M12.9635539.498598226L.498598226.498598226M.498598226.498598226L.498598226%2012.9635539%22%2F%3E%20%20%3C%2Fg%3E%3C%2Fsvg%3E');
      left: -25px;
    }
    .small-right {
      background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2213%22%20height%3D%2221%22%20viewBox%3D%220%200%2013%2021%22%3E%20%20%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%222%22%20transform%3D%22rotate%28135%203.581%207.454%29%22%20stroke-linecap%3D%22square%22%3E%20%20%20%20%3Cpath%20d%3D%22M12.9635539.498598226L.498598226.498598226M.498598226.498598226L.498598226%2012.9635539%22%2F%3E%20%20%3C%2Fg%3E%3C%2Fsvg%3E');
      right: -25px;
    }
    .carousel-icon {
      background: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2273%22%20height%3D%2229%22%20viewBox%3D%220%200%2073%2029%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%20%20%3Cdefs%3E%20%20%20%20%3Crect%20id%3D%22a%22%20width%3D%2240.869%22%20height%3D%2229%22%20x%3D%2215.066%22%2F%3E%20%20%20%20%3Cmask%20id%3D%22b%22%20width%3D%2240.869%22%20height%3D%2229%22%20x%3D%220%22%20y%3D%220%22%20fill%3D%22white%22%3E%20%20%20%20%20%20%3Cuse%20xlink%3Ahref%3D%22%23a%22%2F%3E%20%20%20%20%3C%2Fmask%3E%20%20%3C%2Fdefs%3E%20%20%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%20stroke%3D%22%23FFFFFF%22%20transform%3D%22translate%281%29%22%3E%20%20%20%20%3Cpath%20stroke-width%3D%222%22%20d%3D%22M62.5684544%205.4375L62.5684544%2023.5625M70.1012658%208.15625L70.1012658%2021.75M.898734177%208.15625L.898734177%2021.75M8.43154564%205.4375L8.43154564%2023.5625%22%20stroke-linecap%3D%22square%22%2F%3E%20%20%20%20%3Cuse%20fill%3D%22%23FFFFFF%22%20stroke-width%3D%224%22%20mask%3D%22url%28%23b%29%22%20xlink%3Ahref%3D%22%23a%22%2F%3E%20%20%3C%2Fg%3E%3C%2Fsvg%3E');
      background-size: cover;
      width: 36px;
      display: block;
      z-index: 1500;
      height: 14px;
      margin-top: 30px;
      backface-visibility: hidden;
      cursor: pointer;
      transition: all 0.3s ease-in-out;
      &:hover {
        transform: scale(1.2);
      }
    }
    .small-carousel {
      height: 64px;
      width: 233px;
      max-height: 0;
      display: flex;
      justify-content: center;
      opacity: 0;
      transition: all 0.6s ease-in-out;
      position: absolute;
      bottom: 55px;
      left: 50%;
      transform: translateX(-50%);
      &.is-active {
        opacity: 1;
        max-height: 100%;
      }
    }
  }
  .cancel-icon {
    position: absolute;
    cursor: pointer;
    top: 20px;
    right: 20px;
    z-index: 101;
    color: white;
    display: block;
    cursor: pointer;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2218%22%20height%3D%2218%22%20viewBox%3D%220%200%2018%2018%22%3E%20%20%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%20transform%3D%22translate%281%201%29%22%3E%20%20%20%20%3Ccircle%20cx%3D%228%22%20cy%3D%228%22%20r%3D%228%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%221%22%2F%3E%20%20%20%20%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M8.21052632%2C7.13871017%20L5.7033951%2C4.63157895%20L5.05263158%2C5.28234246%20L6.56644102%2C6.7961519%20L7.5597628%2C7.78947368%20L5.05263158%2C10.2966049%20L5.7033951%2C10.9473684%20L8.21052632%2C8.4402372%20L10.7176575%2C10.9473684%20L11.3684211%2C10.2966049%20L8.86128983%2C7.78947368%20L11.3684211%2C5.28234246%20L10.7176575%2C4.63157895%20L8.21052632%2C7.13871017%20Z%22%2F%3E%20%20%3C%2Fg%3E%3C%2Fsvg%3E');
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
      z-index: 101;
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
        content: '';
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
          content: '';
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
      content: '';
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
