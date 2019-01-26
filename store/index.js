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
      menuScrolled: false,
      menuScrolledDone: false
    },
    mutations: {
      resetMenus (state) {
        state.modalOpen = false
        state.navOpen = false
      },
      hideMenuBg (state) {
        state.menuScrolled = false
        state.menuScrolledDone = false
      },
      showMenuBg (state) {
        state.menuScrolled = true
      },
      showMenuBgDone (state) {
        state.menuScrolledDone = true
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
      // we need to set timeouts to both states for the delay to kick in
      async showMenu ({ commit }) {
        await setTimeout(() => {
          commit('showMenuBg')
        }, 200)
        await setTimeout(() => {
          commit('showMenuBgDone')
        }, 600)
      },
      async nuxtServerInit ({ commit }, { app }) {
        try {
          // console.log('home')
          const home = await app.$axios.get(
            Config.wpDomain + Config.api.homePage,
            { useCache: true }
          )
          commit('setHomepage', home.data)

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
