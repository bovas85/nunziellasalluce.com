<template>
  <main class="home">
    <section class="section hero step">
      <div class="container is-flex-column" :class="{'animated': animateHeader}">
        <h1 class="jumbo">Nunziella Salluce Design</h1>
        <h3>Multi-disciplinary UI / UX and Visual Designer</h3>
      </div>
      <div v-scroll="{element:'.case-studies'}" class="scroll-down">
        <p>scroll</p>
        <div class="scroll-down__arrow">
          <icon-arrow :fill="'white'" direction='down' name='arrow-down' :width="30" :height="40" />
        </div>
      </div>
    </section>

    <section class="case-studies section step" v-if='caseStudies'>
      <div class="container" :class="{'animated': animateWork}">
        <h1>Case Studies</h1>
      </div>
      <the-carousel 
        :class="{'animated': animateWork}"
        :data='caseStudies'
      />
    </section>

    <section class="the-process step">
      <div class="container">
        <h1 :class="{'animated': animateProcess}">The Process</h1>
        <no-ssr>
          <vue-media :query="{maxWidth: 767}">
            <img class="top-image" :class="{'animated': animateProcess}" src="https://placehold.it/800x600" alt="the process description here" />
          </vue-media>
        </no-ssr>
        <no-ssr>
          <vue-media :query="{minWidth: 768}">
            <div class="bottom-image--with-caption" :class="{'animated': animateProcess}">
              <img src="https://placehold.it/1920x1080" alt="the process description">
              <p>some text about the process</p>
            </div>
          </vue-media>
        </no-ssr>
      </div>
    </section>

    <section class="capabilities step" v-if='$store.state.homePage'>
      <div class="container">
        <h1 :class="{'animated': animateCapab}">My Capabilities</h1>
        <div :class="{'animated': animateCapab}" class="skill col--4-tablet">
          <img src="https://placehold.it/800x800" alt="">
          <h3>Title</h3>
          <p>Mobile Applications  Interface Web User  Interfaces User  Experience Design</p>
        </div>
        <div :class="{'animated': animateCapab}" class="skill col--4-tablet padded-top">
          <img src="https://placehold.it/800x800" alt="">
          <h3>Title</h3>
          <p>Mobile Applications  Interface Web User  Interfaces User  Experience Design</p>
        </div>
        <div :class="{'animated': animateCapab}" class="skill col--4-tablet">
          <img src="https://placehold.it/800x800" alt="">
          <h3>Title</h3>
          <p>Mobile Applications  Interface Web User  Interfaces User  Experience Design</p>
        </div>
      </div>
    </section>

    <section class="testimonials step" v-if="testimonials && testimonials.length">
      <div class="container" :class="{'animated': animateTestimonials}">
        <h1>What people say about me</h1>
      </div>
      <div class="wrapper" :class="{'animated': animateTestimonials}">
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
            <icon-arrow :fill="'black'" direction='left' name='arrow-left' :width="30" :height="40" />
          </div>
          <div
            class="arrow arrow--right"
            role="navigation"
            aria-label="next testimonial"
            @click="currentTestimonial < testimonials.length - 1 ? currentTestimonial++ : null"
          >
            <icon-arrow :fill="'black'" direction='right' name='arrow-right' :width="30" :height="40" />
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
    import debounce from 'lodash/debounce'
    import testimonials from '~/assets/testimonials.js'
    import IconArrow from '@/components/Icons/IconArrow'

    export default {
      scrollToTop: true,
      data () {
        return {
          testimonials: testimonials,
          currentTestimonial: 0,
          animateHeader: false,
          animateWork: false,
          animateProcess: false,
          animateCapab: false,
          animateTestimonials: false
        }
      },
      components: {
        IconArrow,
        CaseStudy: () => import('@/components/UI/CaseStudy'),
        TheCarousel: () => import('@/components/Sliders/TheCarousel'),
        TheTestimonial: () => import('@/components/UI/TheTestimonial')
      },
      head () {
        return { title: 'Home' }
      },
      mounted () {
        if (process.browser) {
          this.handleScroll()
        }
      },
      methods: {
        hideMenu () {
          this.$store.commit('hideMenuBg')
        },
        showMenu () {
          this.$store.commit('showMenuBg')
        },
        handleStepEnter (response) {
          switch (response.index) {
            case 0:
              this.hideMenu()
              this.animateHeader = true
              break
            case 1:
              this.animateWork = true
              break
            case 2:
              this.animateProcess = true
              break
            case 3:
              this.animateCapab = true
              break
            case 4:
              this.animateTestimonials = true
              break
            default:
              break
          }
        },
        handleScroll () {
          const scroller = this.scrollama()
          const step = scroller
            .setup({
              step: '.step',
              offset: 0.4,
              debug: false
            })
            .onStepEnter(this.handleStepEnter)
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
        max-width: 480px;
        padding-left: 0;
      }
    }

    section {
      margin: $gap * 1.5 $gap;

      @include media(md) {
        margin: $gap * 3 auto;
      }
      &.hero {
        background-image: url('https://placehold.it/600/800');
        background-size: cover;
        background-position: center;
        @media (min-width: $tablet) {
          background-image: url('https://placehold.it/1280/768');
        }
        @media (min-width: $desktop) {
          background-image: url('https://placehold.it/2048/1024');
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

        .container {
          @include fadeInUp;
        }
      }
      &.case-studies {
        overflow: hidden;

        .container {
          @include fadeInUp;
        }

        .carousel {
          @include fadeInUp;
          transition-delay: 0.2s;
        }

        h1 {
          max-width: 260px;
        }
      }
      &.the-process {
        h1 {
          max-width: 260px;
          @include fadeInUp;
        }

        img {
          max-width: 100%;
          width: 100%;
          object-fit: cover;
        }

        .top-image {
          @include fadeInUp;
          transition-delay: 0.2s;
        }

        .bottom-image {
          &--with-caption {
            @include fadeInUp;
            transition-delay: 0.4s;
          }
        }
      }
      &.capabilities {
        h1 {
          max-width: 30vw;
          @include fadeInUp;
        }

        .skill {
          margin: $gap * 1.5 $gap;
          @include fadeInUp;

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

          &:nth-child(2) {
            transition-delay: 0.2s;
          }
          &:nth-child(3) {
            transition-delay: 0.4s;
          }
          &:nth-child(4) {
            transition-delay: 0.6s;
          }
        }
      }
      &.testimonials {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        margin-bottom: $gap * 3;

        .container {
          @include fadeInUp;
        }

        .wrapper {
          position: relative;
          @include fadeInUp;
          transition-delay: 0.2s;
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

            @include media(md) {
              left: 100px;
            }
          }

          &--right {
            right: 50px;

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
