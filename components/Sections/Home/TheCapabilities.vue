<template>
  <section class="capabilities step" v-if="acf">
    <div class="container">
      <h1 :class="{'animated': animateCapab}">{{acf.capabilities.title}}</h1>
      <div :class="{'animated': animateCapab}" class="skill col--4-tablet">
        <img class='lazyload' :data-src="acf.capabilities.media_object.image.sizes.large" :alt="acf.capabilities.media_object.image.alt">
        <h3>{{acf.capabilities.media_object.title}}</h3>
        <p>{{acf.capabilities.media_object.body}}</p>
      </div>
      <div :class="{'animated': animateCapab}" class="skill col--4-tablet padded-top">
        <img class='lazyload' :data-src="acf.capabilities.media_object2.image.sizes.large" :alt="acf.capabilities.media_object2.image.alt">
        <h3>{{acf.capabilities.media_object2.title}}</h3>
        <p>{{acf.capabilities.media_object2.body}}</p>
      </div>
      <div :class="{'animated': animateCapab}" class="skill col--4-tablet">
        <img class='lazyload' :data-src="acf.capabilities.media_object3.image.sizes.large" :alt="acf.capabilities.media_object3.image.alt">
        <h3>{{acf.capabilities.media_object3.title}}</h3>
        <p>{{acf.capabilities.media_object3.body}}</p>
      </div>
    </div>
  </section>
</template>

<script>
  export default {
    name: 'TheCapabilities',
    props: ['acf', 'animateCapab']
  }
</script>

<style lang="scss" scoped>
  .capabilities {
    h1 {
      flex-basis: 100%;
      max-width: 20vw;
      padding-left: $gap;

      @include media(md) {
        padding-left: 0;
      }

      @include fadeInUp;
    }

    .skill {
      margin: $gap * 1.5 $gap;
      @include fadeInUp;

      @include media(md) {
        margin: 0 auto;
        max-width: 280px;
        text-align: center;
      }

      img {
        width: 100px;
        height: auto;
        margin: 0 auto;

        @media (max-width: $mobile) {
          max-width: 50vw;
          margin: 0 0 $gap;
        }
      }

      h3 {
        margin: $gap / 2 0;
        color: $primary;
      }

      p {
        font-size: $font-size * $rule;
      }

      &.padded-top {
        @include media(md) {
          padding-top: 46px;
        }
      }

      &:nth-child(2) {
        transition-delay: 0.2s;
      }
      &:nth-child(3) {
        transition-delay: 0.4s;
      }
      &:nth-child(4) {
        transition-delay: 0.6s;
      }
    }
  }
</style>
