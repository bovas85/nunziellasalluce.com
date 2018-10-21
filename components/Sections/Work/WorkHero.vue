<template>
  <section class="section hero step" v-if="project.hero != null">
    <lazy-image
      class='image'
      :image="project.hero.desktop_bg"
      :title="project.hero.title"
      positionMobile="left"
      :hover="false"
      :imageMobile="project.hero.mobile_bg"
      home
    />
    <div class="container is-flex-column" :class="{'animated': animateHeader}">
        <h1 class="jumbo">{{project.hero.title}}</h1>
        <h3 class="supertitle">Case Studies - {{project.category}}</h3>
        <h3>{{project.hero.description}}</h3>
    </div>
    <div v-scroll-to="{element:'.client-intro'}" class="scroll-down" :class="{'animated': animateHeader}">
        <p>scroll</p>
        <div class="scroll-down__arrow">
          <icon-arrow :fill="'white'" name='arrow-down' :width="30" :height="40" />
        </div>
    </div>
  </section>
</template>

<script>
  import LazyImage from '@/components/UI/LazyImage'
  export default {
    name: 'WorkHero',
    props: ['project', 'animateHeader'],
    components: {
      LazyImage,
      IconArrow: () => import('@/components/Icons/IconArrow')
    }
  }
</script>

<style lang="scss" scoped>
  .hero {
    overflow: hidden;
    margin: 0;
    /deep/ .lazy-image {
      object-fit: cover;
      object-position: center;
      position: absolute;
      height: 100vh;
      width: 100%;
      z-index: -1;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
    }

    @include media(md) {
      /deep/ .lazy-image {
        object-position: right;
        animation: zoomImage infinite;
        animation-delay: 0.3s;
        animation-timing-function: linear;
        animation-fill-mode: both;
        animation-duration: 80s;
        backface-visibility: hidden;
      }
      // background-position: right;
    }

    @include media(xl) {
      background-position: center;
    }

    height: 100vh;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    position: relative;
    padding: 0 $gap;

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

      @include media(sm) {
        display: flex;
      }

      p {
        font-size: 22px;
        line-height: 1;
        margin-bottom: $gap;
        writing-mode: vertical-rl;
      }
    }

    h1 {
      padding: $gap * 3 0 $gap;

      @include media(sm) {
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
      top: 100px;
      top: calc(60px + #{$gap * 1.5});
      text-transform: uppercase;
      font-weight: 600;

      @include media(sm) {
        top: calc(90px + 50px);
      }
    }
  }
</style>
