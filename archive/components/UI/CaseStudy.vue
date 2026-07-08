<template>
  <div v-if="caseStudy && caseStudy != null" class="case-study">
    <h2>{{ caseStudy.title }}</h2>
    <img
      v-if="caseStudy.image != null"
      class='lazyload' 
      :data-src="caseStudy.image.sizes.medium"
      :src="caseStudy.image.sizes.thumbnail"
      :alt="caseStudy.image.alt"
    >
    <p>{{ caseStudy.intro }}</p>

    <div class="sections">
      <div class="the-problem">
        <h2>{{ caseStudy.the_problem.title }}</h2>
        <p>{{ caseStudy.the_problem.description }}</p>
        <img
          v-if="caseStudy.the_problem.image.sizes != null"
          class='lazyload' 
          :data-src="caseStudy.the_problem.image.sizes.medium"
          :src="caseStudy.the_problem.image.sizes.thumbnail"
          :alt="caseStudy.the_problem.image.alt"
        >
      </div>

      <div class="the-process">
        <h2>{{ caseStudy.the_process.title }}</h2>
        <p>{{ caseStudy.the_process.description }}</p>
        <img
          v-if="caseStudy.the_process.image.sizes != null"
          class='lazyload' 
          :data-src="caseStudy.the_process.image.sizes.medium"
          :src="caseStudy.the_process.image.sizes.thumbnail"
          :alt="caseStudy.the_process.image.alt"
        >
      </div>

      <div class="the-solution">
        <h2>{{ caseStudy.the_solution.title }}</h2>
        <p>{{ caseStudy.the_solution.description }}</p>
        <img
          v-if="caseStudy.the_solution.image.sizes != null"
          class='lazyload' 
          :data-src="caseStudy.the_solution.image.sizes.medium"
          :src="caseStudy.the_solution.image.sizes.thumbnail"
          :alt="caseStudy.the_solution.image.alt"
        >
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      data: {
        type: Object,
        default: () => {}
      }
    },
    computed: {
      caseStudy () {
        if (this.data == null) return null;
        else return this.data.acf;
      }
    }
  };
</script>

<style lang='scss' scoped>
  .case-study {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
