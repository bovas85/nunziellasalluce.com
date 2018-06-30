<template>
  <div @click="navigateTo(data.slug)" class="blog-card">
    <div v-if="data != null" class="col col--12 image-section">
      <lazy-image
        v-if="data != null && data.slug != null"
        isThumb
        masonry
        :image="data.acf.header.image"
      ></lazy-image>
    </div>

    <!-- mobile text -->
    <div v-if="$store.state.window && $store.state.window < 577" class="col col--12 text-section is-hidden-tablet">
      <p v-if="data != null && data.title != null" v-html="data.title.rendered"></p>
      <div class="sub">
        <h1 v-if="data != null && data.date != null">{{getDate(data.date)}}</h1>
        <span class="line"></span>
      </div>
    </div>

    <!-- text-desktop -->
    <div v-else class="col col--12 text-section hidden-mobile">
      <h2 v-if="data != null && data.title != null" v-html="data.title.rendered"></h2>
      <div class="sub">
        <h1 v-if="data != null && data.date != null">{{getDate(data.date)}}</h1>
        <span class="line"></span>
      </div>
      <p>
        {{ data.acf.summary }}
        <nuxt-link class="read-more" :to="`/journal/${data.slug}`">Read more</nuxt-link>
      </p>
    </div>

  </div>
</template>

