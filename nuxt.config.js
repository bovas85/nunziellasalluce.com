const Config = require('./assets/config')
const axios = require('axios')

module.exports = {
  /*
  ** Headers
  ** Common headers are already provided by @nuxtjs/pwa preset
  */
  head: {
    titleTemplate: titleChunk => {
      // If undefined or blank then we don't need the hyphen
      return titleChunk
        ? `${titleChunk} - Nunziella Salluce Design`
        : 'Nunziella Salluce Design'
    },
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      {
        hid: 'viewport',
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, user-scalable=no'
      },
      { name: 'msapplication-TileColor', content: '#ffffff' },
      { name: 'msapplication-TileImage', content: '/ms-icon-144x144.png' },
      { name: 'theme-color', content: '#ffffff' },
      {
        hid: 'description',
        name: 'description',
        content: ''
      },
      {
        hid: 'keywords',
        name: 'keywords',
        content: ''
      },
      {
        hid: 'image',
        name: 'image',
        content: 'https://nunziellasalluce.com/images/facebook.png'
      },
      { hid: 'name', itemprop: 'name', content: 'Nunziella Salluce Design' },
      {
        hid: 'description',
        itemprop: 'description',
        content: ''
      },
      {
        hid: 'image',
        itemprop: 'image',
        content: 'https://nunziellasalluce.com/images/facebook.png'
      },
      {
        hid: 'twitter:card',
        name: 'twitter:card',
        content: ''
      },
      {
        hid: 'twitter:title',
        name: 'twitter:title',
        content: 'Nunziella Salluce Design'
      },
      {
        hid: 'twitter:description',
        name: 'twitter:description',
        content: ''
      },
      { hid: 'twitter:site', name: 'twitter:site', content: '@lucettinas' },
      {
        hid: 'twitter:creator',
        name: 'twitter:creator',
        content: '@lucettinas'
      },
      {
        hid: 'twitter:image',
        name: 'twitter:image',
        content: 'https://nunziellasalluce.com/images/twitter.png'
      },
      {
        hid: 'og:title',
        property: 'og:title',
        content: 'Nunziella Salluce Design'
      },
      { hid: 'og:url', property: 'og:url', content: Config.url },
      {
        hid: 'og:site_name',
        property: 'og:site_name',
        content: 'Nunziella Salluce Design Website'
      },
      {
        hid: 'og:description',
        property: 'og:description',
        content: ''
      },
      { hid: 'og:locale', property: 'og:locale', content: 'en_GB' },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      {
        hid: 'og:image',
        property: 'og:image',
        content: 'https://nunziellasalluce.com/images/facebook.png'
      },
      {
        hid: 'og:image:url',
        property: 'og:image:url',
        content: 'https://nunziellasalluce.com/images/facebook.png'
      },
      {
        hid: 'og:image:width',
        property: 'og:image:width',
        content: '1200'
      },
      {
        hid: 'og:image:height',
        property: 'og:image:height',
        content: '628'
      }
    ],
    script: [
      // IE 11 polyfill for Array.find
      {
        src: 'https://cdn.polyfill.io/v2/polyfill.js?features=es6'
      }
    ]
  },
  /*
  ** PWA Configuration
  */
  manifest: {
    name: 'Nunziella Salluce Design',
    short_name: 'Nunziella Salluce',
    theme_color: '#13294b',
    display: 'minimal-ui',
    description: ''
  },
  /*
  ** Build configuration
  */
  build: {
    extractCSS: true,
    postcss: [require('postcss-responsive-type')()],
    analyze: {
      analyzerMode: 'static',
      openAnalyzer: true
    },
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        /*
        ** Run ESLint on save
        */
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
          options: {
            // fix: true
          }
        })
      }
    }
  },
  generate: {
    interval: 2500,
    fallback: '404.html',
    routes: function () {
      return axios.get(`${Config.wpDomain}${Config.api.projects}`).then(res => {
        return res.data.map(project => {
          return { route: '/' + project.slug, payload: project }
        })
      })
    }
  },
  css: [
    // node.js module but we specify the pre-processor
    '@/assets/css/main.scss',
    '@/assets/css/swiper.css'
  ],
  /*
  ** Customize the progress-bar style
  */
  loading: {
    color: '#f4a261',
    height: '4px',
    failedColor: '#DF4661'
  },
  /*
  ** Modules
  */
  modules: [
    '@nuxtjs/pwa',
    '@nuxtjs/axios',
    '@nuxtjs/sitemap',
    ['nuxt-sass-resources-loader', '~/assets/css/variables.scss']
  ],
  sitemap: {
    path: '/sitemap.xml',
    hostname: 'https://nunziellasalluce.com',
    cacheTime: 1000 * 60 * 15,
    exclude: ['/.git']
  },
  axios: {
    timeout: 5000,
    debug: false,
    https: true,
    headers: {
      'Content-type': 'multipart/form-data'
    }
  },
  plugins: [
    '~/plugins/store.js',
    { src: '~/plugins/vue-media.js', ssr: false },
    { src: '~/plugins/vue-intersect', ssr: false },
    { src: '~/plugins/nuxt-swiper.js', ssr: false },
    { src: '~/plugins/vuelidate.js', ssr: true },
    { src: '~/plugins/vue-localstorage.js', ssr: false },
    { src: '~/plugins/vue-progressive-image.js', ssr: false },
    { src: '~/plugins/vue-smooth-scroll.js', ssr: false }
  ]
}
