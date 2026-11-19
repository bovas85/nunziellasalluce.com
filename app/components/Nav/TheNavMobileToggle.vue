<script setup lang="ts">
import { useRoute } from "vue-router";

defineProps<{
  navOpen: boolean;
  menuScrolled: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle"): void;
}>();

const route = useRoute();
</script>

<template>
  <button
    type="button"
    class="menu menu--mobile"
    :aria-expanded="navOpen"
    aria-label="Toggle navigation menu"
    @click="emit('toggle')"
  >
    <transition name="rotate" mode="out-in">
      <div v-if="!navOpen" key="closed" class="rotate">
        <IconsBurgerMenu
          :fill="
            route.path === '/' ||
            route.path === '/contact' ||
            route.path === '/privacy-policy' ||
            menuScrolled
              ? 'black'
              : 'white'
          "
          :stroke="
            route.path === '/' ||
            route.path === '/contact' ||
            route.path === '/privacy-policy' ||
            menuScrolled
              ? 'black'
              : 'white'
          "
        />
      </div>
      <div v-else key="open" class="rotate">
        <div
          :class="
            (route.path === '/' || route.path === '/contact' || navOpen) &&
            'black'
          "
          class="close-icon"
        >
          <span class="close-icon--line" />
          <span class="close-icon--line inverted" />
        </div>
      </div>
    </transition>
  </button>
</template>

<style lang="scss" scoped>
.menu--mobile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 0;
  width: 36px;
  height: 36px;
  color: inherit;
  font: inherit;
  line-height: inherit;

  .rotate {
    cursor: pointer;
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
