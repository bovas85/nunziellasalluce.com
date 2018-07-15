<template>
  <main class="home">
    <section class="section hero step">
      <div class="container is-flex-column">
        <h1 class="jumbo">Nunziella Salluce Design</h1>
        <h3>Multi-disciplinary UI / UX and Visual Designer</h3>
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
      <the-testimonial
        v-for="(testimonial, index) in testimonials"
        :key="index"
        :data="testimonial"
      />
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
        testimonials: testimonials
      }
    },
    components: {
      CaseStudy: () => import('@/components/UI/CaseStudy'),
      TheCarousel: () => import('@/components/Sliders/TheCarousel'),
      TheTestimonial: () => import('@/components/UI/TheTestimonial')
    },
    head () {
      return { title: 'Home' }
    },
    mounted () {
      if (process.browser) {
        window.onNuxtReady(app => {
          setTimeout(() => {
            this.handleScroll();
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
          const scroller = this.scrollama();

          // setup the instance, pass callback functions
          const step = scroller
            .setup({
              step: ".step",
              offset: .1,
              debug: false
            })
            .onStepEnter(this.hideMenu)
            .onStepExit(this.showMenu)

          step.resize();
          step.enable();

          window.addEventListener(
            "resize",
            debounce(function () {
              // console.log('resizing')
              step.resize();
            }, 150),
            { passive: true }
          );
      }
    },
    computed: {
      caseStudies () {
        if (!this.$store.state.caseStudies.length) return false
        return this.$store.state.caseStudies
      }
    }
  }
</script>

<style lang="scss" scoped>
  // general h1 max width
  h1 {
    max-width: 500px;
  }

  section {
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
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-end;
      padding: 0 0 80px 0;

      h1 {
        max-width: 410px;
        padding: 0 0 $gap;
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
      .skill {
        max-width: 220px;
        margin: 0 auto;
        img {
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
      justify-content: space-around;
      align-items: flex-start;
      margin-bottom: $gap * 2.5;

      h1 {
        flex-basis: 100%;
      }
    }
  }
</style>
