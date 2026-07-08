<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'

const cookieAccepted = useLocalStorage('NuniCookie', false)
const hide = ref(true)
const show = ref(false)

onMounted(() => {
  if (cookieAccepted.value) {
    hide.value = true
    show.value = false
  } else {
    setTimeout(() => {
      hide.value = false
      show.value = true
    }, 4000)
  }
})

const setCookie = () => {
  hide.value = true
  show.value = false
  cookieAccepted.value = true
}
</script>

<template>
  <div v-show="!hide" class="cookies" :class="{'active': show}">
    <div class="container">
      <p>This site uses cookies.
        <NuxtLink to="/privacy-policy">Find out more.</NuxtLink>
        <span
          @click="setCookie"
          class="privacy-link"
        >OK, Close</span>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .cookies {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    z-index: 9999;
    height: auto;
    color: white;
    background: black;
    opacity: 0;
    transition: opacity 0.6s ease-in-out;

    @include media(md) {
      height: 60px;
    }

    &.active {
      opacity: 1;
    }

    a {
      color: white;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
    .privacy-link {
      border: none;
      width: auto;
      padding: 10px 20px;
      color: black;
      background: $red;
      display: inline-flex;
      align-items: center;
      margin-top: calc($gap / 2);
      cursor: pointer;
      transition: all 0.3s ease-in-out;

      @include media(md) {
        margin-top: 0;
        margin-left: $gap;
      }

      &:hover {
        font-weight: bold;
        opacity: 0.9;
      }
    }
    p {
      font-size: 16px;
      font-weight: 400;
      letter-spacing: 1.1px;
      max-width: 95%;
      text-align: left;
      color: white;
      margin-right: 16px;
      @include media(md) {
        margin: 0;
      }
    }
    .container {
      display: flex;
      height: 100%;
      justify-content: center;
      align-items: center;
    }
  }
</style>
