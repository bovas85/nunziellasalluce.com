<script setup lang="ts">
import { computed } from "vue";
const year = computed(() => new Date().getFullYear());
</script>

<template>
  <svg
    viewBox="-30 -30 260 260"
    class="stamp-svg"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Path for Top Text (Starts at 6 o'clock, 50% is 12 o'clock) -->
    <path
      id="circle-path-top"
      d="M 100,180 A 80,80 0 1,1 100,20 A 80,80 0 1,1 100,180"
      fill="none"
    />
    <!-- Path for Bottom Text (Starts at 12 o'clock, 50% is 6 o'clock) -->
    <path
      id="circle-path-bottom"
      d="M 100,20 A 80,80 0 1,1 100,180 A 80,80 0 1,1 100,20"
      fill="none"
    />

    <!-- Center dot -->
    <circle cx="100" cy="100" r="5" fill="black" />

    <!-- Top Text -->
    <text
      font-family="'Source Sans Pro', Helvetica, sans-serif"
      font-size="34"
      font-weight="500"
      fill="black"
      letter-spacing="10"
    >
      <textPath href="#circle-path-top" startOffset="45%" text-anchor="middle">
        - PORTFOLIO -
      </textPath>
    </text>

    <!-- Bottom Text (Year) -->
    <text
      font-family="'Source Sans Pro', Helvetica, sans-serif"
      font-size="36"
      font-weight="500"
      fill="black"
      letter-spacing="14"
    >
      <textPath
        href="#circle-path-bottom"
        startOffset="46%"
        text-anchor="middle"
      >
        {{ year }}
      </textPath>
    </text>
  </svg>
</template>

<style scoped>
.stamp-svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
