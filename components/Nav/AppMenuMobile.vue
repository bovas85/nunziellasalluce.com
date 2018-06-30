<template>
  <div>
    <div class="overlay" @click="closeMobileMenu()" :class="{'is-visible': $store.state.mobileNavOpen}"></div>
    <div class="right-nav" :class="{'is-visible': $store.state.mobileNavOpen}">
      <div @click="closeMobileMenu()" class="close-button">
        <div class="close-icon">
          <span class="close-icon--line"></span>
          <span class="close-icon--line inverted"></span>
        </div>
        <span class="text">Close</span>
      </div>

      <ul class="menu-items">
        <li @click="$store.commit('openSub', 'Africa')">
          <a href="#">Africa Destinations</a>
          <i class="fa fa-arrow-right"></i>
        </li>
        <li @click="$store.commit('openSub', 'Latin America')">
          <a href="#">Latin America Destinations</a>
          <i class="fa fa-arrow-right"></i>
        </li>
        <li>
          <nuxt-link to="/journal" @click.native="$store.commit('resetMenus')">The Journal</nuxt-link>
        </li>
        <li>
          <nuxt-link to="/about" @click.native="$store.commit('resetMenus')">About </nuxt-link>
        </li>
        <li>
          <nuxt-link to="/journal" @click.native="$store.commit('resetMenus')">Where to go When</nuxt-link>
        </li>
      </ul>

      <nuxt-link to="/contact" @click.native="$store.commit('resetMenus')" class="button button--main is-hidden-tablet">Enquire Now</nuxt-link>

      <hr>

      <div class="menu-footer">
        <div class="images">
          <img src="/images/footer/map.svg" alt="">
          <img class="atol" src="/images/footer/atol.svg" alt="">
        </div>
        <p>ATOL PROTECTED TRAVEL TO AFRICA, LATIN AMERICA AND THE CARIBBEAN</p>
      </div>

      <!-- submenu start -->
      <div class="submenu" :class="{'is-visible': $store.state.subMenuActive}">

        <div @click="closeMobileMenu()" class="close-button">
          <div class="close-icon">
            <span class="close-icon--line"></span>
            <span class="close-icon--line inverted"></span>
          </div>
          <span class="text">Close</span>
        </div>

        <ul class="menu-items">
          <li class="flex-start" @click="closeSubNav()">
            <i class="fa fa-arrow-left"></i>
            <a class="submenu-title" href="#">{{ $store.state.activeSubMenu }}</a>
          </li>
        </ul>

        <div v-show="latinAmerica && $store.state.activeSubMenu === 'Latin America'">
          <ul class="menu-items">
            <li v-for="(destination, index) in latinAmerica" :key="index">
              <nuxt-link :to="'/' + destination.destination.post_name"
              @click.native="$store.commit('resetMenus')">
                <span>{{ destination.destination.post_title }}</span>
                <img :src="getImageBySlug(destination.destination.post_name)" alt="">
              </nuxt-link>

            </li>
            <li class="static-link">
              <nuxt-link to="/journal" @click.native="$store.commit('resetMenus')">Where to go When</nuxt-link>
            </li>
          </ul>
        </div>

        <div v-show="africa && $store.state.activeSubMenu === 'Africa'">
          <ul class="menu-items">
            <li v-for="(destination, index) in africa" :key="index">
              <nuxt-link :to="'/' + destination.destination.post_name"
              @click.native="$store.commit('resetMenus')">
                <span>{{ destination.destination.post_title }}</span>
                <img :src="getImageBySlug(destination.destination.post_name)" alt="">
              </nuxt-link>
            </li>
            <li class="static-link">
              <nuxt-link to="/journal" @click.native="$store.commit('resetMenus')">Where to go When</nuxt-link>
            </li>
          </ul>
        </div>

      </div>
      <!-- end submenu -->

    </div>
  </div>
</template>

<script>
  export default {
    name: "AppMenuMobile",
    methods: {
      getImageBySlug (slug) {
        let destination = this.$store.state.destinations.find(destination => {
          return destination.slug === slug;
        });
        if (destination != null && destination.acf.header.image.sizes != null) {
          return destination.acf.header.image.sizes.thumbnail;
        }
      },
      closeSubNav () {
        this.$store.commit("closeSub");
      },
      closeMobileMenu () {
        this.$store.commit('closeMobileMenu');
        setTimeout(() => {
          this.$store.commit("closeSub");
          window.scrollTo(0, this.$store.state.offset);
        }, 700);
      }
    },
    computed: {
      africa () {
        if (
          this.$store.state.continents &&
          this.$store.state.continents[0] != null
        ) {
          return this.$store.state.continents[0].acf.destination_list;
        } else return false;
      },
      latinAmerica () {
        if (
          this.$store.state.continents &&
          this.$store.state.continents[1] != null
        ) {
          return this.$store.state.continents[1].acf.destination_list;
        } else return false;
      },
      northAmerica () {
        if (
          this.$store.state.continents &&
          this.$store.state.continents[2] != null
        ) {
          return this.$store.state.continents[2].acf.destination_list;
        } else return false;
      }
    }
  };
