// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

const dummyRule = {
  create() {
    return {};
  },
};

const dummyPlugin = {
  rules: new Proxy(
    {},
    {
      get() {
        return dummyRule;
      },
      has() {
        return true;
      },
      ownKeys() {
        return [];
      },
      getOwnPropertyDescriptor() {
        return {
          enumerable: true,
          configurable: true,
          writable: false,
          value: dummyRule,
        };
      },
    },
  ),
};

export default withNuxt({
  ignores: ["archive/**", "dist/**", ".nuxt/**", ".output/**"],
  languageOptions: {
    globals: {
      splitting: "readonly",
      Splitting: "readonly",
    },
  },
  plugins: {
    react: dummyPlugin,
    "react-hooks": dummyPlugin,
  },
  rules: {
    "react-hooks/rules-of-hooks": "off",
    "vue/html-self-closing": "off",
  },
});
