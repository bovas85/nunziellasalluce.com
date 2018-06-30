<template>
  <div v-show="!hide" class="cookies" :class="{'active': show}">
    <div class="container">
      <p>We use cookies to improve your experience on our website. By clicking ‘OK’ you agree to, and accept our <nuxt-link class="privacy-link" to="/privacy-policy">cookie policy</nuxt-link></p>
      <button class="ok button button--cta button--cta--inverse" @click="setCookie()">OK</button>
    </div>
  </div>
</template>

<script>
  export default {
    name: "CookieBox",
    data () {
      return {
        hide: true,
        show: false
      };
    },
    mounted () {
      if (this.$localStorage.get("AntCookie") != null) {
        // document.querySelector("body").style.marginTop = "";
        this.hide = true;
        this.show = false;
        this.$store.commit("resetNavPadding");
      } else {
        setTimeout(() => {
          // document.querySelector("body").style.marginTop = "60px";
          this.$store.commit("addNavPadding");
          this.hide = false;
          this.show = true;
        }, 4000);
      }
    },
    methods: {
      setCookie () {
        this.hide = true;
        this.$store.commit("resetNavPadding");
        this.$localStorage.set("AntCookie", true);
      }
    }
  };
</script>

<style lang="scss" scoped>
  .cookies {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    height: auto;
    z-index: 9999;
    background: #fafafa;
    border-top: solid 1px #cccccc;
    border-bottom: solid 1px #cccccc;
    opacity: 0;
    transition: opacity 0.6s ease-in-out;
    .button {
      color: $grey;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
    &.active {
      opacity: 1;
    }
    @media (min-width: $tablet) {
      position: relative;
      bottom: unset;
      height: 52px;
      padding: 0;
    }
    p {
      font-size: 16px;
      font-weight: 400;
      letter-spacing: 1.1px;
      max-width: 95%;
      text-align: left;
      color: $grey;
      margin-right: 16px;
      @media (min-width: $tablet) {
        margin: 0;
      }
    }
    .ok {
      margin-left: auto;
      margin-right: 0;
      text-decoration: none;
      &:hover {
        text-decoration: none;
      }
    }
    .container {
      display: flex;
      height: 100%;
      justify-content: space-between;
      align-items: center;
    }
  }
</style>
