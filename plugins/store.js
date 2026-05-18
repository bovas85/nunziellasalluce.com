import Vue from "vue";
const { capitalizeFirstLetter, capitalizeEveryWord } = require("./utils");

// disable dev mode message in console
Vue.config.productionTip = false;

Vue.mixin({
  methods: {
    capitalizeFirstLetter,
    capitalizeEveryWord
  }
});
