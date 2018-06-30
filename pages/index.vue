<template>
  <main class="home">
    Homepage
  </main>
</template>

<script>
  import debounce from 'lodash/debounce'
  // import API from '~/assets/api.js'

  var timer = null

  export default {
    scrollToTop: true,
    data () {
      return {
      };
    },
    components: {
    },
    head () {
      return { title: "Home" };
    },
    mounted () {
    },
    methods: {

    }
  }
</script>