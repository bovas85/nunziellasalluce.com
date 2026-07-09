<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { WPImage } from '~/types/acf';

const props = withDefaults(defineProps<{
  svg?: boolean
  lazyload?: boolean
  image?: WPImage
  videoMobile?: string | boolean
  videoDesktop?: string | boolean
  imageMobile?: WPImage
  title?: string
  link?: string
  noPlaceholder?: boolean
  type?: string
  home?: boolean
  noBg?: boolean
  isThumb?: boolean
  position?: string
  positionMobile?: string
  contain?: boolean
  hover?: boolean
  onHover?: boolean
  hoverFixed?: boolean
}>(), {
  svg: false,
  lazyload: true,
  image: undefined,
  videoMobile: undefined,
  videoDesktop: undefined,
  imageMobile: undefined,
  title: '',
  link: undefined,
  type: '',
  home: false,
  noBg: false,
  isThumb: false,
  position: 'center',
  positionMobile: 'center',
  contain: false,
  hover: true,
  onHover: false,
  hoverFixed: false
})

const isMobile = ref(false)
const isMounted = ref(false)

onMounted(() => {
  isMobile.value = window.innerWidth < 1024
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 1024
  }, { passive: true })
  isMounted.value = true
})

const mobileSrc = computed(() => {
  if (props.image?.url && props.image.url.toLowerCase().includes('bio-nunziella-salluce-design.jpg')) {
    return 'https://nunziella.moustachedesign.xyz/wp-content/uploads/2019/05/Bio-Nunziella-Salluce-Design-mobile.jpg'
  }
  if (props.imageMobile && props.imageMobile.url && props.imageMobile.id !== props.image?.id) {
    return props.imageMobile.url
  }
  return props.image?.sizes?.medium || props.image?.url || ''
})

const fallbackSrc = computed(() => {
  if (isMobile.value) {
    if (import.meta.client && window.innerWidth < 577) {
      return mobileSrc.value
    }
    return props.image?.sizes?.large || props.image?.url || ''
  }
  return getImage.value ? getImage.value : (props.image?.sizes?.ultra || props.image?.url || '')
})

const computedClass = computed(() => {
  return isMobile.value ? props.positionMobile : props.position
})

const getImage = computed(() => {
  if (props.isThumb && props.image?.sizes?.small) {
    return props.image.sizes.small
  }
  return false
})

onMounted(() => {
  if (import.meta.client) {
    const lazyVideos = Array.from(document.querySelectorAll('video.lazyload')) as HTMLVideoElement[]

    if ('IntersectionObserver' in globalThis) {
      const lazyVideoObserver = new IntersectionObserver((entries, _observer) => {
        entries.forEach(video => {
          if (video.isIntersecting) {
            for (const source of Array.from(video.target.children)) {
              const videoSource = source as HTMLSourceElement
              if (videoSource.tagName === 'SOURCE' && videoSource.dataset.src) {
                videoSource.src = videoSource.dataset.src
              }
            }
            ; (video.target as HTMLVideoElement).load()
            video.target.classList.remove('lazyload')
            lazyVideoObserver.unobserve(video.target)
          }
        })
      })

      lazyVideos.forEach(lazyVideo => {
        lazyVideoObserver.observe(lazyVideo)
      })
    }
  }
})
</script>

<template>
  <div v-if="videoMobile && videoDesktop" class="video">
    <video
:class="lazyload ? 'lazyload hidden-mobile' : 'hidden-mobile'" autoplay muted loop playsinline
      poster="/images/Homepage.svg">
      <source :data-src="videoDesktop" type="video/mp4">
      Your browser does not support the video tag.
    </video>
    <!-- mobile video -->
    <video
:class="lazyload ? 'lazyload is-hidden-mobile-large' : 'is-hidden-mobile-large'" autoplay muted loop
      playsinline poster="/images/Homepage.svg">
      <source :data-src="videoMobile" type="video/mp4">
      Your browser does not support the video tag.
    </video>
  </div>
  <div
