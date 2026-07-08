<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'

const route = useRoute()
const animating = ref(false)

// State replacements for Vuex
const menuScrolled = useState('menuScrolled', () => false)
const menuScrolledDone = useState('menuScrolledDone', () => false)
const navOpen = useState('navOpen', () => false)

const isLargeScreen = useMediaQuery('(min-width: 1024px)')

const menuItems = ["", "work", "about", "contact"]

const toggleMenu = () => {
  navOpen.value = !navOpen.value
}

// Reset menu on route change
watch(() => route.path, () => {
  navOpen.value = false
  if (process.client) {
    document.body.style.overflow = "visible"
    document.documentElement.style.overflow = "visible"
    document.body.style.position = "static"
  }
})
</script>

<template>
  <div class="navigation-bar">
    <div
      class="navigation"
      :class="{
        scrolled: menuScrolled,
        done: (menuScrolled && menuScrolledDone) || route.path === '/about' || route.path === '/contact' || route.path === '/privacy-policy',
        about: route.path === '/about',
        contact: route.path === '/contact',
        static: route.path === '/privacy-policy'
      }"
    >
      <nav role="navigation" class="container is-flex navbar">
        <NuxtLink
          to="/"
          @mouseover="animating = true"
          @mouseleave="animating = false"
          class="logo col--8-mobile col--4-tablet is-center"
        >
          <IconsTheLogoStatic
            :width="90"
            :height="46"
            :mobileWidth="50"
            :mobileHeight="31"
            :animating="animating"
            :fill="menuScrolled ? '#f4a261' : 'white'"
          />
          <IconsTheLogo
            :width="90"
            :height="46"
            :mobileWidth="50"
            :mobileHeight="31"
            :animating="animating"
            :fill="menuScrolled ? '#f4a261' : 'white'"
          />
        </NuxtLink>

        <div
          v-if="!isLargeScreen"
          @click="toggleMenu"
          class="menu menu--mobile"
        >
          <transition-group name="rotate" mode="out-in">
            <div class="rotate" key="closed" v-if="!navOpen">
              <IconsBurgerMenu
                :fill="(route.path === '/' && 'black') || menuScrolled ? 'black' : 'white'"
                :stroke="(route.path === '/' && 'black') || menuScrolled ? 'black' : 'white'"
              />
            </div>
            <div class="rotate" key="open" v-else>
              <div :class="route.path === '/' && 'black'" class="close-icon">
                <span class="close-icon--line" />
                <span class="close-icon--line inverted" />
              </div>
            </div>
          </transition-group>
        </div>

        <ul
          v-else
          class="menu menu--desktop"
          :class="(route.path === '/' || route.path === '/contact') && 'black'"
        >
          <NuxtLink
            to="/"
            :class="route.path === '/' && route.hash !== '#work' && 'nuxt-link-active'"
          >Home</NuxtLink>
          <NuxtLink
            :class="route.hash === '#work' && 'nuxt-link-active'"
            to="/#work"
          >Work</NuxtLink>
          <NuxtLink to="/about">About</NuxtLink>
          <NuxtLink to="/contact">Contact</NuxtLink>
        </ul>
      </nav>
    </div>

    <ClientOnly>
      <div v-if="!isLargeScreen" style="z-index: 9999" class="modal-container is-hidden-desktop">
        <NavTheMenuMobile :menu-items="menuItems" />
      </div>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.navigation {
  top: 0;
  left: 0;
  width: 100%;
  z-index: 5;
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
    align-items: center;
    height: 100%;
    justify-content: space-between;
    align-items: center;

    .logo {
      &:before,
      &:after {
        display: none;
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

          &:before,
          &:after {
            content: "";
            position: absolute;
            width: 0%;
            height: 2px;
            bottom: -2px;
            background: #fff;
          }

          &:before {
            left: 0;
          }

          &:after {
            right: 0;
            background: #fff;
            transition: width 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
          }

          &:hover:before {
            background: #fff;
            width: 100%;
            transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
          }

          &:hover:after {
            background: transparent;
            width: 100%;
            transition: 0s;
          }

          &.nuxt-link-active {
            color: $primary;

            &:before,
            &:after {
              background: $primary;
            }

            &:after {
              right: 0;
              background: $primary;
            }

            &:hover {
              &:before {
                background: $primary;
              }
              &:after {
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

            &:before,
            &:after {
              content: "";
              position: absolute;
              width: 0%;
              height: 2px;
              bottom: -2px;
              background: black;
            }

            &:before {
              left: 0;
            }

            &:after {
              right: 0;
              background: black;
              transition: width 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
            }

            &:hover:before {
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

      &:before,
      &:after {
        background: $primary;
      }

      &:hover:before {
        background: $primary;
        width: 100%;
        transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
      }

      &:hover:after {
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
