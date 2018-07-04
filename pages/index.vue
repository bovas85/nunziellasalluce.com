<template>
  <main class="home">
    
    <section class="case-studies" v-if='caseStudies && caseStudies != null'>
      <case-study
        :data='caseStudy'
        v-for='(caseStudy, index) in caseStudies'
        :key='index'
        class='case-study'
      />
    </section>
  </main>
</template>

<script>
  // import debounce from 'lodash/debounce'

  export default {
    scrollToTop: true,
    data () {
      return {}
    },
    components: {
      CaseStudy: () => import('@/components/UI/CaseStudy')
    },
    head () {
      return { title: 'Home' }
    },
    mounted () {},
    methods: {},
    computed: {
      caseStudies () {
        return this.$store.state.caseStudies
      }
    }
  }
</script>