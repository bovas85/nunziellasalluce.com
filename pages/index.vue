<template>
  <main class="home">
    <hero-section
      :acf="acf"
      :animateHeader="animateHeader"
      :bgImage="bgImage"
    />

    <who-i-am :acf="acf" :animateWho="animateWho" />

    <div
      id="work"
      class="projects"
    >
      <the-work
        :filteredProjects="filteredProjects"
        :acf="acf"
        :animateWork="animateWork"
      />
    </div>

    <the-process
      :acf="acf"
      :animateProcess="animateProcess"
    />

    <the-capabilities
      :acf="acf"
      :animateCapab="animateCapab"
    />

    <the-testimonials
      :acf="acf"
      :testimonials="testimonials"
      :animateTestimonials="animateTestimonials"
    />
  </main>
</template>

<script>
  import debounce from 'lodash/debounce'
  import HeroSection from '@/components/Sections/Home/HeroSection'
  import Config from '~/assets/config'
  import get from 'lodash/get'
  let scroller, steps

  export default {
    scrollToTop: true,
    data () {
      return {
        animateHeader: false,
        animateWho: false,
        animateWork: false,
        animateProcess: false,
        animateCapab: false,
        animateTestimonials: false
      }
    },
    components: {
      HeroSection,
      WhoIAm: () => import('@/components/Sections/Home/WhoIAm'),
      TheWork: () => import('@/components/Sections/Home/TheWork'),
      TheProcess: () => import('@/components/Sections/Home/TheProcess'),
      TheCapabilities: () => import('@/components/Sections/Home/TheCapabilities'),
      TheTestimonials: () => import('@/components/Sections/Home/TheTestimonials')
    },
    head () {
      return { title: 'Home' }
    },
    async created () {
      const projects = await this.$axios.get(
        Config.wpDomain + Config.api.projects,
        { useCache: true }
      )
      this.$store.commit('setProjects', projects.data)
    },
    async mounted () {
      if (process.browser) {
        if (this.$route.query && this.$route.query.utm_source === 'A/B Testing') {
          // if we have a query and it matches ab testing, run the second page call instead
          if ((this.$cookies.get('ab-testing'), { useCache: true })) {
            const home = await this.$axios.get(
              Config.wpDomain + Config.api.homePage2,
              { useCache: true }
            )
            this.$store.commit('setHomepage', home.data)
          }
        } else {
          this.$cookies.set('ab-testing', true, 30)
          const home = await this.$axios.get(
            Config.wpDomain + Config.api.homePage,
            { useCache: true }
          )
          this.$store.commit('setHomepage', home.data)
        }
        setTimeout(() => {
          this.animateHeader = true
          this.handleScroll()
        }, 150)
        if (this.$route.hash) {
          const clickable = document.querySelector('#js-click')
          const clickableMobile = document.querySelector('#js-click-mobile')

          if (clickable) {
            window.scrollTo(0, 0)
            setTimeout(() => {
              clickable.click()
              clickable.click()
            }, 700)
          } else if (clickableMobile) {
            clickableMobile.click()
          }
        }
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

        window.addEventListener(
          'resize',
          this.scrollamaResize,
          { passive: true },
          false
        )
      },
      scrollamaResize: debounce(function () {
        let step = document.querySelector('.step')
        if (step && step.length) {
          this.handleScroll()
        }
      }, 150)
    },
    beforeDestroy () {
      if (typeof scroller !== 'undefined') {
        scroller.disable && scroller.disable()
      }
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
      filteredProjects () {
        if (!this.projects.length) return false
        const order = get(this.acf, 'case_studies.order')
        return this.projects.sort((a, b) => {
          return order.indexOf(a.id) > order.indexOf(b.id)
        })
      },
      acf () {
        if (this.$store.state.homePage == null) return false
        return this.$store.state.homePage.acf
      },
      testimonials () {
        return get(this.acf, 'testimonials.testimonials')
      },
      bgImage () {
        if (process.browser) {
          if (this.$store.state.window < 577) {
            return get(
              this.homePage,
              'acf.hero.mobile_bg.sizes.large',
              'https://placehold.it/2048/2048'
            )
          } else if (
            this.$store.state.window > 576 &&
            this.$store.state.window < 1440
          ) {
            return get(
              this.homePage,
              'acf.hero.desktop_bg.sizes.large',
              'https://placehold.it/2048/2048'
            )
          } else
            return get(
              this.homePage,
              'acf.hero.desktop_bg.sizes.ultra',
              'https://placehold.it/2048/2048'
            )
        }
        return get(
          this.homePage,
          'acf.hero.desktop_bg.sizes.large',
          'https://placehold.it/2048/2048'
        )
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
  }
</style>
