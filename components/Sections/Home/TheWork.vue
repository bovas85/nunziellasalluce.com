<template>
  <section id="#work" class="projects section step" v-if="filteredProjects && acf">
      <div class="container" :class="{'animated': animateWork}">
        <h1>{{acf.case_studies.title}}</h1>
      </div>
      <the-carousel
        v-if="filteredProjects"
        :class="{'animated': animateWork}"
        :data='filteredProjects'
      />
    </section>
</template>

<script>
  export default {
    name: 'TheWork',
    props: ['filteredProjects', 'acf', 'animateWork'],
    components: {
      TheCarousel: () => import('@/components/Sliders/TheCarousel')
    }
  }
</script>

<style lang="scss" scoped>
  section {
    &.projects {
      overflow: hidden;
      margin: $gap * 1.5 0;

      .container {
        @include fadeInUp;
      }

      .carousel {
        @include fadeInUp;
        transition-delay: 0.2s;
      }

      h1 {
        max-width: 260px;
        padding-left: $gap;

        @include media(md) {
          padding-left: 0;
        }
      }
    }
  }
</style>
