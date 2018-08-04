<template>
  <div class="case-study">
    <section class="section hero step">
      <div class="container is-flex-column" :class="{'animated': animateHeader}">
          <h1 class="jumbo">Nunziella Salluce Design</h1>
          <h3 class="supertitle">Case Studies - Website <!-- maybe pull from category--> </h3>
          <h3>Subtitle description here</h3>
      </div>
      <div v-scroll="{element:'.client-intro'}" class="scroll-down" :class="{'animated': animateHeader}">
          <p>scroll</p>
          <div class="scroll-down__arrow">
            <icon-arrow :fill="'white'" name='arrow-down' :width="30" :height="40" />
          </div>
      </div>
    </section>

    <section class="client-intro step">
      <div class="container is-flex">
        <div class="text-section" :class="{'animated': animateIntro}">
          <h3>Client</h3>
          <p>Caspian Media Ltd.</p>
          <h3>Deliverables</h3>
          <ul>
            <li>Strategy</li>
            <li>Website</li>
            <li>UI/UX</li>
            <li>Digital Design</li>
          </ul>
        </div>

        <div class="image-section" :class="{'animated': animateIntro}">
          <img src="https://placehold.it/1024/668" alt="Some alt from wp" />
        </div>
      </div>
    </section>

    <section class="the-brand step">
      <div class="container">
        <h1 :class="{'animated': animateBrand}">The Brand</h1>
      </div>

      <div class="timeline" :class="{'animated': animateBrand}">
        <the-timeline :data="[0, 1, 2, 3, 4, 5]"></the-timeline>
      </div>
    </section>

    <section class="the-challenge step">
      <div class="container">
          <div class="text-section" :class="{'animated': animateChallenge}">
            <h1>The Challenge</h1>
            <p>
            Type I had to redesign a new feel and concept for their Website, using a more modern 
    layout and style, while keeping the business attitude.
            </p>
          </div>
        <div class="two-columns">
          <div class="column column--left" :class="{'animated': animateChallenge}">
            <h3>Insights</h3>
            <ul>
              <li>Some insight</li>
              <li>Some insight</li>
              <li>Some insight</li>
              <li>Some insight</li>
              <li>Some insight</li>
            </ul>
          </div>
          <div class="column column--right" :class="{'animated': animateChallenge}">
            <h3>Action</h3>
            <ul>
              <li>Some action</li>
              <li>Some action</li>
              <li>Some action</li>
              <li>Some action</li>
              <li>Some action</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="final-product step">
      <div class="container">
          <div class="text-section" :class="{'animated': animateFinal}">
            <h1>Final Product</h1>
            <p>I created a dynamic and colourful website with a clearstructure and navigation, three main 
    sections for each type of client identified, and a blog section for the latest news.</p>
          </div>
        <div class="image-section">
            <img :class="{'animated': animateFinal}" src="https://placehold.it/800x600" alt="some alt from wp" />
            
            <img class="step" :class="{'animated': animateBottomImage}" src="https://placehold.it/800x600" alt="some alt from wp" />
        </div>
      </div>
    </section>

    <div class="work-navigation" :class="{'animated': animateBottomImage}">
      <div class="container-fluid is-flex">
        <nuxt-link class="previous" :to="previousProject">
          <img src="https://placehold.it/250x180" alt="Previous Project">
          Previous Project
        </nuxt-link>
        <nuxt-link class="next" :to="nextProject">
          <img src="https://placehold.it/250x180" alt="Next Project">
          Next Project
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
  import IconArrow from '@/components/Icons/IconArrow'
  import debounce from 'lodash/debounce'

  export default {
    components: {
      IconArrow,
      TheTimeline: () => import('@/components/Sliders/TheTimeline')
    },
    data () {
      return {
        animateHeader: false,
        animateIntro: false,
        animateBrand: false,
        animateChallenge: false,
        animateFinal: false,
        animateBottomImage: false
      }
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
            this.animateIntro = true
            break
          case 2:
            this.animateBrand = true
            break
          case 3:
            this.animateChallenge = true
            break
          case 4:
            this.animateFinal = true
            break
          case 5:
            this.animateBottomImage = true
            break
          default:
            break
        }
      },
      handleScroll () {
        const scroller = this.scrollama()
        const steps = scroller
          .setup({
            step: '.step',
            offset: 0.4,
            debug: false
          })
          .onStepEnter(this.handleStepEnter)
          .onStepExit(this.showMenu)

        steps.resize()
        steps.enable()

        window.addEventListener(
          'resize',
          debounce(function () {
            steps.resize()
          }, 150),
          { passive: true }
        )
      }
    },
    computed: {
      projects () {
        if (!this.$store.state.projects.length) return false
        return this.$store.state.projects
      },
      getIndex () {
        if (!this.projects.length) return 0
        return this.projects.findIndex(
          index => this.$route.params.work === index.slug
        )
      },
      previousProject () {
        if (this.getIndex === 0) {
          return this.projects[this.projects.length - 1].slug
        } else return this.projects[this.getIndex - 1].slug
      },
      nextProject () {
        if (this.getIndex === this.projects.length - 1) {
          return this.projects[0].slug
        } else return this.projects[this.getIndex + 1].slug
      }
    }
  }
