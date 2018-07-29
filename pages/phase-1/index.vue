<template>
  <main class="home">
    <section class="section hero">
      <div class="container is-flex-column">
        <h1>Nunziella Salluce Design</h1>
        <h3>Multi-disciplinary UI / UX and Visual Designer</h3>
      </div>
    </section>
    
    <section class="case-studies section" v-if='caseStudies && caseStudies != null'>
      <h2 class="has-text-centered">Case Studies</h2>
      <the-carousel
        :data='caseStudies'
      />
    </section>
  </main>
</template>

<script>
    export default {
      scrollToTop: true,
      data () {
        return {}
      },
      components: {
        CaseStudy: () => import('@/components/UI/CaseStudy'),
        TheCarousel: () => import('@/components/Sliders/TheCarousel')
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

<style lang="scss" scoped>
    section {
      &.hero {
        background-image: url('https://placehold.it/600/800');
        background-size: cover;
        background-position: center;
        @media (min-width: $tablet) {
          background-image: url('https://placehold.it/1280/768');
        }
        @media (min-width: $desktop) {
          background-image: url('https://placehold.it/2048/1024');
        }
        height: 100vh;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-end;
        padding: 0 0 80px 0;

        h1,
        h3 {
          color: white;
        }
      }
      &.case-studies {
        margin: $gap * 1.5 0 $gap * 4;
        overflow: hidden;

        h2 {
          padding: 0 0 $gap * 1.5;
        }
      }
    }
</style>
