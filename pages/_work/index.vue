<template>
  <div class="case-study" v-if="project != null">
    <section class="section hero step" v-if="project.hero != null">
      <lazy-image
        class='image'
        :image="project.hero.desktop_bg"
        :title="project.hero.title"
        positionMobile="left"
        :hover="false"
        :imageMobile="project.hero.mobile_bg"
        home
      />
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
            class="animated-border"
            :href="project.intro.link"
            target="_blank">
              Launch Site
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
            :hover="false"
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
        <div class="flexible-content container-fluid" v-if="project.challenge.flexible_content.length">
          <div 
            v-for="(content, index) in project.challenge.flexible_content"
            :key="index"
            :class="content.acf_fc_layout"
          >
            <lazy-image
              v-if="content.acf_fc_layout === 'image'"
              class="image"
              :hover="false"
              :image="content.image"
              :imageMobile="content.image"
            />
            <p v-else-if="content.acf_fc_layout === 'text'">{{content.text}}</p>
            <lazy-image
              v-else
              class="double_image"
              :hover="false"
              position="right"
              :image="content.double_image"
              :imageMobile="content.double_image"
            />
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
            :hover="false"
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
  import Config from '~/assets/config'

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
    async mounted () {
      if (process.browser) {
        const { data } = await this.$axios.get(
          Config.wpDomain + Config.api.projects
        )
        this.$store.commit('setProjects', data)
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
        let scroller, steps
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

        window.addEventListener(
          'resize',
          debounce(() => {
            let step = document.querySelector('.step')
            if (step && step.length) {
              this.handleScroll()
            }
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
      overflow: hidden;
      margin: 0;
      /deep/ .lazy-image {
        object-fit: cover;
        object-position: center;
        position: absolute;
        height: 100vh;
        width: 100%;
        z-index: -1;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
      }

      @include media(md) {
        /deep/ .lazy-image {
          object-position: right;
          animation: zoomImage infinite;
          animation-delay: 0.3s;
          animation-timing-function: linear;
          animation-fill-mode: both;
          animation-duration: 80s;
          backface-visibility: hidden;
        }
        // background-position: right;
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
        top: 100px;
        top: calc(60px + #{$gap * 1.5});
        text-transform: uppercase;
        font-weight: 600;

        @include media(sm) {
          top: calc(90px + 50px);
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

          @include media(md) {
            max-height: 50vh;
          }
          img {
            position: relative;
            object-fit: cover;
            object-position: center;
            max-height: 650px;
            width: 100%;
          }
        }
      }

      a {
        position: relative;
        padding: 5px 0;
      }

      a:hover {
        text-decoration: none;
      }

      a:before,
      a:after {
        content: '';
        position: absolute;
        width: 0%;
        height: 2px;
        bottom: -2px;
        background: $primary;
      }

      a:before {
        left: 0;
      }

      a:after {
        right: 0;
        transition: width 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
      }

      a:hover:before {
        width: 100%;
        transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
      }

      a:hover:after {
        background: transparent;
        width: 100%;
        transition: 0s;
      }
    }
    &.the-brand {
      overflow: hidden;
      position: relative;

      h1 {
        @include fadeInUp;
        padding-bottom: 60px;
        margin-bottom: $gap * 2;
        max-width: 150px;

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
      overflow: hidden;
      @include media(md) {
        margin-bottom: $gap * 3;
      }

      h1 {
        max-width: 150px;
      }

      .two-columns {
        margin-bottom: $gap * 2;
        @include media(md) {
          display: flex;
          flex-wrap: wrap;
          width: 100%;
          justify-content: space-between;
        }
      }
      .column {
        width: 100%;

        @include media(md) {
          width: 48%;
          flex-basis: calc(50% - #{$gap / 2});
        }

        h3 {
          font-weight: bold;
          text-transform: uppercase;
          line-height: 3;
          color: $primary;
        }
        ul {
          list-style-type: none;
          margin: 0;
          padding: 0;

          li {
            @include size(h3);
            padding: 8px 0;
          }
        }

        &--left {
          @include fadeInUp;
          transition-delay: 0.2s;
        }
        &--right {
          @include fadeInUp;
          position: relative;
          background: transparent;
          transition-delay: 0.4s;
          z-index: 1;
          padding: 0 $gap / 1.5 $gap / 1.5;

          &:after {
            content: '';
            position: absolute;
            background: $lightgrey;
            z-index: -1;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0;
            transform: translateX(200%);
            transition: all 0.6s ease-in-out 0.8s;
          }

          &.animated {
            &:after {
              transform: translateX(0);
              opacity: 1;
            }
          }
        }
      }
      .text-section {
        @include fadeInUp;
      }
      .flexible-content {
        display: flex;
        flex-basis: 100%;
        flex-direction: column;
        margin: 0 auto;
        display: grid;
        grid-auto-rows: minmax(1fr, minmax(340px, 680px));

        .image {
          width: 80%;
          margin: $gap auto;

          @supports (display: grid) {
            @include media(md) {
              height: 100%;
              margin: 0 auto;
              /deep/ img {
                object-fit: contain !important;
              }
            }
          }
        }

        .double_image {
          grid-column: 1 / -1;

          @include media(lg) {
            grid-column: span 6;
          }
          /deep/ img {
            object-fit: cover;
            object-position: center;
            @supports (display: grid) {
              height: 340px;
            }
          }
        }
        .text {
          margin: $gap 0;
        }
      }
    }
    &.final-product {
      margin-top: 0;
      margin-bottom: $gap - 4px;

      h1 {
        max-width: 150px;
      }

      .container {
        display: flex;
        flex-direction: column;

        @include media(md) {
          display: grid;
        }
        grid-gap: $gap;
      }

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
        /deep/ img {
          object-fit: cover;
          object-position: center;
          grid-row: span 1;
          max-height: 75vh;
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

    p {
      font-size: $font-size;
    }

    .container-fluid {
      justify-content: space-between;
      padding: 0 $gap;
      height: 160px;
      position: relative;
      overflow: hidden;

      @include media(sm) {
        padding: 0;
        margin-left: auto;
      }

      @supports (display: grid) {
        height: 100%;
      }
    }

    /deep/ .progressive-image-wrapper {
      padding-top: 0 !important;
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
        bottom: 0;
        z-index: 1;
        background: rgba(0, 0, 0, 0.4);
        opacity: 0;
        transition: opacity 0.2s ease-in-out;

        @supports (display: grid) {
          bottom: 20px;
        }
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
        @include media(md) {
          transform: translateX(-120px);
        }

        span {
          @include media(md) {
            transform: translate(-100%, -50%);
          }
        }
      }

      &.next {
        @include media(md) {
          transform: translateX(120px);
        }

        span {
          @include media(md) {
            transform: translate(100%, -50%);
          }
        }
      }

      @include media(md) {
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
      }

      /deep/ img {
        display: none;

        @include media(md) {
          display: block;
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
  }
</style>
