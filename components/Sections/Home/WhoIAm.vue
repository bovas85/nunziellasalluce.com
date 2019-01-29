<template>
  <section class="section who-i-am step" v-if="acf">
    <div class="container">
      <h1 :class="{'animated': animateWho}" v-if="acf">{{acf.who_i_am.title}}</h1>
      <div class="wrapper">
        <LazyImage
          class="image"
          :class="{'animated': animateWho}"
          v-if="acf"
          :image="acf.who_i_am.image"
          :title="acf.who_i_am.title"
          :hover="false"
          :imageMobile="acf.who_i_am.image"
          home
        />
        <div class="text" v-if="acf">
          <no-ssr>
            <p
              :class="{
                'animated': animateWho,
                'stagger-it': index === 0,
                'color-cycle': index === 1,
                'pop-out-color': index === 2
              }"
              v-for="(item, index) in acf.who_i_am.text_group"
              :key="index"
              class="jumbo"
              data-splitting
            >{{item.text}}</p>
          </no-ssr>
          <nuxt-link
            to="/about"
            :class="{'animated': animateWho}"
            class="button button--sent button--is-white"
          >About Me</nuxt-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  export default {
    name: "WhoIAm",
    props: ["acf", "animateWho"],
    components: {
      LazyImage: () => import("@/components/UI/LazyImage")
    }
  };
</script>

<style lang="scss" scoped>
  section {
    &.who-i-am {
      margin: $gap * 1.5 0;

      h1 {
        max-width: 150px;
        @include fadeInUp;
        padding-left: $gap;

        @include media(md) {
          padding-left: 0;
        }
      }

      @include media(xl) {
        margin: $gap * 1.5 0;
      }
      .container {
        grid-gap: 0;
        .wrapper {
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .image {
          width: 100%;
          height: 430px;
          margin: 0 auto;
          object-fit: cover;
          object-position: center;
          @include fadeInUp;
          transition-delay: 0.2s;
          position: absolute;

          @supports (display: grid) {
            position: relative;
          }

          @include media(md) {
            height: 550px;
          }

          @include media(xl) {
            width: 80%;
          }
        }

        .text {
          position: relative;
          @supports (display: grid) {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            transform: translate(-50%, -50%);
            z-index: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          }

          p {
            text-align: center;
            margin: $gap / 1.5 0;
            padding: 0 $gap / 2;
            @include size(h3);
            @include fadeInUp;

            @include media(lg) {
              padding: 0;
              @include size(h2);
            }
            @include media(xl) {
              @include size(h1);
            }
            @include media(xxl) {
              @include size(jumbo);
            }
            @include media(md) {
              &:nth-child(1) {
                margin-left: auto;
                margin-right: auto;
                transition-delay: 0.4s;
              }
              &:nth-child(2) {
                margin-right: 10%;
                transition-delay: 0.6s;
              }
              &:nth-child(3) {
                margin-left: 10%;
                transition-delay: 0.8s;
              }
            }
          }
        }

        a {
          @include fadeInUp;
          transition-delay: 0.8s;
        }
      }
    }
  }
</style>
