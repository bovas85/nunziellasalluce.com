<script setup lang="ts">
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import { useRouter } from "vue-router";
import type { Project } from "~/types/acf";

const props = defineProps<{
  data: Project[];
  location?: string;
}>();

const router = useRouter();

const onSlideChange = () => {
  if (typeof window !== "undefined") {
    const customWindow = window as unknown as {
      lazySizes?: {
        loader: {
          checkElems: () => void;
        };
      };
    };
    if (customWindow.lazySizes) {
      customWindow.lazySizes.loader.checkElems();
    }
  }
};

const swiperOptions = {
  modules: [Navigation, Pagination],
  initialSlide: Math.floor((props.data.length - 1) / 2) || 1,
  slidesPerView: "auto" as const,
  centeredSlides: true,
  spaceBetween: 32,
  breakpoints: {
    640: {
      slidesPerView: "auto" as const,
      spaceBetween: 32,
    },
    320: {
      slidesPerView: "auto" as const,
      spaceBetween: 16,
    },
  },
  autoplay: false,
  loop: false,
  pagination: {
    clickable: true,
  },
  navigation: {
    nextEl: ".next",
    prevEl: ".prev",
  },
};
</script>

<template>
  <div v-if="data != null && data.length > 0" class="carousel">
    <div class="swiper-container">
      <Swiper
        v-bind="swiperOptions"
        class="app-carousel"
        @slide-change="onSlideChange"
      >
        <SwiperSlide
          v-for="item in data"
          :key="item.id"
          class="swiper-slide-item"
        >
          <div
            v-if="item.acf.hero && item.acf.product"
            class="slide-content"
            @click="router.push(item.slug)"
          >
            <UILazyImage
              class="image"
              :hover="true"
              :image="item.acf.hero.desktop_bg"
              type="'case_study'"
              :title="item.acf.hero.title"
              :image-mobile="item.acf.hero.mobile_bg"
              :link="item.slug"
            >
              <div class="text-section">
                <h3>{{ item.acf.hero.title }}</h3>
                <h4 class="subtitle">{{ item.acf.category }}</h4>
                <button
                  role="navigation"
                  aria-label="Show case study"
                  class="subtitle subtitle--show"
                >
                  Show Case Study
                </button>
              </div>
            </UILazyImage>
          </div>
        </SwiperSlide>
      </Swiper>

      <!-- slider arrows -->
      <div class="prev">Prev</div>
      <div class="next">Next</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.swiper-container {
  height: auto !important;
  background: white;
  min-height: 100%;
  overflow: visible;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
  position: relative;

  .prev,
  .next {
    display: none;
    position: absolute;
    cursor: pointer;
    background-image: unset;
    top: 0;
    right: unset;
    font-size: responsive(18px, 22px);
    font-range: 768px 1200px;
    width: 9vw;
    height: 100%;
    bottom: 0;
    z-index: 100;
    justify-content: center;
    align-items: center;
    color: white;

    @include media(md) {
      display: flex;
    }

    @include media(xl) {
      width: 10vw;
    }
  }

  .prev {
    left: -21px;

    @include media(xl) {
      left: -32px;
    }

    opacity: 1;
    background: linear-gradient(
      to left,
      rgb(0 0 0 / 0%) 0%,
      rgb(0 0 0 / 40%) 100%
    );
    transition: opacity 0.3s ease-in-out;
  }

  .next {
    left: unset;
    right: -21px;

    @include media(xl) {
      right: -32px;
    }

    opacity: 1;
    background: linear-gradient(
      to right,
      rgb(0 0 0 / 0%) 0%,
      rgb(0 0 0 / 40%) 100%
    );
    transition: opacity 0.3s ease-in-out;
  }
}

.app-carousel {
  background: white;
  position: static;
}

.swiper-slide-item {
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 1px 5px 0 $grey;
  height: 300px;
  position: relative;
  width: 65vw !important;
  max-width: 65vw !important;

  @include media(sm) {
    width: 80vw !important;
    max-width: 80vw !important;
    height: 600px;
  }

  @include media(lg) {
    height: 500px;
  }

  .slide-content {
    height: 100%;
    width: 100%;
  }

  .lazy-image {
    pointer-events: none;
  }

  .text-section {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    display: flex;
    flex-direction: column;
    text-align: center;
    opacity: 1;
    z-index: 9999;

    .subtitle {
      opacity: 1;
      transform: translateY(0);
      text-transform: uppercase;

      @include media(lg) {
        opacity: 0;
        transform: translateY(500%);
        transition: all 0.4s ease-in-out;
      }

      &--show {
        box-shadow: 0 0 0 1px white;
        border: none;
        outline: none;
        background: transparent;
        color: white;
        cursor: pointer;
        margin: 0 auto;
        margin-top: 50px;
        display: flex;
        align-items: center;
        line-height: 1;
        justify-content: center;
        height: 50px;
        font-weight: 300;
        transition: all 0.4s ease-in-out;
        width: 150px;
        font-size: 13px;

        @include media(md) {
          width: 220px;
          font-size: $font-size;
        }

        &:hover {
          border: none;
          font-weight: 600;
          box-shadow: 0 0 0 2px white;
        }
      }
    }
  }

  &:hover {
    .text-section .subtitle {
      @include media(lg) {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }

  :deep(img) {
    height: 300px;

    @include media(sm) {
      height: 600px;
    }

    @include media(lg) {
      height: 500px;
    }

    width: 100%;
    object-fit: cover;
    object-position: center;
    backface-visibility: hidden;
    z-index: 0;
    cursor: pointer;
    will-change: transform;
    box-shadow: 0 0 5px 1px white;
    border: 0 solid transparent;
    transition: transform 0.3s ease-in-out;

    &:hover {
      z-index: 1;
      transform: scale(1.05);
    }
  }

  .image {
    position: relative;
    height: 100%;

    .text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 24px;
    }
  }
}
</style>
