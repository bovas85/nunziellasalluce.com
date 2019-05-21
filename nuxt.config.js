const Config = require('./assets/config')
const $http = require('@nuxt/http')
const opn = require('opn')
let routes = []

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
          'Digital and Content Designer trying to make the world a colourful place.'
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
          'Digital and Content Designer trying to make the world a colourful place.'
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
          'Digital and Content Designer trying to make the world a colourful place.'
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
          'Digital and Content Designer trying to make the world a colourful place.'
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
      {
        defer: true,
        src:
          'https://polyfill.io/v2/polyfill.min.js?features=IntersectionObserver'
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
    postcss: {
      plugins: {
        'postcss-responsive-type': {},
        'postcss-nested': {}
      }
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
      return $http.$get(`${Config.wpDomain}${Config.api.projects}`).then(res => {
        const filtered = res.data.filter(project => {
          return project.acf.status === 'true' && project.slug !== 'marketing'
        })
        routes = filtered.map(project => {
          return { route: '/' + project.slug, payload: project }
        })
        return routes
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
    '@nuxt/http',
    '@nuxtjs/sitemap',
    'cookie-universal-nuxt',
    [
      '@nuxtjs/google-analytics',
      {
        id: 'UA-55886565-3'
      }
    ],
    '@nuxtjs/style-resources'
  ],
  styleResources: {
    scss: '~/assets/css/variables.scss'
  },
  workbox: {
    runtimeCaching: [
      {
        urlPattern: 'https://api.nunziellasalluce.com/wp-content/uploads/.*',
        handler: 'staleWhileRevalidate',
        strategyOptions: {
          cacheName: 'images',
          cacheExpiration: {
            maxEntries: 30,
            maxAgeSeconds: 300
          },
          cacheableResponse: { statuses: [0, 200] }
        }
      },
      {
        urlPattern:
          'https://api.nunziellasalluce.com/wp-json/wp/v2/casestudies/.*',
        handler: 'staleWhileRevalidate',
        method: 'GET',
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
        handler: 'staleWhileRevalidate',
        method: 'GET',
        strategyOptions: {
          cacheName: 'fonts',
          cacheExpiration: {
            maxEntries: 10,
            maxAgeSeconds: 30000
          },
          cacheableResponse: { statuses: [0, 200] }
        }
      }
    ]
  },
  sitemap: {
    hostname: 'https://nunziellasalluce.com',
    gzip: true,
    exclude: [
      '/.git'
    ],
    routes: routes
  },
  plugins: [
    '~/plugins/store.js',
    '~/plugins/vuelidate.js',
    '~/plugins/lazysizes.client.js',
    '~/plugins/vue-media.client.js',
    '~/plugins/nuxt-swiper.client.js',
    '~/plugins/vue-localstorage.client.js',
    '~/plugins/vue-smooth-scroll.client.js',
    '~/plugins/splitting.client.js',
    '~/plugins/hotjar.client.js'
  ]
}
