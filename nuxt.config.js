const Config = require('./assets/config')
const axios = require('axios')
const opn = require('opn')

module.exports = {
  mode: 'universal',
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
        content: 'width=device-width, initial-scale=1'
      },
      { name: 'msapplication-TileColor', content: '#ffffff' },
      { name: 'msapplication-TileImage', content: '/ms-icon-144x144.png' },
      { name: 'theme-color', content: '#ffffff' },
      {
        hid: 'description',
        name: 'description',
        content:
          'UI and Visual Designer trying to make the world a colourful place.'
      },
      {
        hid: 'keywords',
        name: 'keywords',
        content:
          'Nunziella Salluce, Nunziella, Portfolio, UI Design, UI London, Design London, Web Designer London, UI Designer in London, UX Design'
      },
      {
        hid: 'image',
        name: 'image',
        content: 'https://nunziellasalluce.com/images/seo.png'
      },
      { hid: 'name', itemprop: 'name', content: 'Nunziella Salluce Design' },
      {
        hid: 'description',
        itemprop: 'description',
        content:
          'UI and Visual Designer trying to make the world a colourful place.'
      },
      {
        hid: 'image',
        itemprop: 'image',
        content: 'https://nunziellasalluce.com/images/seo.png'
      },
      {
        hid: 'twitter:card',
        name: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        hid: 'twitter:title',
        name: 'twitter:title',
        content: 'Nunziella Salluce Design'
      },
      {
        hid: 'twitter:description',
        name: 'twitter:description',
        content:
          'UI and Visual Designer trying to make the world a colourful place.'
      },
      { hid: 'twitter:site', name: 'twitter:site', content: '@SNunziella' },
      {
        hid: 'twitter:creator',
        name: 'twitter:creator',
        content: '@SNunziella'
      },
      {
        hid: 'twitter:image',
        name: 'twitter:image',
        content: 'https://nunziellasalluce.com/images/seo.png'
      },
      {
        hid: 'twitter:image:alt',
        name: 'twitter:image:alt',
        content: 'My Website Image'
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
        content:
          'UI and Visual Designer trying to make the world a colourful place.'
      },
      { hid: 'og:locale', property: 'og:locale', content: 'en_GB' },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      {
        hid: 'og:image',
        property: 'og:image',
        content: 'https://nunziellasalluce.com/images/seo.png'
      },
      {
        hid: 'og:image:url',
        property: 'og:image:url',
        content: 'https://nunziellasalluce.com/images/seo.png'
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
        src: 'https://cdn.polyfill.io/v2/polyfill.min.js',
        integrity:
          'sha384-6907363e508bbe05a30f5cd521f126ce76403f9230c6aacfe5bd549ee7b03107153c125f40e3228ee9f7afd2b95e0fb5',
        crossorigin: 'anonymous'
      }
    ]
  },
  /*
  ** PWA Configuration
  */
  manifest: {
    name: 'Nunziella Salluce Design',
    short_name: 'Nunziella Salluce',
    theme_color: '#000000',
    background_color: '#f2d636',
    display: 'standalone',
    description: ''
  },
  /*
  ** Build configuration
  */
  build: {
    extractCSS: true,
    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.(css|vue)$/,
            chunks: 'all',
            enforce: true
          }
        }
      }
    },
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
  hooks: {
    listen (server, { host, port }) {
      opn(`http://${host}:${port}`)
    }
  },
  generate: {
    fallback: '404.html',
    routes: function () {
      return axios.get(`${Config.wpDomain}${Config.api.projects}`).then(res => {
        const filtered = res.data.filter(project => {
          return project.acf.status === 'true'
        })
        return filtered.map(project => {
          return { route: '/' + project.slug, payload: project }
        })
      })
    }
  },
  render: {
    static: {
      maxAge: 2592000
    }
  },
  css: [
    // node.js module but we specify the pre-processor
    '@/assets/css/main.scss',
    '@/assets/css/swiper.css',
    '@/assets/css/splitting.css'
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
    'cookie-universal-nuxt',
    [
      '@nuxtjs/google-analytics',
      {
        id: 'UA-55886565-3'
      }
    ],
    ['nuxt-sass-resources-loader', '~/assets/css/variables.scss']
  ],
  workbox: {
    runtimeCaching: [
      {
        urlPattern: 'https://api.nunziellasalluce.com/wp-content/uploads/.*',
        handler: 'cacheFirst',
        strategyOptions: {
          cacheName: 'images',
          cacheExpiration: {
            maxEntries: 10,
            maxAgeSeconds: 300
          },
          cacheableResponse: { statuses: [0, 200] }
        }
      },
      {
        urlPattern:
          'https://api.nunziellasalluce.com/wp-json/wp/v2/casestudies/.*',
        handler: 'networkFirst',
        strategyOptions: {
          cacheName: 'casestudies',
          cacheExpiration: {
            maxEntries: 10,
            maxAgeSeconds: 0
          }
        }
      },
      {
        urlPattern: 'https://fonts.googleapis.com/.*',
        handler: 'cacheFirst',
        method: 'GET',
        strategyOptions: {
          cacheName: 'fonts',
          cacheExpiration: {
            maxEntries: 10,
            maxAgeSeconds: 300
          },
          cacheableResponse: { statuses: [0, 200] }
        }
      }
    ]
  },
  sitemap: {
    path: '/sitemap.xml',
    hostname: 'https://nunziellasalluce.com',
    cacheTime: 1000 * 60 * 15,
    exclude: ['/.git']
  },
  axios: {
    timeout: 6000,
    debug: false,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  },
  plugins: [
    '~/plugins/axios.js',
    '~/plugins/store.js',
    { src: '~/plugins/ab-testing.js', ssr: false },
    { src: '~/plugins/vue-media.js', ssr: false },
    { src: '~/plugins/vue-intersect', ssr: false },
    { src: '~/plugins/nuxt-swiper.js', ssr: false },
    { src: '~/plugins/vuelidate.js', ssr: true },
    { src: '~/plugins/vue-localstorage.js', ssr: false },
    { src: '~/plugins/vue-progressive-image.js', ssr: false },
    { src: '~/plugins/vue-smooth-scroll.js', ssr: false },
    { src: '~/plugins/hotjar.js', ssr: false }
  ]
}
