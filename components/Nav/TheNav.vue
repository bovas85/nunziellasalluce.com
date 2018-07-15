<template>
  <div class="navigation-bar">
    <div class="navigation" :class="{'scrolled': $store.state.menuScrolled}">
      <nav
        role="navigation"
        class="container is-flex navbar">
        <nuxt-link
          to="/"
          @click="refreshPage()"
          class="logo col--8-mobile col--4-tablet is-center">
          <the-logo
            :width="50"
            :height="31"
            :fill="$store.state.menuScrolled ? '#f4a261' : 'white'"
          />
        </nuxt-link>

        <div
          v-if="$store.state.window && $store.state.window < 1024"
          @click="$store.commit('openMenu')"
          class="menu menu--mobile"
        >
          <div>MENU</div>
        </div>


        <ul
          v-else
          class="menu menu--desktop">
          <nuxt-link
            :to="`/${menu}`"
            v-for="(menu, index) in menuItems"
            :key="index"
          >
            {{ menu === '' ? 'Home' : menu }}
          </nuxt-link>

        </ul>
      </nav>
    </div>

    <no-ssr>
      <vue-media :query="{maxWidth: 1024}">
        <div
          style="z-index: 9999"
          class="modal-container is-hidden-desktop">
          <the-menu-mobile
            :menu-items="menuItems"
          />
        </div>
      </vue-media>
    </no-ssr>
  </div>

</template>

<script>
  import debounce from 'lodash/debounce'
  import TheLogo from '@/components/Icons/TheLogo'

  export default {
    name: 'TheNav',
    data () {
      return {
        menuItems: ['', 'projects', 'contact']
      }
    },
    components: {
      TheMenuMobile: () => import('@/components/Nav/TheMenuMobile'),
      TheLogo
    },
    methods: {
      refreshPage () {
        if (this.$route.path === '/') {
          window.location.reload()
          window.scrollTo(0, 0)
        }
      }
    },
    async mounted () {
      if (process.browser) {
        // check connection type
        var connection =
          navigator.connection ||
          navigator.mozConnection ||
          navigator.webkitConnection
        if (connection != null) {
          var type = connection.type
          let vm = this
          function updateConnectionStatus () {
            console.log(
              'Connection type changed from ' + type + ' to ' + connection.type
            )
            vm.$store.commit('setConnection', connection.type)
          }
          connection.addEventListener('typechange', updateConnectionStatus)
        }
        // console.log("Connection type: " + type);
        this.$store.commit('setConnection', type)
        // on load trigger window width mutation once
        this.$store.commit('windowResize', window.innerWidth)

        window.onNuxtReady(app => {
          // resize triggers window width mutation
          window.addEventListener(
            'resize',
            debounce(() => {
              console.log('window resize')
              this.$store.commit('windowResize', window.innerWidth)
            }, 300)
          )
        })

        // route management for menus/state/transitions
        this.$root.$on('routeChanged', () => {
          // console.log('route changed, transitioning')
          this.$store.commit('resetMenus')
          let body = document.querySelector('body')
          let html = document.querySelector('html')
          if (body && html) {
            body.style.overflow = 'visible'
            html.style.overflow = 'visible'
            body.style.position = 'static'
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .navigation {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 5;
    height: 90px;
    background-color: transparent;
    box-shadow: unset;
    margin: 0 auto;
    transition: all 0.3s ease-in-out;

    .navbar {
      align-items: center;
      // padding: 0 15px;
      height: 100%;
      justify-content: space-between;
      align-items: center;
      @media (min-width: $tablet) {
        // padding: 0 36px;
      }
      .logo {
        &:before,
        &:after {
          display: none;
        }
      }
      img {
        width: 50px;
        height: 31px;
        object-fit: contain;
        stroke: $primary;
      }
      .menu {
        &--mobile {
          display: block;
        }
        &--desktop {
          display: flex;
          justify-content: space-around;
          a {
            cursor: pointer;
            font-size: $font-size + 4px;
            text-transform: capitalize;
            font-weight: 400;
            color: white;
            transition: color 0.3s ease-in-out;
            &.nuxt-link-active {
              color: $primary;
            }
            &:not(:last-child) {
              margin-right: $gap;
            }
          }
        }
      }
      a {
        position: relative;
        padding: $gap / 3 0;
      }

      a:hover {
        color: #fff;
        text-decoration: none;
      }

      a:before,
      a:after {
        content: '';
        position: absolute;
        width: 0%;
        height: 2px;
        bottom: -2px;
        background: #fff;
      }

      a:before {
        left: 0;
      }

      a:after {
        right: 0;
        background: #fff;
        transition: width 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
      }

      a:hover:before {
        background: #fff;
        width: 100%;
        transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
      }

      a:hover:after {
        background: transparent;
        width: 100%;
        transition: 0s;
      }
    }

    &.scrolled {
      background-color: #f0efef;
      box-shadow: 0 0 4px 1px $secondary-gray;

      .navbar a {
        color: $secondary;

        &:before,
        &:after {
          background: $primary;
        }

        &:hover:before {
          background: $primary;
          width: 100%;
          transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
        }

        &:hover:after {
          background: transparent;
          width: 100%;
          transition: 0s;
        }
      }
    }

    i {
      color: $grey;
      cursor: pointer;
      font-size: 14px;
      @media (min-width: $tablet) {
        font-size: 16px;
      }
    }
  }
</style>
