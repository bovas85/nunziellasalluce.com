import Vuex from 'vuex';

const createStore = () => {
  return new Vuex.Store({
    state: {
    },
    mutations: {
      setHomePage (state, obj) {
        state.homePage = obj;
      },
      windowResize (state, size) {
        state.window = size;
      },
      setConnection (state, type) {
        state.connection = type;
      }
    }
  });
};

export default createStore;
