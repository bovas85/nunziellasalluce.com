<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { computed, ref } from 'vue'

defineProps<{
  data: unknown[]
}>()

const { width } = useWindowSize()
const sliderPosition = ref(0)

const responsiveNumber = computed(() => {
  if (width.value < 480) {
    return 1
  } else if (width.value < 768) {
    return 2
  } else {
    return 3
  }
})

const onSlideChange = (swiper: { activeIndex: number }) => {
  sliderPosition.value = swiper.activeIndex
}

const swiperOptions = {
  modules: [Navigation, Pagination],
  initialSlide: 0,
  slidesPerView: 1,
  breakpoints: {
    480: {
      slidesPerView: 2
    },
    768: {
      slidesPerView: 3
    },
    1024: {
      slidesPerView: 3
    }
  },
  centeredSlides: false,
  spaceBetween: 0,
  autoplay: false,
  loop: false,
  grabCursor: true,
  threshold: 60,
  pagination: {
    clickable: true
  },
  navigation: {
    nextEl: '.next',
    prevEl: '.prev',
  }
}
</script>

<template>
  <div v-if="data != null && data.length" class="carousel">
    <div class="swiper-container">
      <Swiper v-bind="swiperOptions" class="app-carousel" @slide-change="onSlideChange">
        <SwiperSlide v-for="(item, index) in data" :key="index">
          <span class="circle" :style="{ background: item.background }">
            <h3>{{ item.title }}</h3>
          </span>
          <p>{{ item.body }}</p>
        </SwiperSlide>
      </Swiper>
    </div>

    <!-- slider arrows -->
    <div class="prev" :class="{ 'is-disabled': sliderPosition === 0 }">
      <IconsIconArrow direction="left" :fill="'black'" name="arrow-left" :width="30" :height="40" />
    </div>
    <div class="next" :class="{ 'is-disabled': sliderPosition >= data.length - responsiveNumber }">
      <IconsIconArrow direction="right" :fill="'black'" name="arrow-right" :width="30" :height="40" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.swiper-container {
  height: auto !important;
  min-height: 100%;
  overflow: visible;
  margin: 0;
  padding: 0;
  position: relative;
  margin-left: calc($gap / 2);

  @include media(md) {
    margin-left: $gap * 3;
  }

  &::after {
    content: "";
    height: 2px;
    background-color: $grey;
    position: absolute;
    top: calc(165px / 2 + 5px);
    left: 5px;
    width: 100%;
  }
}

.app-carousel {
  overflow: visible;
}

:deep(.swiper-slide) {
  overflow: visible;
  min-height: 320px;
  height: 100%;
  width: 165px;
  position: relative;

  &:last-child {
    width: 1000px !important;
    background: linear-gradient(to right,
        rgb(255 255 255 / 0%) 0%,
        rgb(255 255 255 / 100%) 15%,
        rgb(255 255 255 / 100%) 100%);
  }

  .lazy-image {
    pointer-events: none;
  }

  .circle {
    background: $lightgrey;
    display: flex;
    justify-content: center;
    text-transform: uppercase;
    color: white;
    align-items: center;
    height: 165px;
    width: 165px;
    position: absolute;
    top: 5px;
    left: 5px;
    border-radius: 100%;
    object-fit: cover;
    object-position: center;
    backface-visibility: hidden;
    z-index: 0;
    margin: 0 auto;
    will-change: transform;
    box-shadow: 0 0 5px 1px white;
    border: 0 solid transparent;
    transition: transform 0.3s ease-in-out;

    &:hover {
      z-index: 1;
      transform: scale(1.05);
    }

    h3 {
      font-weight: 600;
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

  p {
    margin-top: 200px;
    max-width: 230px;
    padding-right: calc($gap / 1.5);
  }
}

.prev,
.next {
  position: absolute;
  cursor: pointer;
  top: -100px;
  right: -$gap;
  width: 100px;
  height: $gap;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
  transition: opacity 0.3s ease-in-out;

  @include media(md) {
    top: -160px;
    right: $gap * 2;
  }

  &.is-disabled {
    opacity: 0;
    pointer-events: none;
    cursor: not-allowed;
  }
}

.prev {
  right: $gap * 2;

  @include media(md) {
    right: $gap * 5;
  }
}
</style>
