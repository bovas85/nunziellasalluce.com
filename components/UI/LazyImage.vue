<template>
  <div 
    v-if="image.url != null && imageMobile.url != null"
    class="lazy-image" 
    :style="`background-image: url('${thumbnail}'`"
    @click="clickIt" 
    :class="{'continent': continent, 'masonry': masonry, 'blog': type === 'post', 'home': home, 'hover-disabled': !hover}"
  >
    <no-ssr>
      <vue-media :query="{maxWidth: 576}">
        <progressive-img
          :src="imageMobile.url"
          :alt="imageMobile.alt"
          @onLoad.once="imageLoaded"
          @onError="capture($event)"
          :placeholder="thumbnail"
          no-ratio
          :blur="15"
        />
      </vue-media>
    </no-ssr>
    <no-ssr>
      <vue-media :query="({minWidth: 577, maxWidth: 1200})">
        <progressive-img
          :src="image.sizes.medium"
          :alt="image.alt"
          @onLoad.once="imageLoaded"
          @onError="capture($event)"
          :placeholder="thumbnail"
          no-ratio
          :blur="15"
        />
      </vue-media>
    </no-ssr>
    <no-ssr>
      <vue-media :query="({minWidth: 1201, maxWidth: 1920})">
        <progressive-img
          :src="getImage ? getImage : image.sizes.large"
          :alt="image.alt"
          @onLoad.once="imageLoaded"
          @onError="capture($event)"
          :placeholder="thumbnail"
          no-ratio
          :blur="15"
        />
      </vue-media>
    </no-ssr>
    <no-ssr>
      <vue-media :query="{minWidth: 1921}">
        <progressive-img
          :src="getImage ? getImage : image.sizes.ultra"
          :alt="image.alt"
          @onLoad.once="imageLoaded"
          @onError="capture($event)"
          :placeholder="thumbnail"
          no-ratio
          :blur="15"
        />
      </vue-media>
    </no-ssr>
    <div v-show="onHover || type !== 'post'" class="text-container" :class="{'on-hover': onHover, 'mobile-visible': hoverFixed}">
      <!-- <p v-show="type === 'post' && title" class="text-heading">Experience</p> -->
      <nuxt-link v-if="link && title" :to="type === 'post' ? `/journal/${link}` : link" class="text" v-html="title"></nuxt-link>
      <p v-show="type === 'post' && title" class="text-subheading">Read More</p>
    </div>
    <slot></slot>
  </div>
</template>

<script>
    export default {
      name: 'LazyImage',
      props: {
        image: {
          type: [Object, Boolean]
        },
        imageMobile: {
          type: [Object, Boolean]
        },
        title: '',
        link: {
          default: false
        },
        noPlaceholder: {
          type: Boolean
        },
        type: {
          type: String,
          default: ''
        },
        blogNav: {
          type: Boolean,
          default: false
        },
        journalModal: {
          type: Boolean,
          default: false
        },
        home: {
          type: Boolean,
          default: false
        },
        continent: {
          type: Boolean,
          default: false
        },
        masonry: {
          type: Boolean,
          default: false
        },
        isThumb: {
          type: Boolean,
          default: false
        },
        hover: {
          default: true
        },
        destination: {
          type: Boolean,
          default: false
        },
        event: {
          type: String,
          default: null
        },
        onHover: {
          type: Boolean,
          default: false
        },
        hoverFixed: {
          type: Boolean,
          default: false
        }
      },
      methods: {
        capture (event) {
          return false
        },
        imageLoaded (event) {
          // console.log('image loaded', event)
        },
        clickIt () {
          // go to page of case study
        }
      },
      computed: {
        getImage () {
          if (this.isThumb) {
            return this.image.sizes.small
          } else if (
            this.$store.state.connection === 'cellular' ||
            this.$store.state.connection === 'other'
          ) {
            return this.image.sizes.medium
          } else return false
        },

        thumbnail () {
          if (this.noPlaceHolder) {
            return false
          }
          if (this.image != null) {
            return this.image.sizes.thumbnail
          } else return 'https://placehold.it/150x150'
        }
      }
    }
</script>

