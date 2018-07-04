import Vuex from 'vuex'
import Config from '~/assets/config.js'
let arr = []
let count = 0

const createStore = () => {
  return new Vuex.Store({
    state: {
      homePage: [],
      caseStudies: [],
      window: 320,
      connection: null
    },
    mutations: {
      sortCaseStudies (state, obj) {
        // sorting alphabetically
        if (obj != null) {
          try {
            let filteredCaseStudies = obj.sort(function (a, b) {
              return a.slug.localeCompare(b.slug)
            })
            state.caseStudies = filteredCaseStudies
          } catch (e) {}
        }
      },
      setHomePage (state, obj) {
        state.homePage = obj
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
        if (!arr.length || count === 0) {
          count = 0
          arr = []
          let home = await app.$axios.get(Config.wpDomain + Config.api.homePage)
          arr.push(home.data)
          // console.log("============= Server Init API calls =============");
          commit('setHomePage', home.data)
          // console.log("home");
        } else {
          commit('setHomePage', arr[0])
          count++
        }
      }
    }
  })
}

export default createStore