</script>

<style lang='scss' scoped>
  h1 {
    padding-bottom: $gap;

    @include media(sm) {
      padding-bottom: 60px;
      max-width: 280px;
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
      margin: 0;

      @include media(md) {
        margin: 0 auto $gap * 3;
        background-image: url('https://placehold.it/1280/768');
      }

      @include media(lg) {
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

      @include media(sm) {
        padding: 0;
      }

      .container {
        height: 100%;
        justify-content: center;
        @include fadeInUp;
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
        @include fadeInUp;
        transition-delay: 0.2s;

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
        padding: $gap * 3 0 $gap;

        @include media(sm) {
          max-width: 410px;
          padding: 0 0 $gap;
        }
      }

      h1,
      h3 {
        color: white;
      }

      .supertitle {
        position: absolute;
        top: calc(calc(50% - 13vh));
        @include media(sm) {
          top: calc(60px + 50px);
        }
        text-transform: uppercase;
        font-weight: 600;
      }
    }
    &.client-intro {
      padding: 0;

      .container {
        flex-wrap: wrap;
        justify-content: space-between;
      }

      .text-section {
        height: 100%;
        align-self: flex-end;
        color: black;
        @include fadeInUp;

        h3 {
          font-weight: bold;
          line-height: 3;
          text-transform: uppercase;
        }
        ul {
          list-style-type: none;
          padding: 0;
          margin: 0 0 $gap * 1.5;

          @include media(lg) {
            margin: 0;
          }
        }
        li,
        p {
          @include size(h3);
        }
        h3,
        li {
          color: currentColor;
        }
      }

      .image-section {
        @include media(lg) {
          flex-basis: 70%;
        }
        @include fadeInUp;
        transition-delay: 0.2s;
        img {
          object-fit: cover;
          object-position: center;
          max-height: 650px;
          width: 100%;
        }
      }
    }
    &.the-brand {
      overflow: hidden;
      position: relative;

      h1 {
        @include fadeInUp;
        padding-bottom: 60px;
        margin-bottom: $gap * 2;

        @include media(sm) {
          margin-bottom: $gap * 3;
        }
      }

      .timeline {
        @include fadeInUp;
        transition-delay: 0.2s;
      }
    }
    &.the-challenge {
      .two-columns {
        @include media(md) {
          display: flex;
          justify-content: space-between;
        }
      }
      .column {
        flex-basis: calc(50% - #{$gap / 2});

        h3 {
          font-weight: bold;
          text-transform: uppercase;
          line-height: 3;
        }
        ul {
          list-style-type: none;
          margin: 0;
          padding: 0;

          li {
            @include size(h3);
          }
        }
        &--left {
          @include fadeInUp;
          transition-delay: 0.2s;
        }
        &--right {
          @include fadeInUp;
          transition-delay: 0.4s;
        }
      }
      .text-section {
        @include fadeInUp;
      }
    }
    &.final-product {
      margin-bottom: $gap - 4px;

      .text-section {
        @include fadeInUp;
        margin-bottom: $gap;

        @include media(sm) {
          margin-bottom: 0;
        }
      }
      .image-section {
        display: grid;
        grid-gap: $gap;
        img {
          object-fit: cover;
          object-position: center;
          grid-row: span 1;
        }
        img:nth-child(1) {
          @include fadeInUp;
          transition-delay: 0.2s;
        }
        img:nth-child(2) {
          @include fadeInUp;
        }
      }
    }
  }
  .work-navigation {
    margin: $gap * 2 0 $gap * 1.5;
    height: 100%;
    @include fadeInUp;
    transition-delay: 0.4s;

    .container-fluid {
      justify-content: space-between;
      padding: 0 $gap;
      height: 100%;
      position: relative;
      overflow: hidden;

      @include media(sm) {
        padding: 0;
        margin-left: auto;
      }
    }

    a {
      font-weight: bold;
      color: black;
      text-decoration: none;
      position: relative;
      bottom: 0;
      transition: transform 0.4s ease-in-out;

      &.previous {
        text-align: right;
        transform: translateX(-120px);
      }

      &.next {
        transform: translateX(120px);
      }

      &:hover {
        &.next,
        &.previous {
          transform: translateX(0);
        }
      }

      img {
        width: 250px;
        height: 180px;
        object-fit: cover;
        object-position: center;
        position: relative;
        bottom: 20px;
        left: 0;
      }
    }
  }
</style>
