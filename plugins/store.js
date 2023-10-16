import Vue from "vue";

// disable dev mode message in console
Vue.config.productionTip = false;

Vue.mixin({
  methods: {
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    capitalizeEveryWord(string) {
      const words = string.split(" ");

      for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
      }

      return words.join(" ");
    }
  }
});
