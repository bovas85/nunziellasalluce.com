<script setup lang="ts">
defineProps<{
  filteredProjects: unknown[]
  acf: unknown
  animateWork: boolean
}>()
</script>

<template>
  <section v-if="filteredProjects && acf" class="projects section step">
    <div class="container" :class="{ 'animated': animateWork }">
      <h1>{{ acf.case_studies.title }}</h1>
    </div>
    <SlidersTheCarousel v-if="filteredProjects" :class="{ 'animated': animateWork }" :data="filteredProjects" />
  </section>
</template>

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
