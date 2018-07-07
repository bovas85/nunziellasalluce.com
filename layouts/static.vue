<template>
  <div class="app" :class="{'is-offline': !$root.online}">
    <the-nav />
    <div class="app-main static" :class="{'fixed': $store.state.openModal}">
      <nuxt/>
    </div>
    <the-footer />
  </div>
</template>

<script>
  import TheNav from '@/components/Nav/TheNav'
  import TheFooter from '@/components/Footers/TheFooter'

  export default {
    components: {
      TheNav,
      TheFooter
      // CookieBox: () => import("@/components/UI/CookieBox")
    }
  }
</script>

<style lang="scss" scoped>
  .static {
    .header {
      width: 100%;
      margin: 0;
      // z-index: -1;
    }
    hr {
      border-top: 1px solid #b4b5b3;
      margin-bottom: 50px;
      @media (min-width: $tablet) {
        margin-bottom: 100px;
      }
    }
    .body-wrapper {
      // background: #fafafa;
      height: 100%;
      @media (min-width: $tablet) {
        // padding: 15px 0;
        // margin: 15px 0 0;
      }
    }

    .body {
      padding-bottom: 0;
      color: $grey;
      padding-bottom: 0;
      padding: 0 15px;
      @media (min-width: $tablet) {
        // padding: 15px;
        box-shadow: 0px 1px 1px 1px rgba(0, 0, 0, 0.2);
        // margin: 0 15px;
        padding-bottom: 118px;
      }
      p {
        margin: 0;
        padding: 0 0 24px 0;
        font-size: 16px;
        font-weight: 300;
        line-height: 1.15;
        color: currentColor;
      }
      a {
        color: currentColor;
        border-bottom: 1px solid currentColor;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.3s ease-in-out;
        &:hover {
          color: $red;
        }
      }
      h1 {
        font-size: 22px;
        font-size: 1.375rem;
        letter-spacing: 1.38px;
        text-transform: uppercase;
        text-align: center;
        margin: 50px 0 25px 0;
        padding: 0;
        font-weight: 700;
        color: $secondary;
        @media (min-width: $tablet) {
          font-size: 42px;
          margin: 80px 0 47px 0;
        }
      }
      h2 {
        font-size: 22px;
        letter-spacing: 1.38px;
        text-transform: uppercase;
        text-align: center;
        padding: 0;
        color: $secondary;
        font-weight: 700;
        @media (min-width: $tablet) {
          font-size: 32px;
          letter-spacing: 2px;
        }
        &.superline {
          position: relative;
          text-transform: capitalize;
          font-weight: 700;
          margin-left: 0;
          text-align: left;
          font-size: 22px;
          line-height: 22px;
          color: $secondary;
          letter-spacing: 0.4px;
          padding: 0;
          margin-bottom: 10px;
          &:before {
            content: '';
            position: absolute;
            top: -20px;
            left: 0;
            background: $secondary;
            height: 1px;
            width: 77px;
          }
        }
      }
    }
    .fixed {
      overflow: hidden;
      position: fixed;
      z-index: 999;
    }
    .Masthead__image {
      height: 105% !important;
    }
    .is-offline form.go-bottom {
      margin: 75px 0 $gap * 2 !important;
      // opacity: .6;
      // cursor: not-allowed;
      // pointer-events: none;
      .name--first {
        margin-top: $gap;
      }
      position: relative;
      &::after {
        content: 'You are offline, please save the form.';
        display: block;
        position: absolute;
        top: -60px;
        width: 100%;
        left: 50%;
        transform: translateX(-50%);
        color: #ffffff;
        background-color: $secondary;
        padding: 16px;
      }
    }
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      overflow: hidden;
      height: 100%;
      background: rgba(0, 0, 0, 0.1);
      opacity: 1;
      transition: all 0.3s ease-in-out 0.4s;
    }
    .iframe,
    iframe {
      min-width: 724px;
      max-width: 750px;
      margin: 0 auto;
    }
    // default layout specific styles
    @media (max-width: $mobile) {
      #twitter-widget-0 img {
        max-width: 100%;
        width: 300px;
      }
      .iframe,
      iframe {
        max-width: 100%;
      }
      iframe {
        width: 95vw !important;
        width: calc(100vw - 48px) !important; // 100vw - gap on both sides
        margin: ($gap / 2) auto;
      }
    }
    .paragraph p {
      font-size: 14px;
      letter-spacing: 1.1px;
      line-height: 2.4;
      text-align: left;
      color: #414141;
      @include line-clamp(2, 2.4);
      max-width: 90%;
      @media (min-width: $tablet) {
        max-width: 294px;
        @include line-clamp(2, 2.4);
      }
    }
  }
</style>