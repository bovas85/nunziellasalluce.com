<template>
  <main class="home">
    <section v-if="homePage" class="section hero step" :style="`background-image: url('${bgImage}')`">
      <div class="container is-flex-column" :class="{'animated': animateHeader}">
        <h1 class="jumbo">{{acf.hero.title}}</h1>
        <h3>{{acf.hero.description}}</h3>
      </div>
      <div v-scroll="{element:'.projects'}" class="scroll-down">
        <p>scroll</p>
        <div class="scroll-down__arrow">
          <icon-arrow :fill="'white'" direction='down' name='arrow-down' :width="30" :height="40" />
        </div>
      </div>
    </section>

    <section id="#work" class="projects section step" v-if="projects && homePage">
      <div class="container" :class="{'animated': animateWork}">
        <h1>{{acf.case_studies.title}}</h1>
      </div>
      <the-carousel 
        :class="{'animated': animateWork}"
        :data='projects'
      />
    </section>

    <section class="the-process step" v-if="homePage">
      <div class="container">
        <h1 :class="{'animated': animateProcess}">{{acf.the_process.title}}</h1>
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

    <section class="capabilities step" v-if="homePage">
      <div class="container">
        <h1 :class="{'animated': animateCapab}">{{acf.capabilities.title}}</h1>
        <div :class="{'animated': animateCapab}" class="skill col--4-tablet">
          <img :src="acf.capabilities.media_object.image.sizes.large" :alt="acf.capabilities.media_object.image.alt">
          <h3>{{acf.capabilities.media_object.title}}</h3>
          <p>{{acf.capabilities.media_object.body}}</p>
        </div>
        <div :class="{'animated': animateCapab}" class="skill col--4-tablet padded-top">
          <img :src="acf.capabilities.media_object2.image.sizes.large" :alt="acf.capabilities.media_object2.image.alt">
          <h3>{{acf.capabilities.media_object2.title}}</h3>
          <p>{{acf.capabilities.media_object2.body}}</p>
        </div>
        <div :class="{'animated': animateCapab}" class="skill col--4-tablet">
          <img :src="acf.capabilities.media_object3.image.sizes.large" :alt="acf.capabilities.media_object3.image.alt">
          <h3>{{acf.capabilities.media_object3.title}}</h3>
          <p>{{acf.capabilities.media_object3.body}}</p>
        </div>
      </div>
    </section>

    <section class="testimonials step" v-if="homePage">
      <div class="container" :class="{'animated': animateTestimonials}">
        <h1>{{acf.testimonials.title}}</h1>
      </div>
      
      <no-ssr>
        <div class="wrapper" :class="{'animated': animateTestimonials}">
          <transition-group tag="div" name="fade" mode="out-in">
            <the-testimonial
              v-for="(testimonial, index) in testimonials"
              :key="index"
              v-if="currentTestimonial === index"
              :testimonial="testimonial"
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
      </no-ssr>
    </section>
  </main>
</template>

<script>
  import debounce from 'lodash/debounce'
  import IconArrow from '@/components/Icons/IconArrow'

  export default {
    scrollToTop: true,
    data () {
      return {
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
        setTimeout(() => {
          if (this.$route.hash) {
            const clickable = document.querySelector('#js-click')
            if (clickable) {
              clickable.click()
            }
          }
        }, 900)
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
      homePage () {
        if (this.$store.state.homePage == null) return false
        return this.$store.state.homePage
      },
      projects () {
        if (!this.$store.state.projects.length) return false
        return this.$store.state.projects
      },
      acf () {
        if (this.$store.state.homePage == null) return false
        return this.$store.state.homePage.acf
      },
      testimonials () {
        if (this.acf.testimonials.testimonials == null) return false
        return this.acf.testimonials.testimonials
      },
      computedHeight () {
        if (window && document) {
          return document.querySelector('.hero').offsetHeight - 90
        } else return 0
      },
      bgImage () {
        if (!this.homePage.acf.hero) return 'https://placehold.it/2048/2048'
        if (process.browser) {
          if (this.$store.state.window < 577) {
            return this.homePage.acf.hero.mobile_bg.sizes.large
          } else if (
            this.$store.state.window > 576 &&
            this.$store.state.window < 1440
          ) {
            return this.homePage.acf.hero.desktop_bg.sizes.large
          } else return this.homePage.acf.hero.desktop_bg.sizes.ultra
        }
        return this.homePage.acf.hero.desktop_bg.sizes.large
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
      background-size: cover;
      background-position: center;
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
    &.projects {
      overflow: hidden;
      margin: $gap * 1.5 0;

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
            max-width: 50vw;
            margin: 0 auto;
          }
          width: 100px;
          // margin: 0 auto;
          height: auto;
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
      margin: $gap * 3 0;
      margin-bottom: $gap;

      @include media(sm) {
        margin-bottom: $gap * 3;
      }

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
        width: 100%;
        min-width: 100%;
        height: 1px;
        cursor: pointer;
        position: absolute;
        display: flex;
        align-items: center;
        top: 75px;

        @include media(sm) {
          top: 100px;
        }
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
