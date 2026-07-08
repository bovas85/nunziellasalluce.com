<script setup lang="ts">
import type { HomePageACF } from '~/types/acf';

defineProps<{
  acf: HomePageACF
  animateWho: boolean
}>()
</script>

<template>
  <section v-if="acf" class="section who-i-am step">
    <div class="container">
      <h1 v-if="acf" :class="{ animated: animateWho }">
        {{ acf.who_i_am.title }}
      </h1>
      <div class="wrapper">
        <UILazyImage
v-if="acf" class="image" :class="{ animated: animateWho }" :image="acf.who_i_am.image"
          :title="acf.who_i_am.title" :hover="false" :image-mobile="acf.who_i_am.image" lazyload home />
        <div v-if="acf" class="text">
          <ClientOnly>
            <p
v-for="(item, index) in acf.who_i_am.text_group" :key="index" :class="{
              animated: animateWho,
              'stagger-it': index === 0,
              'color-cycle': index === 1,
              'pop-out-color': index === 2
            }" class="jumbo" data-splitting>
              {{ item.text }}
            </p>
          </ClientOnly>
          <NuxtLink to="/about" :class="{ animated: animateWho }" class="button button--sent button--is-white">
            About Me
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
section {
  &.who-i-am {
    margin: $gap * 1.5 0;

    h1 {
      max-width: 150px;

      @include fadeInUp;

      padding-left: $gap;

      @include media(md) {
        padding-left: 0;
      }
    }

    @include media(xl) {
      margin: $gap * 1.5 0;
    }

    .container {
      gap: 0;

      .wrapper {
        display: flex;
        flex-direction: column;
        position: relative;
      }

      .image {
        width: 100%;
        height: 430px;
        margin: 0 auto;
        object-fit: cover;
        object-position: center;

        @include fadeInUp;

        transition-delay: 0.2s;
        position: absolute;

        @supports (display: grid) {
          position: relative;
        }

        @include media(md) {
          height: 650px;
        }

        @include media(xl) {
          width: 80%;
        }
      }

      .text {
        position: relative;

        @supports (display: grid) {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          transform: translate(-50%, -50%);
          z-index: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }

        p {
          text-align: center;
          margin: calc($gap / 1.5) 0;
          padding: 0 calc($gap / 2);

          @include size(h3);
          @include fadeInUp;

          @include media(lg) {
            padding: 0;

            @include size(h2);
          }

          @include media(xl) {
            @include size(h1);
          }

          @include media(xxl) {
            @include size(jumbo);
          }

          @include media(md) {
            &:nth-child(1) {
              margin-left: auto;
              margin-right: auto;
              transition-delay: 0.4s;
            }

            &:nth-child(2) {
              margin-right: 10%;
              transition-delay: 0.6s;
            }

            &:nth-child(3) {
              margin-left: 10%;
              transition-delay: 0.8s;
            }
          }
        }
      }

      a {
        @include fadeInUp;

        transition-delay: 0.8s;
      }
    }
  }
}
</style>
