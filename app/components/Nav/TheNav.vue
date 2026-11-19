<script setup lang="ts">
import { useRuntimeConfig } from "#app";
import { useWindowScroll, watchThrottled } from "@vueuse/core";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const enableDesktopBurgerMenu = computed(
  () => runtimeConfig.public?.enableDesktopBurgerMenu !== false,
);
const animating = ref(false);

// State replacements for Vuex
const menuScrolled = useState("menuScrolled", () => false);
const menuScrolledDone = useState("menuScrolledDone", () => false);
const navOpen = useState("navOpen", () => false);

const { y } = useWindowScroll();

let scrollTimeout1: ReturnType<typeof setTimeout> | undefined;
let scrollTimeout2: ReturnType<typeof setTimeout> | undefined;

watchThrottled(
  y,
  (newY) => {
    if (!import.meta.client) return;

    // If we scroll past 150px, trigger the sticky menu animations
    if (newY > 150) {
      if (!menuScrolled.value || !menuScrolledDone.value) {
        clearTimeout(scrollTimeout1);
        clearTimeout(scrollTimeout2);
        if (!menuScrolled.value) {
          scrollTimeout1 = setTimeout(() => {
            menuScrolled.value = true;
          }, 150);
        }
        scrollTimeout2 = setTimeout(() => {
          menuScrolledDone.value = true;
        }, 400);
      }
    } else {
      // Reset when at the top
      clearTimeout(scrollTimeout1);
      clearTimeout(scrollTimeout2);
      menuScrolled.value = false;
      menuScrolledDone.value = false;
    }
  },
  { throttle: 50, immediate: true },
);

const menuItems = ["", "work", "about", "contact"];

const toggleMenu = () => {
  navOpen.value = !navOpen.value;
};

// Lock body/html scroll when mobile menu is open
watch(navOpen, (newVal) => {
  if (import.meta.client) {
    if (newVal) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
      document.documentElement.style.overflow = "visible";
    }
  }
});

// Reset menu on route change
watch(
  () => route.path,
  () => {
    clearTimeout(scrollTimeout1);
    clearTimeout(scrollTimeout2);
    navOpen.value = false;
    menuScrolled.value = false;
    menuScrolledDone.value = false;
    if (import.meta.client) {
      document.body.style.overflow = "visible";
      document.documentElement.style.overflow = "visible";
      document.body.style.position = "static";
    }
  },
);

onBeforeUnmount(() => {
  clearTimeout(scrollTimeout1);
  clearTimeout(scrollTimeout2);
});
</script>

<template>
  <div class="navigation-bar">
    <div
      class="navigation"
      :class="{
        scrolled: menuScrolled,
        done:
          (menuScrolled && menuScrolledDone) ||
          route.path === '/about' ||
          route.path === '/contact' ||
          route.path === '/privacy-policy',
        about: route.path === '/about',
        contact: route.path === '/contact',
        static: route.path === '/privacy-policy',
        'nav-open': navOpen,
      }"
    >
      <nav role="navigation" class="container is-flex navbar">
        <NuxtLink
          to="/"
          class="logo col--8-mobile col--4-tablet is-center"
          @mouseover="animating = true"
          @mouseleave="animating = false"
        >
          <IconsTheLogoStatic
            :width="90"
            :height="46"
            :mobile-width="50"
            :mobile-height="31"
            :animating="animating"
            :fill="navOpen ? '#f4a261' : menuScrolled ? '#f4a261' : 'white'"
          />
          <IconsTheLogo
            :width="90"
            :height="46"
            :mobile-width="50"
            :mobile-height="31"
            :animating="animating"
            :fill="navOpen ? '#f4a261' : menuScrolled ? '#f4a261' : 'white'"
          />
        </NuxtLink>

        <NavTheNavMobileToggle
          class="nav-mobile-toggle"
          :class="{ 'is-desktop-enabled': enableDesktopBurgerMenu }"
          :nav-open="navOpen"
          :menu-scrolled="menuScrolled"
          @toggle="toggleMenu"
        />

        <NavTheNavDesktop v-if="!enableDesktopBurgerMenu" class="nav-desktop" />
      </nav>
    </div>

    <ClientOnly>
      <div
        style="z-index: 9999"
        class="modal-container"
        :class="{ 'is-hidden-desktop': !enableDesktopBurgerMenu }"
      >
        <NavTheMenuMobile
          :menu-items="menuItems"
          :nav-open="navOpen"
          @close="navOpen = false"
        />
      </div>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.navigation {
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10000;
  height: 60px;
  background-color: transparent;
  box-shadow: unset;
  margin: 0 auto;
  padding: 0 $gap;
  position: fixed;
  transition:
    background-color 0.6s ease-in-out,
    box-shadow 0.6s ease-in-out;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  @include media(sm) {
    height: 90px;
    padding: 0;
  }

  @include media(lg) {
    position: absolute;
  }

  .navbar {
    height: 100%;
    justify-content: space-between;
    align-items: center;

    .nav-mobile-toggle {
      @include media(lg) {
        display: none !important;
      }

      &.is-desktop-enabled {
        @include media(lg) {
          display: inline-flex !important;
        }
      }
    }

    .nav-desktop {
      display: none !important;

      @include media(lg) {
        display: block !important;
      }
    }

    .logo {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 31px;
      vertical-align: middle;

      &::before,
      &::after {
        display: none;
      }

      @include media(md) {
        width: 90px;
        height: 46px;
      }
    }

    img {
      width: 50px;
      height: 31px;
      object-fit: contain;
      stroke: $primary;
    }
  }

  &.scrolled {
    @include media(lg) {
      transform: translateY(-100%);
    }

    .navbar :deep(a) {
      color: $secondary;

      &::before,
      &::after {
        background: $primary;
      }

      &:hover::before {
        background: $primary;
        width: 100%;
        transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
      }

      &:hover::after {
        background: transparent;
        width: 100%;
        transition: 0s;
      }
    }

    :deep(.close-icon) {
      cursor: pointer;

      .close-icon--line {
        background: black;
      }
    }
  }

  &.scrolled.done {
    background-color: $lightgrey;
    box-shadow: 0 2px 4px 0 rgb(0 0 0 / 10%);
    transition:
      background-color 0.6s ease-in-out,
      box-shadow 0.6s ease-in-out;

    @include media(lg) {
      position: fixed;
      transition: all 0.6s ease-in-out;
      transform: translateY(0);
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  &.contact,
  &.about {
    background-color: transparent;

    .navbar :deep(a) {
      color: white;
    }

    &.scrolled.done {
      background-color: $lightgrey;
      box-shadow: 0 2px 4px 0 rgb(0 0 0 / 10%);

      .navbar :deep(a) {
        color: $secondary;
      }
    }
  }

  &.static {
    background-color: transparent;

    &.scrolled.done {
      background-color: $lightgrey;
      box-shadow: 0 2px 4px 0 rgb(0 0 0 / 10%);
    }
  }

  &.nav-open {
    position: fixed !important;
    background-color: white !important;
    box-shadow: 0 2px 4px 0 rgb(0 0 0 / 10%) !important;
  }

  i {
    color: $grey;
    cursor: pointer;
    font-size: 14px;

    @media (min-width: $tablet) {
      font-size: 16px;
    }
  }
}
</style>