v-else-if="image?.url != null" class="lazy-image"
    :class="[{ 'hover-disabled': !hover, contain: contain }, computedClass, { home: home }]">
    <picture>
      <!-- Mobile: max-width 576px -->
      <source
        v-if="!svg && (mobileSrc.toLowerCase().includes('-mobile') || (imageMobile && imageMobile.url && imageMobile.id !== image?.id))"
        media="(max-width: 576px)" :class="(lazyload && isMounted) ? 'lazyload' : ''" :loading="lazyload ? 'lazy' : undefined"
        srcset="/images/Homepage.svg" :data-srcset="`${mobileSrc}.webp`"
        type="image/webp">
      <source
        media="(max-width: 576px)" :class="(lazyload && isMounted) ? 'lazyload' : ''" :loading="lazyload ? 'lazy' : undefined"
        srcset="/images/Homepage.svg" :data-srcset="mobileSrc">

      <!-- Tablet: 577px to 1023px -->
      <source
        v-if="!svg"
        media="(min-width: 577px) and (max-width: 1023px)" :class="(lazyload && isMounted) ? 'lazyload' : ''" :loading="lazyload ? 'lazy' : undefined"
        srcset="/images/Homepage.svg" :data-srcset="`${image?.sizes?.large || image?.url}.webp`"
        type="image/webp">
      <source
        media="(min-width: 577px) and (max-width: 1023px)" :class="(lazyload && isMounted) ? 'lazyload' : ''" :loading="lazyload ? 'lazy' : undefined"
        srcset="/images/Homepage.svg" :data-srcset="image?.sizes?.large || image?.url">

      <!-- Desktop: 1024px to 1920px -->
      <source
        v-if="!svg"
        media="(min-width: 1024px) and (max-width: 1920px)" :class="(lazyload && isMounted) ? 'lazyload' : ''"
        :loading="lazyload ? 'lazy' : undefined" srcset="/images/Homepage.svg"
        :data-srcset="getImage ? `${getImage}.webp` : `${image?.sizes?.ultra || image?.url}.webp`"
        type="image/webp">
      <source
        media="(min-width: 1024px) and (max-width: 1920px)" :class="(lazyload && isMounted) ? 'lazyload' : ''"
        :loading="lazyload ? 'lazy' : undefined" srcset="/images/Homepage.svg"
        :data-srcset="getImage ? `${getImage}` : `${image?.sizes?.ultra || image?.url}`">

      <!-- 4k: min-width 1921px -->
      <source
        v-if="!svg"
        media="(min-width: 1921px)" :class="(lazyload && isMounted) ? 'lazyload' : ''" :loading="lazyload ? 'lazy' : undefined"
        srcset="/images/Homepage.svg"
        :data-srcset="getImage ? `${getImage}.webp` : `${image?.sizes?.['4k'] || image?.url}.webp`"
        type="image/webp">
      <source
        media="(min-width: 1921px)" :class="(lazyload && isMounted) ? 'lazyload' : ''" :loading="lazyload ? 'lazy' : undefined"
        srcset="/images/Homepage.svg" :data-srcset="getImage ? `${getImage}` : `${image?.sizes?.['4k'] || image?.url}`">

      <!-- Fallback image -->
      <img
:class="(lazyload && isMounted) ? 'lazyload' : ''" :loading="lazyload ? 'lazy' : undefined" src="/images/Homepage.svg"
        :data-src="fallbackSrc" :alt="image.alt || title">
    </picture>
    <slot />
  </div>
</template>

<style lang="scss">
@supports not (display: grid) {
  .progressive-image-wrapper {
    position: relative;
    padding-top: 56.25%;

    /* 16:9 Aspect Ratio */
    img,
    .progressive-image-main {
      background: transparent;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
  }

  .work-navigation {
    .progressive-image-wrapper {
      padding-top: 0 !important;
    }
  }
}

@supports (display: grid) {
  img,
  .progressive-image,
  .progressive-image-wrapper {
    position: static;
    object-fit: cover;
    width: 100%;
    height: 100%;
    padding-top: unset;

    img,
    .progressive-image-main {
      position: relative;
      object-fit: cover;
      z-index: -1;
      width: 100%;
      height: 100%;
    }

    .progressive-image-placeholder {
      background-size: cover;
      background-position: center;
      width: auto;
    }

    .progressive-image-wrapper {
      overflow: hidden;
    }
  }
}

.video {
  display: flex;
  justify-content: center;
  width: 100%;
  flex-wrap: wrap;
  position: relative;

  video {
    margin-bottom: $gap;
    flex-basis: 100%;
    width: 100%;

    &.hidden-mobile {
      @media (max-width: $mobile) {
        display: none;
      }
    }

    &.is-hidden-desktop {
      @media (min-width: $tablet) {
        display: none;
      }
    }
  }
}

.lazy-image {
  height: 100%;
  width: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;

  &::before {
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
      text-decoration: none;
      border: none;
      color: rgb(255 255 255 / 50%);
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

    img {
      transform: scale(1.05);
    }
  }

  &.hover-disabled {
    cursor: auto;

    &::before {
      transition: all 0.3s ease-in-out;
    }

    &:hover {
      .text-container {
        opacity: 1;
      }

      &::before {
        display: none;
      }

      img {
        transform: scale(1);
      }
    }
  }

  &.home {
    overflow: hidden;
    background-size: cover;
    background-repeat: no-repeat;
    pointer-events: none;

    &:hover {
      pointer-events: none;

      .text-container {
        opacity: 0;
      }
    }

    img {
      object-position: right;

      @media (min-width: $tablet) {
        animation: zoomImage infinite;
        animation-delay: 0.3s;
        animation-timing-function: linear;
        animation-fill-mode: both;
        animation-duration: 60s;
        backface-visibility: hidden;

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

  img {
    transition: transform 0.6s ease-in-out;
  }

  &.left img {
    object-position: left;
  }

  &.right img {
    object-position: right;
  }

  &.center img {
    object-position: center;
  }

  &.center-right img {
    object-position: 70% center;
  }

  &.bottom img {
    object-position: bottom;
  }

  &.top img {
    object-position: top;
  }

  &.contain img {
    object-fit: contain;
  }
}

.bg-image--second {
  img,
  .progressive-image-main {
    background: transparent;
    height: 100%;
    width: 100%;
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
    transform: scale3d(1.3, 1.3, 1.3);
  }

  100% {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}
</style>
