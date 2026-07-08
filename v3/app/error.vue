<script setup lang="ts">
import { useHead, clearError } from '#imports'

const props = defineProps({
  error: Object
})

useHead({
  title: props.error?.statusCode === 404 ? 'Page not Found' : 'An error occurred'
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <NuxtLayout>
    <div class="page-not-found">
      <div class="container is-flex">
        <button class="button button--sent" @click="handleError">HOME</button>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
  .page-not-found {
    height: 100vh;
    height: calc(100vh - 180px); // footer visible
    background-color: $yellow;
    background-image: url('/images/contact-mobile.png');
    background-repeat: no-repeat;
    background-size: 80%;
    background-position: center;

    @include media(sm) {
      background-size: 70%;
      background-image: url('/images/contact-desktop.png');
    }

    .container {
      height: 100%;
      align-items: flex-end;
      justify-content: center;
      text-align: center;

      button {
        margin-bottom: 17vh;
        cursor: pointer;
        outline: none;
        border: none;
      }
    }
  }
</style>
