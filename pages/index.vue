<template>
  <main class="home">
    <section v-if="homePage" class="section hero step" :style="`background-image: url('${bgImage}')`">
      <div class="container is-flex-column" :class="{'animated': animateHeader}">
        <h1 class="jumbo">{{acf.hero.title}}</h1>
        <h3>{{acf.hero.description}}</h3>
      </div>
      <div v-scroll="{element:'.who-i-am'}" class="scroll-down">
        <p>scroll</p>
        <div class="scroll-down__arrow">
          <icon-arrow :fill="'white'" direction='down' name='arrow-down' :width="30" :height="40" />
        </div>
      </div>
    </section>

    <section class="section who-i-am step" v-if="homePage">
      <div class="container">
        <h1 :class="{'animated': animateWho}" v-if="homePage.acf">{{homePage.acf.who_i_am.title}}</h1>
        <div class="wrapper">
          <lazy-image
            class='image'
            :class="{'animated': animateWho}"
            v-if="homePage.acf"
            :image="homePage.acf.who_i_am.image"
            :title="homePage.acf.who_i_am.title"
            :hover="false"
            :imageMobile="homePage.acf.who_i_am.image"
            home
          />
          <div class="text">
            <p
              :class="{'animated': animateWho}"
              v-for="(item, index) in homePage.acf.who_i_am.text_group"
              v-if="homePage.acf"
              :key="index"
              class="jumbo"
            >
              {{item.text}}
            </p>
            <nuxt-link
              to="/about"
              :class="{'animated': animateWho}"
              class="button button--sent button--is-white"
            >About Me</nuxt-link>
          </div>
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
        <div class="container is-flex">
          <div class="image-grid">
            <div :class="{'animated': animateProcess}"><p>Planning project scope</p></div>
            <div :class="{'animated': animateProcess}"><p>Design</p></div>
            <div :class="{'animated': animateProcess}"><p>Development</p></div>
            <div :class="{'animated': animateProcess}"><p>QA Testing</p></div>
          </div>
        </div>
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
              :disabled="currentTestimonial === 0"
              role="navigation"
              aria-label="previous testimonial"
              @click="currentTestimonial > 0 ? currentTestimonial-- : null"
            >
              <icon-arrow :fill="'black'" direction='left' name='arrow-left' :width="30" :height="40" />
            </div>
            <div
              class="arrow arrow--right"
              :disabled="currentTestimonial === testimonials.length - 1"
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
  import Config from '~/assets/config'
  let scroller, steps

  export default {
    scrollToTop: true,
    data () {
      return {
        currentTestimonial: 0,
        animateHeader: false,
        animateWho: false,
        animateWork: false,
        animateProcess: false,
        animateCapab: false,
        animateTestimonials: false,
        resize: false
      }
    },
    components: {
      IconArrow,
      CaseStudy: () => import('@/components/UI/CaseStudy'),
      TheCarousel: () => import('@/components/Sliders/TheCarousel'),
      TheTestimonial: () => import('@/components/UI/TheTestimonial'),
      LazyImage: () => import('@/components/UI/LazyImage')
    },
    head () {
      return { title: 'Home' }
    },
    async mounted () {
      if (process.browser) {
        const { data } = await this.$axios.get(
          Config.wpDomain + Config.api.homePage
        )
        this.$store.commit('setHomepage', data)
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
            this.animateWho = true
            break
          case 2:
            this.animateWork = true
            break
          case 3:
            this.animateProcess = true
            break
          case 4:
            this.animateCapab = true
            break
          case 5:
            this.animateTestimonials = true
            break
          default:
            break
        }
      },
      handleScroll () {
        if (window.innerWidth > 577) {
          scroller = this.scrollama()
          steps = null
          steps = scroller
            .setup({
              step: '.step',
              offset: 0.6,
              debug: false
            })
            .onStepEnter(this.handleStepEnter)
            .onStepExit(this.showMenu)

          steps.resize()
          steps.enable()
        } else {
          scroller = this.scrollama()
          steps = null
          steps = scroller
            .setup({
              step: '.step',
              offset: 0.9,
              debug: false
            })
            .onStepEnter(this.handleStepEnter)
            .onStepExit(this.showMenu)

          steps.resize()
          steps.enable()
        }

        if (!this.resize) {
          window.addEventListener(
            'resize',
            this.scrollamaResize,
            { passive: true },
            false
          )
        }
      },
      scrollamaResize: debounce(function () {
        this.resize = true
        let step = document.querySelector('.step')
        if (step && step.length) {
          this.handleScroll()
        }
      }, 150)
    },
    beforeDestroy () {
      scroller.disable()
      scroller = null
      steps = null
      window.removeEventListener('resize', this.scrollamaResize, false)
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
  h1 {
    @include media(sm) {
      max-width: 480px;
      padding-left: 0;
    }
  }

  section {
    margin: $gap / 1.5 0;
    width: 100%;

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
    &.who-i-am {
      margin: $gap * 1.5 0;

      h1 {
        max-width: 150px;
        @include fadeInUp;
        padding-left: $gap;

        @include media(md) {
          padding-left: 0;
        }
      }

      @include media(xl) {
        margin: $gap * 1.5 0;
      }
      .container {
        grid-gap: 0;
        .wrapper {
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .image {
          width: 100%;
          height: 430px;
          margin: 0 auto;
          object-fit: cover;
          object-position: center;
          @include fadeInUp;
          transition-delay: 0.2s;
          position: absolute;

          @supports (display: grid) {
            position: relative;
          }

          @include media(md) {
            height: 550px;
          }

          @include media(xl) {
            width: 80%;
          }
        }

        .text {
          position: relative;
          @supports (display: grid) {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            transform: translate(-50%, -50%);
            z-index: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          }

          p {
            text-align: center;
            margin: $gap / 1.5 0;
            padding: 0 $gap / 2;
            @include size(h3);
            @include fadeInUp;

            @include media(lg) {
              padding: 0;
              @include size(h2);
            }
            @include media(xl) {
              @include size(h1);
            }
            @include media(xxl) {
              @include size(jumbo);
            }
            @include media(md) {
              &:nth-child(1) {
                margin-left: auto;
                margin-right: auto;
                transition-delay: 0.4s;
              }
              &:nth-child(2) {
                margin-right: 10%;
                transition-delay: 0.6s;
              }
              &:nth-child(3) {
                margin-left: 10%;
                transition-delay: 0.8s;
              }
            }
          }
        }

        a {
          @include fadeInUp;
          transition-delay: 0.8s;
        }
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
        padding-left: $gap;

        @include media(md) {
          padding-left: 0;
        }
      }
    }
    &.the-process {
      h1 {
        max-width: 200px;
        padding-left: $gap;

        @include media(md) {
          padding-left: 0;
        }
        @include fadeInUp;
      }

      img {
        max-width: 100%;
        width: 100%;
        object-fit: cover;
      }

      .image-grid {
        display: flex;
        display: grid;
        grid-gap: 0;
        grid-template-columns: 1fr;
        grid-template-rows: repeat(18, 1fr);
        width: 100%;
        height: 100%;
        position: relative;

        div {
          border-radius: 100%;
          display: block;
          width: calc(100vw - 90px);
          height: calc(100vw - 90px);
          max-width: 320px;
          max-height: 320px;
          border-radius: 100%;
          background-color: $grey;
          mix-blend-mode: color-burn;
          justify-self: center;
          display: flex;
          justify-content: center;
          align-items: center;
          grid-column: 1 / -1;
          @include fadeInUp;

          p {
            font-size: responsive(18px 21px);
            font-range: 1200px 1440px;
            font-weight: 600;
            text-transform: uppercase;
            max-width: 160px;
            text-align: center;
          }

          &:nth-child(1) {
            grid-row: 1 / 6;
            background-color: #95d3e8;
            transition-delay: 0.2s;
          }
          &:nth-child(2) {
            grid-row: 5 / 10;
            background-color: #ff83c1;
            transition-delay: 0.3s;
          }
          &:nth-child(3) {
            grid-row: 9 / 14;
            background-color: #f9e344;
            transition-delay: 0.4s;
          }
          &:nth-child(4) {
            grid-row: 13 / 18;
            background-color: #b4d27a;
            transition-delay: 0.5s;
          }
        }

        @include media(xl) {
          grid-template-columns: repeat(17, 1fr);
          grid-auto-rows: 274px;
          height: 274px;

          div {
            max-width: unset;
            max-height: unset;
            width: 100%;
            justify-self: start;
            height: 274px;

            p {
              text-align: left;
            }

            &:nth-child(1) {
              grid-row: 1 / 1;
              grid-column: 3 / 7;
            }
            &:nth-child(2) {
              grid-row: 1 / 1;
              grid-column: 6 / 10;
            }
            &:nth-child(3) {
              grid-row: 1 / 1;
              grid-column: 9 / 13;
            }
            &:nth-child(4) {
              grid-row: 1 / 1;
              grid-column: 12 / 16;
            }
          }
        }

        @include media(xxl) {
          grid-auto-rows: 329px;
          height: 329px;

          div {
            height: 329px;
          }
        }
      }
    }
    &.capabilities {
      h1 {
        flex-basis: 100%;
        max-width: 20vw;
        padding-left: $gap;

        @include media(md) {
          padding-left: 0;
        }

        @include fadeInUp;
      }

      .skill {
        margin: $gap * 1.5 $gap;
        @include fadeInUp;

        @include media(md) {
          margin: 0 auto;
          max-width: 280px;
          text-align: center;
        }

        img {
          width: 100px;
          height: auto;
          margin: 0 auto;

          @media (max-width: $mobile) {
            max-width: 50vw;
            margin: 0 0 $gap;
          }
        }

        h3 {
          margin: $gap / 2 0;
          color: $primary;
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
      margin-bottom: $gap;

      @include media(sm) {
        margin: $gap * 3 0;
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

      h1 {
        padding-left: $gap;

        @include media(md) {
          padding-left: 0;
        }
      }

      .testimonial-group {
        position: relative;
      }

      .arrows {
        width: 100%;
        min-width: 100%;
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
        &[disabled] {
          opacity: 0.4;
          pointer-events: none;
        }

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
