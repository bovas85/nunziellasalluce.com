<template>
  <main class="home">
    <div class="app">
      <div class="mock-content">
        <img src='/images/logo.svg' alt='Logo' />
        <p>The slider will only slide when inside the viewport</p>
        <p>Slide down to verify</p>
        <p>|</p>
        <p>|</p>
        <p>V</p>
      </div>

      <!-- mobile slider is only visible below tablet size -->
      <no-ssr>
        <vue-media :query="{maxWidth: 767}">
          <section class="mobile-sliders">
            <h1>Design Better. Faster. Together.</h1>
            <home-mobile-slider
              v-for='(slide, index) in API'
              :key='index'
              :data="slide"
            ></home-mobile-slider>
          </section>
        </vue-media>
      </no-ssr>
      <!-- desktop version is visible otherwise -->
      <no-ssr>
        <vue-media :query="{minWidth: 768}">
          <section class="desktop-tabs">
            <h1>Design Better. Faster. Together.</h1>
            <!-- list items for each section -->
            <intersect @enter="pauseTimer(true)" @leave="pauseTimer(false)">
              <Wrapper class='container wrapper button-wrapper'>
                <StyledButton
                  class='styled-button'
                  @click='selectSection(section.name, true)'
                  v-for='(section, index) in API'
                  :key='index'
                  :active='section.name === $store.state.currentTab'>
                  {{section.text}}
                  <span>{{section.name}}</span>
                  <!-- timer for each tab switch -->
                  <Timer class='timer' :class='{active: section.name === $store.state.currentTab}' />
                </StyledButton>
              </Wrapper>
            </intersect>

            <!-- dynamic tab using props -->
            <div class='is-relative container'>
              <transition-group
                name='fade'
                mode='out-in'
              >
              <app-tab
                  v-for='(section, index) in API'
                  @click='$store.commit("selectTab", section.name)'
                  :key='index'
                  :class="{active: section.name === $store.state.currentTab}"
                  :content='section'
                />
              </transition-group>
            </div>
          </section>
        </vue-media>
      </no-ssr>
    </div>
  </main>
</template>

<script>
  import debounce from 'lodash/debounce'
  import anime from 'animejs'
  import API from '~/assets/api.js'
  import Wrapper from '@/components/Styled/Wrapper'
  import Timer from '@/components/Styled/Timer'
  import StyledButton from '@/components/Styled/StyledButton'

  var timer = null

  export default {
    scrollToTop: true,
    data () {
      return {
        API: API
      };
    },
    components: {
      HomeMobileSlider: () => import("@/components/Sliders/HomeMobileSlider"),
      AppTab: () => import("@/components/UI/AppTab"),
      Wrapper,
      Timer,
      StyledButton
    },
    head () {
      return { title: "Home" };
    },
    mounted () {
      if (process.browser) {
        // check connection type
        var connection =
          navigator.connection ||
          navigator.mozConnection ||
          navigator.webkitConnection;
        if (connection != null) {
          var type = connection.type;
          let vm = this;
          function updateConnectionStatus () {
            vm.$store.commit("setConnection", connection.type);
          }
          connection.addEventListener("typechange", updateConnectionStatus);
        }
        this.$store.commit("setConnection", type);
        // on load trigger window width mutation once
        this.$store.commit("windowResize", window.innerWidth);

        window.onNuxtReady(app => {
          // resize triggers window width mutation
          window.addEventListener(
            "resize",
            debounce(() => {
              this.animate()
              this.$store.commit("windowResize", window.innerWidth);
            }, 300)
          )
          this.animate()
        })
      }
    },
    methods: {
      animate () {
        timer = anime({
          /**
           * This takes care of performance improvements, pausing and easing
           */
          targets: document.querySelector('.timer.active'),
          easing: 'linear',
          maxWidth: '100%', // target width after duration
          duration: this.$store.state.timerDuration,
          loop: false,
          autoplay: false,
          complete: anim => {
            /**
             * Once the timer is complete we pause it,
             * Set it to 0 for the next timer,
             * Switch to the next tab and then recreate the timer on the new active element
             */
            timer.pause()
            document.querySelector('.timer.active').style.maxWidth = 0
            this.nextSection(this.$store.state.currentTab)

            setTimeout(() => {
              this.animate()
              timer.play()
            }, 150)
          }
        })
      },
      pauseTimer (isVisible) {
        /**
         * Pause the timer when not in viewport,
         * resume it once entered in viewport
         */
        if (timer == null) return false // timer was destroyed
        isVisible ? timer.play() : timer.pause()
      },
      selectSection (name, clicked) {
        /**
         * Set the tab content to the one selected
         * When doing so we reset the timer, hide it and destroy the timer instance
         */
        if (clicked) {
          timer && timer.pause() // only pause if timer exists
          timer = null
          document.querySelector('.timer.active').style.opacity = 0
          document.querySelector('.timer.active').style.maxWidth = 0
        }
        /**
         * We set the name of the tab to check which is active
         */
        this.$store.commit('selectTab', name)
      },
      nextSection (current) {
        /**
         * Find the current index in the array of sections
         * Change to the next element
         */
        let index = API.findIndex((element, index) => {
          return element.name === current
        })
        // if last index, set back to first
        if (index > -1 && index === API.length - 1) {
          this.selectSection(API[0].name)
        }
        else if (index > -1) this.selectSection(API[index + 1].name)
      }
    }
  }
</script>