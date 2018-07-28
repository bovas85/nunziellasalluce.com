<template>
  <main class="home">
    <section class="section hero step">
      <div class="container is-flex-column">
        <h1 class="jumbo">Nunziella Salluce Design</h1>
        <h3>Multi-disciplinary UI / UX and Visual Designer</h3>
      </div>
      <div v-scroll="{element:'.case-studies'}" class="scroll-down">
        <p>scroll</p>
        <div class="scroll-down__arrow">
          <icon-arrow :fill="'white'" name='arrow-down' :width="30" :height="40" />
        </div>
      </div>
    </section>

    <section class="case-studies section" v-if='caseStudies'>
      <div class="container">
        <h1>Case Studies</h1>
      </div>
      <the-carousel
        :data='caseStudies'
      />
    </section>

    <section class="the-process">
      <div class="container">
        <h1>The Process</h1>
      </div>
      <no-ssr>
        <vue-media :query="{maxWidth: 767}">
          <img src="https://placehold.it/800x600" alt="the process description here" />
        </vue-media>
      </no-ssr>
      <no-ssr>
        <vue-media :query="{minWidth: 768}">
          <img src="https://placehold.it/1920x1080" alt="the process description">
          <p>some text about the process</p>
        </vue-media>
      </no-ssr>
    </section>

    <section class="capabilities" v-if='$store.state.homePage'>
      <div class="container">
        <h1>My Capabilities</h1>
      </div>
      <div class="container">
        <div class="skill col--4-tablet">
          <img src="https://placehold.it/800x800" alt="">
          <h3>Title</h3>
          <p>Mobile Applications  Interface Web User  Interfaces User  Experience Design</p>
        </div>
        <div class="skill col--4-tablet padded-top">
          <img src="https://placehold.it/800x800" alt="">
          <h3>Title</h3>
          <p>Mobile Applications  Interface Web User  Interfaces User  Experience Design</p>
        </div>
        <div class="skill col--4-tablet">
          <img src="https://placehold.it/800x800" alt="">
          <h3>Title</h3>
          <p>Mobile Applications  Interface Web User  Interfaces User  Experience Design</p>
        </div>
      </div>
    </section>

    <section class="testimonials container" v-if="testimonials && testimonials.length">
      <div class="container">
        <h1>What people say about me</h1>
      </div>
      <div class="wrapper">
        <transition-group tag="div" name="fade" mode="out-in">
          <the-testimonial
            v-for="(testimonial, index) in testimonials"
            :key="testimonial.id"
            v-if="currentTestimonial === index"
            :data="testimonial"
          />
        </transition-group>

        <div class="arrows" role="pagination">
          <div
            class="arrow arrow--left"
            role="navigation"
            aria-label="previous testimonial"
            @click="currentTestimonial > 0 ? currentTestimonial-- : null"
          >
            <img src="/images/arrow.svg" alt="arrow-left">
          </div>
          <div
            class="arrow arrow--right"
            role="navigation"
            aria-label="next testimonial"
            @click="currentTestimonial < testimonials.length - 1 ? currentTestimonial++ : null"
          >
            <img src="/images/arrow.svg" alt="arrow-right">
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
  import debounce from 'lodash/debounce'
  import testimonials from '~/assets/testimonials.js'

  export default {
    scrollToTop: true,
    data () {
      return {
        testimonials: testimonials,
        currentTestimonial: 0
      }
    },
    components: {
      CaseStudy: () => import('@/components/UI/CaseStudy'),
      TheCarousel: () => import('@/components/Sliders/TheCarousel'),
      TheTestimonial: () => import('@/components/UI/TheTestimonial'),
      IconArrow: () => import('@/components/Icons/IconArrow')
    },
    head () {
      return { title: 'Home' }
    },
    mounted () {
      if (process.browser) {
        window.onNuxtReady(app => {
          setTimeout(() => {
            this.handleScroll()
          }, 1000)
        })
      }
    },
    methods: {
      hideMenu () {
        this.$store.commit('hideMenuBg')
      },
      showMenu () {
        this.$store.commit('showMenuBg')
      },
      handleScroll () {
        const scroller = this.scrollama()
        const step = scroller
          .setup({
            step: '.step',
            offset: 0.1,
            debug: false
          })
          .onStepEnter(this.hideMenu)
          .onStepExit(this.showMenu)

        step.resize()
        step.enable()

        window.addEventListener(
          'resize',
          debounce(function () {
            step.resize()
          }, 150),
          { passive: true }
        )
      }
    },
    computed: {
      caseStudies () {
        if (!this.$store.state.caseStudies.length) return false
        return this.$store.state.caseStudies
      },
      computedHeight () {
        if (window && document) {
          return document.querySelector('.hero').offsetHeight - 90
        } else return 0
      }
    }
  }
