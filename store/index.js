import Vuex from 'vuex'
import Config from '~/assets/config.js'
let arr = []
let count = 0

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
        state.navOpen = true
        state.modalOpen = true
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
      setHomePage (state, obj) {
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
        if (count === 0 || count > 2) {
          count = 0
          arr = []
          console.log('============= Server Init API calls =============')
          try {
            console.log('home')
            let home = await app.$axios.get(
              Config.wpDomain + Config.api.homePage
            )
            arr.push(home.data)
            commit('setHomePage', home.data)

            console.log('case studies')
            let projects = await app.$axios.get(
              Config.wpDomain + Config.api.projects
            )
            arr.push(projects.data)
            commit('setProjects', projects.data)
            // count++ // enable when live
          } catch (e) {
            console.log('error with API')
            arr = []
          }
        } else {
          count++
          console.log('using cached api')
          commit('setHomePage', arr[0])
          commit('setProjects', arr[1])
        }
      }
    }
  })
}

export default createStore
