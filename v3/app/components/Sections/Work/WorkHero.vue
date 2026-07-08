<template>
  <section class="section hero step" v-if="project.hero != null">
    <UILazyImage
        class="image"
      :image="project.hero.desktop_bg"
      :title="project.hero.title"
      positionMobile="left"
      :hover="false"
      :imageMobile="project.hero.mobile_bg"
      home
    />
    <div class="container is-flex-column" :class="{'animated': animateHeader}">
      <h1 class='jumbo'>{{project.hero.title}}</h1>
      <h3 class="supertitle">Case Studies - {{project.category}}</h3>
      <h3>{{project.hero.description}}</h3>
    </div>
    <div
      @click="scrollTo('.client-intro')"
      class="scroll-down"
      :class="{'animated': animateHeader}"
    >
      <p>scroll</p>
      <div class="scroll-down__arrow">
        <IconsIconArrow :fill="'white'" name="arrow-down" :width="30" :height="40"/>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps(["project", "animateHeader"])

const scrollTo = (selector) => {
  if (process.client) {
    const el = document.querySelector(selector)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style lang="scss" scoped>
  .hero {
    overflow: hidden;
    height: 100vh;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    position: relative;
    padding: 0 $gap;

    :deep(.lazy-image) {
      position: absolute;
      height: 100vh;
      width: 100%;
      z-index: -1;
      inset: 0;
    }

    :deep(.lazy-image img) {
      object-position: center !important;
    }

    @include media(md) {
      :deep(.lazy-image) {
        animation: zoomImage infinite;
        animation-delay: 0.3s;
        animation-timing-function: linear;
        animation-fill-mode: both;
        animation-duration: 60s;
        backface-visibility: hidden;
      }
    }

    @include media(xl) {
      background-position: center;
    }

    @include media(sm) {
      padding: 0;
    }

    .container {
      height: 100%;
      justify-content: center;

      @include fadeInUp;
    }

    .scroll-down {
      position: absolute;
      bottom: 80px;
      left: 60px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      display: none;

      @include fadeInUp;

      transition-delay: 0.2s;

      @media (min-width: $tablet) and (height >= 700px) {
        display: flex;
      }

      p {
        font-size: 22px;
        line-height: 1;
        margin-bottom: $gap;
        writing-mode: vertical-rl;
      }
    }

    h1.jumbo {
      padding: $gap * 3 0 $gap;
      font-size: responsive(32px 90px);

      @media (min-width: $tablet) and (min-height: $tablet) {
        max-width: 410px;
        padding: 0 0 $gap;
      }
    }

    h1,
    h3 {
      color: white;
    }

    h3 {
      max-width: 780px;
    }

    .supertitle {
      position: absolute;
      top: 10vh;
      top: calc(60px + #{$gap * 1.5});
      text-transform: uppercase;
      font-weight: 600;

      @include media(sm) {
        top: calc(90px + 50px);
      }
    }
  }
</style>
