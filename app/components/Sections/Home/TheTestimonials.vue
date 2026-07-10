<script setup lang="ts">
import { ref } from "vue";
import type { HomePageACF, Testimonial } from "~/types/acf";

defineProps<{
  acf: HomePageACF;
  testimonials: Testimonial[];
  animateTestimonials: boolean;
}>();

const currentTestimonial = ref(0);
</script>

<template>
  <section v-if="acf" class="testimonials step">
    <div class="container" :class="{ animated: animateTestimonials }">
      <h1>{{ acf.testimonials.title }}</h1>
    </div>

    <ClientOnly>
      <div class="wrapper" :class="{ animated: animateTestimonials }">
        <div class="testimonial-group">
          <UITheTestimonial
            v-for="(testimonial, index) in testimonials"
            v-show="currentTestimonial === index"
            :key="`${testimonial.name}-${index}`"
            :testimonial="testimonial"
          />
        </div>

        <div class="arrows">
          <div
            class="arrow arrow--left"
            :class="{ 'is-disabled': currentTestimonial === 0 }"
            role="button"
            aria-label="previous testimonial"
            @click="currentTestimonial > 0 ? currentTestimonial-- : null"
          >
            <IconsIconArrow
              fill="black"
              direction="left"
              name="arrow-left"
              :width="30"
              :height="40"
            />
          </div>
          <div
            class="arrow arrow--right"
            :class="{
              'is-disabled': currentTestimonial === testimonials.length - 1,
            }"
            role="button"
            aria-label="next testimonial"
            @click="
              currentTestimonial < testimonials.length - 1
                ? currentTestimonial++
                : null
            "
          >
            <IconsIconArrow
              fill="black"
              direction="right"
              name="arrow-right"
              :width="30"
              :height="40"
            />
          </div>
        </div>
      </div>
    </ClientOnly>
  </section>
</template>

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
      max-width: 420px;
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
    cursor: pointer;

    &.is-disabled {
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
