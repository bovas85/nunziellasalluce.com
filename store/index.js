import Vuex from 'vuex'
import Config from '~/assets/config.js'

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
      async nuxtServerInit ({ commit }, { app, route }) {
        /**
         * This is the secret sauce.
         * If the data being requested is cached, subsequent API calls will not be made
         * Also, if using nuxt generate, nuxtServerInit will be called for every page
         * Because of this caching, the API calls will only be done once
         */
        // console.log('============= Server Init API calls =============')
        try {
          // console.log('home')
          if (route.query && route.query.utm_source === 'A/B Testing') {
            // if we have a query and it matches ab testing, run the second page call instead
            if (app.$cookies.get('ab-testing', { useCache: true })) {
              const home = await app.$axios.get(
                Config.wpDomain + Config.api.homePage2
              )
              commit('setHomepage', home.data)
            }
          } else {
            app.$cookies.set('ab-testing', true, 30)
            const home = await app.$axios.get(
              Config.wpDomain + Config.api.homePage,
              { useCache: true }
            )
            commit('setHomepage', home.data)
          }
          // console.log('case studies')
          const projects = await app.$axios.get(
            Config.wpDomain + Config.api.projects,
            { useCache: true }
          )
          commit('setProjects', projects.data)
        } catch (e) {
          console.log('error with API', e)
        }
      },
      resetScroll ({ commit }) {
        if (process.browser) {
          let body = document.querySelector('body')
          if (body) {
            body.style.overflow = 'auto'
          }
        }
        commit('resetMenus')
      }
    }
  })
}

export default createStore
