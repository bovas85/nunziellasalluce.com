<script setup lang="ts">
import { useAsyncData } from "#app";
import { useHead } from "#imports";
import Config from "@/assets/config";
import scrollama, { type ScrollamaInstance } from "scrollama";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import type { ContactPageACF } from "~/types/acf";

defineOptions({ name: "ContactPage" });

useHead({
  title: "Contact Me",
});

const { data } = await useAsyncData(
  "contactPage",
  () => $fetch(Config.wpDomain + Config.api.contactPage),
  {
    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    },
  },
);

const contactPage = computed(
  () => data.value as { acf?: ContactPageACF } | undefined,
);
const showForm = ref(false);
let contactScroller: ScrollamaInstance | null = null;

onMounted(async () => {
  if (import.meta.client) {
    await nextTick();

    const formEl = document.querySelector(".contact-form--wrapper");
    if (formEl) {
      contactScroller = scrollama();
      contactScroller
        .setup({
          step: ".contact-form--wrapper",
          offset: 0.8,
          debug: false,
        })
        .onStepEnter(() => {
          showForm.value = true;
        });
    } else {
      // Fallback: show form immediately if element not found
      showForm.value = true;
    }
  }
});

onBeforeUnmount(() => {
  if (contactScroller) {
    contactScroller.destroy();
    contactScroller = null;
  }
});
</script>

<template>
  <div class="contact">
    <section class="section hero">
      <div v-if="contactPage != null" class="grid-wrapper">
        <UILazyImage
          v-if="contactPage.acf"
          class="image"
          no-bg
          :image="contactPage.acf.background"
          :title="contactPage.acf.title"
          position-mobile="left"
          :hover="false"
          :image-mobile="contactPage.acf.background"
          home
        />
        <div class="container">
          <h1 v-if="contactPage.acf" class="jumbo">
            {{ contactPage.acf.title }}
          </h1>
          <h3>
            Email:
            <a href="mailto:hello@nunziellasalluce.com?subject=hello"
              >hello@nunziellasalluce.com</a
            >
          </h3>
        </div>

        <div class="contact-form--wrapper" :class="{ animated: showForm }">
          <UITheContactForm />
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.contact {
  section {
    margin: $gap * 1.5 $gap;

    @include media(md) {
      margin: $gap * 3 auto;
    }

    &.hero {
      background: white;
      margin: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      position: relative;
      padding: 0;

      @include media(md) {
        margin: $gap * 3 0;
        padding-top: 90px;
      }

      .grid-wrapper {
        min-height: 100vh;
        width: 100%;
        grid-template-rows: repeat(12, auto);
        grid-template-columns: 1fr;

        @include media(xxl) {
          min-height: 70vh;
        }
      }

      .container {
        display: flex;
        width: 100%;
        flex-direction: column;
        grid-column: 1 / -1;
        grid-row: 4 / 5;
        padding: $gap;

        @include media(sm) {
          padding: 0;
        }
      }

      .image {
        grid-column: 1 / 2;
        width: 100%;
        z-index: 0;
        grid-row: 1 / 11;

        @include media(xxl) {
          grid-row: 1 / 11;
          max-height: 80vh;
        }
      }

      h1,
      h3 {
        color: black;
        grid-column: 1 / 2;
        z-index: 1;
        padding: 0;
      }

      h1 {
        max-width: 150px;
        padding-top: 60px;

        @include media(sm) {
          max-width: 350px;
          padding-top: 96px;
        }

        grid-row: 2 / 4;
      }

      h3 {
        grid-row: 4 / 7;
      }

      .contact-form--wrapper {
        grid-column: 1 / 2;
        z-index: 1;
        grid-row: 8 / -1;
        padding-top: 50px;
        padding: 0;
        max-width: 100%;
        overflow: hidden;

        @include media(lg) {
          margin: 0;
          padding: 0 $gap;
          margin-left: auto;
          margin-right: 10vw;
        }
      }

      @include media(sm) {
        padding: 0;
      }

      @include media(md) {
        margin: 0 auto $gap * 3;
      }

      .container {
        height: 100%;
        justify-content: center;
      }

      a {
        color: black;
        font-weight: 600;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .contact-form--wrapper {
      @include media(lg) {
        margin-left: auto;
        margin-right: 10vw;
        min-height: 546px;
      }

      @include fadeInUp;

      &.animated {
        opacity: 1;
      }
    }
  }
}
</style>
