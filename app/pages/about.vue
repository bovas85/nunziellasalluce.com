<script setup lang="ts">
import { useAsyncData, useRuntimeConfig } from "#app";
import { useHead } from "#imports";
import Config from "@/assets/config";
import { computed } from "vue";
import type { AboutPageACF } from "~/types/acf";

defineOptions({ name: "AboutPage" });

useHead({
  title: "About Me",
});

const config = useRuntimeConfig();
const enableCvLivePreview = computed(
  () => config.public?.enableCvLivePreview !== false,
);

const { data } = await useAsyncData(
  "aboutPage",
  () => $fetch(Config.wpDomain + Config.api.aboutPage),
  {
    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    },
  },
);

const aboutPage = computed(
  () =>
    (data.value as Record<string, unknown>)?.acf as AboutPageACF | undefined,
);
</script>

<template>
  <div v-if="aboutPage" class="about">
    <UILazyImage
      class="image"
      :image="aboutPage.about.desktop_image"
      :hover="false"
      position="right"
      position-mobile="right"
      :image-mobile="aboutPage.about.mobile_image"
      home
    />
    <div v-if="aboutPage" class="container">
      <h1>{{ aboutPage.title }}</h1>

      <h3>{{ aboutPage.about.title }}</h3>
      <p>
        {{ aboutPage.about.body }}
      </p>
      <h3>{{ aboutPage.current_job.title }}</h3>
      <p>
        {{ aboutPage.current_job.body }}
      </p>
      <h3>{{ aboutPage.skills.title }}</h3>
      <p>
        {{ aboutPage.skills.body }}
      </p>
      <div v-if="enableCvLivePreview" class="cv-preview">
        <h3 class="cv-preview__title">Curriculum Vitae</h3>
        <div
          class="cv-preview__container"
          tabindex="0"
          role="region"
          aria-label="Curriculum Vitae Preview"
        >
          <picture>
            <source
              srcset="/NunziellaSalluce-CV-preview.webp"
              type="image/webp"
            />
            <img
              src="/NunziellaSalluce-CV-preview.png"
              alt="Curriculum Vitae of Nunziella Salluce"
              class="cv-preview__image"
              loading="lazy"
              width="1200"
              height="3402"
            />
          </picture>
        </div>
      </div>
      <p>
        <a
          class="link"
          target="_blank"
          rel="noopener noreferrer"
          href="/NunziellaSalluce-CV.pdf"
          >Download my CV</a
        >
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.about {
  position: relative;
  min-height: 100vh;
  min-height: calc(100vh - 178px);
  background-color: #91754d;
  z-index: 1;

  a {
    color: white;
    text-decoration: underline;
    transition: color 0.3s ease-in-out;
    z-index: 1;

    &:hover {
      color: $primary;
      text-decoration: underline;
    }
  }

  .container {
    padding: 0 $gap $gap * 3;

    @include media(lg) {
      padding: 0;
      padding-bottom: $gap * 3;
    }
  }

  .image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
  }

  h1 {
    color: white;
    text-transform: uppercase;
    font-weight: 600;
    padding-top: $gap * 4;

    @include size(h1);
  }

  h3 {
    color: white;
  }

  p {
    color: black;
    max-width: 568px;

    @include size(h3);

    margin-bottom: $gap;

    @include media(md) {
      margin-bottom: 0;
    }
  }

  .cv-preview {
    margin-top: $gap;
    margin-bottom: $gap;
    max-width: 568px;

    &__title {
      color: white;
      margin-bottom: $gap * 0.5;
    }

    &__container {
      position: relative;
      width: 100%;
      height: 480px;
      background-color: #fff;
      border-radius: 8px;
      overflow: hidden auto;
      box-shadow: 0 4px 16px rgb(0 0 0 / 20%);
      -webkit-overflow-scrolling: touch;

      @include media(md) {
        height: 560px;
      }
    }

    &__image {
      width: 100%;
      height: auto;
      display: block;
    }
  }
}
</style>
