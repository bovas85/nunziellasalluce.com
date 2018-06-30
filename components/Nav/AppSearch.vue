<template>
  <div>
    <div @keyup.esc="$store.commit('closeSearch')" class="search-modal" :class="{'is-visible': $store.state.searchOpen}">
    
      <div class="container">
        <div class="search-input col--12 is-center" :class="{'animated': $store.state.inputAnimate}">
          <span class="search"></span>
          <input @keydown="debounceInput($event)" v-model="searchInput" placeholder="SEARCH FOR..." type="text" />
          <span @click="$store.commit('closeSearch')" class="cancel-icon"></span>
        </div>

        <p class="results-text" v-if="results.length > 0 && searchInput.length">
          {{ results.length }} Results for {{ searchInput }}
        </p>
        <p class="results-text" v-else-if="results.length === 0 && focus && searchInput.length < 1">
          No results for {{ searchInput }}
        </p>


          <div :class="{'is-visible': results.length}" class="results grid-wrapper">
            <div class="card col--12-mobile col--4-tablet is-center" v-for="(result, index) in results" :key="index">
              <div class="image">
                <lazy-image 
                  v-if="result.type === 'post'"
                  type="post"
                  :link="result.slug"
                  :image="result.acf.images[0].image"
                ></lazy-image>
                <lazy-image 
                  v-else
                  type="destinations"
                  :link="result.slug"
                  :image="result.acf.header.image"
                ></lazy-image>
              </div>
              <nuxt-link :to="result.type === 'post' ? `/journal/${result.slug}` : `/${result.slug}`" class="text">
                <h4 v-html="result.title.rendered"></h4>
                <p>
                  {{ result.acf.summary }}
                </p>
                <span class="read-more" to="#">Read More</span>
              </nuxt-link>
            </div>
          </div>

      </div>

    </div>
  </div>
</template>

<script>
  import Config from "~/assets/config";
  import debounce from "lodash/debounce";

  export default {
    name: "AppSearch",
    data () {
      return {
        searchInput: "",
        focus: false
      };
    },
    components: {
      LazyImage: () => import("@/components/UI/LazyImage")
    },
    methods: {
      debounceInput: debounce(async function (event) {
        // check if arrows are pressed, avoid api call then
        if (event != null) {
          if (
            event.keyCode === 37 ||
            event.keyCode === 38 ||
            event.keyCode === 39 ||
            event.keyCode === 40
          ) {
            return false;
          } else {
            // input is a normal key, continue
            if (this.searchInput === "" || this.searchInput === " ") {
              this.focus = false;
              this.$store.commit("addResults", []);
              return false;
            }
            this.focus = true;
            let blog = await this.$axios.get(`${Config.wpDomain}${
              Config.api.journal
            }&
                  search=${this.searchInput}`);
            let dests = await this.$axios.get(`${Config.wpDomain}${
              Config.api.destinations
            }&
                  search=${this.searchInput}`);

            let res = [];
            if (this.searchInput.length > 1) {
              if (blog.data && blog.data[0] != null) {
                res.push(blog.data[0]);
              }
              if (dests.data && dests.data[0] != null) {
                res.push(dests.data[0]);
              }
              this.$store.commit("addResults", res);
            } else {
              res = [];
              this.$store.commit("addResults", res);
            }
          }
        }
      }, 350),
      goTo (url) {
        if (this.$route.path === url.slug) {
          window.location.reload();
        } else {
          if (url.type === "post") {
            this.$router.push(`/journal/${url.slug}`);
          } else {
            this.$router.push(`/${url.slug}`);
          }
        }
      }
    },
    computed: {
      results () {
        return this.$store.state.searchResults;
      }
    }
  };
</script>

