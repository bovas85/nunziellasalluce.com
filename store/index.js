import Vuex from 'vuex';
import Config from '~/assets/config.js';
let arr = [];
let count = 0;

const createStore = () => {
  return new Vuex.Store({
    state: {
      homePage: [],
      caseStudies: [],
      window: 320,
      connection: null,
      navOpen: false,
      current: null,
      modalOpen: false,
      menuScrolled: false
    },
    mutations: {
      resetMenus (state) {
        state.modalOpen = false;
        state.navOpen = false;
      },
      hideMenuBg (state) {
        state.menuScrolled = false;
      },
      showMenuBg (state) {
        state.menuScrolled = true;
      },
      closeMenu (state) {
        state.navOpen = false;
        state.modalOpen = false;
      },
      openMenu (state) {
        state.navOpen = true;
        state.modalOpen = true;
      },
      sortCaseStudies (state, obj) {
        // sorting alphabetically
        if (obj != null) {
          try {
            let filteredCaseStudies = obj.sort(function (a, b) {
              return a.slug.localeCompare(b.slug);
            });
            state.caseStudies = filteredCaseStudies;
          } catch (e) {}
        }
      },
      setHomePage (state, obj) {
        state.homePage = obj;
      },
      setCaseStudies (state, obj) {
        state.caseStudies = obj;
      },
      windowResize (state, size) {
        state.window = size;
      },
      setConnection (state, type) {
        state.connection = type;
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
        if (!arr.length || count > 0) {
          count = 0;
          arr = [];
          try {
            let home = await app.$axios.get(
              Config.wpDomain + Config.api.homePage
            );
            arr.push(home.data);
            console.log('============= Server Init API calls =============');
            commit('setHomePage', home.data);
            console.log('home');

            let caseStudies = await app.$axios.get(
              Config.wpDomain + Config.api.caseStudies
            );
            arr.push(caseStudies.data);
            commit('setCaseStudies', caseStudies.data);
            console.log('case studies');
          } catch (e) {
            console.log('error with API');
            arr = [];
          }
        } else {
          console.log('using cached api');
          commit('setHomePage', arr[0]);
          commit('setCaseStudies', arr[1]);
          count++;
        }
      }
    }
  });
};

export default createStore;
