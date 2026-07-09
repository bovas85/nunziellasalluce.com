<script setup lang="ts">
import { useMediaQuery, useWindowScroll } from '@vueuse/core'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const animating = ref(false)

// State replacements for Vuex
const menuScrolled = useState('menuScrolled', () => false)
const menuScrolledDone = useState('menuScrolledDone', () => false)
const navOpen = useState('navOpen', () => false)

const isLargeScreen = useMediaQuery('(min-width: 1024px)')
const { y } = useWindowScroll()

let scrollTimeout1: NodeJS.Timeout
let scrollTimeout2: NodeJS.Timeout

watch(y, (newY) => {
  // If we scroll past 150px, trigger the sticky menu animations
  if (newY > 150) {
    if (!menuScrolled.value) {
      clearTimeout(scrollTimeout1)
      clearTimeout(scrollTimeout2)
      scrollTimeout1 = setTimeout(() => { menuScrolled.value = true }, 150)
      scrollTimeout2 = setTimeout(() => { menuScrolledDone.value = true }, 400)
    }
  } else {
    // Reset when at the top
    clearTimeout(scrollTimeout1)
    clearTimeout(scrollTimeout2)
    menuScrolled.value = false
    menuScrolledDone.value = false
  }
})

const menuItems = ["", "work", "about", "contact"]

const toggleMenu = () => {
  navOpen.value = !navOpen.value
}

// Lock body/html scroll when mobile menu is open
watch(navOpen, (newVal) => {
  if (import.meta.client) {
    if (newVal) {
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "visible"
      document.documentElement.style.overflow = "visible"
    }
  }
})

// Reset menu on route change
watch(() => route.path, () => {
  navOpen.value = false
  menuScrolled.value = false
  menuScrolledDone.value = false
  if (import.meta.client) {
    document.body.style.overflow = "visible"
    document.documentElement.style.overflow = "visible"
    document.body.style.position = "static"
  }
})
</script>

<template>
  <div class="navigation-bar">
    <div
class="navigation" :class="{
      scrolled: menuScrolled,
      done: (menuScrolled && menuScrolledDone) || route.path === '/about' || route.path === '/contact' || route.path === '/privacy-policy',
      about: route.path === '/about',
      contact: route.path === '/contact',
      static: route.path === '/privacy-policy',
      'nav-open': navOpen
    }">
      <nav role="navigation" class="container is-flex navbar">
        <NuxtLink
to="/" class="logo col--8-mobile col--4-tablet is-center" @mouseover="animating = true"
          @mouseleave="animating = false">
          <IconsTheLogoStatic
:width="90" :height="46" :mobile-width="50" :mobile-height="31" :animating="animating"
            :fill="navOpen ? '#f4a261' : (menuScrolled ? '#f4a261' : 'white')" />
          <IconsTheLogo
:width="90" :height="46" :mobile-width="50" :mobile-height="31" :animating="animating"
            :fill="navOpen ? '#f4a261' : (menuScrolled ? '#f4a261' : 'white')" />
        </NuxtLink>

        <div v-if="!isLargeScreen" class="menu menu--mobile" @click="toggleMenu">
          <transition name="rotate" mode="out-in">
            <div v-if="!navOpen" key="closed" class="rotate">
              <IconsBurgerMenu
                :fill="(route.path === '/' && 'black') || menuScrolled ? 'black' : 'white'"
                :stroke="(route.path === '/' && 'black') || menuScrolled ? 'black' : 'white'" />
            </div>
            <div v-else key="open" class="rotate">
              <div :class="(route.path === '/' || navOpen) && 'black'" class="close-icon">
                <span class="close-icon--line" />
                <span class="close-icon--line inverted" />
              </div>
            </div>
          </transition>
        </div>

        <ul v-else class="menu menu--desktop" :class="(route.path === '/' || route.path === '/contact') && 'black'">
          <NuxtLink to="/" :class="route.path === '/' && route.hash !== '#work' && 'nuxt-link-active'">Home</NuxtLink>
          <NuxtLink :class="route.hash === '#work' && 'nuxt-link-active'" to="/#work">Work</NuxtLink>
          <NuxtLink to="/about">About</NuxtLink>
          <NuxtLink to="/contact">Contact</NuxtLink>
        </ul>
      </nav>
    </div>

    <ClientOnly>
      <div v-if="!isLargeScreen" style="z-index: 9999" class="modal-container is-hidden-desktop">
        <NavTheMenuMobile :menu-items="menuItems" :nav-open="navOpen" @close="navOpen = false" />
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

    .menu {
      cursor: pointer;

      .rotate {
        cursor: pointer;
      }

      &--mobile {
        display: block;
        position: relative;
      }

      &--desktop {
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
    }
  }

  &.scrolled {
    @include media(lg) {
      transform: translateY(-100%);
    }

    .navbar a {
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

    .close-icon {
      cursor: pointer;

      &--line {
        background: black;
      }
    }
  }

  &.scrolled.done {
    @include media(lg) {
      position: fixed;
      background-color: $lightgrey;
      transition: all 0.6s ease-in-out;
      transform: translateY(0);
    }
  }

  &.contact,
  &.about,
  &.scrolled.done.contact,
  &.scrolled.done.about {
    background-color: transparent;

    .navbar a {
      color: white;
    }
  }

  &.static {
    background-color: $grey;
  }

  &.nav-open {
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

.close-icon {
  cursor: pointer;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  &--line {
    position: absolute;
    top: 50%;
    cursor: pointer;
    display: block;
    margin-bottom: 3px;
    background: white;
    border-radius: 2px;
    opacity: 1;
    height: 2px;
    width: 15px;
    transform: rotate(45deg);

    &.inverted {
      transform: rotate(-45deg);
    }
  }

  &.black .close-icon--line {
    background: black;
  }
}
</style>
