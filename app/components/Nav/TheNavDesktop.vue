<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <ul
    class="menu menu--desktop"
    :class="
      (route.path === '/' ||
        route.path === '/contact' ||
        route.path === '/privacy-policy') &&
      'black'
    "
  >
    <NuxtLink
      to="/"
      :class="
        route.path === '/' && route.hash !== '#work' && 'nuxt-link-active'
      "
      >Home</NuxtLink
    >
    <NuxtLink
      :class="route.hash === '#work' && 'nuxt-link-active'"
      to="/#work"
      >Work</NuxtLink
    >
    <NuxtLink to="/about">About</NuxtLink>
    <NuxtLink to="/contact">Contact</NuxtLink>
  </ul>
</template>

<style lang="scss" scoped>
.menu--desktop {
  display: flex;
  justify-content: space-around;

  a {
    cursor: pointer;
    font-size: $font-size + 4px;
    text-transform: capitalize;
    font-weight: 400;
    color: white;
    transition: color 0.3s ease-in-out;

    &.nuxt-link-active {
      color: $primary;
    }

    &:not(:last-child) {
      margin-right: $gap;
    }

    position: relative;
    padding: calc($gap / 3) 0;

    &:hover {
      color: #fff;
      text-decoration: none;
    }

    &::before,
    &::after {
      content: "";
      position: absolute;
      width: 0%;
      height: 2px;
      bottom: -2px;
      background: #fff;
    }

    &::before {
      left: 0;
    }

    &::after {
      right: 0;
      background: #fff;
      transition: width 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    &:hover::before {
      background: #fff;
      width: 100%;
      transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    &:hover::after {
      background: transparent;
      width: 100%;
      transition: 0s;
    }

    &.nuxt-link-active {
      color: $primary;

      &::before,
      &::after {
        background: $primary;
      }

      &::after {
        right: 0;
        background: $primary;
      }

      &:hover {
        &::before {
          background: $primary;
        }

        &::after {
          background: transparent;
          width: 100%;
          transition: 0s;
        }
      }
    }
  }

  &.black {
    a:not(.nuxt-link-active) {
      color: black;

      &:hover {
        color: black;
        text-decoration: none;
      }

      &::before,
      &::after {
        content: "";
        position: absolute;
        width: 0%;
        height: 2px;
        bottom: -2px;
        background: black;
      }

      &::before {
        left: 0;
      }

      &::after {
        right: 0;
        background: black;
        transition: width 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
      }

      &:hover::before {
        background: black;
        width: 100%;
        transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
      }
    }
  }
}
</style>