<style lang="scss">
    .lazy-image {
      height: 100%;
      width: 100%;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
      position: relative;
      cursor: pointer;
      &:before {
        display: none;
      }
      .text-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 1;
        text-align: center;
        z-index: 101;
        transition: all 0.3s ease-in-out;
        &.on-hover {
          justify-content: center !important;
          padding: 0 !important;
          opacity: 0;
          &.mobile-visible {
            opacity: 1;
          }
        }
        @media (max-width: $mobile) {
          opacity: 1 !important;
        }
        .text {
          font-size: 52px;
          line-height: 1;
          text-align: center;
          pointer-events: none;
          text-transform: uppercase;
          font-weight: 300;
          // padding: 0 32px;
          text-decoration: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0;
        }
        &:hover {
          opacity: 1;
          color: white;
        }
      }
      &:hover {
        .text-container {
          opacity: 1;
        }
        // &:before {
        //   z-index: 100;
        //   background-color: rgba(0, 0, 0, 0.25);
        // }
        img {
          transform: scale(1.05);
        }
      }
      &.hover-disabled {
        cursor: auto;
        &:before {
          transition: all 0.3s ease-in-out;
        }
        &:hover {
          .text-container {
            opacity: 1;
          }
          &:before {
            display: none;
          }
          img {
            transform: scale(1);
          }
        }
      }
      &.home {
        background-size: cover;
        background-repeat: no-repeat;
        pointer-events: none;
        // &:before {
        //   z-index: 2;
        //   background-color: rgba(0, 0, 0, 0.25);
        // }
        &:hover {
          pointer-events: none;
          .text-container {
            opacity: 0;
          }
          img {
            // transform: none;
          }
        }
        img {
          object-position: right;
          @media (min-width: $tablet) {
            animation: zoomImage infinite;
            animation-delay: 0.3s;
            animation-timing-function: linear;
            animation-fill-mode: both;
            animation-duration: 80s;
            backface-visibility: hidden;
            // transform: translateZ(0);
            // perspective: 1000px;
            // will-change: transform;
            // transition: all 1.3s;
            &:hover {
              .overlay {
                opacity: 0;
              }
              img {
                transform: none;
              }
            }
          }
        }
      }

      &.masonry {
        .text-container {
          display: none;
        }
      }

      &.blog {
        position: relative;
        .text-container {
          position: absolute;
          // left: 50%;
          // top: 50%;
          // transform: translate(-50%, -50%);
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          transform: none;
          padding: 0 32px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding-bottom: 36px;
          align-items: center;
          color: white;
          background: rgba(0, 10, 19, 0.56);
          .text-heading {
            font-size: 16px;
            line-height: 1.38;
            letter-spacing: 0.2px;
            font-weight: 400;
            text-align: center;
            color: white;
            text-transform: uppercase;
            padding-bottom: 0;
          }
          .text-subheading {
            // font-size: 16px;
            // line-height: 1.38;
            // letter-spacing: 0.2px;
            // font-weight: 400;
            // text-align: center;
            // color: white;
            font-size: 14px;
            font-weight: bold;
            font-style: normal;
            font-stretch: normal;
            line-height: normal;
            letter-spacing: 1.4px;
            text-align: center;
            color: #ffffff;
            text-transform: uppercase;
            padding-bottom: 0;
            position: relative;
            margin-top: 22px;
            &:before {
              position: absolute;
              top: -12px;
              left: 50%;
              transform: translateX(-50%);
              content: '';
              background: #9b9b9b;
              height: 1px;
              width: 50px;
            }
          }
          .text {
            // font-size: 28px;
            // line-height: 1.18;
            // letter-spacing: 0.3px;
            // font-weight: 400;
            // opacity: 1;
            // text-align: center;
            // text-transform: uppercase;
            // color: white;
            font-size: 22px;
            font-weight: 400;
            font-style: normal;
            font-stretch: normal;
            line-height: normal;
            letter-spacing: 2.2px;
            text-align: center;
            color: #ffffff;
            padding: 0 15px;
          }
        }
      }

      img {
        transition: transform 0.6s ease-in-out;
      }
    }
    .progressive-image,
    .progressive-image-wrapper {
      height: 100%;
      object-fit: cover;
      .progressive-image-main {
        background: transparent;
        height: 100% !important;
        object-fit: cover;
      }
      .progressive-image-placeholder {
        background-size: cover;
        background-position: center;
      }
      .progressive-image-wrapper {
        overflow: hidden;
      }
    }
    .bg-image--second {
      .progressive-image-main {
        background: transparent;
        height: 100% !important;
        object-fit: cover;
        margin-top: 0;
        margin-bottom: -5px;
        object-position: 0 0;
        @media (min-width: $tablet) {
          object-fit: cover;
        }
      }
    }
    @keyframes zoomImage {
      0% {
        opacity: 1;
        transform: scale3d(1, 1, 1);
      }
      50% {
        opacity: 1;
        transform: scale3d(1.4, 1.4, 1.4);
      }
      100% {
        opacity: 1;
        transform: scale3d(1, 1, 1);
      }
    }
</style>