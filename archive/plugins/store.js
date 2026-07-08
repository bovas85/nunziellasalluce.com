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
        const word = words[i];
        if (word.length > 0) {
          const firstChar = word[0];
          const upperFirstChar = firstChar.toUpperCase();
          if (firstChar !== upperFirstChar) {
            words[i] = upperFirstChar + word.substr(1);
          }
        }
      }

      return words.join(" ");
    }
  }
});