<style lang="scss" scoped>
  .search-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    opacity: 0;
    z-index: -2;
    background: rgba(0, 23, 44, 0.95);
    transition: all 0.3s ease-in-out;
    .container {
      height: 100%;
      align-items: start;
      grid-template-rows: 1fr 40px 2fr;
      padding: 0 15px;
      @media (min-width: $tablet) {
        padding: 0;
      }
    }
    &.is-visible {
      opacity: 1;
      z-index: 9999;
    }
    .search-input {
      align-self: end;
      grid-row: 1;
      height: 65px;
      width: 100%;
      position: relative;
      opacity: 0;
      margin-top: 133px;
      transform: translateY(-100%);
      transition: all 0.6s ease-in-out 0.2s;
      &.animated {
        opacity: 1;
        transform: translateY(0%);
      }
      input {
        background: none;
        color: #ffffff;
        box-shadow: none !important;
        border: 0;
        padding: 0;
        outline: 0;
        width: 100%;
        text-transform: uppercase;
        padding: 0px 16px 12px 43px;
        font-size: 24px;
        font-size: 1.5rem;
        line-height: 2.625rem;
        letter-spacing: 0.84px;
        border-radius: 0px;
        -webkit-appearance: none;
        background: transparent;
        border: none;
        box-shadow: unset;
        outline: none;
        width: 100%;
        padding: 0 30px 14px 67px;
        height: 65px;
        border-bottom: 2px solid white;
        @media (min-width: $tablet) {
          font-size: 42px;
        }
      }
    }
    .cancel-icon {
      display: inline-block;
      position: absolute;
      cursor: pointer;
      background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2218%22%20height%3D%2218%22%20viewBox%3D%220%200%2018%2018%22%3E%20%20%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%20transform%3D%22translate%281%201%29%22%3E%20%20%20%20%3Ccircle%20cx%3D%228%22%20cy%3D%228%22%20r%3D%228%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%221%22%2F%3E%20%20%20%20%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M8.21052632%2C7.13871017%20L5.7033951%2C4.63157895%20L5.05263158%2C5.28234246%20L6.56644102%2C6.7961519%20L7.5597628%2C7.78947368%20L5.05263158%2C10.2966049%20L5.7033951%2C10.9473684%20L8.21052632%2C8.4402372%20L10.7176575%2C10.9473684%20L11.3684211%2C10.2966049%20L8.86128983%2C7.78947368%20L11.3684211%2C5.28234246%20L10.7176575%2C4.63157895%20L8.21052632%2C7.13871017%20Z%22%2F%3E%20%20%3C%2Fg%3E%3C%2Fsvg%3E");
      background-repeat: no-repeat;
      background-size: contain;
      right: 0;
      top: 9px;
      width: 24px;
      height: 24px;
      @media (min-width: $tablet) {
        width: 32px;
        height: 30px;
      }
    }
    .search {
      display: inline-block;
      position: absolute;
      cursor: pointer;
      background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2213%22%20height%3D%2213%22%20viewBox%3D%220%200%2013%2013%22%3E%20%20%3Cg%20fill%3D%22%23FFFFFF%22%20fill-rule%3D%22evenodd%22%20transform%3D%22matrix%28-1%200%200%201%2013%200%29%22%3E%20%20%20%20%3Cpath%20d%3D%22M8.27272727%208.5630386C6.15768463%208.5630386%204.43694429%206.84244669%204.43694429%204.72736346%204.43694429%202.61228022%206.15768463.891506858%208.27272727.891506858%2010.3877699.891506858%2012.1085103%202.61228022%2012.1085103%204.72736346%2012.1085103%206.84244669%2010.3877699%208.5630386%208.27272727%208.5630386M8.27272727%200C5.6661223%200%203.54545455%202.12070846%203.54545455%204.72736346%203.54545455%207.33401846%205.6661223%209.45454545%208.27272727%209.45454545%2010.8793322%209.45454545%2013%207.33401846%2013%204.72736346%2013%202.12070846%2010.8793322%200%208.27272727%200M4.10374779%208.27272727L.13653342%2012.2099731C-.039848783%2012.3850343-.0461283588%2012.6753328.122312028%2012.8582554.290937108%2013.0413697.570562925%2013.047889.746760434%2012.8730196L4.72727273%208.92254349C4.49936106%208.72792459%204.29047282%208.51010481%204.10374779%208.27272727%22%2F%3E%20%20%3C%2Fg%3E%3C%2Fsvg%3E");
      background-repeat: no-repeat;
      background-size: contain;
      left: 0;
      top: 9px;
      width: 24px;
      height: 24px;
      @media (min-width: $tablet) {
        width: 32px;
        height: 30px;
      }
    }
    .results-text {
      color: white;
      grid-row: 2;
    }
    .results {
      grid-row: 3;
      overflow-y: auto;
      height: 100%;
      padding-bottom: 30px;
      opacity: 0;
      will-change: opacity;
      backface-visibility: hidden;
      transition: opacity 0.3s ease-in-out;
      &.is-visible {
        opacity: 1;
      }
      .card {
        width: 100%;
        cursor: pointer;
        &:hover {
          .text .read-more {
            color: $red;
            text-decoration: none;
          }
        }
        .image {
          height: 265px;
          .lazy-image {
            margin-bottom: 0px;
            width: 100%;
            height: 265px;
            object-fit: cover;
            object-position: center;
          }
        }
        .text {
          color: white;
          h4 {
            text-transform: uppercase;
            letter-spacing: 2px;
            font-size: 24px;
            line-height: 21px;
            margin-top: 22px;
            margin-bottom: 10px;
          }
          p {
            line-height: 1.5;
            color: currentColor;
            @include line-clamp(3, 1.5);
          }
          .read-more {
            color: white;
            text-transform: uppercase;
            font-size: 16px;
            display: block;
            font-weight: 700;
            margin-bottom: 22px;
            margin-top: 13px;
            text-decoration: none;
            transition: color 0.3s ease-in-out;
          }
        }
      }
    }
  }
</style>