<script>
  import startsWith from "lodash/startsWith";
  export default {
    name: "BlogCard",
    props: {
      data: {
        type: Object
      },
      featured: {
        type: Boolean
      },
      location: {
        type: String,
        default: ""
      }
    },
    components: {
      LazyImage: () => import("@/components/UI/LazyImage")
    },
    methods: {
      navigateTo (url) {
        if (startsWith(url, "http")) {
          // console.log('external')
          if (url != null) {
            window.open(url);
          }
        } else {
          if (startsWith(url, "/")) {
            // console.log('navigating to /', url)
            this.$router.push(url);
          }
          // console.log('navigating to', url)
          this.$router.push({ path: `/journal/${url}` });
        }
      }
    },
    computed: {
      bindImage () {
        if (this.data.image != null) {
          return `${this.data.image.url} 500w, ${this.data.image.url} 1024w, ${
            this.data.image.url
          } 1100w`;
        }
      },
      bindBackground () {
        if (process.browser) {
          if (window.innerWidth > 767) {
            return {
              "background-image": `url('${this.data.image.url}')`,
              "background-size": "100%"
            };
          } else return { background: "white" };
        } else {
          return { background: "white" };
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  .blog-card {
    grid-column: span 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    width: 100%;
    min-height: 413px;
    cursor: pointer;
    background: none;
    justify-self: center;
    justify-content: center;
    margin: 0 auto;
    position: relative;
    padding: 0;
    border: 1px solid $secondary;
    @media (min-width: $tablet) {
      border: none;
      min-height: 443px;
    }

    @media (min-width: $tablet) {
      min-height: 413px;
      &:hover {
        .read-more {
          color: $red;
        }
        .text-section {
          opacity: 1;
        }
      }
    }
    .overlay {
      z-index: 0;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      height: 100%;
      width: 100%;
      background-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0.45)
      );
    }
    .image-section {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 305px;
      @media (min-width: $mobile-large) {
        min-height: 100%;
        height: 413px;
      }
      img {
        height: 100%;
        width: 100%;
        object-fit: cover;
      }
    }

    .text-section {
      padding: 30px 32px;
      background: white;
      width: 100%;
      min-height: 137px;
      max-height: 137px;
      text-align: left;
      .sub {
        display: grid;
        grid-template-columns: auto 2fr;
        align-content: center;
        width: 100%;
        h1 {
          font-family: $family-primary;
          font-size: 16px;
          font-weight: bold;
          font-style: normal;
          font-stretch: normal;
          text-transform: uppercase;
          line-height: 1.75;
          letter-spacing: 0.4px;
          text-align: left;
          color: #686868;
          @media (min-width: $tablet) {
            font-family: $family-primary;
            font-size: 12px;
            font-weight: bold;
            font-style: normal;
            font-stretch: normal;
            text-transform: uppercase;
            line-height: 2.08;
            letter-spacing: 0.4px;
            text-align: left;
            color: #686868;
            color: white;
          }
        }
        .line {
          background: #9b9b9b;
          height: 2px;
          grid-column: span 1;
          margin-left: 17px;
          align-self: center;
          width: 98%;
          width: calc(100% - 18px);
          @media (min-width: $tablet) {
            height: 1px;
          }
        }
      }
      @media (min-width: $tablet) {
        padding: 0;
        background: rgba(0, 10, 19, 0.56);
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-end;
        text-align: left;
        position: absolute;
        top: 0;
        opacity: 0;
        padding: 0 38px;
        z-index: 1000;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100%;
        min-height: 100%;
        max-height: 100%;
        transition: opacity 0.3s ease-in-out;
        padding-bottom: 32px;
        p {
          padding-bottom: 0;
        }
        .read-more {
          display: inline-flex;
          color: white;
          padding: 0;
          margin: 0;
          width: auto;
          &:hover {
            color: white;
          }
        }
        &:hover {
          .read-more {
            color: white;
          }
        }
      }
    }
    &.tall {
      @media (min-width: $tablet) {
        // double the normal cards, adding the gap of each row
        height: 654px;
        .image-section {
          min-height: 100%;
          max-height: 100%;
        }
        .text-section {
          p {
            @include line-clamp(14, 1.1);
          }
        }
      }
    }
    &.big {
      @media (min-width: $tablet) {
        height: 413px !important;
        .image-section {
          min-height: 100%;
          max-height: 100%;
        }
        .text-section {
          min-height: 100%;
          max-height: 100%;
        }
      }
    }
    h1 {
      font-size: 16px;
      font-style: italic;
      line-height: 1;
      letter-spacing: 0.4px;
      margin: 0;
      text-align: left;
      color: $grey;
      position: relative;
    }
    p {
      font-size: 24px;
      letter-spacing: 2px;
      font-weight: 400;
      line-height: 1.1;
      text-align: left;
      color: #002650;
      margin-bottom: 10px;
      text-transform: capitalize;
      @include line-clamp(2, 1.12);
    }
    @media (min-width: $tablet) {
      background: none;
      margin-bottom: 0;
      padding: 0;
      a {
        width: 100%;
        border-bottom: none;
        padding: ($gap * 1.5) $gap / 1.5 ($gap * 2);
        &.read-more {
          padding: 0;
        }
      }
      .sub {
        display: grid;
        grid-template-columns: auto 2fr;
        align-content: center;
        color: white;
        width: 100%;
        h1 {
          font-size: 12px;
          font-weight: bold;
          font-style: normal;
          font-stretch: normal;
          line-height: 2.08;
          letter-spacing: 0.4px;
          text-align: left;
          color: #ffffff;
        }
        .line {
          background: #9b9b9b;
          height: 1px;
          margin-left: 17px;
          align-self: center;
          width: 100%;
        }
      }
      h1 {
        position: relative;
      }
      p {
        font-size: 16px;
        font-weight: 300;
        line-height: 1.2;
        letter-spacing: 0.2px;
        margin: 0;
        text-align: left;
        color: white;
        text-transform: none;
        position: relative;
        margin-top: 14px;
        @include line-clamp(10, 1.2);
      }
      h2 {
        font-size: 22px;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        line-height: normal;
        letter-spacing: 1.8px;
        text-align: left;
        color: #ffffff;
        margin-bottom: 10px;
        text-transform: uppercase;
        // @include line-clamp(2, 1.12);
      }
      .mobile-link {
        align-items: center;
        justify-content: space-between;
      }
      .overlay {
        display: none;
      }
    }
  }
</style>
