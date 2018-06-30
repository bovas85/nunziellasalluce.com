<template>
<div class="navigation-bar">
  <cookie-box></cookie-box>
  <div class="navigation" :class="{'is-padded': getNavPadding, 'blue-bg': checkStyle}">
    <nav role="navigation" class="container-fluid grid-wrapper is-gapless navbar">

    </nav>
  </div>

</div>

</template>

<script>
  import debounce from "lodash/debounce";

  export default {
    name: "AppNav",
    components: {
      CookieBox: () => import("@/components/UI/CookieBox")
    },
    data () {
      return {
      };
    },
    methods: {
      refreshPage () {
        if (this.$route.path === "/") {
          window.location.reload();
          window.scrollTo(0, 0);
        }
      }
    },
    watch: {
    },
    computed: {
    },
    created () {
    },
    async mounted () {
      if (process.browser) {
        // check connection type
        var connection =
          navigator.connection ||
          navigator.mozConnection ||
          navigator.webkitConnection;
        if (connection != null) {
          var type = connection.type;
          let vm = this;
          function updateConnectionStatus () {
            // console.log(
            //   "Connection type changed from " + type + " to " + connection.type
            // );
            vm.$store.commit("setConnection", connection.type);
          }
          connection.addEventListener("typechange", updateConnectionStatus);
        }
        // console.log("Connection type: " + type);
        this.$store.commit("setConnection", type);
        // on load trigger window width mutation once
        this.$store.commit("windowResize", window.innerWidth);

        window.onNuxtReady(app => {
          // resize triggers window width mutation
          window.addEventListener(
            "resize",
            debounce(() => {
              // console.log("window resize");
              this.$store.commit("windowResize", window.innerWidth);
            }, 300)
          );
        });

        // route management for menus/state/transitions
        this.$root.$on("routeChanged", () => {
          let body = document.querySelector("body");
          let html = document.querySelector("html");
          if (body && html) {
            body.style.overflow = "visible";
            html.style.overflow = "visible";
            body.style.position = "static";
          }
        });
      }
    }
  };
</script>

<style lang="scss" scoped>
  .navigation {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    // bottom: 0;
    width: 100%;
    z-index: 5;
    height: 100px;
    margin: 0 auto;
    &.is-padded {
      @media (min-width: $tablet) {
        padding-top: 52px;
      }
    }
    &.blue-bg {
      // background: $secondary;
      background: #00172c;
      height: 86px;
      &.is-padded {
        @media (min-width: $tablet) {
          padding-top: 0;
          margin-top: 52px;
        }
      }
    }
    .navbar {
      align-items: center;
      padding: 0 15px;
      height: 100%;
      position: absolute;
      left: 0;
      right: 0;
      width: 100%;
      display: flex;
      justify-content: space-between;
      .logo {
        margin: 0;
        margin-top: 8px;
      }
      @media (min-width: $tablet) {
        padding: 0 36px;
      }
    }
    i {
      color: white;
      font-size: 14px;
      @media (min-width: $tablet) {
        font-size: 16px;
      }
    }
  }
  .menu {
    &:hover {
      .menu-icon {
        margin-bottom: 6px;
      }
    }
    cursor: pointer;
    display: flex;
    align-items: center;
    @media (min-width: $desktop) {
      flex-basis: 159px;
    }
    &--desktop {
      .menu-icons {
        margin-left: 8px;
        margin-top: 2px;
      }
    }
    .text {
      color: white;
      margin-left: 15px;
      font-size: 14px;
      font-weight: 400;
      line-height: 1;
      @media (min-width: $tablet) {
        font-size: 16px;
        margin-left: 0;
      }
    }
    .destination {
      margin-right: 6px;
      margin-left: 0;
      &:hover {
        + i {
          transform: rotate(180deg);
        }
      }
      + i {
        transition: transform 0.3s ease-in-out;
        transform-origin: center;
        &:hover {
          transform: rotate(180deg);
        }
      }
    }
    .menu-icon {
      display: block;
      margin-bottom: 3px;
      background: #ffffff;
      border-radius: 1px;
      opacity: 1;
      height: 1px;
      width: 15px;
      transition: all 0.3s ease-in-out;
    }
    .menu-icons {
      @media (min-width: $tablet) {
        &:hover {
          .menu-icon {
            margin-bottom: 6px;
          }
        }
      }
    }
    span:hover {
      + .menu-icon {
        margin-bottom: 6px;
      }
    }
    i {
      font-size: 14px;
      width: 14px;
      &:before {
        width: 14px;
        font-size: 14px;
      }
      @media (min-width: $tablet) {
        font-size: 16px;
        width: 16px;
        &:before {
          font-size: 16px;
          width: 16px;
        }
      }
    }
  }
  .logo {
    cursor: pointer;
    margin: 0 auto;
    margin-top: 8px;
    background-image: url("/images/logo-text.svg");
    background-repeat: no-repeat;
    background-size: cover;
    width: 150px;
    height: 25px;
    @media (min-width: $tablet) {
      width: 180px;
      height: 30px;
    }
  }
  .search {
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    span {
      font-size: 14px;
      line-height: 1;
      color: white;
      font-weight: 400;
      margin-left: 32px;
      @media (min-width: $tablet) {
        font-size: 16px;
        &:first-child {
          margin-left: 0;
        }
      }
    }
    .search {
      display: inline-block;
      margin-left: 8px;
      cursor: pointer;
      background-image: url("/images/08__search.svg");
      background-repeat: no-repeat;
      background-size: contain;
      width: 13px;
      height: 13px;
      transform: rotate(-90deg);
    }
  }
</style>
