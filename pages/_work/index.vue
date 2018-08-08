<template>
  <div class="case-study" v-if="project != null">
    <section class="section hero step" v-if="project.hero != null" :style="`background-image: url('${bgImage}')`">
      <div class="container is-flex-column" :class="{'animated': animateHeader}">
          <h1 class="jumbo">{{project.hero.title}}</h1>
          <h3 class="supertitle">Case Studies - {{project.category}}</h3>
          <h3>{{project.hero.description}}</h3>
      </div>
      <div v-scroll="{element:'.client-intro'}" class="scroll-down" :class="{'animated': animateHeader}">
          <p>scroll</p>
          <div class="scroll-down__arrow">
            <icon-arrow :fill="'white'" name='arrow-down' :width="30" :height="40" />
          </div>
      </div>
    </section>

    <section class="client-intro step" v-if="project.intro != null">
      <div class="container is-flex">
        <div class="text-section" :class="{'animated': animateIntro}">
          <h3>Client</h3>
          <p>{{project.intro.client_name}}</p>
          <a
            v-if="project.intro.link != null"
            :href="project.intro.link"
            target="_blank">
              Show Live site
          </a>
          <h3>Deliverables</h3>
          <ul>
            <li 
              v-for="(deliverable, index) in project.intro.deliverables"
              :key="index"
            >{{deliverable.item}}</li>
          </ul>
        </div>

        <div class="image-section" :class="{'animated': animateIntro}" v-if="project.intro.image != null">
          <lazy-image
            class='image'
            :image="project.intro.image"
            :imageMobile="project.intro.image"
          />
        </div>
      </div>
    </section>

    <section class="the-brand step" v-if="project.brand != null">
      <div class="container">
        <h1 :class="{'animated': animateBrand}">{{project.brand.title}}</h1>
      </div>

      <div class="timeline" :class="{'animated': animateBrand}">
        <the-timeline :data="project.brand.items"></the-timeline>
      </div>
    </section>

    <section class="the-challenge step" v-if="project.challenge != null">
      <div class="container">
          <div class="text-section" :class="{'animated': animateChallenge}">
            <h1>{{project.challenge.title}}</h1>
            <p>
              {{project.challenge.body}}
            </p>
          </div>
        <div class="two-columns">
          <div class="column column--left" :class="{'animated': animateChallenge}">
            <h3>Insights</h3>
            <ul>
              <li
                v-for="(insight, index) in project.challenge.left_list.list_item"
                :key="index"
              >
                {{insight.item}}
              </li>
            </ul>
          </div>
          <div class="column column--right" :class="{'animated': animateChallenge}">
            <h3>Action</h3>
            <ul>
              <li
                v-for="(action, index) in project.challenge.right_list.list_item"
                :key="index"
              >
                {{action.item}}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="final-product step" v-if="project.product != null">
      <div class="container">
        <div class="text-section" :class="{'animated': animateFinal}">
          <h1>{{project.product.title}}</h1>
          <p>
            {{project.product.body}}
          </p>
        </div>
        
        <div
          class="image-section step"
          v-for="(content, index) in project.product.the_content"
          :key="index"
        >
          <lazy-image
            v-if="content.image != null"
            class='image'
            :image="content.image"
            :imageMobile="content.image"
          />
        </div>
      </div>
    </section>

    <div class="work-navigation step" :class="{'animated': animateBottomImage}" v-if="previousProject.acf.hero && nextProject.acf.hero">
      <div class="container-fluid is-flex">
        <nuxt-link class="previous" :to="previousProject.slug">
          <lazy-image
            v-if="previousProject.acf.hero != null"
            class='image'
            :hover="false"
            :image="previousProject.acf.hero.desktop_bg"
            :imageMobile="previousProject.acf.hero.mobile_bg"
          >
            <span>{{previousProject.acf.hero.title}}</span>
          </lazy-image>
          <p>Previous Project</p>
        </nuxt-link>
        <nuxt-link class="next" :to="nextProject.slug">
          <lazy-image
            v-if="nextProject.acf.hero != null"
            class='image'
            :hover="false"
            :image="nextProject.acf.hero.desktop_bg"
            :imageMobile="nextProject.acf.hero.mobile_bg"
          >
            <span>{{nextProject.acf.hero.title}}</span>
          </lazy-image>
          <p>Next Project</p>
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
      TheTimeline: () => import('@/components/Sliders/TheTimeline'),
      LazyImage: () => import('@/components/UI/LazyImage')
    },
    middleware: 'routeGuard',
    head () {
      if (
        this.project &&
        this.projectTitle != null &&
        this.project.seo != null &&
        this.project.hero != null
      ) {
        return {
          title: this.capitalizeFirstLetter(this.projectTitle.replace(/-/g, ' ')),
          meta: [
            {
              hid: 'description',
              name: 'description',
              content: this.project.seo.description
            },
            {
              hid: 'keywords',
              name: 'keywords',
              content:
                this.project.keywords ||
                `${this.projectTitle.replace(
                  /-/g,
                  ' '
                )}, ${this.projectTitle.replace(/-/g, ', ')}`
            },
            {
              hid: 'description',
              itemprop: 'description',
              content: this.project.seo.description
            },
            {
              hid: 'image',
              itemprop: 'image',
              content: this.project.hero.desktop_bg.sizes.large
            },
            {
              hid: 'twitter:title',
              name: 'twitter:title',
              content: this.capitalizeFirstLetter(
                this.projectTitle.replace(/-/g, ' ')
              )
            },
            {
              hid: 'twitter:description',
              name: 'twitter:description',
              content: this.project.seo.description
            },
            {
              hid: 'twitter:image',
              name: 'twitter:image',
              content: this.project.hero.desktop_bg.sizes.large
            },
            {
              hid: 'og:title',
              name: 'og:title',
              content: this.capitalizeFirstLetter(
                this.projectTitle.replace(/-/g, ' ')
              )
            },
            { hid: 'og:url', name: 'og:url', content: this.$route.path },
            {
              hid: 'og:description',
              name: 'og:description',
              content: this.project.seo.description
            },
            {
              hid: 'og:image',
              name: 'og:image',
              content: this.project.hero.desktop_bg.sizes.large
            }
          ]
        }
      } else {
        return {
          title: 'Case Study'
        }
      }
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
        response.element.classList.add('animated')
        const length = document.querySelectorAll('.step').length - 2
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
          case length:
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
      projectTitle () {
        if (
          !this.$store.state.projects.length ||
          !this.$store.state.projects[this.getIndex]
        ) {
          return ''
        }
        return this.$store.state.projects[this.getIndex].slug
      },
      project () {
        if (
          !this.$store.state.projects.length ||
          !this.$store.state.projects[this.getIndex]
        )
          return false
        return this.$store.state.projects[this.getIndex].acf
      },
      getIndex () {
        if (!this.projects.length) return 0
        return this.projects.findIndex(
          index => this.$route.params.work === index.slug
        )
      },
      previousProject () {
        if (this.getIndex === 0) {
          return this.projects[this.projects.length - 1]
        } else return this.projects[this.getIndex - 1]
      },
      nextProject () {
        if (this.getIndex === this.projects.length - 1) {
          return this.projects[0]
        } else return this.projects[this.getIndex + 1]
      },
      bgImage () {
        if (!this.project) return 'https://placehold.it/2048/2048'
        if (process.browser) {
          if (this.$store.state.window < 577) {
            return this.project.hero.mobile_bg.sizes.large
          } else if (
            this.$store.state.window > 576 &&
            this.$store.state.window < 1440
          ) {
            return this.project.hero.desktop_bg.sizes.large
          } else return this.project.hero.desktop_bg.sizes.ultra
        }
        return this.project.hero.desktop_bg.sizes.large
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
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      margin: 0;

      @include media(md) {
        background-position: right;
      }

      @include media(xl) {
        background-position: center;
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

      h3 {
        max-width: 780px;
      }

      .supertitle {
        position: absolute;
        top: calc(calc(50% - 20vh));
        text-transform: uppercase;
        font-weight: 600;

        @include media(sm) {
          top: calc(60px + 50px);
        }
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

        a {
          color: currentColor;
          text-decoration: none;
          @include size(h4);

          &:hover {
            text-decoration: underline;
          }
        }

        h3,
        li {
          color: currentColor;
        }
      }

      .image-section {
        @include fadeInUp;
        transition-delay: 0.2s;

        @include media(lg) {
          flex-basis: 70%;
        }

        .image {
          display: block;
          img {
            position: relative;
            object-fit: cover;
            object-position: center;
            max-height: 650px;
            width: 100%;
          }
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
        &:nth-child(2) {
          @include fadeInUp;
          transition-delay: 0.2s;
        }
        &:nth-child(3) {
          @include fadeInUp;
          transition-delay: 0.4s;
        }
        &:nth-child(n + 1) {
          @include fadeInUp;
          transition-delay: 0.6s;
        }
      }
    }
  }

  .work-navigation {
    margin: $gap * 2 0 $gap * 1.5;
    height: 100%;
    @include fadeInUp;
    transition-delay: 1s;

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
      position: relative;
      bottom: 0;
      height: 100%;
      transition: transform 0.4s ease-in-out;

      &:after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 30px;
        z-index: 1;
        background: rgba(0, 0, 0, 0.4);
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
      }

      p {
        font-weight: bold;
        color: black;
        text-decoration: none;
      }

      span {
        @include size(h4);
        color: white;
        max-width: 100px;
        position: absolute;
        pointer-events: none;
        top: 50%;
        left: 50%;
        opacity: 0;
        z-index: 2;
        transition: all 0.4s ease-in-out;
      }

      &.previous {
        text-align: right;
        transform: translateX(-120px);

        span {
          transform: translate(-100%, -50%);
        }
      }

      &.next {
        transform: translateX(120px);

        span {
          transform: translate(100%, -50%);
        }
      }

      &:hover {
        &.next,
        &.previous {
          transform: translateX(0);
        }
        span {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
        &:after {
          opacity: 1;
        }
      }

      /deep/ img {
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
