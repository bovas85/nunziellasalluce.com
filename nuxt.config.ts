// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    pageTransition: { name: 'intro', mode: 'out-in' }
  },
  css: ['~/assets/css/main.scss'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/css/variables.scss" as *;',
          silenceDeprecations: ['color-functions', 'if-function', 'import', 'global-builtin', 'legacy-js-api']
        }
      }
    },
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'lazysizes',
        'scrollama',
        'splitting',
        'swiper/modules',
        'swiper/vue'
      ]
    }
  },
  modules: [
    '@vueuse/nuxt',
    '@nuxt/eslint'
  ],
  eslint: {
    checker: false
  },
  postcss: {
    plugins: {
      'postcss-responsive-type': {}
    }
  },
  routeRules: {
    '/wp-json/**': { proxy: 'https://nunziella.moustachedesign.xyz/wp-json/**' }
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: false,
      routes: ['/', '/about', '/contact', '/privacy-policy']
    }
  }
})
