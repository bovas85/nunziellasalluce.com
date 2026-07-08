<script setup lang="ts">
import { useHead, useRequestEvent } from '#imports'
import { useRouter } from 'vue-router'
import { setResponseStatus } from 'h3'

const router = useRouter()

useHead({
  title: 'Page not Found'
})

if (import.meta.server) {
  const event = useRequestEvent()
  if (event) {
    setResponseStatus(event, 404)
  }
}
</script>

<template>
  <div class="page-not-found">
    <div class="container is-flex">
      <button class="button button--sent" @click="router.push('/')">HOME</button>
    </div>
  </div>
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