</script>

<style lang="scss" scoped>
  .overlay {
    position: fixed;
    background: rgba(0, 0, 0, 0.5);
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    opacity: 0;
    z-index: -2;
    will-change: opacity, z-index;
    backface-visibility: hidden;
    transform: translateZ(0);
    transition: opacity 0.6s ease-in-out, z-index 0.6s ease-in-out;
    &.is-visible {
      opacity: 1;
      z-index: 9000;
    }
  }
  .right-nav {
    background: white;
    overflow: auto;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    width: calc(100% - 50px);
    height: 100%;
    opacity: 1;
    z-index: 9999;
    padding: 0 15px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
    transform: translateX(-102%) translateZ(0);
    will-change: transform;
    backface-visibility: hidden;
    transition: transform 0.6s ease-in-out;
    &.is-visible {
      opacity: 1;
      transform: translateX(0);
    }
    .close-button {
      display: flex;
      height: 100px;
      justify-content: flex-start;
      align-items: center;
      .text {
        cursor: pointer;
        font-size: 14px;
        letter-spacing: 1.2px;
        text-align: left;
        color: $grey;
      }
    }
    .close-icon {
      cursor: pointer;
      position: relative;
      padding-right: 20px;
      width: 15px;
      height: 15px;
      &--line {
        position: absolute;
        top: 7px;
        left: 0;
        cursor: pointer;
        display: block;
        margin-bottom: 3px;
        background: $grey;
        border-radius: 1px;
        opacity: 1;
        height: 1px;
        width: 15px;
        transform: rotate(45deg);
        &.inverted {
          transform: rotate(-45deg);
        }
      }
    }
    .menu-items {
      margin-bottom: 100px;
      li {
        padding: 15px 0;
        display: flex;
        cursor: pointer;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #ededed;
        transition: all 0.3s ease-in-out;
        &:hover,
        &:hover i,
        &:hover a {
          color: $red;
        }
      }
      a {
        font-size: 14px;
        line-height: 1;
        letter-spacing: 0.5px;
        text-align: left;
        color: $secondary;
        text-transform: uppercase;
        transition: all 0.3s ease-in-out;
      }
      i {
        line-height: 1;
        width: 7px;
        font-size: 16px;
        height: 19px;
        transition: all 0.3s ease-in-out;
      }
    }
    .button {
      min-height: 40px;
      margin-bottom: 100px;
    }
    hr {
      border-bottom: 1px solid #ededed;
      margin: 0;
      padding: 0;
    }

    .menu-footer {
      margin-top: 20px;
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .images {
        display: flex;
        margin-bottom: 20px;
        img {
          margin: 0 5px;
          max-width: 35px;
          max-height: 28px;
          min-height: 28px;
          object-fit: contain;
          opacity: 1;
          object-position: center;
          &.atol {
            opacity: 0.4;
          }
        }
      }
      p {
        font-size: 10px;
        line-height: 1.4;
        letter-spacing: 0.4px;
        text-align: center;
        max-width: 200px;
        color: #818181;
      }
    }
  }
  .submenu {
    background: white;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    opacity: 1;
    z-index: -2;
    padding: 0 15px;
    will-change: transform;
    backface-visibility: hidden;
    transform: translateX(-102%) translateZ(0);
    transition: transform 0.6s ease-in-out, z-index .6s ease-in-out, opacity .6s ease-in-out;
    &.is-visible {
      opacity: 1;
      z-index: 9999;
      transform: translateX(0);
    }
    .menu-items {
      background: white;
      margin-bottom: 0;
      li {
        padding: 5px 0;
        display: flex;
        align-items: center;
        &.static-link {
          padding: 22px 0;
          height: 62px;
          a {
            text-transform: uppercase;
            color: $secondary;
            &:hover {
              color: $red;
            }
          }
        }
        &.flex-start {
          padding: 15px 0;
          justify-content: flex-start;
          align-items: center;
        }
        a {
          font-size: 14px;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: 1;
          letter-spacing: 1.2px;
          text-align: left;
          text-transform: none;
          color: $grey;
          transition: all 0.3s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          &.submenu-title {
            text-transform: uppercase;
            color: $secondary;
            line-height: 1;
          }
        }
        img {
          width: 77px;
          height: 51px;
          object-fit: cover;
          object-position: center;
        }
      }
      i {
        width: 7px;
        line-height: 1;
        margin-right: 10px;
      }
    }
  }
</style>
