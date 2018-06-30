<template>
<div class="navigation-bar">
  <div class="transition-overlay" :class="{'is-active': $store.state.routeTransition}">
    <div class="preloader"></div>
    <span class="pulse"></span>
    <span class="pulse"></span>
    <span class="pulse"></span>
  </div>
  <cookie-box></cookie-box>
  <div class="navigation" :class="{'is-padded': getNavPadding, 'blue-bg': checkStyle}">
    <nav role="navigation" class="container-fluid grid-wrapper is-gapless navbar">
      <span class="menu is-hidden-tablet col--2-mobile col--3-tablet is-left" @click="$store.commit('openMobileMenu')">
        <div class="menu-icons">
          <div class="menu-icon"></div>
          <div class="menu-icon"></div>
          <div class="menu-icon"></div>
        </div>
        <span class="text hidden-mobile">Menu</span>
      </span>
      <span class="menu hidden-mobile is-hidden-mobile-large-only col--2-mobile col--4-tablet is-left" @click="$store.commit('openDestinationMenu')">
        <span class="text destination hidden-mobile">Destinations</span>
        <i class="fa fa-arrow-down"></i>
      </span>
      <nuxt-link to="/" @click="refreshPage()" class="logo col--8-mobile col--4-tablet is-center"></nuxt-link>
      <div class="search col--2-mobile col--4-tablet is-right">
        <div class="is-flex" @click="$store.commit('openSearch')">
          <span class="hidden-mobile">Search</span>
          <div class="search"></div>
        </div>
        <span class="menu menu--desktop hidden-mobile is-hidden-mobile-large-only" @click="$store.commit('openMenu')">
          <span class="text hidden-mobile">Menu</span>
          <div class="menu-icons">
            <div class="menu-icon"></div>
            <div class="menu-icon"></div>
            <div class="menu-icon"></div>
          </div>
        </span>
      </div>
    </nav>
  </div>


  <no-ssr>
    <vue-media :query="{maxWidth: 767}">
      <div style="z-index: 9999" class="modal-container is-hidden-tablet">
        <app-menu-mobile></app-menu-mobile>
      </div>
    </vue-media>
  </no-ssr>

  <no-ssr>
    <vue-media :query="{minWidth: 768}">
      <div style="z-index: 9999" class="modal-container hidden-mobile is-hidden-mobile-large-only">
        <destination-menu></destination-menu>
      </div>
    </vue-media>
  </no-ssr>


  <app-search></app-search>

  <no-ssr>
    <vue-media :query="{minWidth: 767}">
      <div
        style="z-index: 9999"
        class="modal-container modal-container-large app-menu hidden-mobile is-hidden-mobile-large-only"
      >
        <app-menu></app-menu>
      </div>
    </vue-media>
  </no-ssr>

</div>

</template>

<script>
  import Config from "~/assets/config";
  import debounce from "lodash/debounce";

  export default {
    name: "AppNav",
    props: {
      journal: {
        type: Boolean,
        default: false
      }
    },
    components: {
      AppMenuMobile: () => import("@/components/Nav/AppMenuMobile"),
      AppMenu: () => import("@/components/Nav/AppMenu"),
      AppSearch: () => import("@/components/Nav/AppSearch"),
      DestinationMenu: () => import("@/components/Nav/DestinationMenu"),
      CookieBox: () => import("@/components/UI/CookieBox")
    },
    data () {
      return {
        focus: false,
        results: [],
        searchInput: "",
        disabled: "",
        openMenuTitle: "",
        submenuSelectionMade: false,
        menuLeft: false,
        latest: {},
        menuData: {}
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
      // sorcery to check for updates on modal state boolean
      // if true, it will run some DOM stuff to block scrolling else remove it
      modalState () {
        if (this.modalState) {
          let body = document.querySelector("body");
          let html = document.querySelector("html");
          if (body && html) {
            setTimeout(() => {
              body.style.overflow = "hidden";
              html.style.overflow = "hidden";
            }, 600);

            if (window.innerWidth < 577) {
              // body.style.position = 'fixed'
            }
          }
        } else {
          let body = document.querySelector("body");
          let html = document.querySelector("html");
          if (body && html) {
            setTimeout(() => {
              body.style.overflow = "visible";
              html.style.overflow = "visible";
              // body.style.position = 'static'
            }, 600);
          }
        }
      }
    },
    computed: {
      menuBg () {
        if (this.currentMenu) {
          if (this.currentMenu === "kids") {
            return {
              "background-color": "#e1f2f2"
            };
          } else if (this.currentMenu === "offers") {
            return {
              "background-color": "#fcf2f0"
            };
          } else if (this.currentMenu === "events") {
            return {
              "background-color": "#dceaf7"
            };
          } else {
            return {
              "background-color": "#e1f2f2"
            };
          }
        }
      },
      modalState () {
        // get modal state from the store and compute it
        return this.$store.state.modalOpen;
      },
      getNavPadding () {
        return this.$store.state.navPadding;
      },
      checkStyle () {
        if (this.journal) return true;
        var found = 0;
        if (this.$store.state.continents != null) {
          this.$store.state.continents.forEach(continent => {
            // console.log(continent.slug, this.$route.name)
            if (continent.slug === this.$route.name) {
              found++;
            }
          });
          return found > 0;
        } else return false;
      }
    },
    created () {
      this.$store.commit("routeTransition");
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
        this.$store.commit("closeSearch");

        // route management for menus/state/transitions
        this.$root.$on("routeChanged", () => {
          // console.log('route changed, transitioning')
          this.$store.commit("routeTransition");
          this.$store.commit("resetMenus");
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
  .transition-overlay {
    background: #fafafa;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    z-index: -1;
    will-change: transform, z-index;
    transform: translateZ(0);
    backface-visibility: hidden;
    transition: opacity 0.3s ease-out, z-index 0.2s ease-in-out;
    &.is-active {
      z-index: 999999;
      opacity: 1;
    }
    .preloader {
      width: 50px;
      height: 64px;
      background-image: url("/images/loader-logo.svg");
      background-repeat: no-repeat;
      background-size: contain;
    }
    .pulse {
      z-index: 9999999990;
      width: 50px;
      height: 64px;
      position: absolute;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      &:nth-of-type(2):before {
        animation-delay: 0.6s;
      }
      &:nth-of-type(3):before {
        animation-delay: 2.2s;
      }
      &:before {
        content: "";
        display: block;
        position: relative;
        width: 50px;
        height: 64px;
        border-radius: 50%;
        border-style: solid;
        border-width: thin;
        border-color: #000b19;
        animation: scale-before 3.5s infinite ease;
      }
    }
    @keyframes scale-before {
      0% {
        transform: scale(1);
        opacity: 0;
      }
      40% {
        opacity: 0.5;
      }
      100% {
        transform: scale(1.4);
        opacity: 0;
      }
    }
  }
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
