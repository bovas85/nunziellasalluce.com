<template>
  <div class="case-study">
    <section class="section hero step">
      <div class="container is-flex-column">
          <h1 class="jumbo">Nunziella Salluce Design</h1>
          <h3 class="supertitle">Case Studies - Website <!-- maybe pull from category--> </h3>
          <h3>Subtitle description here</h3>
      </div>
      <div v-scroll="{element:'.client-intro'}" class="scroll-down">
          <p>scroll</p>
          <div class="scroll-down__arrow">
            <icon-arrow :fill="'white'" name='arrow-down' :width="30" :height="40" />
          </div>
      </div>
    </section>

    <section class="client-intro">
      <div class="container is-flex">
        <div class="text-section">
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

        <div class="image-section">
          <img src="https://placecage.com/1024/668" alt="Some alt from wp" />
        </div>
      </div>
    </section>

    <section class="the-brand">
      <div class="container">
        <h1>The Brand</h1>

        <div class="timeline">
          some timeline to do
        </div>
      </div>
    </section>

    <section class="the-challenge">
      <div class="container">
        <h1>The Challenge</h1>
        <p>
          Type I had to redesign a new feel and concept for their Website, using a more modern 
  layout and style, while keeping the business attitude.
        </p>
        <div class="two-columns">
          <div class="column column--left">
            <h3>Insights</h3>
            <ul>
              <li>Some insight</li>
              <li>Some insight</li>
              <li>Some insight</li>
              <li>Some insight</li>
              <li>Some insight</li>
            </ul>
          </div>
          <div class="column column--right">
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

    <section class="final-product">
      <div class="container">
        <h1>Final Product</h1>
        <p>I created a dynamic and colourful website with a clearstructure and navigation, three main 
  sections for each type of client identified, and a blog section for the latest news.</p>

        <img src="https://placecage.com/g/1400/600" alt="some alt from wp" />
        
        <img src="https://placecage.com/1400/600" alt="some alt from wp" />
      </div>
    </section>

    <div class="work-navigation">
      <div class="container is-flex">
        <nuxt-link to="/">Previous Project</nuxt-link>
        <nuxt-link to="/">Next Project</nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    components: {
      IconArrow: () => import('@/components/Icons/IconArrow')
    },
    data () {
      return {}
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
    }
  }
</script>

<style lang='scss' scoped>
  h1 {
    padding-bottom: 60px;
  }
  section {
    margin: $gap * 1.5 $gap;

    @include media(md) {
      margin: $gap * 3 auto;
    }
    &.hero {
      background-image: url('https://fillmurray.com/g/600/800');
      background-size: cover;
      background-position: center;
      margin: 0;

      @include media(md) {
        margin: $gap * 3 auto;
      }

      @include media(md) {
        background-image: url('https://fillmurray.com/g/1280/768');
      }

      @include media(lg) {
        background-image: url('https://fillmurray.com/g/2048/1024');
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

      .supertitle {
        position: absolute;
        top: calc(60px + 50px);
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
          font-size: $font-size * $rule * $rule;
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
        img {
          object-fit: cover;
          object-position: center;
          max-height: 650px;
          width: 100%;
        }
      }
    }
    &.timeline {
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
            font-size: $font-size * $rule * $rule;
          }
        }
      }
    }
  }
  .work-navigation {
    .container {
      justify-content: space-between;
      margin-left: auto;
    }

    a {
      margin-bottom: $gap * 2;
    }
  }
</style>
