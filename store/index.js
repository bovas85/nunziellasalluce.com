import Vuex from 'vuex'
import axios from 'axios'
import { cacheAdapterEnhancer } from 'axios-extensions'
import Config from '~/assets/config.js'

const $http = axios.create({
  headers: { 'Cache-Control': 'no-cache' },
  https: true,
  // cache will be enabled by default
  adapter: cacheAdapterEnhancer(axios.defaults.adapter)
})

const createStore = () => {
  return new Vuex.Store({
    state: {
      homePage: [],
      projects: [],
      window: 320,
      connection: null,
      navOpen: false,
      current: null,
      modalOpen: false,
      menuScrolled: false
    },
    mutations: {
      resetMenus (state) {
        state.modalOpen = false
        state.navOpen = false
      },
      hideMenuBg (state) {
        state.menuScrolled = false
      },
      showMenuBg (state) {
        state.menuScrolled = true
      },
      closeMenu (state) {
        state.navOpen = false
        state.modalOpen = false
      },
      openMenu (state) {
        if (process.browser) {
          state.navOpen = true
          state.modalOpen = true
          let body = document.querySelector('body')
          if (body) {
            body.style.overflow = 'hidden'
          }
        }
      },
      sortProjects (state, obj) {
        // sorting alphabetically
        if (obj != null) {
          try {
            let filteredProjects = obj.sort(function (a, b) {
              return a.slug.localeCompare(b.slug)
            })
            state.projects = filteredProjects
          } catch (e) {}
        }
      },
      setHomepage (state, obj) {
        state.homePage = obj
      },
      setProjects (state, obj) {
        state.projects = obj
      },
      windowResize (state, size) {
        state.window = size
      },
      setConnection (state, type) {
        state.connection = type
      }
    },
    actions: {
      async nuxtServerInit ({ commit }, { app }) {
        /**
         * This is the secret sauce.
         * If the data being requested is cached, subsequent API calls will not be made
         * Also, if using nuxt generate, nuxtServerInit will be called for every page
         * Because of this caching, the API calls will only be done once
         */
        // console.log('============= Server Init API calls =============')
        try {
          // console.log('home')
          let home = await $http.get(
            Config.wpDomain + Config.api.homePage
          )
          commit('setHomepage', home.data)

          // console.log('case studies')
          let projects = await $http.get(
            Config.wpDomain + Config.api.projects
          )
          commit('setProjects', projects.data)
        } catch (e) {
          console.log('error with API')
        }
      },
      resetScroll ({ commit }) {
        if (process.browser) {
          let body = document.querySelector('body')
          if (body) {
            body.style.overflow = 'auto'
            setTimeout(() => {
              const hash = document.location.hash
              if (hash && hash === '#work') {
                const clickable = document.querySelector('#js-click-mobile')
                if (clickable) {
                  clickable.click()
                }
              }
            }, 100)
          }
        }

        commit('closeMenu')
      }
    }
  })
}

export default createStore