</script>

<style lang="scss" scoped>
  // general h1 max width
  h1 {
    padding-left: $gap;

    @include media(sm) {
      max-width: 500px;
      padding-left: 0;
    }
  }

  section {
    margin: $gap * 1.5 $gap;

    @include media(md) {
      margin: $gap * 3 auto;
    }
    &.hero {
      background-image: url('https://fillmurray.com/600/800');
      background-size: cover;
      background-position: center;
      @media (min-width: $tablet) {
        background-image: url('https://fillmurray.com/1280/768');
      }
      @media (min-width: $desktop) {
        background-image: url('https://fillmurray.com/2048/1024');
      }
      height: 100vh;
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      position: relative;
      padding: 0 $gap;
      margin: 0;

      @include media(sm) {
        padding: 0;
      }

      @include media(md) {
        margin: 0 auto $gap * 3;
      }

      .scroll-down {
        position: absolute;
        bottom: 80px;
        left: 60px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: pointer;
        display: none;

        @include media(sm) {
          display: flex;
        }

        p {
          font-size: 22px;
          line-height: 1;
          margin-bottom: $gap;
          writing-mode: vertical-rl;
        }
      }

      h1 {
        padding: 0 0 $gap;

        @include media(sm) {
          max-width: 410px;
          padding: 0 0 $gap;
        }
      }

      h1,
      h3 {
        color: white;
      }
    }
    &.case-studies {
      overflow: hidden;

      h1 {
        max-width: 260px;
      }
    }
    &.the-process {
      h1 {
        max-width: 260px;
      }

      img {
        max-width: 100%;
        width: 100%;
        object-fit: cover;
      }
    }
    &.capabilities {
      h1 {
        max-width: 80vw;

        @include media(sm) {
          max-width: 100%;
        }
      }

      .skill {
        margin: $gap * 1.5 $gap;

        @include media(md) {
          margin: 0 auto;
          max-width: 220px;
        }

        img {
          @media (max-width: $mobile) {
            max-width: 60vw;
            margin: 0 auto;
          }
          border-radius: 100%;
        }

        h3 {
          margin: $gap / 2 0;
        }

        p {
          font-size: $font-size * $rule;
        }

        &.padded-top {
          padding-top: 46px;
        }
      }
    }

    &.testimonials {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      margin-bottom: $gap * 3;

      .wrapper {
        position: relative;
      }

      .testimonial-group {
        position: relative;
      }

      .arrows {
        top: 100px;
        width: 100%;
        height: 1px;
        cursor: pointer;
        position: absolute;
        display: flex;
        align-items: center;
      }
      .arrow {
        position: absolute;
        &--left {
          left: 50px;
          transform: rotate(90deg);
          transform-origin: center;

          @include media(md) {
            left: 100px;
          }
        }

        &--right {
          right: 50px;
          transform: rotate(-90deg);
          transform-origin: center;

          @include media(md) {
            right: 100px;
          }
        }
      }

      h1 {
        flex-basis: 100%;
      }
    }
  }
</style>
