<template>
  <section v-if="project.brand != null" class="the-brand step">
    <div class="container">
      <h1 :class="{'animated': animateBrand}">{{project.brand.title}}</h1>
    </div>

    <div class="timeline" :class="{'animated': animateBrand}">
      <SlidersTheTimeline :data="project.brand.items"/>
    </div>
  </section>
</template>

<script setup>
const props = defineProps(["project", "animateBrand"])
</script>

<style lang="scss" scoped>
  .the-brand {
    overflow: hidden;
    position: relative;

    h1 {
      @include fadeInUp;

      padding-bottom: 60px;
      margin-bottom: $gap * 2;
      max-width: 150px;

      @include media(sm) {
        margin-bottom: $gap * 3;
      }
    }

    .timeline {
      @include fadeInUp;

      transition-delay: 0.2s;
    }
  }
</style>
