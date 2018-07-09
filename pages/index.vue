<template>
  <main class="home">
    <section class="section hero">
      <div class="container is-flex-column">
        <h1>Nunziella Salluce Design</h1>
        <h3>Multi-disciplinary UI / UX and Visual Designer</h3>
      </div>
    </section>
    
    <section class="case-studies section" v-if='caseStudies'>
      <h2 class="has-text-centered">Case Studies</h2>
      <the-carousel
        :data='caseStudies'
      />
    </section>

    <section class="the-process">
      <h2>The Process</h2>
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
      <h2 class="has-text-centered">My Capabilities</h2>
      <div class="container">
        <div class="svg-icons">
          <div class="round-icon">
            <img src="https://placehold.it/40x40" alt="" />
          </div>
          <div class="line"></div>
          <div class="round-icon">
            <img src="https://placehold.it/40x40" alt="" />
          </div>
          <div class="line"></div>
          <div class="round-icon">
            <img src="https://placehold.it/40x40" alt="" />
          </div>
          <div class="text-left">
            some text
          </div>
          <span></span>
          <div class="text-center">
            some text
          </div>
          <span></span>
          <div class="text-right">
            some text
          </div>
        </div>
      </div>
    </section>

    <section class="testimonials">
      <h2 class="has-text-centered">What people say about me</h2>
      <div class="testimonial">
        <!-- component with image and text + title / job -->
        <img src="https://placehold.it/60x60" alt="name of person">
        <blockquote>
          Some testimonial here
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias, maiores.
          -- Title, job position
        </blockquote>
      </div>
      <div class="testimonial">
        
        <!-- component with image and text + title / job -->
        <img src="https://placehold.it/60x60" alt="name of person">
        <blockquote>
          Some testimonial here
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias, maiores.
          -- Title, job position
        </blockquote>
      </div>
      <div class="testimonial">
        
        <!-- component with image and text + title / job -->
        <img src="https://placehold.it/60x60" alt="name of person">
        <blockquote>
          Some testimonial here
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias, maiores.
          -- Title, job position
        </blockquote>
      </div>
      <div class="testimonial">
        
        <!-- component with image and text + title / job -->
        <img src="https://placehold.it/60x60" alt="name of person">
        <blockquote>
          Some testimonial here
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias, maiores.
          -- Title, job position
        </blockquote>
      </div>
      <div class="testimonial">
        
        <!-- component with image and text + title / job -->
        <img src="https://placehold.it/60x60" alt="name of person">
        <blockquote>
          Some testimonial here
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias, maiores.
          -- Title, job position
        </blockquote>
      </div>
    </section>
  </main>
</template>

<script>
  export default {
    scrollToTop: true,
    data () {
      return {}
    },
    components: {
      CaseStudy: () => import('@/components/UI/CaseStudy'),
      TheCarousel: () => import('@/components/Sliders/TheCarousel')
    },
    head () {
      return { title: 'Home' }
    },
    mounted () {},
    methods: {},
    computed: {
      caseStudies () {
        if (!this.$store.state.caseStudies.length) return false
        return this.$store.state.caseStudies
      }
    }
  }
</script>

<style lang="scss" scoped>
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

      h1,
      h3 {
        color: white;
      }
    }
    &.case-studies {
      margin: $gap * 1.5 0 $gap * 2;
      overflow: hidden;

      h2 {
        padding: 0 0 $gap * 1.5;
      }
    }
    &.the-process {
      img {
        max-width: 100%;
        object-fit: cover;
      }
    }
    &.capabilities {
      margin: 0 0 $gap * 2;

      h2 {
        padding-bottom: $gap * 2;
      }

      .svg-icons {
        display: grid;
        grid-template-columns: 1fr;
        justify-items: center;
        text-align: center;

        @media (min-width: $tablet) {
          grid-template-columns: 40px 1fr 40px 1fr 40px; // icon --- icon --- icon, the lines flex
        }

        .round-icon img {
          border-radius: 100%;
        }

        @media (max-width: $tablet - 1) {
          .text-left {
            grid-row: 2;
          }

          .text-center {
            grid-row: 4;
          }

          .text-right {
            grid-row: 6;
          }
        }

        span {
          display: none;

          @media (min-width: $tablet) {
            display: block;
          }
        }

        .line {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;

          display: none;

          @media (min-width: $tablet) {
            display: block;
          }

          &:after {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
            background-color: black;
            background-repeat: repeat;
            background-position: center center;
            width: 100%;
            height: 2px;
          }
        }
      }
    }
    &.testimonials {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
      align-items: flex-start;
      padding: $gap 0;

      h2 {
        flex-basis: 100%;
        padding-bottom: $gap;
      }

      .testimonial {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        flex-basis: calc(33.3333% - 16px);
        margin: 16px auto;
      }
      img {
        border-radius: 100%;
        width: 60px;
        height: 60px;
      }
    }
  }
</style>
