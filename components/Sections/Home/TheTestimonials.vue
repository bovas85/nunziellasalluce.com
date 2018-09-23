<template>
  <section class="testimonials step" v-if="acf">
    <div class="container" :class="{'animated': animateTestimonials}">
      <h1>{{acf.testimonials.title}}</h1>
    </div>
    
    <no-ssr>
      <div class="wrapper" :class="{'animated': animateTestimonials}">
        <transition-group tag="div" name="fade" mode="out-in">
          <the-testimonial
            v-for="(testimonial, index) in testimonials"
            :key="index"
            v-if="currentTestimonial === index"
            :testimonial="testimonial"
          />
        </transition-group>

        <div class="arrows" role="pagination">
          <div
            class="arrow arrow--left"
            :disabled="currentTestimonial === 0"
            role="navigation"
            aria-label="previous testimonial"
            @click="currentTestimonial > 0 ? currentTestimonial-- : null"
          >
            <icon-arrow :fill="'black'" direction='left' name='arrow-left' :width="30" :height="40" />
          </div>
          <div
            class="arrow arrow--right"
            :disabled="currentTestimonial === testimonials.length - 1"
            role="navigation"
            aria-label="next testimonial"
            @click="currentTestimonial < testimonials.length - 1 ? currentTestimonial++ : null"
          >
            <icon-arrow :fill="'black'" direction='right' name='arrow-right' :width="30" :height="40" />
          </div>
        </div>
      </div>
    </no-ssr>
  </section>
</template>

<script>
  export default {
    name: 'TheTestimonials',
    props: ['acf', 'testimonials', 'animateTestimonials'],
    data () {
      return {
        currentTestimonial: 0
      }
    },
    components: {
      IconArrow: () => import('@/components/Icons/IconArrow'),
      TheTestimonial: () => import('@/components/UI/TheTestimonial')
    }
  }
</script>

<style lang="scss" scoped>
  .testimonials {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: $gap;

    @include media(sm) {
      margin: $gap * 3 0;
      margin-bottom: $gap * 3;
    }

    .container {
      @include fadeInUp;
      flex-basis: 100%;
    }

    .wrapper {
      max-width: $tablet;
      position: relative;
      @include fadeInUp;
      transition-delay: 0.2s;
    }

    h1 {
      padding-left: $gap;

      @include media(md) {
        padding-left: 0;
      }
    }

    .testimonial-group {
      position: relative;
    }

    .arrows {
      width: 100%;
      min-width: 100%;
      cursor: pointer;
      position: absolute;
      display: flex;
      align-items: center;
      top: 75px;

      @include media(sm) {
        top: 100px;
      }
    }
    .arrow {
      position: absolute;
      &[disabled] {
        opacity: 0.4;
        pointer-events: none;
      }

      &--left {
        left: 50px;

        @include media(md) {
          left: 100px;
        }
      }

      &--right {
        right: 50px;

        @include media(md) {
          right: 100px;
        }
      }
    }

    h1 {
      flex-basis: 100%;
    }
  }
</style>
